import { Request, Response, NextFunction } from 'express';
import { HistoryService } from './history.service.js';

export class HistoryController {
  private historyService: HistoryService;

  constructor() {
    this.historyService = new HistoryService();
  }

  public getById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const history = await this.historyService.getHistoryById(req.params.id);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  };

  public getByRequest = async (
    req: Request<{ requestId: string }, any, any, { page: string; limit: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Zod handles coercion, but we parse here to satisfy TypeScript
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      
      const result = await this.historyService.getHistoryByRequestId(req.params.requestId, page, limit);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  public getMetrics = async (
    req: Request<{ requestId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const metrics = await this.historyService.getRequestMetrics(req.params.requestId);
      res.status(200).json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  };

  public clearRequestHistory = async (
    req: Request<{ requestId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.historyService.clearHistoryForRequest(req.params.requestId);
      res.status(200).json({ success: true, message: 'Request history cleared' });
    } catch (error) {
      next(error);
    }
  };
}

export const historyController = new HistoryController();