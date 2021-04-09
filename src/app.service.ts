import { Injectable } from '@nestjs/common';
import {
  AttributeType,
  IRestableService,
  ResourceResponse,
} from '@obel/restable';
import * as couchbase from 'couchbase';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService implements IRestableService {
  private dbUrl: string;
  private username: string;
  private password: string;
  private bucket: string;
  private typeAttribute: string;

  constructor() {
    this.dbUrl = 'couchbase://localhost';
    this.username = 'Administrator';
    this.password = 'watchtower';
    this.bucket = 'Heroes';
    this.typeAttribute = 'restable_type';
  }

  private async getCluster() {
    return await couchbase.connect(this.dbUrl, {
      username: this.username,
      password: this.password,
    });
  }

  private async getCollection() {
    const cluster = await this.getCluster();
    const bucket = cluster.bucket(this.bucket);
    const collection = bucket.defaultCollection();
    return collection;
  }

  async createItem(
    type: string,
    body: AttributeType,
  ): Promise<ResourceResponse> {
    const key = uuidv4();
    const collection = await this.getCollection();
    await collection.insert(key, { ...body, [this.typeAttribute]: type });
    return {
      data: {
        type,
        id: key,
        attributes: body,
      },
    };
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
