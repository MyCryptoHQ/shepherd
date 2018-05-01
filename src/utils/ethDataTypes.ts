import {
  DATA,
  DATA_20B,
  DATA_256B,
  DATA_32B,
  DATA_60B,
  DATA_8B,
  QUANTITY,
} from 'eth-rpc-types/primitives';

type HexString = UnprefixedHexString | PrefixedHexString;
type UnprefixedHexString = string & { tag: '__unprefixed__hex__' };
type PrefixedHexString =
  | string & { tag: '__prefixed__hex__' }
  | DATA
  | DATA_20B
  | DATA_256B
  | DATA_32B
  | DATA_60B
  | DATA_8B
  | QUANTITY;

export function isHexPrefixed(str: HexString) {
  if (str.length >= 2) {
    return str.slice(0, 2) === '0x';
  }
  return false;
}

export function stripHexPrefix(str: HexString): HexString {
  if (!isHexPrefixed(str)) {
    return str;
  }
  return str.slice(2) as HexString;
}

export function hasLeadingZeros(str: HexString): boolean {
  return stripHexPrefix(str)[0] === '0';
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

export function isHexString(str: string): str is HexString {
  return !!str.match(/^[0-9A-Fa-f]*$/);
}

export function addHexPrefix(str: HexString): HexString {
  if (isHexPrefixed(str)) {
    return str;
  }
  return `0x${str}` as HexString;
}

export function toHexString(str: string): HexString {
  if (isHexString(str)) {
    return str;
  }
  throw Error(`${str} can not be converted to a hex string`);
}

export function isPrefixedHexString(str: string): str is PrefixedHexString {
  return isHexString(str) && isHexPrefixed(str);
}

export function toPrefixedHexString(str: string): PrefixedHexString {
  return addHexPrefix(toHexString(str)) as PrefixedHexString;
}

export function isValidBytesLength(
  hexStr: HexString,
  expectedBytesLength: number,
): boolean {
  const prefixLength = isHexPrefixed(hexStr) ? 2 : 0;
  const hexLenToBytesLen = (hex: HexString) => hex.length * 2;
  return expectedBytesLength === prefixLength + hexLenToBytesLen(hexStr);
}

export function isEvenlyPadded(str: HexString) {
  return str.length % 2 === 0;
}

export function padHexToEven(str: HexString): HexString {
  if (isEvenlyPadded(str)) {
    return str;
  }
  if (isHexPrefixed(str)) {
    return addHexPrefix(`0${stripHexPrefix(str)}` as HexString);
  }

  return `0${str}` as HexString;
}

export function isZeroValueHex(str: HexString) {
  return parseInt(str, 16) === 0;
}

export function encodeEthData(str: string): DATA {
  // encode as hex
  // prefix with 0x
  const hexStr = toPrefixedHexString(str);

  // pad to even bytes
  const dataStr = padHexToEven(hexStr);

  if (isZeroValueHex(dataStr)) {
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
  if (isZeroValueHex(quantStr)) {
    return '0x0' as QUANTITY;
  }

  return (quantStr as string) as QUANTITY;
}

export function isValidEthData(str: string): str is DATA {
  // encoded as hex and prefixed
  if (!isPrefixedHexString(str)) {
    return false;
  }

  // padded evenly
  if (!isEvenlyPadded) {
    return false;
  }

  return true;
}

export function isValidEthQuantity(str: string): str is QUANTITY {
  // encoded as hex and prefixed
  if (!isPrefixedHexString(str)) {
    return false;
  }

  // the most compact representation (slight exception: zero should be represented as "0x0").
  if (hasLeadingZeros(str) && str !== '0x0') {
    return false;
  }

  return true;
}

export function isValidEthData8B(str: string): str is DATA_8B {
  return isValidEthData(str) && isValidBytesLength(str, 8);
}

export function isValidEthData20B(str: string): str is DATA_8B {
  return isValidEthData(str) && isValidBytesLength(str, 20);
}

export function isValidEthData256B(str: string): str is DATA_256B {
  return isValidEthData(str) && isValidBytesLength(str, 256);
}

export function isValidEthData32B(str: string): str is DATA_32B {
  return isValidEthData(str) && isValidBytesLength(str, 32);
}

export function isValidEthData60B(str: string): str is DATA_60B {
  return isValidEthData(str) && isValidBytesLength(str, 60);
}
