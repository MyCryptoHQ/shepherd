import { IJsonRpcResponse } from '@src/providers/rpc/types';
import { Schema, Validator } from 'jsonschema';

// JSONSchema Validations for Rpc responses
const v = new Validator();

export const schema: { [key: string]: Schema } = {
  RpcProvider: {
    type: 'object',
    additionalProperties: true,

    properties: {
      jsonrpc: { type: 'string' },
      id: { oneOf: [{ type: 'string' }, { type: 'integer' }] },
      result: {
        oneOf: [{ type: 'string' }, { type: 'array' }, { type: 'object' }],
      },

      status: { type: 'string', pattern: '1' }, // 1 means pass from etherscan
      message: { type: 'string', pattern: '^OK' },
    },
    oneOf: [
      {
        additionalProperties: true,
        type: 'object',
        required: ['jsonrpc'],
        properties: { jsonrpc: { type: 'string' } },
      },
      {
        additionalProperties: true,

        type: 'object',
        required: ['status'],
        properties: { status: { type: 'string' } },
      },
    ],

    dependencies: {
      jsonrpc: ['id', 'result'],
      status: ['message', 'result'],
    },
    not: {
      anyOf: [
        {
          additionalProperties: true,
          properties: {
            error: {
              anyOf: [
                { type: 'string', minLength: 1 },
                { type: ['array', 'object', 'number', 'boolean'] },
              ],
            },
          },
          required: ['error'],
        },
      ],
    },
  },
};

function isValidResult(
  response: IJsonRpcResponse,
  schemaFormat: typeof schema.RpcProvider,
): boolean {
  return v.validate(response, schemaFormat).valid;
}

function formatErrors(response: IJsonRpcResponse, apiType: string) {
  if (response) {
    if (response.error && response.error.message) {
      // Metamask errors are sometimes full-blown stacktraces, no bueno. Instead,
      // We'll just take the first line of it, and the last thing after all of
      // the colons. An example error message would be:
      // "Error: Metamask Sign Tx Error: User rejected the signature."
      const lines = response.error.message.split('\n');
      if (lines.length > 2) {
        return lines[0].split(':').pop();
      } else {
        return `${response.error.message} ${response.error.data || ''}`;
      }
    } else if (response.result && (response as any).status) {
      return response.result;
    }
  }
  return `Invalid ${apiType} Error`;
}

enum API_NAME {
  Get_Balance = 'Get Balance',
  Estimate_Gas = 'Estimate Gas',
  Call_Request = 'Call Request',
  Token_Balance = 'Token Balance',
  Transaction_Count = 'Transaction Count',
  Current_Block = 'Current Block',
  Raw_Tx = 'Raw Tx',
  Send_Transaction = 'Send Transaction',
  Sign_Message = 'Sign Message',
  Get_Accounts = 'Get Accounts',
  Net_Version = 'Net Version',
  Transaction_By_Hash = 'Transaction By Hash',
  Transaction_Receipt = 'Transaction Receipt',
  Block_By_Number = 'Block By Number',
}

const isValidEthCall = (
  response: IJsonRpcResponse,
  schemaType: typeof schema.RpcProvider,
) => (apiName: API_NAME, cb?: (res: IJsonRpcResponse) => any) => {
  if (!isValidResult(response, schemaType)) {
    if (cb) {
      return cb(response);
    }
    throw new Error(formatErrors(response, apiName));
  }
  return response;
};

export const isValidGetBalance = (response: IJsonRpcResponse) =>
  isValidEthCall(response, schema.RpcProvider)(API_NAME.Get_Balance);

export const isValidEstimateGas = (response: IJsonRpcResponse) =>
  isValidEthCall(response, schema.RpcProvider)(API_NAME.Estimate_Gas);

export const isValidCallRequest = (response: IJsonRpcResponse) =>
  isValidEthCall(response, schema.RpcProvider)(API_NAME.Call_Request);

export const isValidTransactionCount = (response: IJsonRpcResponse) =>
  isValidEthCall(response, schema.RpcProvider)(API_NAME.Transaction_Count);

export const isValidTransactionByHash = (response: IJsonRpcResponse) =>
  isValidEthCall(response, schema.RpcProvider)(API_NAME.Transaction_By_Hash);

export const isValidTransactionReceipt = (response: IJsonRpcResponse) =>
  isValidEthCall(response, schema.RpcProvider)(API_NAME.Transaction_Receipt);

export const isValidCurrentBlock = (response: IJsonRpcResponse) =>
  isValidEthCall(response, schema.RpcProvider)(API_NAME.Current_Block);

export const isValidRawTxApi = (response: IJsonRpcResponse) =>
  isValidEthCall(response, schema.RpcProvider)(API_NAME.Raw_Tx);

export const isValidSendTransaction = (response: IJsonRpcResponse) =>
  isValidEthCall(response, schema.RpcProvider)(API_NAME.Send_Transaction);

export const isValidSignMessage = (response: IJsonRpcResponse) =>
  isValidEthCall(response, schema.RpcProvider)(API_NAME.Sign_Message);

export const isValidGetAccounts = (response: IJsonRpcResponse) =>
  isValidEthCall(response, schema.RpcProvider)(API_NAME.Get_Accounts);

export const isValidGetNetVersion = (response: IJsonRpcResponse) =>
  isValidEthCall(response, schema.RpcProvider)(API_NAME.Net_Version);

export const isValidBlockByNumber = (response: IJsonRpcResponse) =>
  isValidEthCall(response, schema.RpcProvider)(API_NAME.Block_By_Number);
