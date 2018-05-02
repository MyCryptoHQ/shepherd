import { IStrIdx } from '@src/types';
import { randomBytes } from 'crypto';

export class BaseClient {
  protected endpoint: string;
  protected headers: IStrIdx<string>;
  constructor(endpoint: string, headers: IStrIdx<string> = {}) {
    this.endpoint = endpoint;
    this.headers = headers;
  }

  public id(): string | number {
    return randomBytes(16).toString('hex');
  }
}
