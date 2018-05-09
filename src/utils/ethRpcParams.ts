import {
  EthCall,
  EthEstimateGas,
  EthGetBalance,
  EthGetTransactionByHash,
  EthGetTransactionCount,
  EthGetTransactionReceipt,
  EthPersonalSign,
  EthSendRawTransaction,
  EthSendTransaction,
  EthTypeToStr,
  ExtractParams,
  ITransactionCallObject,
  ITransactionObject,
} from 'eth-rpc-types';
import { Result } from 'nano-result/dist/lib';
import {
  isValidEthData,
  isValidEthData20B,
  isValidEthData32B,
  isValidEthQuantity,
} from './ethDataTypes';

export function isValidPartialTransactionCallObj(
  obj: EthTypeToStr<Partial<ITransactionCallObject>>,
): Result<Partial<ITransactionCallObject>> {
  type Entry = [
    keyof EthTypeToStr<ExtractParams<EthEstimateGas>[0]>,
    undefined | string
  ];

  const valid = Object.entries(obj).reduce(
    (isValid, [curKey, curValue]: Entry) => {
      if (curValue === undefined) {
        return isValid;
      }
      switch (curKey) {
        case 'to':
        case 'from':
          return isValid && isValidEthData20B(curValue).ok();
        case 'gas':
        case 'gasPrice':
        case 'value':
          return isValid && isValidEthQuantity(curValue).ok();
        case 'data':
          return isValid && isValidEthData(curValue).ok();
      }
    },
    true,
  );

  if (valid) {
    return Result.from({ res: obj as Partial<ITransactionCallObject> });
  } else {
    return Result.from({
      err: `${JSON.stringify(
        obj,
        null,
        1,
      )} is not a valid partial transaction call object`,
    });
  }
}

export function isValidTransactionCallObj(
  obj: EthTypeToStr<ITransactionCallObject>,
): Result<ITransactionCallObject> {
  if (obj.to && isValidPartialTransactionCallObj(obj).ok()) {
    return Result.from({ res: obj as ITransactionCallObject });
  }
  return Result.from({
    err: `${JSON.stringify(
      obj,
      null,
      1,
    )} is not a valid transaction call object`,
  });
}

export function isValidTransactionObj(
  obj: EthTypeToStr<ITransactionObject>,
): Result<ITransactionObject> {
  let isValid = isValidPartialTransactionCallObj(obj).ok();
  // check that it has a from address
  isValid = !!(isValid && obj.from);

  // check that it has data
  isValid = !!(isValid && obj.data);

  // check for optional nonce
  if (obj.nonce) {
    isValid = !!(isValid && isValidEthQuantity(obj.nonce).ok());
  }

  if (isValid) {
    return Result.from({ res: obj as ITransactionObject });
  } else {
    return Result.from({
      err: `${JSON.stringify(obj, null, 1)} is not a valid transaction object`,
    });
  }
}

type RawTxParam = ExtractParams<EthSendRawTransaction>[0];
export function isValidSendRawTx(
  str: EthTypeToStr<RawTxParam>,
): Result<RawTxParam> {
  return isValidEthData(str);
}

type EstGasParam = ExtractParams<EthEstimateGas>[0];
export function isValidEstimateGas(
  obj: EthTypeToStr<EstGasParam>,
): Result<EstGasParam> {
  return isValidPartialTransactionCallObj(obj);
}

type GetBalParam = ExtractParams<EthGetBalance>[0];
export function isValidGetBalance(
  str: EthTypeToStr<GetBalParam>,
): Result<GetBalParam> {
  return isValidEthData20B(str);
}

type EthCallParam = ExtractParams<EthCall>[0];
export function isValidEthCall(
  obj: EthTypeToStr<EthCallParam>,
): Result<EthCallParam> {
  return isValidTransactionCallObj(obj);
}

type EthTxParam = ExtractParams<EthSendTransaction>[0];
export function isValidEthTransaction(
  obj: EthTypeToStr<EthTxParam>,
): Result<EthTxParam> {
  return isValidTransactionObj(obj);
}

type EthGetTxParam = ExtractParams<EthGetTransactionCount>[0];
// We dont validate the default block parameter
// as our provider doesnt support such option
export function isValidGetTransactionCount(
  str: EthTypeToStr<EthGetTxParam>,
): Result<EthGetTxParam> {
  return isValidEthData20B(str);
}

type EthGetTxByHash = ExtractParams<EthGetTransactionByHash>[0];

export function isValidGetTransactionByHash(
  str: EthTypeToStr<EthGetTxByHash>,
): Result<EthGetTxByHash> {
  return isValidEthData32B(str);
}

type EthGetTxReceipt = ExtractParams<EthGetTransactionReceipt>[0];
export function isValidGetTransactionReceipt(
  str: EthTypeToStr<EthGetTxReceipt>,
): Result<EthGetTxReceipt> {
  return isValidEthData32B(str);
}

type EthSignMessage1 = ExtractParams<EthPersonalSign<true>>[0];
type EthSignMessage2 = ExtractParams<EthPersonalSign<true>>[1];
export function isValidPersonalSignMessage(
  msg: EthTypeToStr<EthSignMessage1>,
  fromAddr: EthTypeToStr<EthSignMessage2>,
): Result<{
  msg: EthSignMessage1;
  fromAddr: EthSignMessage2;
}> {
  if (isValidEthData(msg).ok() && isValidEthData20B(fromAddr).ok()) {
    return Result.from({
      res: {
        msg: msg as EthSignMessage1,
        fromAddr: fromAddr as EthSignMessage2,
      },
    });
  }
  return Result.from({
    err: `
    Message: ${msg}
    From Address: ${fromAddr}
    is not a valid sign personal message parameter
  `,
  });
}
