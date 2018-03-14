import { RootState } from '@src/ducks';
import { getProviderBalancer } from '@src/ducks/providerBalancer/selectors';

export const getProviderCalls = (state: RootState) =>
  getProviderBalancer(state).providerCalls;

export const getProviderCallById = (state: RootState, id: number) =>
  getProviderCalls(state)[id];

export const getPendingProviderCallsByProviderId = (
  state: RootState,
  providerId: string,
) => {
  const providerCalls = getProviderCalls(state);
  const providerCallsArr = Object.values(providerCalls);
  const callsByProviderId = providerCallsArr.filter(
    providerCall =>
      providerCall.providerId && providerCall.providerId === providerId,
  );
  return callsByProviderId.length;
};
