import { storeManager } from '@src/ducks/store';
import { RootState } from '@src/types';

export const getRootState = (s: any): RootState => {
  const customRoot = storeManager.getRoot();
  return customRoot ? s[customRoot] : s;
};
