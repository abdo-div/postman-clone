import { Request, Response, NextFunction } from "express";
import { ImporterService } from "./importer.service.js";

export class ImporterController {
  private importerService: ImporterService;

  constructor() {
    this.importerService = new ImporterService();
  }

  public importPostman = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.importerService.importPostmanCollection(
        req.body,
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const importerController = new ImporterController();
