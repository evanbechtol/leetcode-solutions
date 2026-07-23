/**
 * @param {number[]} nums
 * @return {number[]}
 */
var frequencySort = function(nums) {
    /*
    Because we can have negative values (-100 <= num <= 100) in order to correctly update our frequency array 
    for the current number we must add 100 to each number. 
        - For -100, the index will be 0 
        - For -99 the index will be 1
        - For 100 index will be 200
    This is why we need 201 elements in the array 100 + 100 + 1 (100 negative + 100 positive + zero)
    */
    // Create a frequency map using reduce
    const freq = nums.reduce((acc, num) => {
        acc[num + 100] = (acc[num + 100] || 0) + 1;
        return acc;
    }, new Array(201).fill(0));

    // Sort the array based on frequency and value
    return nums.sort((a, b) => {
        // If the frequencies are equal, sort descending
        if (freq[a + 100] === freq[b + 100]) {
            return b - a;
        }
        // Else, sort ascending by frequency
        return freq[a + 100] - freq[b + 100];
    });
};