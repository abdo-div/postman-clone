import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

const inputClasses =
  "w-full rounded-xs border border-outline-variant bg-surface-container-low px-3 py-2.5 font-code-md text-code-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary";

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const { register, guestLogin, isLoading, error, clearError } = useAuthStore();

  const rules = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "Contains a number", valid: /\d/.test(password) },
    { label: "Contains an uppercase letter", valid: /[A-Z]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError("");

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (rules.some((r) => !r.valid)) {
      setLocalError("Password does not meet requirements");
      return;
    }

    const ok = await register({ name: fullName, email, password });
    if (ok) onSuccess?.();
  };

  const displayError = localError || error;

  return (
    <>
      <h1 className="mb-2 font-headline-lg text-headline-lg text-on-surface">Build better APIs.</h1>
      <p className="mb-8 font-body-md text-body-md text-on-surface-variant">
        Create your workspace and start building, testing, and automating your API workflows.
      </p>

      {displayError && (
        <div className="mb-4 flex items-center gap-2 rounded border border-error/40 bg-error-container/50 px-3 py-2.5 text-sm text-error">
          <span className="material-symbols-outlined text-sm">error</span>
          {displayError}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
          disabled={isLoading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xs bg-primary py-3 font-body-md text-body-md font-bold text-on-primary shadow-[0_0_15px_rgba(76,215,246,0.15)] transition-colors hover:bg-surface-tint disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              CREATING ACCOUNT...
            </>
          ) : (
            <>
              CREATE ACCOUNT
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => { guestLogin(); onSuccess?.(); }}
          className="flex w-full items-center justify-center gap-2 rounded-xs border border-outline-variant py-2.5 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-sm">person</span>
          Continue as Guest
        </button>
      </form>

      <div className="mt-8 text-center">
        <span className="font-body-md text-body-md text-on-surface-variant">
          Already have an account?
        </span>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onSwitchToSignIn?.(); }}
          className="ml-1 font-body-md text-body-md font-semibold text-primary hover:underline"
        >
          Sign in
        </a>
      </div>
    </>
  );
}
