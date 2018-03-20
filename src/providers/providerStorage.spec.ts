import { providerStorage } from './providerStorage';
import { MockProvider } from '@test/mockNode';
import { IProvider } from '@src/types';

describe('providerStorage tests', () => {
  const instance: IProvider = new MockProvider() as any;
  const classToSet: any = Proxy;
  it('should set a class', () => {
    expect(providerStorage.setClass('mock1', classToSet)).toEqual(undefined);
  });
  it('should get the class', () => {
    expect(providerStorage.getClass('mock1')).toEqual(classToSet);

    // throw on undefined
    expect(() => providerStorage.getClass('mock11')).toThrow(
      'mock11 implementation does not exist in storage',
    );
  });
  it('should set an instance', () => {
    expect(providerStorage.setInstance('mock_inst_1', instance)).toEqual(
      undefined,
    );
  });
  it('should get the instance', () => {
    expect(providerStorage.getInstance('mock_inst_1')).toEqual(instance);

    // throw on undefined
    expect(() => providerStorage.getInstance('mock11')).toThrow(
      'mock11 instance does not exist in storage',
    );
  });
});
