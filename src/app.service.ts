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
    this.dbUrl = process.env.COUCHBASE_URL;
    this.username = process.env.COUCHBASE_USERNAME;
    this.password = process.env.COUCHBASE_PASSWORD;
    this.bucket = process.env.COUCHBASE_BUCKET;
    this.typeAttribute = process.env.TYPE_ATTRIBUTE || 'restable_type';
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

  private async getDocumentByKey(key: string, type: string) {
    const collection = await this.getCollection();
    try {
      const { content } = await collection.get(key);
      if (content[this.typeAttribute] != type) {
        throw 'Type does not match';
      }
      return content;
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
    const data = await this.getDocumentByKey(id, type);
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
    const doc = await this.getDocumentByKey(id, type);
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
