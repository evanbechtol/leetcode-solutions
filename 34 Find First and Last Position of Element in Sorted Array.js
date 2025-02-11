/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var searchRange = function (nums, target) {
    if (nums.length === 0 || (nums.length === 1 && nums[0] !== target)) {
        return [-1, -1];
    }

    // we utilize our binary search 2 times: once to find the left bound
    // and once more to find our right bound.
    // Since Binary search will naturally converge onto the target
    const left = binarySearch(nums, target, true);
    const right = binarySearch(nums, target, false);
    
    return [left, right];    
};

const binarySearch = (nums, target, isSearchingLowerBound) => {
    let left = 0;
    let right = nums.length - 1;
    let idx = -1;

    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        // console.log(`mid is now: ${mid}`)
        if (nums[mid] < target) {
            left = mid + 1;
        } else if (nums[mid] > target) {
            right = mid - 1;
        } else {
            // mid is on the target
            idx = mid;
            // console.log(`mid on target, idx updating to: ${idx}`);


            if (isSearchingLowerBound) {
                // this is our upper bound
                // search the left half of the arr
                right = mid -1;
                // console.log(`updating upper bound, right is now: ${right}`)
            } else {
                // this is our lower bound
                // search the right half of the arr
                left = mid + 1;
                // console.log(`updating lower bound, left is now: ${left}`)
            }
        }
    }

    // console.log(`returning idx: ${idx}`)
    return idx;
};