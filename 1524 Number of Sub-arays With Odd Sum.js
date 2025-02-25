/**
 * @param {number[]} arr
 * @return {number}
 */
var numOfSubarrays = function(arr) {
    let prefixSum = 0;
    let count = 0;
    let oddCount = 0;
    let evenCount = 1;
    const MOD = 1000000007;

    for (let i = 0; i < arr.length; i++) {
        prefixSum += arr[i];

        if (prefixSum % 2 === 0) {
            count += oddCount;
            evenCount++;
        } else {
            count += evenCount;
            oddCount++;
        }

        count %= MOD;
    }

    return count;
};