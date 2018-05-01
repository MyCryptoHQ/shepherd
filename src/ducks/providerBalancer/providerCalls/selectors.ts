import { IPendingProviderCall } from '@src/ducks/providerBalancer/providerCalls';
import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';
import { IRootState } from '@src/types';

export const getProviderCalls = (state: IRootState) =>
  getProviderBalancer(state).providerCalls;

export const getProviderCallById = (state: IRootState, id: number) =>
  getProviderCalls(state)[id];

export const isStaleCall = (state: IRootState, callId: number) => {
  const call = getProviderCallById(state, callId);
  return !call || !call.pending;
};

export const getPendingProviderCallsByProviderId = (
  state: IRootState,
  providerId: string,
) => {
  const pendingCalls = getAllPendingCalls(state);
  const pendingCallsByProviderId = pendingCalls.filter(
    providerCall =>
      providerCall.providerId && providerCall.providerId === providerId,
  );
  return pendingCallsByProviderId.length;
};

export const getAllPendingCalls = (
  state: IRootState,
): IPendingProviderCall[] => {
  const providerCalls = getProviderCalls(state);
  const providerCallsArr = Object.values(providerCalls);
  const pendingCalls: IPendingProviderCall[] = providerCallsArr.filter(
    (providerCall): providerCall is IPendingProviderCall => {
      if (providerCall.pending) {
        return true;
      } else {
        return false;
      }
    },
  );
  return pendingCalls;
};
