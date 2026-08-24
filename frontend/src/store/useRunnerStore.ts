import { create } from "zustand";
import type { Collection, RequestItem } from "../services/collectionService";
import { executorService, interpolateVariables } from "../services/executorService";

export type RunStatus = "idle" | "running" | "completed" | "aborted";
export type StepStatus = "pending" | "running" | "passed" | "failed" | "skipped";

export interface RunStep {
  id: string;
  requestId: string;
  requestName: string;
  method: string;
  url: string;
  status: StepStatus;
  responseStatus?: number;
  durationMs?: number;
  sizeBytes?: number;
  testsPassed?: number;
  testsFailed?: number;
  error?: string;
  response?: any;
  testResults?: { name: string; passed: boolean; error?: string }[];
}

export interface RunSummary {
  totalRequests: number;
  completed: number;
  testsPassed: number;
  testsFailed: number;
  totalDurationMs: number;
  startedAt: string;
}

interface RunnerState {
  selectedCollectionId: string | null;
  selectedEnvironmentId: string | null;
  iterations: number;
  delayMs: number;
  stopOnError: boolean;
  runStatus: RunStatus;
  steps: RunStep[];
  summary: RunSummary | null;
  activeStepId: string | null;
  progress: number; // 0-100

  setSelectedCollectionId: (id: string | null) => void;
  setSelectedEnvironmentId: (id: string | null) => void;
  setIterations: (n: number) => void;
  setDelayMs: (n: number) => void;
  setStopOnError: (v: boolean) => void;
  setActiveStepId: (id: string | null) => void;

  runCollection: (
    collection: Collection,
    environmentVariables: Record<string, string>,
  ) => Promise<void>;
  abortRun: () => void;
  reset: () => void;
}

let _abortRequested = false;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const useRunnerStore = create<RunnerState>((set, get) => ({
  selectedCollectionId: null,
  selectedEnvironmentId: null,
  iterations: 1,
  delayMs: 0,
  stopOnError: false,
  runStatus: "idle",
  steps: [],
  summary: null,
  activeStepId: null,
  progress: 0,

  setSelectedCollectionId: (id) => set({ selectedCollectionId: id }),
  setSelectedEnvironmentId: (id) => set({ selectedEnvironmentId: id }),
  setIterations: (n) => set({ iterations: Math.max(1, n) }),
  setDelayMs: (n) => set({ delayMs: Math.max(0, n) }),
  setStopOnError: (v) => set({ stopOnError: v }),
  setActiveStepId: (id) => set({ activeStepId: id }),

  runCollection: async (collection, environmentVariables) => {
    const { iterations, delayMs, stopOnError } = get();
    _abortRequested = false;

    const requests: RequestItem[] = collection.requests || [];
    if (requests.length === 0) return;

    // Build initial steps
    const initialSteps: RunStep[] = requests.map((r) => ({
      id: "step-" + r.id,
      requestId: r.id,
      requestName: r.name,
      method: r.method,
      url: r.url,
      status: "pending",
    }));

    set({
      runStatus: "running",
      steps: initialSteps,
      progress: 0,
      summary: {
        totalRequests: requests.length * iterations,
        completed: 0,
        testsPassed: 0,
        testsFailed: 0,
        totalDurationMs: 0,
        startedAt: new Date().toISOString(),
      },
    });

    let currentEnvVars = { ...environmentVariables };
    let totalTestsPassed = 0;
    let totalTestsFailed = 0;
    let totalDuration = 0;
    let completed = 0;

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < requests.length; i++) {
        if (_abortRequested) {
          set({ runStatus: "aborted" });
          return;
        }

        const req = requests[i];
        const stepId = "step-" + req.id;

        // Mark running
        set((s) => ({
          steps: s.steps.map((st) =>
            st.id === stepId ? { ...st, status: "running" } : st,
          ),
          activeStepId: stepId,
        }));

        // Interpolate URL
        const interpolatedUrl = interpolateVariables(req.url, currentEnvVars);
        const interpolatedHeaders: Record<string, string> = {};
        for (const h of req.headers || []) {
          if (h.enabled && h.key.trim()) {
            interpolatedHeaders[h.key.trim()] = interpolateVariables(
              h.value,
              currentEnvVars,
            );
          }
        }

        try {
          const result = await executorService.execute({
            url: interpolatedUrl,
            method: req.method,
            headers: interpolatedHeaders,
            body: req.body
              ? interpolateVariables(req.body, currentEnvVars)
              : undefined,
            environmentVariables: currentEnvVars,
          });

          // Run tests
          let stepTestsPassed = 0;
          let stepTestsFailed = 0;
          let testResults: { name: string; passed: boolean; error?: string }[] = [];

          if (req.testsScript && req.testsScript.trim()) {
            const { executeTestScript } = await import("../services/executorService");
            const testRes = executeTestScript(
              req.testsScript,
              {
                status: result.status,
                statusText: result.statusText,
                headers: result.headers,
                data: result.data,
                responseTime: result.metrics?.durationMs,
              },
              currentEnvVars,
            );
            testResults = testRes.results;
            stepTestsPassed = testRes.results.filter((r) => r.passed).length;
            stepTestsFailed = testRes.results.filter((r) => !r.passed).length;
            currentEnvVars = { ...currentEnvVars, ...testRes.environmentVariables };
          }

          const passed = result.status < 400;
          totalTestsPassed += stepTestsPassed;
          totalTestsFailed += stepTestsFailed;
          totalDuration += result.metrics?.durationMs || 0;
          completed++;

          set((s) => ({
            steps: s.steps.map((st) =>
              st.id === stepId
                ? {
                    ...st,
                    status: passed ? "passed" : "failed",
                    responseStatus: result.status,
                    durationMs: result.metrics?.durationMs || 0,
                    sizeBytes: result.metrics?.sizeBytes || 0,
                    testsPassed: stepTestsPassed,
                    testsFailed: stepTestsFailed,
                    testResults,
                    response: result,
                  }
                : st,
            ),
            progress: Math.round(
              ((iter * requests.length + i + 1) / (iterations * requests.length)) * 100,
            ),
            summary: {
              totalRequests: requests.length * iterations,
              completed,
              testsPassed: totalTestsPassed,
              testsFailed: totalTestsFailed,
              totalDurationMs: totalDuration,
              startedAt: s.summary?.startedAt || new Date().toISOString(),
            },
          }));

          if (stopOnError && !passed) {
            set({ runStatus: "aborted" });
            return;
          }
        } catch (err: any) {
          completed++;
          totalTestsFailed++;

          set((s) => ({
            steps: s.steps.map((st) =>
              st.id === stepId
                ? { ...st, status: "failed", error: err.message }
                : st,
            ),
            progress: Math.round(
              ((iter * requests.length + i + 1) / (iterations * requests.length)) * 100,
            ),
          }));

          if (stopOnError) {
            set({ runStatus: "aborted" });
            return;
          }
        }

        if (delayMs > 0 && i < requests.length - 1) {
          await sleep(delayMs);
        }
      }
    }

    set({ runStatus: "completed", progress: 100, activeStepId: null });
  },

  abortRun: () => {
    _abortRequested = true;
    set({ runStatus: "aborted" });
  },

  reset: () => {
    _abortRequested = false;
    set({
      runStatus: "idle",
      steps: [],
      summary: null,
      activeStepId: null,
      progress: 0,
    });
  },
}));
