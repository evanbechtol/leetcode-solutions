/**
Problem solving process:
    1. Analyze the problem. Identify constraints, identify the end goal (what is really being asked as the output?)
    2. Identify edge cases
    3. What data structure is required to make this efficient?
    4. Start coding!
*/


/**
 * @param {string[]} words1
 * @param {string[]} words2
 * @return {string[]}
 */
var wordSubsets = function (words1, words2) {
    const ALPHABET_LENGTH = 26;
    const maxCharFrequency = new Array(ALPHABET_LENGTH).fill(0);

    // 1. Find the maximum frequency of each character in words2
    for (let i = 0; i < words2.length; i++) {
        const tempCharFrequency = new Array(ALPHABET_LENGTH).fill(0);

        for (const char of words2[i]) {
            tempCharFrequency[char.charCodeAt(0) - 'a'.charCodeAt(0)]++;
        }

        for (let j = 0; j < ALPHABET_LENGTH; j++) {
            maxCharFrequency[j] = Math.max(maxCharFrequency[j], tempCharFrequency[j]);
        }
    }

    const result = [];

    // 2. Check if each word in words1 is a universal word
    for (let i = 0; i < words1.length; i++) {
        const tempCharFrequency = new Array(ALPHABET_LENGTH).fill(0);

        for (const char of words1[i]) {
            tempCharFrequency[char.charCodeAt(0) - 'a'.charCodeAt(0)]++;
        }

        let isUniversal = true;

        // 3. Check if the frequency of each character in the word is greater than 
        // or equal to the maximum frequency of that character in words2
        for (let j = 0; j < ALPHABET_LENGTH; j++) {
            if (tempCharFrequency[j] < maxCharFrequency[j]) {
                isUniversal = false;
                break;
            }
        }

        if (isUniversal) {
            result.push(words1[i]);
        }
    }

    return result;
};

// const words1 = ["amazon", "apple", "facebook", "google", "leetcode"];
const words1 = ["cccbb","aacbc","bbccc","baaba","acaba"];
// const words2 = ["e", "oo"];
const words2 = ["cb","b","cb"];


// const expectedOutput = ['facebook', 'google'];
const expectedOutput = ["cccbb", "aacbc", "bbccc", "acaba"];
const output = wordSubsets(words1, words2);

console.log(output);
console.assert(JSON.stringify(expectedOutput) === JSON.stringify(output));