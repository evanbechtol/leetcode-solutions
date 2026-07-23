/**
 * @param {string} s
 * @return {number}
 */
var minimumLength = function(s) {
    if (s.length < 3) {
        return s.length;
    }

    let freq = new Array(26).fill(0);
    let totalLength = 0;

    for (let i = 0; i < s.length; i++) {
        freq[s[i].charCodeAt(0) - 'a'.charCodeAt(0)]++;
    }

    for (let i = 0; i < freq.length; i++) {
        if (freq[i] === 0) {
            continue;
        }

        if (freq[i] % 2 === 0) {
            totalLength += 2
        } else {
            totalLength += 1;
        };
    }

    return totalLength;
};