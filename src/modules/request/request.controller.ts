import { Request, Response, NextFunction } from 'express';
import { RequestService } from './request.service.js';

export class RequestController {
  private requestService: RequestService;

  constructor() {
    this.requestService = new RequestService();
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestItem = await this.requestService.createRequest(req.body);
      res.status(201).json({ success: true, data: requestItem });
    } catch (error) {
      next(error);
    }
  };

// Add or update the getByCollection method inside RequestController
public getByCollection = async (
  req: Request<{ collectionId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const requests = await this.requestService.getRequestsByCollection(req.params.collectionId);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

  public getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestItem = await this.requestService.getRequestById(req.params.id);
      res.status(200).json({ success: true, data: requestItem });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestItem = await this.requestService.updateRequest(req.params.id, req.body);
      res.status(200).json({ success: true, data: requestItem });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.requestService.deleteRequest(req.params.id);
      res.status(200).json({ success: true, message: 'Request deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export const requestController = new RequestController();