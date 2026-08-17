/**
 * Q1. Set Mismatch
Solved
Easy
Topics
premium lock iconCompanies

You have a set of integers s, which originally contains all the numbers from 1 to n. Unfortunately, due to some error, one of the numbers in s got duplicated to another number in the set, which results in repetition of one number and loss of another number.

You are given an integer array nums representing the data status of this set after the error.

Find the number that occurs twice and the number that is missing and return them in the form of an array.

 

Example 1:

Input: nums = [1,2,2,4]
Output: [2,3]

Example 2:

Input: nums = [1,1]
Output: [1,2]

 

Constraints:

    2 <= nums.length <= 104
    1 <= nums[i] <= 104


 */

    /**
 * @param {number[]} nums
 * @return {number[]}
 */
var findErrorNums = function(nums) {
    // create a frequency map from 1 to n + 1 and fill with 0
    const res = new Array(nums.length + 1).fill(0);

    // iterate over nums and increment the index corresponding to the
    // number in nums[i]. If any number has more than 1, it's duplicated
    // if any number has 0, then it's missing
    for (let i = 0; i < nums.length;i++) {
        res[nums[i]]++;
    }

    // return the duplicate and the missing
    return [res.indexOf(2), res.lastIndexOf(0)];
};