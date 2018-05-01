import { storeManager } from '@src/ducks/store';
import { IRootState } from '@src/types';

export const getRootState = (s: any): IRootState => {
  const customRoot = storeManager.getRoot();
  return customRoot ? s[customRoot] : s;
};
