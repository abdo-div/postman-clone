import { RequestModel, IRequest } from './request.model.js';
import { CollectionModel } from '../collection/collection.model.js';
import { CreateRequestInput, UpdateRequestInput } from './request.dto.js';
import { NotFoundError } from '../../errors/app-error.js';

export class RequestService {
  public async createRequest(input: CreateRequestInput): Promise<IRequest> {
    const collectionExists = await CollectionModel.findById(input.collectionId);
    if (!collectionExists) {
      throw new NotFoundError(`Parent Collection with ID ${input.collectionId} not found`);
    }

    return await RequestModel.create(input as unknown as Partial<IRequest>);
  }

  public async getRequestsByCollection(collectionId: string): Promise<IRequest[]> {
    return await RequestModel.find({ collectionId }).lean();
  }

  public async getRequestById(id: string): Promise<IRequest> {
    const requestItem = await RequestModel.findById(id);
    if (!requestItem) {
      throw new NotFoundError(`Request with ID ${id} not found`);
    }
    return requestItem;
  }

  public async updateRequest(id: string, input: UpdateRequestInput): Promise<IRequest> {
    const updated = await RequestModel.findByIdAndUpdate(
      id,
      input as unknown as Partial<IRequest>,
      { new: true, runValidators: true }
    );
    if (!updated) {
      throw new NotFoundError(`Request with ID ${id} not found`);
    }
    return updated;
  }

  public async deleteRequest(id: string): Promise<void> {
    const deleted = await RequestModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError(`Request with ID ${id} not found`);
    }
  }
}