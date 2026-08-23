/**
 * 26. Remove Duplicates from Sorted Array
Easy
Topics
premium lock iconCompanies
Hint

Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same.

Consider the number of unique elements in nums to be k​​​​​​​​​​​​​​. After removing duplicates, return the number of unique elements k.

The first k elements of nums should contain the unique numbers in sorted order. The remaining elements beyond index k - 1 can be ignored.

Custom Judge:

The judge will test your solution with the following code:

int[] nums = [...]; // Input array
int[] expectedNums = [...]; // The expected answer with correct length

int k = removeDuplicates(nums); // Calls your implementation

assert k == expectedNums.length;
for (int i = 0; i < k; i++) {
    assert nums[i] == expectedNums[i];
}

If all assertions pass, then your solution will be accepted.

 

Example 1:

Input: nums = [1,1,2]
Output: 2, nums = [1,2,_]
Explanation: Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively.
It does not matter what you leave beyond the returned k (hence they are underscores).

Example 2:

Input: nums = [0,0,1,1,1,2,2,3,3,4]
Output: 5, nums = [0,1,2,3,4,_,_,_,_,_]
Explanation: Your function should return k = 5, with the first five elements of nums being 0, 1, 2, 3, and 4 respectively.
It does not matter what you leave beyond the returned k (hence they are underscores).

 

Constraints:

    1 <= nums.length <= 3 * 104
    -100 <= nums[i] <= 100
    nums is sorted in non-decreasing order.


 */
/**
What pattern? Two pointers
- "write": keeps track of the number of unique numbers and is the index we'll update in the event a duplicate is encountered
- "read": the index of the number that we are checking to see if there is a duplicate

We know that the first item in the array is guaranteed to be unique, so
we start our loop at index one.

Each iteration of the loop, we compare read with read - 1. If they are identical, we increment read and proceed to next iteration.

Once we encounter nums[read] that doesn't equal nums[read - 1], then we know that we have encountered a new unique number. At this point, we update nums[write] with the value at nums[read]. Finally, we increment write.
 */
/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function (nums) {
    let write = 1;

    for (let read = 1; read < nums.length; read++) {
        if (nums[read] !== nums[read - 1]) {
            nums[write] = nums[read];
            write++;
        }
    }

    return write;
};