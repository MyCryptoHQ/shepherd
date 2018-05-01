import {
  EthSendRawTransaction,
  ExtractParams,
  EthEstimateGas,
  DATA,
  DATA_20B,
  DATA_256B,
  DATA_32B,
  DATA_60B,
  DATA_8B,
  QUANTITY,
  EthGetBalance,
  EthCall,
  ITransactionCallObject,
  EthSendTransaction,
  ITransactionObject,
  EthGetTransactionCount,
  EthGetTransactionByHash,
  EthGetTransactionReceipt,
  EthPersonalSIgn,
} from 'eth-rpc-types';
import {
  isValidEthData,
  isValidEthData20B,
  isValidEthQuantity,
  isValidEthData32B,
} from './ethDataTypes';

type EthType =
  | DATA
  | DATA_20B
  | DATA_256B
  | DATA_32B
  | DATA_60B
  | DATA_8B
  | QUANTITY;

type EthTypeToStr<T> = T extends EthType
  ? string
  : T extends number | string | null | undefined | boolean
    ? T
    : { [K in keyof T]: EthTypeToStr<T[K]> };

export function isValidPartialTransactionCallObj(
  obj: EthTypeToStr<Partial<ITransactionCallObject>>,
) {
  return Object.entries(obj).reduce(
    (
      isValid,
      [curKey, curValue]: [
        keyof EthTypeToStr<ExtractParams<EthEstimateGas>[0]>,
        undefined | string
      ],
    ) => {
      if (curValue === undefined) {
        return isValid;
      }
      switch (curKey) {
        case 'to':
        case 'from':
          return isValid && isValidEthData20B(curValue);
        case 'gas':
        case 'gasPrice':
        case 'value':
          return isValid && isValidEthQuantity(curValue);
        case 'data':
          return isValid && isValidEthData(curValue);
      }
    },
    true,
  );
}

export function isValidTransactionCallObj(
  obj: EthTypeToStr<ITransactionCallObject>,
) {
  return !!(obj.to && isValidPartialTransactionCallObj(obj));
}
export function isValidTransactionObj(obj: EthTypeToStr<ITransactionObject>) {
  let isValid = isValidPartialTransactionCallObj(obj);
  // check that it has a from address
  isValid = !!(isValid && obj.from);

  // check that it has data
  isValid = !!(isValid && obj.data);

  // check for optional nonce
  if (obj.nonce) {
    isValid = !!(isValid && isValidEthQuantity(obj.nonce));
  }

  return isValid;
}

type RawTxParam = ExtractParams<EthSendRawTransaction>[0];
export function isValidSendRawTx(
  str: EthTypeToStr<RawTxParam>,
): str is RawTxParam {
  return isValidEthData(str);
}

type EstGasParam = ExtractParams<EthEstimateGas>[0];
export function isValidEstimateGas(
  obj: EthTypeToStr<EstGasParam>,
): obj is EstGasParam {
  return isValidPartialTransactionCallObj(obj);
}

type GetBalParam = ExtractParams<EthGetBalance>[0];
export function isValidGetBalance(
  str: EthTypeToStr<GetBalParam>,
): str is GetBalParam {
  return isValidEthData20B(str);
}

type EthCallParam = ExtractParams<EthCall>[0];
export function isValidEthCall(
  obj: EthTypeToStr<EthCallParam>,
): obj is EthCallParam {
  return isValidTransactionCallObj(obj);
}

type EthTxParam = ExtractParams<EthSendTransaction>[0];
export function isValidEthTransaction(
  obj: EthTypeToStr<EthTxParam>,
): obj is EthTxParam {
  return isValidTransactionObj(obj);
}

type EthGetTxParam = ExtractParams<EthGetTransactionCount>[0];
// We dont validate the default block parameter
// as our provider doesnt support such option
export function isValidGetTransactionCount(
  str: EthTypeToStr<EthGetTxParam>,
): str is EthGetTxParam {
  return isValidEthData20B(str);
}

type EthGetTxByHash = ExtractParams<EthGetTransactionByHash>[0];

export function isValidGetTransactionByHash(
  str: EthTypeToStr<EthGetTxByHash>,
): str is EthGetTxByHash {
  return isValidEthData32B(str);
}

type EthGetTxReceipt = ExtractParams<EthGetTransactionReceipt>[0];
export function isValidGetTransactionReceipt(
  str: EthTypeToStr<EthGetTxReceipt>,
): str is EthGetTxReceipt {
  return isValidEthData32B(str);
}

type EthSignMessage1 = ExtractParams<EthPersonalSIgn>[0];
type EthSignMessage2 = ExtractParams<EthPersonalSIgn>[1];
export function isValidPersonalSignMessage(
  msg: EthSignMessage1,
  fromAddr: EthSignMessage2,
) {
  return;
}
