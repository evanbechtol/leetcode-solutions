/**
 * @param {number[]} derived
 * @return {boolean}
 */
var doesValidArrayExist = function(derived) {
   return !derived.reduce((acc, curr) => acc ^= curr, 0);
};