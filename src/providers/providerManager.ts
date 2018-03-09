import { IProviderContructor } from '@src/types';
import { IProviderStorage } from '@src/providers/providerStorage';
import { IProviderConfig } from '@src/ducks/providerBalancer/providerStats';
// shepherd.config({callTimeout })
// const myNode = shepherd.init({providers })
// shepherd.add({provider})
// shepherd.remove({provider})
// shepherd.modify({provider: { supportedMethods, maxWorkers } })
// shepherd.only({provider})
// shepherd.delegate([{provider}], [methods] )

function addProviderFactory(
  store: IProviderStorage,
  providerName: string,
  Provider: IProviderContructor,
) {
  return store.set(providerName, Provider);
}

function addNetwork() {}

function useProvider(
  store: IProviderStorage,
  providerName: string,
  args: any[],
  config: IProviderConfig,
) {
  const Provider = store.get(providerName);
  const provider = new Provider(...args);
  const payload = {
    providerName,
    provider,
    config,
  };
}
