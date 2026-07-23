/**
 * @param {number[]} nums
 * @return {number}
 */
var countBadPairs = function (nums) {
    let res = 0;
    let map = new Map();
    let n = nums.length * (nums.length - 1) / 2;
    for (let i = 0; i < nums.length; i++) {
        if (map.has(nums[i] - i)) {
            res += map.get(nums[i] - i);
            map.set(nums[i] - i, map.get(nums[i] - i) + 1);
        } else {
            map.set(nums[i] - i, 1);
        }
    }
    // console.log(res);
    return n - res;
};