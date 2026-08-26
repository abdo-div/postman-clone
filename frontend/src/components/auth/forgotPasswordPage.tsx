import React, { useState } from "react";

interface ForgotPasswordPageProps {
  onBack?: () => void;
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmittedEmail(email);
    requestAnimationFrame(() => setVisible(true));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container">
      <main className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2 text-primary">
            <span
              style={{ fontVariationSettings: "'FILL' 1" }}
              className="material-symbols-outlined text-3xl"
            >
              terminal
            </span>
            <span className="font-headline-lg font-bold text-headline-lg">API Workbench</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="relative overflow-hidden rounded-[8px] border border-outline-variant bg-panel-level-1 p-8 shadow-2xl">
          <div className="absolute left-0 right-0 top-0 h-[2px] bg-primary-container"></div>

          {submittedEmail == null ? (
            <div className="flex flex-col">
              <h1 className="mb-2 font-headline-lg text-headline-lg text-on-surface">
                Reset your password
              </h1>
              <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
                Enter the email associated with your account and we'll send you a password reset
                link.
              </p>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="reset-email"
                    className="mb-2 block font-label-caps uppercase text-label-caps text-on-surface-variant"
                  >
                    Email Address
                  </label>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    required
                    placeholder="developer@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-sm border border-slate-800 bg-panel-level-1 px-4 py-3 font-code-md text-code-md text-on-surface transition-colors duration-200 focus:border-cyan-accent focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-cyan-accent py-3 font-label-caps uppercase text-label-caps text-slate-950 transition-colors duration-200 hover:bg-primary"
                >
                  <span>Send Reset Link</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </form>
            </div>
          ) : (
            <div
              className={`flex flex-col items-center text-center transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high text-primary">
                <span
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  className="material-symbols-outlined text-3xl"
                >
                  mark_email_read
                </span>
              </div>
              <h2 className="mb-2 font-headline-lg text-headline-lg text-on-surface">
                Check your inbox
              </h2>
              <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
                We've sent a password reset link to{" "}
                <strong className="text-on-surface">{submittedEmail}</strong>.
              </p>
              <p className="font-body-sm text-body-sm text-outline">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          )}
        </div>

        {/* Back to Sign In */}
        <div className="mt-8 text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onBack?.();
            }}
            className="inline-flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant transition-colors duration-200 hover:text-primary"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Sign In</span>
          </a>
        </div>
      </main>
    </div>
  );
}
