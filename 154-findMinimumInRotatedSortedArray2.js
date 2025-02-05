/**
 * @param {number[]} nums
 * @return {number}
 */
var findMin = function (nums) {
    let left = 0;
    let right = nums.length - 1;
    let min = Infinity;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        // all values are equal, narrow our search space
        if (nums[left] === nums[mid] && nums[mid] === nums[right]) {
            min = Math.min(min, nums[left]);
            left = left + 1;
            right = right - 1;
        } else if (nums[left] <= nums[mid]) {
            // left is sorted
            min = Math.min(min, nums[left]);
            left = mid + 1;
        } else {
            // right is sorted
            min = Math.min(min, nums[mid]);
            right = mid - 1;
        }
    }

    return min;
};