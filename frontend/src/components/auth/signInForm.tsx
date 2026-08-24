import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";

interface SignInFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSuccess, onForgotPassword }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, guestLogin, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const ok = await login({ email, password });
    if (ok) onSuccess?.();
  };

  const handleGuest = () => {
    guestLogin();
    onSuccess?.();
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 font-headline-lg text-headline-lg">Welcome back.</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Sign in to continue to your API workspace.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded border border-error/40 bg-error-container/50 px-3 py-2.5 text-sm text-error">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="email" className="block font-body-sm text-body-sm text-on-surface-variant">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="dev@example.com"
            className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-2 font-code-md text-code-md text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary-container"
          />
        </div>

        <div className="relative space-y-1.5">
          <label htmlFor="password" className="block font-body-sm text-body-sm text-on-surface-variant">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded border border-outline-variant bg-surface-container-low py-2 pl-3 pr-10 font-code-md text-code-md text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary-container"
            />
            <button
              type="button"
              title="Toggle password visibility"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pb-4 pt-2">
          <label className="group flex cursor-pointer items-center gap-2">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                defaultChecked={false}
                className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-outline-variant bg-surface-container-low transition-colors checked:border-primary-container checked:bg-primary-container"
              />
              <span
                style={{ fontVariationSettings: "'FILL' 1" }}
                className="material-symbols-outlined pointer-events-none absolute text-[10px] text-on-primary-container opacity-0 peer-checked:opacity-100"
              >
                check
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant transition-colors group-hover:text-on-surface">
              Remember me
            </span>
          </label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onForgotPassword?.();
            }}
            className="font-body-sm text-body-sm text-primary transition-colors hover:text-primary-fixed"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded bg-primary-container py-2.5 font-headline-md text-[14px] font-bold leading-5 text-on-primary-container transition-colors duration-150 hover:bg-primary-fixed active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              SIGNING IN...
            </>
          ) : (
            "SIGN IN"
          )}
        </button>
      </form>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleGuest}
          className="w-full rounded border border-outline-variant py-2.5 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">person</span>
          Continue as Guest
        </button>
      </div>

      <div className="mt-8">
        <div className="relative mb-6 flex items-center">
          <div className="flex-grow border-t border-outline-variant"></div>
          <span className="mx-4 shrink-0 font-body-sm text-body-sm text-on-surface-variant">
            or continue with
          </span>
          <div className="flex-grow border-t border-outline-variant"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              guestLogin();
              onSuccess?.();
            }}
            className="flex items-center justify-center gap-2 rounded border border-outline-variant bg-surface-container-low py-2 transition-colors duration-150 hover:bg-surface-container active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-base">code</span>
            <span className="font-body-sm text-body-sm">GitHub</span>
          </button>
          <button
            type="button"
            onClick={() => {
              guestLogin();
              onSuccess?.();
            }}
            className="flex items-center justify-center gap-2 rounded border border-outline-variant bg-surface-container-low py-2 transition-colors duration-150 hover:bg-surface-container active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-base">data_object</span>
            <span className="font-body-sm text-body-sm">Google</span>
          </button>
        </div>
      </div>
    </>
  );
};
