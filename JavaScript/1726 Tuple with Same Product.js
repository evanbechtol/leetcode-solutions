/**
 * @param {number[]} nums
 * @return {number}
 */
var tupleSameProduct = function (nums) {
    let result = 0;
    const products = new Map();

    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            const currentProduct = nums[i] * nums[j];
            const count = products.get(currentProduct) || 0;
            // Each pair of indices can form 8 different tuples with the same product.
            result += 8 * count;
            products.set(currentProduct, count + 1);
        }
    }

    return result;
};