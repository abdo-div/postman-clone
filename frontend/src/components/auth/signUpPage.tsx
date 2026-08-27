import { SignUpForm } from "./signUpForm";
import { RunnerPreview } from "./runnerPreview";
import { BrandLogo } from "../layout/BrandLogo";

interface SignUpPageProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export function SignUpPage({ onSuccess, onSwitchToSignIn }: SignUpPageProps) {
  return (
    <div className="flex min-h-screen bg-surface-container-lowest font-body-md text-on-surface selection:bg-primary selection:text-on-primary">
      {/* Left Pane: Form */}
      <div className="relative z-10 w-full overflow-y-auto border-r border-outline-variant/30 bg-surface-container-lowest p-8 lg:w-5/12 lg:p-12 xl:w-[45%] xl:p-16">
        <div className="flex items-center gap-2 text-primary">
          <BrandLogo height={50} />
        </div>

        <div className="mx-auto mt-12 mb-12 flex w-full max-w-sm grow flex-col justify-center">
          <SignUpForm onSuccess={onSuccess} onSwitchToSignIn={onSwitchToSignIn} />
        </div>
      </div>

      {/* Right Pane: Visual Preview */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-surface lg:flex lg:w-7/12 xl:w-[55%]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,_rgba(76,215,246,0.08)_0%,_transparent_50%)]"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(134,147,151,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(134,147,151,0.05) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          ></div>
        </div>
        <RunnerPreview />
      </div>
    </div>
  );
}
