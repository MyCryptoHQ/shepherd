import { IRPCRequests } from '@src/types';
import {
  ENUM_DEFAULT_BLOCK,
  RpcMethodNames as RPC,
} from 'eth-rpc-types/primitives';

export class RPCRequests implements IRPCRequests {
  public getNetVersion: IRPCRequests['getNetVersion'] = () => ({
    method: RPC.NET_VERSION,
    params: [],
  });

  public sendRawTx: IRPCRequests['sendRawTx'] = signedTx => ({
    method: RPC.ETH_SEND_RAW_TRANSACTION,
    params: [signedTx],
  });

  public estimateGas: IRPCRequests['estimateGas'] = transaction => ({
    method: RPC.ETH_ESTIMATE_GAS,
    params: [transaction],
  });

  public getBalance: IRPCRequests['getBalance'] = address => ({
    method: RPC.ETH_GET_BALANCE,
    params: [address, ENUM_DEFAULT_BLOCK.PENDING],
  });

  public ethCall: IRPCRequests['ethCall'] = txObj => ({
    method: RPC.ETH_CALL,
    params: [txObj, ENUM_DEFAULT_BLOCK.PENDING],
  });

  public getTransactionCount: IRPCRequests['getTransactionCount'] = address => ({
    method: RPC.ETH_GET_TRANSACTION_COUNT,
    params: [address, ENUM_DEFAULT_BLOCK.PENDING],
  });

  public getTransactionByHash: IRPCRequests['getTransactionByHash'] = txhash => ({
    method: RPC.ETH_GET_TRANSACTION_BY_HASH,
    params: [txhash],
  });

  public getTransactionReceipt: IRPCRequests['getTransactionReceipt'] = txhash => ({
    method: RPC.ETH_GET_TRANSACTION_RECEIPT,
    params: [txhash],
  });

  public getCurrentBlock: IRPCRequests['getCurrentBlock'] = () => ({
    method: RPC.ETH_BLOCK_NUMBER,
    params: [],
  });
}
