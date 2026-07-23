/**
 * @param {number[]} nums
 * @return {number}
 */
var maximumSum = function (nums) {
    if (nums.length < 2) {
        return -1
    }

    const digitMapping = new Array(82).fill(0);
    let result = -1;

    for (let num of nums) {
        let sum = 0;
        let temp = num;

        while (temp !== 0) {
            sum += temp % 10; // get the last digit
            temp = Math.floor(temp / 10); // remove the last digit
        }

        // if the sum already exists, we can calculate the result
        if (digitMapping[sum] !== 0) {
            // get the max of the result OR the current number + the number in the mapping
            // this makes sure we get the max sum of the pair
            result = Math.max(result, num + digitMapping[sum]);
        }

        // update the mapping with the larger of our numbers
        // this helps make sure that we are always getting the max sum
        digitMapping[sum] = Math.max(digitMapping[sum], num);
    }

    return result;
};