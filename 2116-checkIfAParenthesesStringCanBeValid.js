/**
 * @param {string} s
 * @param {string} locked
 * @return {boolean}
 */
var canBeValid = function(s, locked) {
    if (s.length % 2 === 1) {
        return false;
    }

    const openBrackets = [];
    const unlocked = [];

    for (let i = 0; i < s.length; i++) {
        if (locked[i] === '0') {
            unlocked.push(i);
        } else if (s[i] === '(') {
            openBrackets.push(i);
        } else {
            if (openBrackets.length > 0) {
                openBrackets.pop();
            } else if (unlocked.length > 0) {
                unlocked.pop();
            } else {
                return false;
            }
        }
    }

    while (openBrackets.length > 0 && unlocked.length > 0) {
        if (openBrackets[openBrackets.length - 1] > unlocked[unlocked.length - 1]) {
            return false;
        }

        openBrackets.pop();
        unlocked.pop();
    }

    return openBrackets.length === 0 && unlocked.length % 2 === 0;
};