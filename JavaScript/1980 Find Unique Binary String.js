/**
 * @description https://leetcode.com/problems/find-unique-binary-string/editorial/?envType=daily-question&envId=2025-02-20
 * Cantor's diagonal argument: https://en.wikipedia.org/wiki/Cantor%27s_diagonal_argument
 * @param {string[]} nums
 * @return {string}
 */
var findDifferentBinaryString = function(nums) {
    let result = '';

    for (let i = 0; i < nums.length; i++) {
        result += nums[i][i] === '0' ? '1' : '0';
    }

    return result;
};