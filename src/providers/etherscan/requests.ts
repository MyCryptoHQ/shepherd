import { IEtherscanModule, IEtherscanRequests } from '@src/types';
import {
  ENUM_DEFAULT_BLOCK,
  RpcMethodNames as RPC,
} from 'eth-rpc-types/primitives';

export class EtherscanRequests implements IEtherscanRequests {
  public sendRawTx: IEtherscanRequests['sendRawTx'] = signedTx => ({
    module: IEtherscanModule.PROXY,
    action: RPC.ETH_SEND_RAW_TRANSACTION,
    payload: [{ hex: signedTx }],
  });

  public estimateGas: IEtherscanRequests['estimateGas'] = transaction => ({
    module: IEtherscanModule.PROXY,
    action: RPC.ETH_ESTIMATE_GAS,
    payload: [transaction],
  });

  public getBalance: IEtherscanRequests['getBalance'] = address => ({
    module: IEtherscanModule.ACCOUNT,
    action: 'balance',
    payload: [{ address }, { tag: ENUM_DEFAULT_BLOCK.PENDING }],
  });

  public ethCall: IEtherscanRequests['ethCall'] = transaction => ({
    module: IEtherscanModule.PROXY,
    action: RPC.ETH_CALL,
    payload: [transaction, { tag: ENUM_DEFAULT_BLOCK.PENDING }],
  });

  public getTransactionByHash: IEtherscanRequests['getTransactionByHash'] = txhash => ({
    module: IEtherscanModule.PROXY,
    action: RPC.ETH_GET_TRANSACTION_BY_HASH,
    payload: [{ txhash }],
  });

  public getTransactionReceipt: IEtherscanRequests['getTransactionReceipt'] = txhash => ({
    module: IEtherscanModule.PROXY,
    action: RPC.ETH_GET_TRANSACTION_RECEIPT,
    payload: [{ txhash }],
  });

  public getTransactionCount: IEtherscanRequests['getTransactionCount'] = address => ({
    module: IEtherscanModule.PROXY,
    action: RPC.ETH_GET_TRANSACTION_COUNT,
    payload: [{ address }, { tag: ENUM_DEFAULT_BLOCK.LATEST }],
  });

  public getCurrentBlock: IEtherscanRequests['getCurrentBlock'] = () => ({
    module: IEtherscanModule.PROXY,
    action: RPC.ETH_BLOCK_NUMBER,
    payload: [],
  });
}
