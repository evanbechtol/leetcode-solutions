/**
 * Given a string of English letters s, return the greatest English letter which occurs as both a 
 * lowercase and uppercase letter in s. 
 * 
 * The returned letter should be in uppercase. If no such letter exists, return an empty string.
 * 
 * An English letter b is greater than another letter a if b appears after a in the English alphabet.

    Example 1:

    Input: s = "lEeTcOdE"
    Output: "E"
    Explanation:
    The letter 'E' is the only letter to appear in both lower and upper case.

    Example 2:

    Input: s = "arRAzFif"
    Output: "R"
    Explanation:
    The letter 'R' is the greatest letter to appear in both lower and upper case.
    Note that 'A' and 'F' also appear in both lower and upper case, but 'R' is greater than 'F' or 'A'.

    Example 3:

    Input: s = "AbCdEfGhIjK"
    Output: ""
    Explanation:
    There is no letter that appears in both lower and upper case.

 */
/**
 * @param {string} s
 * @return {string}
 */
var greatestLetter = function(s) {
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const small = new Array(26).fill(0);
    const big = new Array(26).fill(0);

    for (let i = 0; i < s.length; i++) {
        // lower case
        if (s[i] >= 'a' && s[i] <= 'z') {
            small[s[i].charCodeAt(0) - 'a'.charCodeAt(0)] = 1;
        } else {
            big[s[i].charCodeAt(0) - 'A'.charCodeAt(0)] = 1;
        }
    }

    for (let i = small.length - 1; i >= 0; i--) {
        if (small[i] && big[i]) {
            return ALPHABET[i];
        }
    }

    return '';
};



const input = "lEeTcOdE";
const expectedOutput = 'E';
const actualOutput = greatestLetter(input);
console.log(actualOutput);
console.assert(actualOutput === expectedOutput, JSON.stringify({input, expectedOutput, actualOutput}));