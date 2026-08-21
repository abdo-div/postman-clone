import { EnvironmentModel, IEnvironment } from './environment.model.js';
import { CreateEnvironmentInput, UpdateEnvironmentInput } from './environment.dto.js';
import { NotFoundError } from '../../errors/app-error.js';

export class EnvironmentService {
  public async createEnvironment(input: CreateEnvironmentInput): Promise<IEnvironment> {
    return await EnvironmentModel.create(input as unknown as Partial<IEnvironment>);
  }

  public async getAllEnvironments(): Promise<IEnvironment[]> {
    return await EnvironmentModel.find().lean();
  }

  public async getEnvironmentById(id: string): Promise<IEnvironment> {
    const env = await EnvironmentModel.findById(id);
    if (!env) {
      throw new NotFoundError(`Environment with ID ${id} not found`);
    }
    return env;
  }

  public async updateEnvironment(id: string, input: UpdateEnvironmentInput): Promise<IEnvironment> {
    const updated = await EnvironmentModel.findByIdAndUpdate(
      id,
      input as unknown as Partial<IEnvironment>,
      { new: true, runValidators: true }
    );
    if (!updated) {
      throw new NotFoundError(`Environment with ID ${id} not found`);
    }
    return updated;
  }

  public async deleteEnvironment(id: string): Promise<void> {
    const deleted = await EnvironmentModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError(`Environment with ID ${id} not found`);
    }
  }
}