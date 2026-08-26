import { SignInForm } from "./signInForm";
import { IdePreview } from "./idePreview";

interface SignInPageProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
  onForgotPassword?: () => void;
}

export function SignInPage({
  onSuccess,
  onSwitchToSignUp,
  onForgotPassword,
}: SignInPageProps) {
  return (
    <div className="flex min-h-screen bg-surface-container-lowest font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <div className="flex w-full min-h-screen">
        {/* Left Column: Sign In Form */}
        <div className="relative z-10 flex w-full flex-col border-r border-outline-variant bg-surface-container-lowest p-8 lg:w-[480px] lg:p-12">
          {/* Brand Header */}
          <a href="#" className="group mb-16 flex w-max items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary-container text-on-primary-container transition-transform group-active:scale-95">
              <span
                style={{ fontVariationSettings: "'FILL' 1" }}
                className="material-symbols-outlined text-lg"
              >
                api
              </span>
            </div>
            <span className="font-headline-md text-headline-md text-on-surface">API Workbench</span>
          </a>

          <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center">
            <SignInForm onSuccess={onSuccess} onForgotPassword={onForgotPassword} />
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Don't have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSwitchToSignUp?.();
                }}
                className="font-medium text-primary transition-colors hover:text-primary-fixed"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Right Column: IDE Preview */}
        <div className="glow-effect relative hidden flex-1 items-center justify-center overflow-hidden bg-surface-container p-12 lg:flex">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(#3d494c 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          ></div>
          <IdePreview />
        </div>
      </div>
    </div>
  );
}
