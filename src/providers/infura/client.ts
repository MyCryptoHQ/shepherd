import { randomBytes } from 'crypto';
import { RPCClient } from '../rpc/client';

export class InfuraClient extends RPCClient {
  public id(): number {
    return parseInt(randomBytes(5).toString('hex'), 16);
  }
}
