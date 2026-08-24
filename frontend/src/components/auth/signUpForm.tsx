import React, { useState } from "react";

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

const inputClasses =
  "w-full rounded-xs border border-outline-variant bg-surface-container-low px-3 py-2.5 font-code-md text-code-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary";

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onSwitchToSignIn }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const rules = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "Contains a number", valid: /\d/.test(password) },
    { label: "Contains an uppercase letter", valid: /[A-Z]/.test(password) },
  ];

  return (
    <>
      <h1 className="mb-2 font-headline-lg text-headline-lg text-on-surface">Build better APIs.</h1>
      <p className="mb-10 font-body-md text-body-md text-on-surface-variant">
        Create your workspace and start building, testing, and automating your API workflows.
      </p>

      <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); onSuccess?.(); }}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="font-label-caps text-label-caps text-on-surface-variant">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-email" className="font-label-caps text-label-caps text-on-surface-variant">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            required
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-password" className="font-label-caps text-label-caps text-on-surface-variant">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
          />

          <div className="mt-2 flex flex-col gap-1.5 rounded-xs border border-outline-variant/30 bg-surface-container/30 p-3">
            {rules.map((rule) => (
              <div
                key={rule.label}
                className={`flex items-center gap-2 ${rule.valid ? "text-primary" : "text-on-surface-variant"}`}
              >
                {rule.valid ? (
                  <span
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    className="material-symbols-outlined text-[14px]"
                  >
                    check_circle
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[14px]">radio_button_unchecked</span>
                )}
                <span className="font-body-sm text-body-sm">{rule.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="font-label-caps text-label-caps text-on-surface-variant">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClasses}
          />
        </div>

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xs bg-primary py-3 font-body-md text-body-md font-bold text-on-primary shadow-[0_0_15px_rgba(76,215,246,0.15)] transition-colors hover:bg-surface-tint"
        >
          CREATE ACCOUNT
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </form>

      <div className="mt-8 flex items-center gap-4">
        <div className="h-px flex-grow bg-outline-variant"></div>
        <span className="font-label-caps text-label-caps text-on-surface-variant">OR CONTINUE WITH</span>
        <div className="h-px flex-grow bg-outline-variant"></div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => console.log("GitHub sign-up clicked")}
          className="flex flex-1 items-center justify-center gap-2 rounded-xs border border-outline-variant bg-surface-container-low py-2.5 transition-colors hover:bg-surface-container-highest"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-on-surface">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
          </svg>
          <span className="font-body-md text-body-md text-on-surface">GitHub</span>
        </button>
        <button
          type="button"
          onClick={() => console.log("Google sign-up clicked")}
          className="flex flex-1 items-center justify-center gap-2 rounded-xs border border-outline-variant bg-surface-container-low py-2.5 transition-colors hover:bg-surface-container-highest"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          <span className="font-body-md text-body-md text-on-surface">Google</span>
        </button>
      </div>

      <div className="mt-8 text-center">
        <span className="font-body-md text-body-md text-on-surface-variant">
          Already have an account?
        </span>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSwitchToSignIn?.();
          }}
          className="ml-1 font-body-md text-body-md font-semibold text-primary hover:underline"
        >
          Sign in
        </a>
      </div>
    </>
  );
};
