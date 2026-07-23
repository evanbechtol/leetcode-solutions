/**
 * @param {string} word
 * @return {boolean}
 */
var detectCapitalUse = function(word) {
    /*
    valid cases:
        1. Word is only upper case -> word === word.toUpperCase()
        2. Word is only lower case -> word === word.toLowerCase()
        3. Word starts with uppercase and rest of string is lower case -> word === word[0] + word.substr(1).toLowerCase()
    */
    return word === word.toUpperCase() || word === word[0] + word.substr(1).toLowerCase();
};