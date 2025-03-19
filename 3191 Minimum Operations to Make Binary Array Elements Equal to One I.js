/**
 * @param {number[]} nums
 * @return {number}
 */
var minOperations = function(nums) {
    let count = 0;
    let n = nums.length;

    for (let i = 0; i < nums.length - 2; i++) {
        if (nums[i] === 0) {
            count++;

            nums[i + 1] = nums[i + 1] === 1 ? 0 : 1;
            nums[i + 2] = nums[i + 2] === 1 ? 0 : 1;
        }
    }

    return (nums[nums.length - 1] && nums[nums.length - 2]) ? count : -1;
}