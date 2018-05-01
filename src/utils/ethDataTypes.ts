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

export interface AssertableOk<T> {
  res: T;
  err?: undefined;
}

export interface AssertableErr {
  res?: undefined;
  err: string;
}

export type AssertableType<T> = AssertableOk<T> | AssertableErr;

export class Assertable<T> {
  private readonly val: AssertableType<T>;
  constructor(value: AssertableType<T>) {
    this.val = value;
  }
  public static from<T>(value: AssertableType<T>) {
    return new Assertable(value);
  }

  public and<U>(func: (arg: T) => Assertable<U>) {
    if (this.isOk(this.val)) {
      const nextAssertable = func(this.val.res);
      const nextVal = nextAssertable.toVal();
      if (nextAssertable.isOk(nextVal)) {
        return Assertable.from({ res: nextVal.res });
      } else {
        return Assertable.from<U>({
          err: nextVal.err,
        });
      }
    } else {
      return Assertable.from<U>({ err: this.val.err });
    }
  }

  public unwrap() {
    if (this.isOk(this.val)) {
      return this.val.res;
    }
    throw Error(this.val.err);
  }

  public ok() {
    return !this.val.err;
  }

  public valueOf() {
    !this.val.err;
  }

  private isOk(val: AssertableType<T>): val is AssertableOk<T> {
    return !val.err;
  }

  public toVal() {
    return this.val;
  }
}

export function isHexPrefixed(str: HexString): Assertable<PrefixedHexString> {
  if (str.length >= 2 && str.slice(0, 2) === '0x') {
    return Assertable.from({ res: str as PrefixedHexString });
  }
  return Assertable.from({ err: `${str} does not have a hex prefix` });
}

export function stripHexPrefix(str: HexString): HexString {
  if (!isHexPrefixed(str)) {
    return str;
  }
  return str.slice(2) as HexString;
}

export function hasLeadingZeros(str: HexString): Assertable<HexString> {
  if (stripHexPrefix(str)[0] === '0') {
    return Assertable.from({ res: str });
  }
  return Assertable.from({ err: `${str} does not have leading zeros` });
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

export function isHexString(str: string): Assertable<HexString> {
  if (str.match(/^[0-9A-Fa-f]*$/)) {
    return Assertable.from({ res: str as HexString });
  }
  return Assertable.from({ err: `${str} is not a hex string` });
}

export function addHexPrefix(str: HexString): HexString {
  if (isHexPrefixed(str)) {
    return str;
  }
  return `0x${str}` as HexString;
}

export function toHexString(str: string): HexString {
  return isHexString(str).unwrap();
}

export function isPrefixedHexString(
  str: string,
): Assertable<PrefixedHexString> {
  return isHexString(str).and(isHexPrefixed);
}

export function toPrefixedHexString(str: string): PrefixedHexString {
  return addHexPrefix(toHexString(str)) as PrefixedHexString;
}

export const isValidBytesLength = (expectedBytesLength: number) => (
  hexStr: HexString,
): Assertable<HexString> => {
  const prefixLength = isHexPrefixed(hexStr) ? 2 : 0;
  const hexLenToBytesLen = (hex: HexString) => hex.length * 2;
  if (expectedBytesLength === prefixLength + hexLenToBytesLen(hexStr)) {
    return Assertable.from({ res: hexStr });
  }
  return Assertable.from({
    err: `${hexStr} is not a valid length, expected bytes length of ${expectedBytesLength}`,
  });
};

export function isEvenlyPadded(str: HexString) {
  if (str.length % 2 === 0) {
    return Assertable.from({ res: str });
  }

  return Assertable.from({ err: `${str} is not evenly padded` });
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

export function isZeroValueHex(str: HexString): Assertable<HexString> {
  if (parseInt(str, 16) === 0) {
    return Assertable.from({ res: str });
  }
  return Assertable.from({ err: `${str} does not have a value of zero` });
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

export function isValidEthData(str: string): Assertable<DATA> {
  return isPrefixedHexString(str).and(isEvenlyPadded) as Assertable<DATA>;
}

export function isValidEthQuantity(str: string): Assertable<QUANTITY> {
  // encoded as hex and prefixed
  const prefixedHex = isPrefixedHexString(str);
  if (!prefixedHex.ok()) {
    return prefixedHex as Assertable<QUANTITY>;
  }

  // the most compact representation (slight exception: zero should be represented as "0x0").
  if (prefixedHex.and(hasLeadingZeros) && str !== '0x0') {
    return Assertable.from({
      err: `${str} has leading zeros when it should be the most compact representation`,
    });
  }

  return Assertable.from({ res: str as QUANTITY });
}

export function isValidEthData8B(str: string) {
  return isValidEthData(str).and(isValidBytesLength(8)) as Assertable<DATA_8B>;
}

export function isValidEthData20B(str: string) {
  return isValidEthData(str).and(isValidBytesLength(20)) as Assertable<
    DATA_20B
  >;
}

export function isValidEthData32B(str: string) {
  return isValidEthData(str).and(isValidBytesLength(32)) as Assertable<
    DATA_32B
  >;
}

export function isValidEthData60B(str: string) {
  return isValidEthData(str).and(isValidBytesLength(60)) as Assertable<
    DATA_60B
  >;
}

export function isValidEthData256B(str: string) {
  return isValidEthData(str).and(isValidBytesLength(256)) as Assertable<
    DATA_256B
  >;
}
