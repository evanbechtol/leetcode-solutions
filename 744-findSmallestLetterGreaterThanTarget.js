/**
 * @param {character[]} letters
 * @param {character} target
 * @return {character}
 */
var nextGreatestLetter = function(letters, target) {
    let left = 0;
    let right = letters.length - 1;

    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);

        if (letters[mid] <= target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    // 2 cases:
    //   1. target > last letter of 'letters' -> return letters[0]
    //   2. we return letters[left], because the final interation of our loop will hold the character we need
    return left === letters.length ? letters[0] : letters[left];
};