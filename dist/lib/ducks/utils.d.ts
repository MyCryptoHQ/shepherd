/**
 * @name filterAgainstArray
 * @description Compares each entry in arr1 against all entries in arr2, if the entry in arr1 matches an entry in arr2 then it is included in the result
 * @param arr1 An array of entries
 * @param arr2 An array of strings to check each entry against
 * @param invert Includes results from arr1 that arent in arr2 instead
 */
export declare const filterAgainstArr: <T>(arr1: T[], arr2: T[], invert?: boolean) => T[];
