import dns from 'dns/promises';
import { ForbiddenError } from '../errors/app-error.js';

// Reserved and private IPv4 / IPv6 blocks
const PRIVATE_IP_RANGES = [
  /^127\.\d+\.\d+\.\d+$/,                  // Loopback
  /^10\.\d+\.\d+\.\d+$/,                   // Private 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,   // Private 172.16.0.0/12
  /^192\.168\.\d+\.\d+$/,                 // Private 192.168.0.0/16
  /^169\.254\.\d+\.\d+$/,                 // Link-Local / Cloud Metadata
  /^0\.\d+\.\d+\.\d+$/,                    // Current network
  /^::1$/,                                 // IPv6 Loopback
  /^fe80::/,                               // IPv6 Link-Local
  /^fc00::/,                               // IPv6 Unique Local
];

export async function validateTargetUrl(rawUrl: string): Promise<void> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new ForbiddenError('Invalid request URL format.');
  }

  // Enforce HTTP/HTTPS protocols only
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new ForbiddenError(`Unsupported URL protocol: ${parsedUrl.protocol}`);
  }

  const hostname = parsedUrl.hostname;

  // Block obvious localhost aliases
  if (hostname === 'localhost' || hostname.endsWith('.local')) {
    throw new ForbiddenError('Access to local hostnames is blocked for security.');
  }

  try {
    // Resolve hostname to IP addresses
    const addresses = await dns.lookup(hostname, { all: true });

    for (const addr of addresses) {
      for (const pattern of PRIVATE_IP_RANGES) {
        if (pattern.test(addr.address)) {
          throw new ForbiddenError(
            `SSRF Guard: Request target resolves to restricted internal IP (${addr.address})`
          );
        }
      }
    }
  } catch (err: any) {
    if (err instanceof ForbiddenError) {
      throw err;
    }
    // Handle DNS lookup failures
    throw new ForbiddenError(`Unable to resolve target host: ${hostname}`);
  }
}