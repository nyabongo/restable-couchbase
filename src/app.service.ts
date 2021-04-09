import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  AttributeType,
  IRestableService,
  ResourceListResponse,
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
  private removeMetaData(data: AttributeType) {
    const response = { ...data };
    delete response[this.typeAttribute];
    return response;
  }

  private async getDocumentByKey(key: string) {
    const collection = await this.getCollection();
    try {
      const result = await collection.get(key);
      return result.content;
    } catch (error) {
      throw new HttpException(
        {
          errors: [
            {
              title: 'Document not found',
              details: 'Failed to find the document with the given key',
            },
          ],
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findById(type: string, id: string): Promise<ResourceResponse> {
    const data = await this.getDocumentByKey(id);
    return {
      data: {
        id,
        type,
        attributes: { ...this.removeMetaData(data) },
      },
    };
  }

  async editItem(
    type: string,
    id: string,
    attributes: AttributeType,
  ): Promise<ResourceResponse> {
    const doc = await this.getDocumentByKey(id);
    const newDoc = { ...doc, ...attributes };
    const collection = await this.getCollection();
    await collection.upsert(id, newDoc);
    return {
      data: {
        id,
        type,
        attributes: this.removeMetaData(newDoc),
      },
    };
  }
  async getItemsByType(type: string): Promise<ResourceListResponse> {
    const query = `SELECT META().id, * FROM \`${this.bucket}\` AS data WHERE ${this.typeAttribute}='${type}'`;
    const cluster = await this.getCluster();
    const response = await cluster.query(query);
    console.log(response.meta);
    return {
      data: response.rows.map((row) => {
        return {
          id: row['id'],
          type: row['data'][this.typeAttribute],
          attributes: { ...this.removeMetaData(row['data']) },
        };
      }),
    };
  }
}
