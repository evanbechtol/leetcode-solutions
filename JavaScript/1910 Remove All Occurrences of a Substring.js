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

// Approach 2: Using String Replace
/**
 * @param {string} s
 * @param {string} part
 * @return {string}
 */
var removeOccurrences = function (s, part) {
    while (s.includes(part)) {
        s = s.replace(part, '');
    }

    return s;
};

// Approach 3: KMP Algorithm
/**
 * @param {string} s
 * @param {string} part
 * @return {string}
 */
var removeOccurrences = function (s, part) {
    const lps = buildLPS(part);
    let i = 0; // index for s
    let j = 0; // index for part
    const result = [];

    while (i < s.length) {
        if (s[i] === part[j]) {
            i++;
            j++;
            if (j === part.length) {
                // Found a match, reset j and remove the matched part from result
                result.length -= part.length - 1;
                j = 0;
            }
        } else {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                result.push(s[i]);
                i++;
            }
        }
    }

    // Append remaining characters
    result.push(...s.slice(i));

    return result.join('');
};

const buildLPS = (pattern) => {
    const lps = new Array(pattern.length).fill(0);
    let len = 0;
    let i = 1;

    while (i < pattern.length) {
        if (pattern[i] === pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len !== 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }

    return lps;
};

// Test case
const s = "daabcbaabcbc";
const part = "abc";
const result = removeOccurrences(s, part);
console.log(result); // Expected output: "dab"