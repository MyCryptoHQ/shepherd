import { BlockExplorerConfig } from '@src/types/networks';

export const ethPlorer = 'https://ethplorer.io';
export const ETHTokenExplorer = (address: string): string =>
  `${ethPlorer}/address/${address}`;
// Must be a website that follows the ethplorer convention of /tx/[hash] and
// address/[address] to generate the correct functions.
export function makeExplorer(origin: string): BlockExplorerConfig {
  return {
    origin,
    txUrl: hash => `${origin}/tx/${hash}`,
    addressUrl: address => `${origin}/address/${address}`,
  };
}
