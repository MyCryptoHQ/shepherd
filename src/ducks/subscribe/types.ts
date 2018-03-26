export enum SUBSCRIBE {
  ACTION = 'SUBSCRIBE_TO_ACTION',
}

export interface SubscribeAction {
  type: SUBSCRIBE.ACTION;
  payload: {
    trigger: any;
    callback(resultingAction: any): void;
  };
}
