/**
 * @param {number[]} nums
 * @return {number}
 */
var maxAbsoluteSum = function (nums) {
    let sum = 0;
    let minSum = 0;
    let maxSum = 0;

    for (let i = 0; i < nums.length; i++) {
        sum += nums[i];
        if (sum > maxSum) {
            maxSum = sum;
        }

        if (sum < minSum) {
            minSum = sum;
        }
    }


    return Math.abs(maxSum - minSum);
};