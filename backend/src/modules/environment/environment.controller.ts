import { Request, Response, NextFunction } from 'express';
import { EnvironmentService } from './environment.service.js';

export class EnvironmentController {
  private environmentService: EnvironmentService;

  constructor() {
    this.environmentService = new EnvironmentService();
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const environment = await this.environmentService.createEnvironment(req.body);
      res.status(201).json({ success: true, data: environment });
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const environments = await this.environmentService.getAllEnvironments();
      res.status(200).json({ success: true, data: environments });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const environment = await this.environmentService.getEnvironmentById(req.params.id);
      res.status(200).json({ success: true, data: environment });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const environment = await this.environmentService.updateEnvironment(req.params.id, req.body);
      res.status(200).json({ success: true, data: environment });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.environmentService.deleteEnvironment(req.params.id);
      res.status(200).json({ success: true, message: 'Environment deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export const environmentController = new EnvironmentController();