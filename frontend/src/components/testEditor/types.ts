export type AssertionStatus = "passed" | "failed" | "skipped";

export interface TestAssertion {
  id: string;
  name: string;
  status: AssertionStatus;
  durationMs: string | null;
  error?: string;
}
