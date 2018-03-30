import { handleValues, hexToNumber, makeBN, Wei } from '@src/utils';

describe('Testing ethUnits library ', () => {
  describe('handleValues', () => {
    it('should handle string inputs', () => {
      expect(handleValues('10').toString()).toEqual('10');
      expect(handleValues('0xd').toString()).toEqual('13');
      expect(handleValues('0xD').toString()).toEqual('13');
    });

    it('should handle number inputs', () => {
      expect(handleValues(10).toString()).toEqual('10');
    });

    it('should handle BN inputs', () => {
      const BN = handleValues(10);
      expect(handleValues(BN)).toEqual(BN);
    });

    it('should throw otherwise', () => {
      expect(() => handleValues([] as any)).toThrow(
        'unsupported value conversion',
      );
      expect(() => handleValues({} as any)).toThrow(
        'unsupported value conversion',
      );
    });
  });

  describe('makeBN', () => {
    it('should work', () => {
      expect(makeBN('0xD').toString()).toEqual('13');
    });
  });

  describe('Wei', () => {
    it('should work', () => {
      expect(Wei('0xD').toString()).toEqual('13');
    });
  });

  describe('hexToNum', () => {
    it('should work', () => {
      expect(hexToNumber('0xD').toString()).toEqual('13');
    });
  });
});
