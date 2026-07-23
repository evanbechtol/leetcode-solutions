/**
 * @param {number[]} nums
 * @return {boolean}
 */
var divideArray = function(nums) {
    const map = new Map();

    for (const num of nums) {
        map.set(num, (map.get(num) || 0) + 1);
    }

    for (const value of map.values()) {
        if (value % 2) {
            return false;
        }
    }

    return true;
};