import { create } from "zustand";
import {
  environmentService,
  type Environment,
  type EnvironmentVariable,
} from "../services/environmentService";
import { interpolateVariables } from "../services/executorService";

interface EnvironmentState {
  environments: Environment[];
  activeEnvironmentId: string;
  isLoading: boolean;
  loadEnvironments: () => Promise<void>;
  setActiveEnvironmentId: (id: string) => void;
  getActiveEnvironment: () => Environment | undefined;
  getVariablesMap: () => Record<string, string>;
  interpolate: (text: string) => string;
  addEnvironment: (name: string, isProd?: boolean) => Promise<Environment>;
  updateEnvironmentName: (id: string, name: string) => Promise<void>;
  deleteEnvironment: (id: string) => Promise<void>;
  addVariable: (envId: string, variable?: Partial<EnvironmentVariable>) => void;
  updateVariable: (envId: string, varId: string, patch: Partial<EnvironmentVariable>) => void;
  deleteVariable: (envId: string, varId: string) => void;
  saveEnvironmentChanges: (envId: string) => Promise<void>;
}

// Debounce timers so typing in the editor doesn't fire a PATCH per keystroke
const persistTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearPersistTimer(envId: string) {
  const timer = persistTimers.get(envId);
  if (timer) {
    clearTimeout(timer);
    persistTimers.delete(envId);
  }
}

export const useEnvironmentStore = create<EnvironmentState>((set, get) => {
  async function persistNow(envId: string): Promise<void> {
    const env = get().environments.find((e) => e.id === envId);
    if (!env) return;
    try {
      await environmentService.updateEnvironment(envId, env.name, env.variables);
      await environmentService.saveEnvironments(get().environments);
    } catch (err) {
      console.warn("Failed to persist environment", envId, err);
    }
  }

  function schedulePersist(envId: string, delayMs = 700) {
    clearPersistTimer(envId);
    persistTimers.set(
      envId,
      setTimeout(() => {
        persistTimers.delete(envId);
        void persistNow(envId);
      }, delayMs),
    );
  }

  function mutateVariables(
    envId: string,
    mutate: (vars: EnvironmentVariable[]) => EnvironmentVariable[],
  ) {
    set({
      environments: get().environments.map((e) =>
        e.id === envId ? { ...e, variables: mutate(e.variables) } : e,
      ),
    });
    schedulePersist(envId);
  }

  return {
    environments: [],
    activeEnvironmentId: localStorage.getItem("active_environment_id") || "",
    isLoading: false,

    loadEnvironments: async () => {
      set({ isLoading: true });
      const envs = await environmentService.getEnvironments();
      const activeId = get().activeEnvironmentId;
      const validActiveId = envs.some((e) => e.id === activeId)
        ? activeId
        : envs[0]?.id || "";

      set({
        environments: envs,
        activeEnvironmentId: validActiveId,
        isLoading: false,
      });
    },

    setActiveEnvironmentId: (id: string) => {
      localStorage.setItem("active_environment_id", id);
      set({ activeEnvironmentId: id });
    },

    getActiveEnvironment: () => {
      const { environments, activeEnvironmentId } = get();
      return environments.find((e) => e.id === activeEnvironmentId) || environments[0];
    },

    getVariablesMap: () => {
      const active = get().getActiveEnvironment();
      if (!active) return {};
      const map: Record<string, string> = {};
      for (const v of active.variables) {
        if (v.key && v.key.trim()) {
          map[v.key.trim()] = v.currentValue ?? v.initialValue ?? "";
        }
      }
      return map;
    },

    interpolate: (text: string) => {
      const vars = get().getVariablesMap();
      return interpolateVariables(text, vars);
    },

    addEnvironment: async (name: string, isProd = false) => {
      const newEnv = await environmentService.createEnvironment(name, isProd, []);
      const updated = [...get().environments, newEnv];
      set({ environments: updated, activeEnvironmentId: newEnv.id });
      await environmentService.saveEnvironments(updated);
      return newEnv;
    },

    updateEnvironmentName: async (id: string, name: string) => {
      set({
        environments: get().environments.map((e) => (e.id === id ? { ...e, name } : e)),
      });
      schedulePersist(id);
    },

    deleteEnvironment: async (id: string) => {
      clearPersistTimer(id);
      const remaining = get().environments.filter((e) => e.id !== id);
      const newActiveId = remaining[0]?.id || "";
      set({ environments: remaining, activeEnvironmentId: newActiveId });
      await environmentService.saveEnvironments(remaining);
      await environmentService.deleteEnvironment(id);
    },

    addVariable: (envId: string, variable = {}) => {
      mutateVariables(envId, (vars) => [
        ...vars,
        {
          id: "v-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
          key: "",
          initialValue: "",
          currentValue: "",
          secret: false,
          description: "",
          ...variable,
        },
      ]);
    },

    updateVariable: (envId: string, varId: string, patch: Partial<EnvironmentVariable>) => {
      mutateVariables(envId, (vars) =>
        vars.map((v) => (v.id === varId ? { ...v, ...patch } : v)),
      );
    },

    deleteVariable: (envId: string, varId: string) => {
      mutateVariables(envId, (vars) => vars.filter((v) => v.id !== varId));
    },

    saveEnvironmentChanges: async (envId: string) => {
      clearPersistTimer(envId);
      await persistNow(envId);
    },
  };
});
