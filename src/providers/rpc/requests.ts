import { TRPCRequests } from '@src/providers/rpc/types';
import {
  ENUM_DEFAULT_BLOCK,
  RpcMethodNames as RPC,
} from 'eth-rpc-types/primitives';

export class RPCRequests implements TRPCRequests {
  public getNetVersion: TRPCRequests['getNetVersion'] = () => ({
    method: RPC.NET_VERSION,
    params: [],
  });

  public sendRawTx: TRPCRequests['sendRawTx'] = signedTx => ({
    method: RPC.ETH_SEND_RAW_TRANSACTION,
    params: [signedTx],
  });

  public estimateGas: TRPCRequests['estimateGas'] = transaction => ({
    method: RPC.ETH_ESTIMATE_GAS,
    params: [transaction],
  });

  public getBalance: TRPCRequests['getBalance'] = address => ({
    method: RPC.ETH_GET_BALANCE,
    params: [address, ENUM_DEFAULT_BLOCK.PENDING],
  });

  public ethCall: TRPCRequests['ethCall'] = txObj => ({
    method: RPC.ETH_CALL,
    params: [txObj, ENUM_DEFAULT_BLOCK.PENDING],
  });

  public getTransactionCount: TRPCRequests['getTransactionCount'] = address => ({
    method: RPC.ETH_GET_TRANSACTION_COUNT,
    params: [address, ENUM_DEFAULT_BLOCK.PENDING],
  });

  public getTransactionByHash: TRPCRequests['getTransactionByHash'] = txhash => ({
    method: RPC.ETH_GET_TRANSACTION_BY_HASH,
    params: [txhash],
  });

  public getTransactionReceipt: TRPCRequests['getTransactionReceipt'] = txhash => ({
    method: RPC.ETH_GET_TRANSACTION_RECEIPT,
    params: [txhash],
  });

  public getCurrentBlock: TRPCRequests['getCurrentBlock'] = () => ({
    method: RPC.ETH_BLOCK_NUMBER,
    params: [],
  });
}
