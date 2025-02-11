/**
 * @param {number[]} A
 * @param {number[]} B
 * @return {number[]}
 */
var findThePrefixCommonArray = function(A, B) {
    const freq = new Array(A.length + 1).fill(0);
    const result = new Array(A.length);
    let commonCount = 0;

    for (let i = 0; i < A.length; i++) {
        ++freq[A[i]];

        if (freq[A[i]] === 2) {
            commonCount++;
        }

        ++freq[B[i]];

        if (freq[B[i]] === 2) {
            commonCount++;
        }

        result[i] = commonCount;
    }

    return result;
};