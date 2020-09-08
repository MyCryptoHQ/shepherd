export declare enum SUBSCRIBE {
    ACTION = "SUBSCRIBE_TO_ACTION"
}
export interface ISubscribe {
    type: SUBSCRIBE.ACTION;
    payload: {
        trigger: any;
        callback(resultingAction: any): void;
    };
}
export declare type SubscribeAction = ISubscribe;
