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

            if (!products.has(currentProduct)) {
                products.set(currentProduct, 1);
            } else {
                products.set(currentProduct, products.get(currentProduct) + 1);
            }
        }
    }

    for (const [key, value] of products) {
        // combination formula: C(n, 2) = n * (n - 1) / 2
        const pairsOfEqualProduct = ((value - 1) * value) / 2;
        // Each pair of indices can form 8 different tuples with the same product.
        result += 8 * pairsOfEqualProduct;
    }

    return result;
};