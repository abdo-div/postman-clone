import { CollectionModel, ICollection } from './collection.model.js';
import { CreateCollectionInput, UpdateCollectionInput } from './collection.dto.js';
import { NotFoundError } from '../../errors/app-error.js';

export class CollectionService {
  public async createCollection(input: CreateCollectionInput): Promise<ICollection> {
    return await CollectionModel.create(input as unknown as Partial<ICollection>);
  }

  public async getAllCollections(): Promise<ICollection[]> {
    // Retrieves top-level root collections (where parentId is null)
    return await CollectionModel.find({ parentId: null }).lean();
  }

  public async getCollectionById(id: string): Promise<ICollection> {
    const collection = await CollectionModel.findById(id);
    if (!collection) {
      throw new NotFoundError(`Collection with ID ${id} not found`);
    }
    return collection;
  }

  public async updateCollection(id: string, input: UpdateCollectionInput): Promise<ICollection> {
    const updated = await CollectionModel.findByIdAndUpdate(id, input, { new: true });
    if (!updated) {
      throw new NotFoundError(`Collection with ID ${id} not found`);
    }
    return updated;
  }

  public async deleteCollection(id: string): Promise<void> {
    const collection = await CollectionModel.findById(id);
    if (!collection) {
      throw new NotFoundError(`Collection with ID ${id} not found`);
    }
    // Triggers schema pre('deleteOne') hook for cascading request cleanup
    await collection.deleteOne();
  }
}