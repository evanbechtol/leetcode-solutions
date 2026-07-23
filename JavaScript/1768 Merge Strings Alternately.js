/**
 * @description Given two strings word1 and word2, return the string that results from merging the characters of word1 and word2 alternatively in one string.
 * https://leetcode.com/problems/merge-strings-alternately/description/?envType=study-plan-v2&envId=programming-skills
 * @param {string} word1
 * @param {string} word2
 * @return {string}
 */
var mergeAlternately = function(word1, word2) {
    let merged = '';
    const n = Math.max(word1.length, word2.length);

    for (let i = 0; i < n; i++) {
        if (word1[i]) {
            merged += word1[i];
        } 

        if (word2[i]) {
            merged +=word2[i];
        }
    }

    return merged;
};