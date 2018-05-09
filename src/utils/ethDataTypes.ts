import {
  DATA,
  DATA_20B,
  DATA_256B,
  DATA_32B,
  DATA_60B,
  DATA_8B,
  EthType,
  QUANTITY,
} from 'eth-rpc-types/primitives';
import { Result } from 'nano-result';

type UnprefixedHexString = string & { tag: '__unprefixed__hex__' };
type PrefixedHexString = string & { tag: '__prefixed__hex__' } | EthType;
type HexString = UnprefixedHexString | PrefixedHexString;

/**
 *
 * @description Checks a string to see if the string is a hex string
 * * Does not matter if the hex string contains a hex prefix or not
 * @export
 * @param {string} str
 * @returns {Result<HexString>}
 */
export function isHexString(str: string): Result<HexString> {
  if (str.match(/^(0x)?([0-9A-Fa-f]*)$/)) {
    return Result.from({ res: str as HexString });
  }
  return Result.from({ err: `${str} is not a hex string` });
}

export function isHexPrefixed(str: HexString): Result<PrefixedHexString> {
  if (str.length >= 2 && str.slice(0, 2) === '0x') {
    return Result.from({ res: str as PrefixedHexString });
  }
  return Result.from({ err: `${str} does not have a hex prefix` });
}

export function isPrefixedHexString(str: string): Result<PrefixedHexString> {
  return isHexString(str).and(isHexPrefixed);
}

// check for negatives
export const isHexStrValidBytesLen = (expectedBytesLength: number) => (
  hexStr: HexString,
): Result<HexString> => {
  const prefixLength = isHexPrefixed(hexStr).ok() ? 2 : 0;
  const bytesLenToHexLen = (num: number) => num * 2;

  if (bytesLenToHexLen(expectedBytesLength) + prefixLength === hexStr.length) {
    return Result.from({ res: hexStr });
  }
  return Result.from({
    err: `${hexStr} is not a valid length, expected bytes length of ${expectedBytesLength}`,
  });
};

export function isEvenlyPadded(str: HexString): Result<HexString> {
  if (str.length % 2 === 0) {
    return Result.from({ res: str });
  }

  return Result.from({ err: `${str} is not evenly padded` });
}

export function isZeroValueHex(str: HexString): Result<HexString> {
  // these two cases are correctly converted to 0
  // when using a buffer
  // but NaN when using parseInt
  if (str === '' || str === '0x') {
    return Result.from({ res: str });
  }
  if (parseInt(str, 16) === 0) {
    return Result.from({ res: str });
  }
  return Result.from({ err: `${str} does not have a value of zero` });
}

export function isValidEthData(str: string): Result<DATA> {
  return isPrefixedHexString(str).and(isEvenlyPadded) as Result<DATA>;
}

export function isValidEthQuantity(str: string): Result<QUANTITY> {
  // encoded as hex and prefixed
  const prefixedHex = isPrefixedHexString(str);
  if (!prefixedHex.ok()) {
    return prefixedHex as Result<QUANTITY>;
  }

  // the most compact representation (slight exception: zero should be represented as "0x0").
  if (prefixedHex.and(hasLeadingZeros) && str !== '0x0') {
    return Result.from({
      err: `${str} has leading zeros when it should be the most compact representation`,
    });
  }

  return Result.from({ res: str as QUANTITY });
}

export function isValidEthData8B(str: string) {
  return isValidEthData(str).and(isHexStrValidBytesLen(8)) as Result<DATA_8B>;
}

export function isValidEthData20B(str: string) {
  return isValidEthData(str).and(isHexStrValidBytesLen(20)) as Result<DATA_20B>;
}

export function isValidEthData32B(str: string) {
  return isValidEthData(str).and(isHexStrValidBytesLen(32)) as Result<DATA_32B>;
}

export function isValidEthData60B(str: string) {
  return isValidEthData(str).and(isHexStrValidBytesLen(60)) as Result<DATA_60B>;
}

export function isValidEthData256B(str: string) {
  return isValidEthData(str).and(isHexStrValidBytesLen(256)) as Result<
    DATA_256B
  >;
}

export function stripHexPrefix(str: HexString): HexString {
  if (!isHexPrefixed(str).ok()) {
    return str;
  }
  return str.slice(2) as HexString;
}

export function hasLeadingZeros(str: HexString): Result<HexString> {
  if (stripHexPrefix(str)[0] === '0') {
    return Result.from({ res: str });
  }
  return Result.from({ err: `${str} does not have leading zeros` });
}

export function stripLeadingZeros(str: HexString): HexString {
  let retStr = stripHexPrefix(str);
  while (true) {
    if (retStr === '' || retStr[0] !== '0') {
      return addHexPrefix(retStr);
    }

    retStr = retStr.slice(1) as HexString;
  }
}

export function addHexPrefix(str: HexString): PrefixedHexString {
  if (isHexPrefixed(str).ok()) {
    return str as PrefixedHexString;
  }
  return `0x${str}` as PrefixedHexString;
}

export function toHexString(str: string): HexString {
  return isHexString(str).unwrap();
}

export function toPrefixedHexString(str: string): PrefixedHexString {
  return addHexPrefix(toHexString(str));
}

export function padHexToEven(str: HexString): HexString {
  if (isEvenlyPadded(str).ok()) {
    return str;
  }

  if (isHexPrefixed(str).ok()) {
    return addHexPrefix(`0${stripHexPrefix(str)}` as HexString);
  }

  return `0${str}` as HexString;
}

export function encodeEthData(str: string): DATA {
  // encode as hex
  // prefix with 0x
  const hexStr = toPrefixedHexString(str);

  // pad to even bytes
  const dataStr = padHexToEven(hexStr);

  if (isZeroValueHex(dataStr).ok()) {
    return '0x' as DATA;
  }

  // add hex prefix
  return (dataStr as string) as DATA;
}

export function encodeEthQuantity(str: string): QUANTITY {
  // encode as hex
  // prefix with 0x
  const hexStr = toPrefixedHexString(str);

  // most compact representation
  const quantStr = stripLeadingZeros(hexStr);

  // slight exception: zero should be represented as "0x0")
  if (isZeroValueHex(quantStr).ok()) {
    return '0x0' as QUANTITY;
  }

  return (quantStr as string) as QUANTITY;
}
