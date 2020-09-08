import BN from 'bn.js';
export declare function stripHexPrefix(value: string): string;
declare type Wei = BN;
declare const handleValues: (input: string | BN | number) => BN;
declare const hexToNumber: (hex: string) => number;
declare const makeBN: (input: string | BN | number) => BN;
declare const Wei: (input: string | BN | number) => BN;
export { Wei, handleValues, makeBN, hexToNumber };
