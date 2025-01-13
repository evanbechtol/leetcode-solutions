/**
 * Example 1:

    Input: s = "annabelle", k = 2
    Output: true
    Explanation: You can construct two palindromes using all characters in s.
    Some possible constructions "anna" + "elble", "anbna" + "elle", "anellena" + "b"

    Example 2:

    Input: s = "leetcode", k = 3
    Output: false
    Explanation: It is impossible to construct 3 palindromes using all the characters of s.

    Example 3:

    Input: s = "true", k = 4
    Output: true
    Explanation: The only possible solution is to put each character in a separate string.

 */

/**
 * @param {string} s
 * @param {number} k
 * @return {boolean}
 */
var canConstruct = function(s, k) {
    // impossible to form k palindromes
    if (s.length < k) {
        return false;
    }

    // can use each character in s to form a palindrome of length 1
    if (s.length === k) {
        return true;
    }

    if (k >= 26) {
        return true;
    }

    let oddCount = 0;
    const frequencies = new Array(26).fill(0);

    for (let i = 0; i < s.length; i++) {
        const char = s[i].charCodeAt(0);
        frequencies[char - 'a'.charCodeAt(0)]++;
    }

    for (let i = 0; i < 26; i++) {
        if (frequencies[i] % 2 === 1) {
            oddCount++;
        }
    }

    return oddCount <= k;
};