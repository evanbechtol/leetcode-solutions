// Approach 1: Using Stack
/**
 * @param {string} s
 * @param {string} part
 * @return {string}
 */
var removeOccurrences = function (s, part) {
    const stack = [];
    const endChar = part[part.length - 1];
    
    for (const currChar of s) {
        stack.push(currChar);

        if (currChar === endChar && stack.length >= part.length) {
            if (isMatch(stack, part)) {
                stack.length -= part.length;
            }
        }
    }

    return stack.join('');
};

const isMatch = (sArr, part) => {
    return sArr.slice(-part.length).join('') === part;
}