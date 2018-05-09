import { DeepPartial } from '@src/types';
import { AnyJsonRpc, ExtractResponse } from 'eth-rpc-types';
import { Result } from 'nano-result';
/*
 * ETHERSCAN API
 *
 * For user side errors checking,
 * our API currently check for the address, contract address and the module parameter.
 * You can differentiate between these errors by referring to the return result.
 * For invalid address, the return result will be
 *
 *“Error! Invalid address format” or “Invalid address format” with  “0” status.
 *
 *For invalid contract address, the return result will be
 *
 *“Error! Invalid contract address format” or “Invalid contract address format” with “0” status.
 *
 *For incorrect module parameter, the return result will be
 *
 *“Error! Missing Or invalid Module name” with “0” status.
 *
 * Other than the failure message above, the other failure message will be from server side or node.
 */

export function isValidJsonRpcResponse(
  res: DeepPartial<ExtractResponse<AnyJsonRpc<boolean>>>,
): Result<ExtractResponse<AnyJsonRpc<true>>> {
  if (isJsonRpcResponseSuccess(res)) {
    return Result.from({ res });
  } else if (isJsonRpcResponseErr(res)) {
    return Result.from({
      err: `JSON RPC requested responded with error:
    ${JSON.stringify(res, null, 1)}`,
    });
  } else {
    return Result.from({
      err: `${JSON.stringify(
        res,
        null,
        1,
      )} is not a valid json rpc response, neither error or result object exists`,
    });
  }
}

function isJsonRpcResponseErr(
  res: DeepPartial<ExtractResponse<AnyJsonRpc<boolean>>>,
): res is ExtractResponse<AnyJsonRpc<false>> {
  return !!(res as ExtractResponse<AnyJsonRpc<false>>).error;
}

function isJsonRpcResponseSuccess(
  res: DeepPartial<ExtractResponse<AnyJsonRpc<boolean>>>,
): res is ExtractResponse<AnyJsonRpc<true>> {
  return !!(res as ExtractResponse<AnyJsonRpc<true>>).result;
}
