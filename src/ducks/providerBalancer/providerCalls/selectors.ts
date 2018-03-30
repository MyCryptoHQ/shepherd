import { PendingProviderCall } from '@src/ducks/providerBalancer/providerCalls';
import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';
import { RootState } from '@src/types';

export const getProviderCalls = (state: RootState) =>
  getProviderBalancer(state).providerCalls;

export const getProviderCallById = (state: RootState, id: number) =>
  getProviderCalls(state)[id];

export const isStaleCall = (state: RootState, callId: number) => {
  const call = getProviderCallById(state, callId);
  return !call || !call.pending;
};

export const getPendingProviderCallsByProviderId = (
  state: RootState,
  providerId: string,
) => {
  const pendingCalls = getAllPendingCalls(state);
  const pendingCallsByProviderId = pendingCalls.filter(
    providerCall =>
      providerCall.providerId && providerCall.providerId === providerId,
  );
  return pendingCallsByProviderId.length;
};

export const getAllPendingCalls = (state: RootState): PendingProviderCall[] => {
  const providerCalls = getProviderCalls(state);
  const providerCallsArr = Object.values(providerCalls);
  const pendingCalls: PendingProviderCall[] = providerCallsArr.filter(
    (providerCall): providerCall is PendingProviderCall => {
      if (providerCall.pending) {
        return true;
      } else {
        return false;
      }
    },
  );
  return pendingCalls;
};
