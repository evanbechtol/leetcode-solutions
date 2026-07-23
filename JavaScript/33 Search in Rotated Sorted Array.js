/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function (nums, target) {
    let left = 0;
    let right = nums.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (nums[mid] === target) {
            return mid;
        }

        // if true, we know all numbers betwen left and mid are sorted
        if (nums[mid] >= nums[left]) {
            // target is between left and mid
            if (nums[left] <= target && target <= nums[mid]) {
                right = mid - 1;
            } else {
                // target must be in right half
                left = mid + 1;
            }
        } else {
            // if we are here, all numbers between mid and right must be sorted
            // target is between mid and right
            if (nums[mid] <= target && target <= nums[right]) {
                left = mid + 1;
            } else {
                // target must be in left half
                right = mid - 1;
            }
        }
    }

    return -1;
};