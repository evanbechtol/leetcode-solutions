/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
var merge = function(nums1, m, nums2, n) {
    let r = nums1.length - 1;
    let i = m - 1;
    let j = n - 1;

    while (j >= 0) {
        if (j >= 0 && nums1[i] > nums2[j]) {
            nums1[r--] = nums1[i--];
        } else {
            nums1[r--] = nums2[j--];
        }
    }
};