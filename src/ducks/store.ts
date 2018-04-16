import { logger } from '@src/utils/logging';
import { Store } from 'redux';

class StoreManager {
  private store: Store<any> | undefined;
  private root: string | undefined;

  public setRoot(r: string) {
    logger.log(`Setting root to: ${r}`);
    this.root = r;
  }

  public getRoot() {
    return this.root;
  }

  public setStore(s: Store<any>) {
    this.store = s;
  }

  public getStore() {
    if (!this.store) {
      throw Error('no store');
    }
    return this.store;
  }
}

export const storeManager = new StoreManager();
