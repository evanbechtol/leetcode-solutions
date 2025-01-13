/**
 * 
 * Example 1:

    Input: words = ["mass","as","hero","superhero"]
    Output: ["as","hero"]
    Explanation: "as" is substring of "mass" and "hero" is substring of "superhero".
    ["hero","as"] is also a valid answer.

    Example 2:

    Input: words = ["leetcode","et","code"]
    Output: ["et","code"]
    Explanation: "et", "code" are substring of "leetcode".

    Example 3:

    Input: words = ["blue","green","bu"]
    Output: []
    Explanation: No string of words is substring of another string.

 */
/**
 * @param {string[]} words
 * @return {string[]}
 */
var stringMatching = function(words) {
    const matches = [];

    for (let i = 0; i < words.length; i++)  {
        const currentWord = words[i];

        for (let j = 0; j < words.length; j++) {
            const possibleSubstring = words[j];

            if (i === j || currentWord.length > possibleSubstring.length || currentWord === possibleSubstring) {
                continue;
            }


            if (possibleSubstring.includes(currentWord)) {
                matches.push(currentWord);
            }
        }
    }

    return matches;
};