/**
 * @description Given two strings s and t, return true if t is an anagram of s, and false otherwise.
 * URL: https://leetcode.com/problems/valid-anagram/description/
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function (s, t) {
    if (s.length !== t.length) {
        return false;
    }

    let mapT = buildCharMap(t);

    for (const char of s) {
        if (!mapT.get(char)) {
            return false;
        }

        if (mapT.get(char) === 1) {
            mapT.delete(char);
            continue;
        }

        mapT.set(char, mapT.get(char) - 1);
    }

    return true;
};

const buildCharMap = (str) => {
    let charMap = new Map();

    for (const char of str) {
        if (!charMap.get(char)) {
            charMap.set(char, 1);
        } else {
            charMap.set(char, charMap.get(char) + 1);
        }
    }

    return charMap;
}

var isAnagramFrequencyCount = function (s, t) {
    if (s.length !== t.length) {
        return false;
    }

    const charCount = new Array(26).fill(0);

    for (let i = 0; i < s.length; i++) {
        charCount[s.charCodeAt(i) - 97]++;
        charCount[t.charCodeAt(i) - 97]--;
    }

    for (let count of charCount) {
        if (count !== 0) {
            return false;
        }
    }

    return true;
};