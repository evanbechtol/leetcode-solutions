/**
 * @param {string} s1
 * @param {string} s2
 * @return {boolean}
 */
var areAlmostEqual = function (s1, s2) {
    if (s1 === s2) {
        return true;
    }

    let differenceCount = 0;
    let firstIdxDiff = 0;
    let secondIdxDiff = 0;

    for (let i = 0; i < s1.length; i++) {
        let s1Char = s1[i];
        let s2Char = s2[i];

        if (s1Char !== s2Char) {
            differenceCount++;

            if (differenceCount > 2) {
                return false;
            }

            if (differenceCount === 1) {
                firstIdxDiff = i;
            } else {
                secondIdxDiff = i;
            }
        }
    }

    return s1[firstIdxDiff] === s2[secondIdxDiff] && s1[secondIdxDiff] === s2[firstIdxDiff];
};