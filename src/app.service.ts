import { Injectable } from '@nestjs/common';
import { AttributeType, IRestableService, ResourceListResponse, ResourceResponse } from '@obel/restable'

@Injectable()
export class AppService implements IRestableService {
  createItem(type: string, body: AttributeType): Promise<ResourceResponse> {
    throw new Error('Method not implemented.');
  }
  findById(type: string, id: string): Promise<ResourceResponse> {
    throw new Error('Method not implemented.');
  }
  editItem(type: string, id: string, attributes: AttributeType): Promise<ResourceResponse> {
    throw new Error('Method not implemented.');
  }
  getItemsByType(type: string): Promise<ResourceListResponse> {
    throw new Error('Method not implemented.');
  }
}
