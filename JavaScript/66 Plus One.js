/**
 * @param {number[]} digits
 * @return {number[]}
 */
var plusOne = function (digits) {
    let carry = 0;
    const n = digits.length - 1;

    // handles the case where a simple increment on the last digit
    // is all that is needed
    if (digits[n] !== 9) {
        digits[n]++;
        return digits;
    }

    /**
    1. Start at the end of the array. If we are processing a 9, 
       then we set that digit to zero and update carry to be 1.
    2. Else we are not processing a 9.
       - If carry === 1 -> we need to add one to the current digit & set carry to 0.
    4. Repeat step 1 and 2 until all numbers are processed.
    5. After all numbers are processed, if carry is 1, we need to add a 1 
       to the front of the number
    */
    for (let i = n; i >= 0; i--) {
        if (digits[i] === 9) {
            carry = 1;
            digits[i] = 0;
        } else {
            if (carry === 1) {
                digits[i]++;
                carry = 0;
                break;
            }
        }
    }

    if (carry === 1) {
        digits.unshift(1);
    }

    return digits;
};