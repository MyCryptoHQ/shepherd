import { makeMockProviderConfig, makeMockStats } from './utils';
describe('Test makeMockProviderConfig', () => {
  it('should properly merge supported methods', () => {
    const providerConfig = makeMockProviderConfig();
    const providerConfig2 = makeMockProviderConfig({
      supportedMethods: { estimateGas: false },
    });
    providerConfig.supportedMethods.estimateGas = false;
    expect(providerConfig).toEqual(providerConfig2);
  });

  it('should properly merge networks', () => {
    const providerConfig = makeMockProviderConfig();
    const providerConfig2 = makeMockProviderConfig({
      network: 'ETC',
    });
    providerConfig.network = 'ETC';
    expect(providerConfig).toEqual(providerConfig2);
  });
});

describe('Test makeMockProviderStats', () => {
  it('should properly merge isOffline', () => {
    const stats1 = makeMockStats();
    const stats2 = makeMockStats({ isOffline: true });
    stats1.isOffline = true;
    expect(stats1).toEqual(stats2);
  });
});
