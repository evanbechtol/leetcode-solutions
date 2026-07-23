13-romanToInteger.js
/**
 * @param {string} s
 * @return {number}
 */
var romanToInt = function(s) {
    const romanToNumMap = { 'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000 };

    if (s.length === 1) {
        return romanToNumMap[s[0]];
    }
    
    let result = 0; 

    for (let i = 0; i < s.length; i++) {
        const current = romanToNumMap[s[i]];
        const next = romanToNumMap[s[i + 1]];

        if (next > current) {
            result += next - current;
            i++;
        } else {
            result += current;
        }
    }

    return result;
};