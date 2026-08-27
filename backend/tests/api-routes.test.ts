import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { CollectionModel } from '../src/modules/collection/collection.model.js';
import { RequestModel } from '../src/modules/request/request.model.js';
import { EnvironmentModel } from '../src/modules/environment/environment.model.js';
import { HistoryModel } from '../src/modules/history/history.model.js';
import { WorkspaceModel, WorkspaceRole } from '../src/modules/workspace/workspace.model.js';
import { redisConnection } from '../src/config/redis.js';
import { collectionRunnerQueue } from '../src/modules/runner/runner.queue.js';
import mongoose, { Types } from 'mongoose';

describe('Complete API Routes Verification Suite', () => {
  const testWorkspaceId = new Types.ObjectId().toString();
  const testCollectionId = new Types.ObjectId().toString();
  const testRequestId = new Types.ObjectId().toString();
  const testEnvId = new Types.ObjectId().toString();
  const testHistoryId = new Types.ObjectId().toString();
  const testUserId = '507f1f77bcf86cd799439011';
  const testNewMemberId = new Types.ObjectId().toString();

  beforeAll(() => {
    // Mock Redis ping for Health Readiness probe
    vi.spyOn(redisConnection, 'ping').mockResolvedValue('PONG');

    // Mock BullMQ Queue methods
    vi.spyOn(collectionRunnerQueue, 'add').mockResolvedValue({
      id: 'job-123',
      timestamp: Date.now(),
      getState: vi.fn().mockResolvedValue('waiting'),
    } as any);

    vi.spyOn(collectionRunnerQueue, 'getJob').mockResolvedValue({
      id: 'job-123',
      getState: vi.fn().mockResolvedValue('completed'),
      progress: 100,
      returnvalue: { success: true, totalExecuted: 1 },
      failedReason: null,
    } as any);

    // Mock CollectionModel
    vi.spyOn(CollectionModel, 'create').mockImplementation(async (data: any) => ({
      _id: testCollectionId,
      ...data,
      variables: new Map(Object.entries(data.variables || {})),
      headers: new Map(Object.entries(data.headers || {})),
      getVariablesObject: () => data.variables || {},
      deleteOne: vi.fn().mockResolvedValue(true),
    } as any));

    vi.spyOn(CollectionModel, 'find').mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        { _id: testCollectionId, name: 'Sample Collection', parentId: null },
      ]),
    } as any);

    vi.spyOn(CollectionModel, 'findById').mockImplementation(((async (id: any) => {
      if (id?.toString() === testCollectionId) {
        return {
          _id: testCollectionId,
          name: 'Sample Collection',
          variables: new Map([['baseUrl', 'https://api.example.com']]),
          deleteOne: vi.fn().mockResolvedValue(true),
        } as any;
      }
      return null;
    }) as any));

    vi.spyOn(CollectionModel, 'findByIdAndUpdate').mockImplementation(((async (id: any, update: any) => {
      if (id?.toString() === testCollectionId) {
        return { _id: testCollectionId, name: update.name || 'Updated Collection' } as any;
      }
      return null;
    }) as any));

    // Mock RequestModel
    vi.spyOn(RequestModel, 'create').mockImplementation(async (data: any) => ({
      _id: testRequestId,
      ...data,
    } as any));

    vi.spyOn(RequestModel, 'find').mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        { _id: testRequestId, collectionId: testCollectionId, name: 'Get Users', url: 'https://api.example.com/users', method: 'GET' },
      ]),
    } as any);

    vi.spyOn(RequestModel, 'findById').mockImplementation(((async (id: any) => {
      if (id?.toString() === testRequestId) {
        return {
          _id: testRequestId,
          collectionId: testCollectionId,
          name: 'Get Users',
          url: 'https://api.example.com/users',
          method: 'GET',
        } as any;
      }
      return null;
    }) as any));

    vi.spyOn(RequestModel, 'findByIdAndUpdate').mockImplementation(((async (id: any, update: any) => {
      if (id?.toString() === testRequestId) {
        return { _id: testRequestId, ...update } as any;
      }
      return null;
    }) as any));

    vi.spyOn(RequestModel, 'findByIdAndDelete').mockImplementation(((async (id: any) => {
      if (id?.toString() === testRequestId) {
        return { _id: testRequestId } as any;
      }
      return null;
    }) as any));

    // Mock EnvironmentModel
    vi.spyOn(EnvironmentModel, 'create').mockImplementation(async (data: any) => ({
      _id: testEnvId,
      ...data,
    } as any));

    vi.spyOn(EnvironmentModel, 'find').mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        { _id: testEnvId, name: 'Production', variables: {} },
      ]),
    } as any);

    vi.spyOn(EnvironmentModel, 'findById').mockImplementation(((async (id: any) => {
      if (id?.toString() === testEnvId) {
        return { _id: testEnvId, name: 'Production', variables: new Map() } as any;
      }
      return null;
    }) as any));

    vi.spyOn(EnvironmentModel, 'findByIdAndUpdate').mockImplementation(((async (id: any, update: any) => {
      if (id?.toString() === testEnvId) {
        return { _id: testEnvId, ...update } as any;
      }
      return null;
    }) as any));

    vi.spyOn(EnvironmentModel, 'findByIdAndDelete').mockImplementation(((async (id: any) => {
      if (id?.toString() === testEnvId) {
        return { _id: testEnvId } as any;
      }
      return null;
    }) as any));

    // Mock HistoryModel
    vi.spyOn(HistoryModel, 'create').mockImplementation(async (data: any) => ({
      _id: testHistoryId,
      ...data,
    } as any));

    vi.spyOn(HistoryModel, 'findById').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: testHistoryId,
        requestId: testRequestId,
        requestSnapshot: { method: 'GET', url: 'https://api.example.com' },
        responseSnapshot: { status: 200, statusText: 'OK' },
        metrics: { durationMs: 120, sizeBytes: 250 },
      }),
    } as any);

    vi.spyOn(HistoryModel, 'find').mockReturnValue({
      sort: vi.fn().mockReturnValue({
        skip: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([
              { _id: testHistoryId, requestId: testRequestId },
            ]),
          }),
        }),
      }),
    } as any);

    vi.spyOn(HistoryModel, 'countDocuments').mockResolvedValue(1);

    vi.spyOn(HistoryModel, 'aggregate').mockResolvedValue([
      { _id: testRequestId, totalRuns: 5, avgLatencyMs: 150, minLatencyMs: 100, maxLatencyMs: 220, avgSizeBytes: 300 },
    ]);

    vi.spyOn(HistoryModel, 'deleteMany').mockResolvedValue({ deletedCount: 1 } as any);

    // Mock WorkspaceModel
    vi.spyOn(WorkspaceModel, 'create').mockImplementation(async (data: any) => ({
      _id: testWorkspaceId,
      ...data,
    } as any));

    vi.spyOn(WorkspaceModel, 'find').mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        { _id: testWorkspaceId, name: 'Default Workspace', ownerId: new Types.ObjectId(testUserId) },
      ]),
    } as any);

    vi.spyOn(WorkspaceModel, 'findById').mockImplementation(((id: any) => {
      const isMatch = id?.toString() === testWorkspaceId;
      const workspaceDoc = {
        _id: testWorkspaceId,
        name: 'Default Workspace',
        ownerId: new Types.ObjectId(testUserId),
        members: [
          { userId: new Types.ObjectId(testUserId), role: WorkspaceRole.OWNER },
        ],
        save: vi.fn().mockResolvedValue(true),
      };

      return {
        ...workspaceDoc,
        lean: vi.fn().mockResolvedValue(isMatch ? workspaceDoc : null),
        then: (resolve: any) => Promise.resolve(isMatch ? workspaceDoc : null).then(resolve),
      };
    }) as any);
  });

  describe('1. Health and Readiness Routes', () => {
    it('GET /health should return 200 OK (liveness probe)', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('GET /ready should return readiness probe response', async () => {
      // Mock mongoose connection readyState to 1 (connected)
      vi.spyOn(mongoose.connection, 'readyState', 'get').mockReturnValue(1);

      const res = await request(app).get('/ready');
      expect([200, 503]).toContain(res.status);
      expect(res.body.checks).toBeDefined();
    });
  });

  describe('2. Sandboxed Test Runner Routes', () => {
    it('POST /api/v1/runner/run should execute test script assertions and return results', async () => {
      const res = await request(app)
        .post('/api/v1/runner/run')
        .send({
          script: `
            pm.test("Status code is 200", function () {
              pm.expect(response.status).to.equal(200);
            });
            pm.environment.set("token", "secret_abc");
          `,
          response: {
            status: 200,
            statusText: 'OK',
            headers: { 'content-type': 'application/json' },
            data: { success: true },
          },
          environmentVariables: {},
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.results[0].passed).toBe(true);
      expect(res.body.data.environmentVariables.token).toBe('secret_abc');
    });

    it('POST /api/v1/runner/queue should enqueue a collection run to BullMQ', async () => {
      const res = await request(app)
        .post('/api/v1/runner/queue')
        .send({
          collectionId: testCollectionId,
          workspaceId: testWorkspaceId,
        });

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobId).toBe('job-123');
    });

    it('GET /api/v1/runner/queue/:jobId should return background job status', async () => {
      const res = await request(app).get('/api/v1/runner/queue/job-123');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobId).toBe('job-123');
      expect(res.body.data.status).toBe('completed');
    });
  });

  describe('3. Collections CRUD Routes', () => {
    it('POST /api/v1/collections should create a new collection', async () => {
      const res = await request(app)
        .post('/api/v1/collections')
        .send({ name: 'New Test Collection', description: 'Test description' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Test Collection');
    });

    it('GET /api/v1/collections should retrieve all root collections', async () => {
      const res = await request(app).get('/api/v1/collections');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/collections/:id should retrieve a single collection', async () => {
      const res = await request(app).get(`/api/v1/collections/${testCollectionId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('PATCH /api/v1/collections/:id should update collection details', async () => {
      const res = await request(app)
        .patch(`/api/v1/collections/${testCollectionId}`)
        .send({ name: 'Updated Collection Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /api/v1/collections/:id should delete a collection', async () => {
      const res = await request(app).delete(`/api/v1/collections/${testCollectionId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('4. Requests CRUD Routes', () => {
    it('POST /api/v1/requests should create a request under a collection', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .send({
          collectionId: testCollectionId,
          name: 'Create User',
          method: 'POST',
          url: 'https://api.example.com/users',
          headers: { 'Content-Type': 'application/json' },
          body: { mode: 'json', rawContent: '{"name":"John"}' },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Create User');
    });

    it('GET /api/v1/requests/collection/:collectionId should list requests in a collection', async () => {
      const res = await request(app).get(`/api/v1/requests/collection/${testCollectionId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/requests/:id should fetch a single request blueprint', async () => {
      const res = await request(app).get(`/api/v1/requests/${testRequestId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('PATCH /api/v1/requests/:id should update a request blueprint', async () => {
      const res = await request(app)
        .patch(`/api/v1/requests/${testRequestId}`)
        .send({ name: 'Updated Request Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /api/v1/requests/:id should delete a request', async () => {
      const res = await request(app).delete(`/api/v1/requests/${testRequestId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('5. Environments CRUD Routes', () => {
    it('POST /api/v1/environments should create an environment', async () => {
      const res = await request(app)
        .post('/api/v1/environments')
        .send({
          name: 'Staging Environment',
          variables: { apiKey: 'key_staging_999' },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/environments should list environments', async () => {
      const res = await request(app).get('/api/v1/environments');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/environments/:id should get an environment by ID', async () => {
      const res = await request(app).get(`/api/v1/environments/${testEnvId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('PATCH /api/v1/environments/:id should update environment variables', async () => {
      const res = await request(app)
        .patch(`/api/v1/environments/${testEnvId}`)
        .send({ name: 'Staging V2' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /api/v1/environments/:id should delete an environment', async () => {
      const res = await request(app).delete(`/api/v1/environments/${testEnvId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('6. History & Analytics Routes', () => {
    it('GET /api/v1/history/request/:requestId should fetch audit history for a request', async () => {
      const res = await request(app).get(`/api/v1/history/request/${testRequestId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('GET /api/v1/history/request/:requestId/metrics should compute performance analytics', async () => {
      const res = await request(app).get(`/api/v1/history/request/${testRequestId}/metrics`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRuns).toBe(5);
      expect(res.body.data.avgLatencyMs).toBe(150);
    });

    it('GET /api/v1/history/:id should fetch a specific execution snapshot', async () => {
      const res = await request(app).get(`/api/v1/history/${testHistoryId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(testHistoryId);
    });

    it('DELETE /api/v1/history/request/:requestId should purge history for a request', async () => {
      const res = await request(app).delete(`/api/v1/history/request/${testRequestId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('7. Import Specification Routes', () => {
    it('POST /api/v1/import/postman should parse and import Postman collection v2.1 format', async () => {
      const postmanJson = {
        info: { name: 'Imported Postman Demo', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
        item: [
          {
            name: 'Sample Request',
            request: {
              method: 'GET',
              url: 'https://httpbin.org/get',
              header: [{ key: 'Accept', value: 'application/json' }],
            },
          },
        ],
      };

      const res = await request(app)
        .post('/api/v1/import/postman')
        .send({ postmanJson });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.name).toBe('Imported Postman Demo');
    });

    it('POST /api/v1/import/openapi should parse and import OpenAPI 3.0 specification', async () => {
      const openApiSpec = {
        openapi: '3.0.0',
        info: { title: 'Pet Store API', version: '1.0.0' },
        servers: [{ url: 'https://petstore.swagger.io/v2' }],
        paths: {
          '/pets': {
            get: {
              summary: 'List all pets',
              responses: { '200': { description: 'Success' } },
            },
          },
        },
      };

      const res = await request(app)
        .post('/api/v1/import/openapi')
        .send({ spec: openApiSpec });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.name).toBe('Pet Store API');
    });
  });

  describe('8. Workspaces & RBAC Routes', () => {
    it('POST /api/v1/workspaces should create a new workspace', async () => {
      const res = await request(app)
        .post('/api/v1/workspaces')
        .set('x-user-id', testUserId)
        .send({ name: 'Engineering Team', description: 'Core API Workspace' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Engineering Team');
    });

    it('GET /api/v1/workspaces/mine should list current user workspaces', async () => {
      const res = await request(app)
        .get('/api/v1/workspaces/mine')
        .set('x-user-id', testUserId);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/v1/workspaces/:workspaceId/members should add a member with RBAC authorization', async () => {
      const res = await request(app)
        .post(`/api/v1/workspaces/${testWorkspaceId}/members`)
        .set('x-user-id', testUserId)
        .send({
          userId: testNewMemberId,
          role: 'EDITOR',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
