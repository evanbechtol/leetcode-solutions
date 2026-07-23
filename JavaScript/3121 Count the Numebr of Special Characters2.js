/**
 * You are given a string word. A letter c is called special if it appears both in lowercase and 
 * uppercase in word, and every lowercase occurrence of c appears before the first uppercase 
 * occurrence of c. Return the number of special letters in word.
 * 
 * Example 1:
        Input: word = "aaAbcBC"
        Output: 3
        Explanation:
        The special characters are 'a', 'b', and 'c'.

    Example 2:
        Input: word = "abc"
        Output: 0
        Explanation:
        There are no special characters in word.

    Example 3:
        Input: word = "AbBCab"
        Output: 0
        Explanation:
        There are no special characters in word.
 */

/**
 * @param {string} word
 * @return {number}
 */
/**
 * @param {string} word
 * @return {number}
 */
var numberOfSpecialChars = function(word) {
    const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
    let result = 0;

    for (let i = 0; i < ALPHABET.length; i++) {
        // This checks if there are any lowercase after the uppercase
        const lower = word.lastIndexOf(ALPHABET[i]);
        // This finds the first index of the uppercase
        const upper = word.indexOf(ALPHABET[i].toUpperCase());
        

        // Increment IFF: we have a lower AND upper, AND lower appears before upper
        if (lower !== -1 && upper !== -1 && lower < upper) {
            result++;
        }
    }

    return result;
};

const input = "abDBAbb";
const expectedOutput = 1;
const actualOutput = numberOfSpecialChars(input);
console.log(actualOutput);
console.assert(actualOutput === expectedOutput, JSON.stringify({input, expectedOutput, actualOutput}));