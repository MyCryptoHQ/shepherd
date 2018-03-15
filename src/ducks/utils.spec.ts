import { filterAgainstArr } from './utils';
describe('Ducks utils Tests', () => {
  describe('filterAgainstArr', () => {
    it('should return the first three entries', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [1, 2, 3];

      expect(filterAgainstArr<number>(arr1, arr2)).toEqual(
        // [ 1, 2, 3]
        arr1.slice(0, arr1.length - 1),
      );
    });
    it('should return the last entry', () => {
      const arr1 = [1, 2, 3, 4];
      const arr2 = [1, 2, 3];

      expect(filterAgainstArr<number>(arr1, arr2, true)).toEqual(
        // [ 4 ]
        arr1.slice(-1),
      );
    });
  });
});
