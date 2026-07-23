/**
 * @description You are given a 0-indexed array of positive integers nums and a positive integer limit.
 * In one operation, you can choose any two indices i and j and swap nums[i] and nums[j] if |nums[i] - nums[j]| <= limit.
 * Return the lexicographically smallest array that can be obtained by performing the operation any number of times.
 * An array a is lexicographically smaller than an array b if in the first position where a and b differ, 
 * array a has an element that is less than the corresponding element in b. 
 * For example, the array [2,10,3] is lexicographically smaller than the array [10,2,3] because they differ at index 0 and 2 < 10.
 * 
 * Keys to solving this efficiently:
 * 1. Sort the indices based on the values in nums
 * 2. Group the indices that can be swapped with one another
 * 3. Sort the group based on their original position
 * 
 * URL: https://leetcode.com/problems/make-lexicographically-smallest-array-by-swapping-elements/description/?envType=daily-question&envId=2025-01-25
 * @param {number[]} nums
 * @param {number} limit
 * @return {number[]}
 */
var lexicographicallySmallestArray = function(nums, limit) {
    const n = nums.length;
    const indices = [];

    // create an array of indices
    for (let i = 0; i < n; i++) {
        indices.push(i);
    }

    // sort indices based on values in nums
    indices.sort((a, b) => nums[a] - nums[b]);

    const result = new Array(n);
    let i = 0;

    while (i < n) {
        let j = i + 1;

        // find range of indices which can be swapped with one another
        // this determine the index range of our group
        while (j < n && nums[indices[j]] - nums[indices[j - 1]] <= limit) {
            j++;
        }

        // now we have our group of indices
        const currentGroup = indices.slice(i, j);

        // sort based on the their original position
        currentGroup.sort((a, b) => a - b);

        // put values corresponding to indices in the result
        for (let k = 0; k < currentGroup.length; k++) {
            result[currentGroup[k]] = nums[indices[i + k]];
        }

        // process next group, we skip all the indices that have been processed
        i = j;
    }

    return result;
};