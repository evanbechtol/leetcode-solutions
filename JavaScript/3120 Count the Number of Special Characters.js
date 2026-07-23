/**
 * @param {string} word
 * @return {number}
 */
var numberOfSpecialChars = function(word) {
    if (word.length < 2) {
        return 0;
    }

    const small = new Array(26).fill(0);
    const big = new Array(26).fill(0);
    let matches = 0;

    for (let i = 0; i < word.length; i++) {
        if (word[i] >= 'a' && word[i] <= 'z') {
            small[word[i].charCodeAt(0) - 'a'.charCodeAt(0)] = 1;
        } else {
            big[word[i].charCodeAt(0) - 'A'.charCodeAt(0)] = 1
        }
    }

    for (let i = 0; i < 26; i++) {
        if (small[i] && big[i]) {
            matches++;
        }
    }

    return matches;
};