import type { OAuth2Config } from "./collectionService";

export interface OAuthTokenResult {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  scope: string;
  expiresIn: number;
}

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

export function defaultRedirectUri(): string {
  return window.location.origin;
}

export function isTokenExpired(config: OAuth2Config): boolean {
  if (!config.accessToken) return true;
  if (!config.expiresIn) return false;
  return Date.now() - config.acquiredAt >= config.expiresIn * 1000;
}

async function postTokenRequest(
  tokenUrl: string,
  body: Record<string, string>,
): Promise<OAuthTokenResult> {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) {
    if (v !== "") params.set(k, v);
  }

  let res: Response;
  try {
    res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: params.toString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Could not reach token endpoint: ${msg}`, { cause: err });
  }

  let data: TokenResponse;
  try {
    data = (await res.json()) as TokenResponse;
  } catch {
    const text = await res.text().catch(() => "");
    throw new Error(`Token endpoint returned a non-JSON response (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok || data.error) {
    const desc = data.error_description || data.error || `HTTP ${res.status}`;
    throw new Error(`OAuth token request failed: ${desc}`);
  }
  if (!data.access_token) {
    throw new Error("OAuth token response did not include an access_token");
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || "",
    tokenType: data.token_type || "Bearer",
    scope: data.scope || "",
    expiresIn: data.expires_in || 0,
  };
}

export async function getClientCredentialsToken(config: OAuth2Config): Promise<OAuthTokenResult> {
  if (!config.tokenUrl.trim()) throw new Error("OAuth 2.0 requires a Token URL");
  return postTokenRequest(config.tokenUrl, {
    grant_type: "client_credentials",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: config.scope,
  });
}

export async function getPasswordToken(config: OAuth2Config): Promise<OAuthTokenResult> {
  if (!config.tokenUrl.trim()) throw new Error("OAuth 2.0 requires a Token URL");
  return postTokenRequest(config.tokenUrl, {
    grant_type: "password",
    username: config.username,
    password: config.password,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: config.scope,
  });
}

export async function refreshAccessToken(config: OAuth2Config): Promise<OAuthTokenResult> {
  if (!config.tokenUrl.trim()) throw new Error("OAuth 2.0 requires a Token URL");
  if (!config.refreshToken) throw new Error("No refresh token available");
  return postTokenRequest(config.tokenUrl, {
    grant_type: "refresh_token",
    refresh_token: config.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: config.scope,
  });
}

export async function getAuthorizationCodeToken(config: OAuth2Config): Promise<OAuthTokenResult> {
  if (!config.tokenUrl.trim()) throw new Error("OAuth 2.0 requires a Token URL");
  if (!config.authUrl.trim()) throw new Error("OAuth 2.0 requires an Authorization URL");

  const code = await openAuthPopup(config);
  return postTokenRequest(config.tokenUrl, {
    grant_type: "authorization_code",
    code,
    redirect_uri: config.redirectUri || defaultRedirectUri(),
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: config.scope,
  });
}

async function openAuthPopup(config: OAuth2Config): Promise<string> {
  const redirectUri = config.redirectUri || defaultRedirectUri();
  const state = Math.random().toString(36).slice(2);
  const sep = config.authUrl.includes("?") ? "&" : "?";
  const fullUrl = `${config.authUrl}${sep}response_type=code&client_id=${encodeURIComponent(config.clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}${config.scope ? `&scope=${encodeURIComponent(config.scope)}` : ""}`;

  const popup = window.open(fullUrl, "_blank", "width=640,height=720");

  return new Promise<string>((resolve, reject) => {
    if (!popup) {
      reject(new Error("Could not open the authorization window. Check your popup blocker."));
      return;
    }

    const timer = window.setInterval(() => {
      try {
        if (popup.closed) {
          window.clearInterval(timer);
          reject(new Error("Authorization window was closed before completing"));
          return;
        }
        const href = popup.location.href;
        if (!href || href === "about:blank") return;
        const parsed = new URL(href);
        const error = parsed.searchParams.get("error");
        if (error) {
          window.clearInterval(timer);
          popup.close();
          reject(new Error(parsed.searchParams.get("error_description") || error));
          return;
        }
        const code = parsed.searchParams.get("code");
        if (code) {
          window.clearInterval(timer);
          popup.close();
          resolve(code);
        }
      } catch {
        // Cross-origin navigation — keep polling until we can read the redirect
      }
    }, 250);

    window.setTimeout(() => {
      window.clearInterval(timer);
      try {
        popup.close();
      } catch {
        // ignore
      }
      reject(new Error("Authorization timed out after 2 minutes"));
    }, 120000);
  });
}