/**
 * @param {number} num1
 * @param {number} num2
 * @return {number}
 */
var minimizeXor = function(num1, num2) {
    const countSetBits = (num) => num.toString(2).replace(/0/g, '').length;

    const addSetBits = (num, bitsToAdd) => {
        let bitPos = 0;
        while (bitsToAdd > 0) {
            while ((num >> bitPos) & 1) bitPos++;
            num |= 1 << bitPos;
            bitsToAdd--;
        }
        return num;
    };

    const removeSetBits = (num, bitsToRemove) => {
        while (bitsToRemove > 0) {
            num &= num - 1;
            bitsToRemove--;
        }
        return num;
    };

    const setBitsNum1 = countSetBits(num1);
    const setBitsNum2 = countSetBits(num2);

    if (setBitsNum1 === setBitsNum2) return num1;
    if (setBitsNum1 < setBitsNum2) return addSetBits(num1, setBitsNum2 - setBitsNum1);
    return removeSetBits(num1, setBitsNum1 - setBitsNum2);
};