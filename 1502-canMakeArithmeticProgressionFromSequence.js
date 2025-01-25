/**
 * @description A sequence of numbers is called an arithmetic progression
 * if the difference between any two consecutive elements is the same.
 * Given an array of numbers arr, return true if the array can be rearranged to form an arithmetic progression. 
 * Otherwise, return false.
 * 
 * URL: https://leetcode.com/problems/can-make-arithmetic-progression-from-sequence/description/?envType=study-plan-v2&envId=programming-skills
 * @param {number[]} arr
 * @return {boolean}
 */
var canMakeArithmeticProgression = function(arr) {
    if (arr.length < 3) {
        return true;
    }

    arr.sort((a, b) => a - b);

    for (let i = 2; i < arr.length; i++) {
        // compare two differences in a single loop iteration
        // if we ever encounter one that is not equal, return false
        if (arr[i] - arr[i - 1] !== arr[i - 1] - arr[i - 2]) {
            return false;
        }
    }

    return true;
};