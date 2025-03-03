/**
 * @param {number[]} nums
 * @param {number} pivot
 * @return {number[]}
 */
var pivotArray = function(nums, pivot) {
    const lessThanPivot = [];
    const greaterThanPivot = [];
    const pivots = [];

    for (const num of nums) {
        if (num < pivot) {
            lessThanPivot.push(num)
        } else if (num > pivot) {
            greaterThanPivot.push(num);
        } else {
            pivots.push(num);
        }
    }

    return [...lessThanPivot, ...pivots, ...greaterThanPivot];
};