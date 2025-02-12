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
            sum += temp % 10;
            temp = Math.floor(temp / 10);
        }

        if (digitMapping[sum] !== 0) {
            result = Math.max(result, num + digitMapping[sum]);
        }

        digitMapping[sum] = Math.max(digitMapping[sum], num);
    }

    return result;
};