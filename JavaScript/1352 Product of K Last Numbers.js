
// Approach 1: TC: O(n) SC: O(n)
var ProductOfNumbers = function () {
    this.data = [];
};

/** 
 * @param {number} num
 * @return {void}
 */
ProductOfNumbers.prototype.add = function(num) {
    this.data.push(num);
};

/** 
 * @param {number} k
 * @return {number}
 */
ProductOfNumbers.prototype.getProduct = function(k) {
    return this.data
    .slice(this.data.length - k)
    .reduce((acc, curr) => acc *= curr, 1);
};

/** 
 * Your ProductOfNumbers object will be instantiated and called as such:
 * var obj = new ProductOfNumbers()
 * obj.add(num)
 * var param_2 = obj.getProduct(k)
 */

// Approach 2: TC: O(1) SC: O(n)
var ProductOfNumbers = function () {
    this.products = [1];
};

/** 
 * @param {number} num
 * @return {void}
 */
ProductOfNumbers.prototype.add = function (num) {
    // reset the products, all previous values are now invalid
    if (num === 0) {
        this.products = [1];
    } else {
        // add the new product to the end of the array
        this.products.push( this.products.at(-1) * num);
    }
};

/** 
 * @param {number} k
 * @return {number}
 */
ProductOfNumbers.prototype.getProduct = function (k) {
    // we can't return the last k, if k is larger than our array
    if (k > this.products.length - 1) {
        return 0;
    }

    // use prefix division to get the product of the last k elements
    return this.products.at(-1) / this.products.at(-k - 1);
};