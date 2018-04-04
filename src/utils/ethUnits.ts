import BN from 'bn.js';

export function stripHexPrefix(value: string) {
  return value.replace('0x', '');
}

type Wei = BN;

const handleValues = (input: string | BN | number) => {
  if (typeof input === 'string') {
    return input.startsWith('0x')
      ? new BN(stripHexPrefix(input), 16)
      : new BN(input);
  }
  if (typeof input === 'number') {
    return new BN(input);
  }
  if (BN.isBN(input)) {
    return input;
  } else {
    throw Error('unsupported value conversion');
  }
};

const hexToNumber = (hex: string): number => handleValues(hex).toNumber();
const makeBN = handleValues;
const Wei = handleValues;

export { Wei, handleValues, makeBN, hexToNumber };
