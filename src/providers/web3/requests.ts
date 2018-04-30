import { IWeb3Requests } from '@src/types';
import { RpcMethodNames } from 'eth-rpc-types/primitives';
import { RPCRequests } from '../rpc/requests';

export class Web3Requests extends RPCRequests implements IWeb3Requests {
  public sendTransaction: IWeb3Requests['sendTransaction'] = tx => ({
    method: RpcMethodNames.ETH_SEND_TRANSACTION,
    params: [tx],
  });

  public signMessage: IWeb3Requests['signMessage'] = (msgHex, fromAddr) => ({
    method: RpcMethodNames.ETH_PERSONAL_SIGN,
    params: [msgHex, fromAddr],
  });

  public getAccounts: IWeb3Requests['getAccounts'] = () => ({
    method: RpcMethodNames.ETH_ACCOUNTS,
    params: [],
  });
}
