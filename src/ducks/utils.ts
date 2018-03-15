/**
 * @name filterAgainstArray
 * @description Compares each entry in arr1 against all entries in arr2, if the entry in arr1 matches an entry in arr2 then it is included in the result
 * @param arr1 An array of entries
 * @param arr2 An array of strings to check each entry against
 */
export const filterAgainstArr = <T>(
  arr1: [string, T][],
  arr2: string[],
  invert: boolean = false,
) => arr1.filter(([strToCheck]) => !invert && arr2.includes(strToCheck));
