import { getProviderCalls } from '@src/ducks/providerBalancer/providerCalls';
import { RootState } from '@src/types';

export const getFinishedCallsByProviderId = (
  state: RootState,
  providerId: string,
) => {
  const providerCalls = getProviderCalls(state);
  const providerCallsArr = Object.values(providerCalls);
  const callsByProviderId = providerCallsArr.filter(
    providerCall =>
      providerCall.providerId &&
      providerCall.providerId === providerId &&
      !providerCall.pending, // TODO: test this
  );
  return callsByProviderId.length;
};
