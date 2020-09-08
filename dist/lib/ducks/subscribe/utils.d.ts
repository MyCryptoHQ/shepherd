import { AllActions } from '@src/ducks/types';
import { RootState } from '@src/types';
import { Dispatch } from 'redux';
export declare const triggerOnMatchingCallId: (callId: number, includeTimeouts: boolean) => (action: AllActions) => boolean | undefined;
export declare function waitForNetworkSwitch(dispatch: Dispatch<RootState>, id: number): Promise<unknown>;
export declare function waitForManualMode(dispatch: Dispatch<RootState>): Promise<string>;
