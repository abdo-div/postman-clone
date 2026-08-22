import { CollectionModel } from "../collection/collection.model.js";
import { RequestModel } from "../request/request.model.js";
import { EnvironmentModel } from "../environment/environment.model.js";
import { HistoryModel } from "../history/history.model.js";
import { ExecutorService } from "../executor/executor.service.js";
import { RunnerService } from "./runner.service.js";
import { NotFoundError } from "../../errors/app-error.js";

export interface RunCollectionInput {
  collectionId: string;
  environmentId?: string | undefined;
  onProgress?: (progress: any) => void;
  
}

export class CollectionRunnerService {
  private executorService: ExecutorService;
  private runnerService: RunnerService;

  constructor() {
    this.executorService = new ExecutorService();
    this.runnerService = new RunnerService();
  }

  public async runCollection(input: RunCollectionInput) {
    const collection = await CollectionModel.findById(input.collectionId);
    if (!collection) {
      throw new NotFoundError(
        `Collection with ID ${input.collectionId} not found`,
      );
    }

    // 1. Resolve initial active variables (Collection vars + Environment vars override)
    let activeVars: Record<string, string> = {};

    if (collection.variables) {
      collection.variables.forEach((val, key) => {
        activeVars[key] = val;
      });
    }

    if (input.environmentId) {
      const env = await EnvironmentModel.findById(input.environmentId);
      if (env && env.variables) {
        env.variables.forEach((val, key) => {
          activeVars[key] = val;
        });
      }
    }

    // 2. Fetch all request blueprints tied to this collection
    const requests = await RequestModel.find({
      collectionId: input.collectionId,
    });

    const executionSummary = [];

    // 3. Sequentially execute requests in order
    for (const reqItem of requests) {
      // Execute standard HTTP call with variable substitution
      const executionResult = await this.executorService.execute({
        url: reqItem.url,
        method: reqItem.method,
        headers: Object.fromEntries(reqItem.headers || new Map()),
        body: reqItem.body?.rawContent,
        environmentVariables: activeVars,
        timeoutMs: 10000,
      });

      let testResults: Array<{
        name: string;
        passed: boolean;
        error?: string;
      }> = [];

      // Pass test assertions to sandboxed node:vm engine
      if (reqItem.testScript) {
        const scriptOutput = await this.runnerService.runScript({
          script: reqItem.testScript,
          response: {
            status: executionResult.status,
            statusText: executionResult.statusText,
            headers: executionResult.headers,
            data: executionResult.data,
          },
          environmentVariables: activeVars,
          timeoutMs: 3000,
        });

        testResults = scriptOutput.results;
        activeVars = scriptOutput.environmentVariables; // Capture mutated vars for subsequent requests
      }

      // 4. Save execution audit snapshot to History collection
      const historyRecord = await HistoryModel.create({
        requestId: reqItem._id,
        requestSnapshot: {
          method: reqItem.method,
          url: reqItem.url,
          headers: Object.fromEntries(reqItem.headers || new Map()),
          body: reqItem.body?.rawContent || "",
        },
        responseSnapshot: {
          status: executionResult.status,
          statusText: executionResult.statusText,
          headers: executionResult.headers,
          data:
            typeof executionResult.data === "string"
              ? executionResult.data
              : JSON.stringify(executionResult.data),
        },
        metrics: executionResult.metrics,
        testResults,
      });

      executionSummary.push({
        requestId: reqItem._id,
        name: reqItem.name,
        status: executionResult.status,
        metrics: executionResult.metrics,
        tests: testResults,
        historyId: historyRecord._id,
      });
    }

    return {
      collectionId: collection._id,
      collectionName: collection.name,
      totalExecuted: executionSummary.length,
      summary: executionSummary,
      finalEnvironmentVariables: activeVars,
    };
  }
}
