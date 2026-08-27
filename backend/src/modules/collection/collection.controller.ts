import { Request, Response, NextFunction } from 'express';
import { CollectionService } from './collection.service.js';

export class CollectionController {
  private collectionService: CollectionService;

  constructor() {
    this.collectionService = new CollectionService();
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const collection = await this.collectionService.createCollection(req.body);
      res.status(201).json({ success: true, data: collection });
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const collections = await this.collectionService.getAllCollections();
      res.status(200).json({ success: true, data: collections });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const collection = await this.collectionService.getCollectionById(req.params.id);
      res.status(200).json({ success: true, data: collection });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const collection = await this.collectionService.updateCollection(req.params.id, req.body);
      res.status(200).json({ success: true, data: collection });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.collectionService.deleteCollection(req.params.id);
      res.status(200).json({ success: true, message: 'Collection deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export const collectionController = new CollectionController();