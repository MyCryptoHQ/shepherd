import { Validator } from 'jsonschema';
import { JsonRpcResponse } from '@src/nodes/rpc/types';

const v = new Validator();

export const schema = {
  RpcNode: {
    type: 'object',
    additionalProperties: false,
    properties: {
      jsonrpc: { type: 'string' },
      id: { oneOf: [{ type: 'string' }, { type: 'integer' }] },
      result: { oneOf: [{ type: 'string' }, { type: 'array' }] },
      status: { type: 'string' },
      message: { type: 'string', maxLength: 2 },
    },
  },
};

export const isValidNonce = (value: string): boolean => {
  let valid;
  if (value === '0') {
    valid = true;
  } else if (!value) {
    valid = false;
  } else {
    valid = isPositiveInteger(+value);
  }
  return valid;
};

function isValidResult(response: JsonRpcResponse, schemaFormat): boolean {
  return v.validate(response, schemaFormat).valid;
}

function formatErrors(response: JsonRpcResponse, apiType: string) {
  if (response.error) {
    return `${response.error.message} ${response.error.data || ''}`;
  }
  return `Invalid ${apiType} Error`;
}

const isValidEthCall = (
  response: JsonRpcResponse,
  schemaType: typeof schema.RpcNode,
) => (apiName, cb?) => {
  if (!isValidResult(response, schemaType)) {
    if (cb) {
      return cb(response);
    }
    throw new Error(formatErrors(response, apiName));
  }
  return response;
};

export const isValidGetBalance = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)('Get Balance');

export const isValidEstimateGas = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)('Estimate Gas');

export const isValidCallRequest = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)('Call Request');

export const isValidTokenBalance = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)('Token Balance', () => ({
    result: 'Failed',
  }));

export const isValidTransactionCount = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)('Transaction Count');

export const isValidCurrentBlock = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)('Current Block');

export const isValidRawTxApi = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)('Raw Tx');

export const isValidSendTransaction = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)('Send Transaction');

export const isValidSignMessage = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)('Sign Message');

export const isValidGetAccounts = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)('Get Accounts');

export const isValidGetNetVersion = (response: JsonRpcResponse) =>
  isValidEthCall(response, schema.RpcNode)('Net Version');

export function isPositiveInteger(n: number) {
  return Number.isInteger(n) && n > 0;
}
