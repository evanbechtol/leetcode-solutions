
/**
 * 33. Search in Rotated Sorted Array
 * Solved
 * Medium
 * Topics
 * premium lock iconCompanies

 *  *There is an integer array nums sorted in ascending order (with distinct values).

 *  *Prior to being passed to your function, nums is possibly left rotated at an unknown index k (1 <= k < nums.length) such that the resulting array is [nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]] (0-indexed). For example, [0,1,2,4,5,6,7] might be left rotated by 3 indices and become [4,5,6,7,0,1,2].

 *  *Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.

 *  *You must write an algorithm with O(log n) runtime complexity.
 *
 *

 *  *Example 1:

 *  *Input: nums = [4,5,6,7,0,1,2], target = 0
 * Output: 4

 *  *Example 2:

 *  *Input: nums = [4,5,6,7,0,1,2], target = 3
 * Output: -1

 *  *Example 3:

 *  *Input: nums = [1], target = 0
 * Output: -1
 *
 *

 *  *Constraints:

 *  *1 <= nums.length <= 5000
 * -104 <= nums[i] <= 104
 * All values of nums are unique.
 * nums is an ascending array that is possibly rotated.
 * -104 <= target <= 104
 */

 /**
  * 
Deciding the Sorted Half:

At any point during the search in the rotated array, one half (either the left or the right) will always be sorted. Determining which half is sorted is crucial for our modified binary search.

    If left half [low...mid] is sorted: We know this if the element at low is less than or equal to the element at mid. In a normally sorted array, if the start is less than or equal to the midpoint, it means all elements till the midpoint are in the correct increasing order.

        If the target lies within this sorted left half: We know this if the target is greater than or equal to the element at low and less than the element at mid. If this is the case, we then move our search to this half, meaning, we update high to mid−1.

        Otherwise: The target must be in the right half. So, we update low to mid+1.

    If right half [mid...high] is sorted: This is the else part. If the left half isn't sorted, the right half must be!

        If the target lies within this sorted right half: We know this if the target is greater than the element at mid and less than or equal to the element at high. If so, we move our search to this half by updating low to mid+1.

        Otherwise: The target must be in the left half. So, we update high to mid−1.

  */
class Solution {

    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (nums[mid] == target) {
                return mid;
            }

            if (nums[left] <= nums[mid]) {
                // target is between left and mid
                if (nums[left] <= target && target <= nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                // target is between mid and right
                if (nums[mid] <= target && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }

        return -1;
    }
}
