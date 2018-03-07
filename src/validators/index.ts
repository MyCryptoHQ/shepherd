import { JsonRpcResponse } from '@src/nodes/rpc/types';
import { Validator } from 'jsonschema';

export function isValidHex(str: string): boolean {
  if (str === '') {
    return true;
  }
  str =
    str.substring(0, 2) === '0x'
      ? str.substring(2).toUpperCase()
      : str.toUpperCase();
  const re = /^[0-9A-F]*$/g; // Match 0 -> unlimited times, 0 being "0x" case
  return re.test(str);
}

// JSONSchema Validations for Rpc responses
const v = new Validator();

export const schema = {
  RpcNode: {
    type: 'object',
    additionalProperties: false,
    properties: {
      jsonrpc: { type: 'string' },
      id: { oneOf: [{ type: 'string' }, { type: 'integer' }] },
      result: {
        oneOf: [{ type: 'string' }, { type: 'array' }, { type: 'object' }],
      },
      status: { type: 'string' },
      message: { type: 'string', maxLength: 2 },
    },
  },
};

function isValidResult(
  response: JsonRpcResponse,
  schemaFormat: typeof schema.RpcNode,
): boolean {
  return v.validate(response, schemaFormat).valid;
}

function formatErrors(response: JsonRpcResponse, apiType: string) {
  if (response.error) {
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
}

const isValidEthCall = (
  response: JsonRpcResponse,
  schemaType: typeof schema.RpcNode,
) => (apiName: API_NAME, cb?: (res: JsonRpcResponse) => any) => {
  if (!isValidResult(response, schemaType)) {
    if (cb) {
      return cb(response);
    }
    throw new Error(formatErrors(response, apiName));
  }
  return response;
};

export const isValidGetBalance = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)(API_NAME.Get_Balance);

export const isValidEstimateGas = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)(API_NAME.Estimate_Gas);

export const isValidCallRequest = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)(API_NAME.Call_Request);

export const isValidTransactionCount = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)(API_NAME.Transaction_Count);

export const isValidTransactionByHash = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)(API_NAME.Transaction_By_Hash);

export const isValidTransactionReceipt = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)(API_NAME.Transaction_Receipt);

export const isValidCurrentBlock = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)(API_NAME.Current_Block);

export const isValidRawTxApi = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)(API_NAME.Raw_Tx);

export const isValidSendTransaction = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)(API_NAME.Send_Transaction);

export const isValidSignMessage = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)(API_NAME.Sign_Message);

export const isValidGetAccounts = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)(API_NAME.Get_Accounts);

export const isValidGetNetVersion = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)(API_NAME.Net_Version);
export const isValidTxHash = (hash: string) =>
  hash.substring(0, 2) === '0x' && hash.length === 66 && isValidHex(hash);
