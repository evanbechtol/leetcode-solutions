/**
 * @param {number} n
 * @param {number} k
 * @return {string}
 */
var getHappyString = function(n, k) {
    // Calculate the total number of happy strings of length n
    const totalHappyStrings = 3 * Math.pow(2, n - 1);
    
    // If k is greater than the total number of happy strings, return an empty string
    if (k > totalHappyStrings) {
        return '';
    }

    const result = [];

    // Define mappings for the next smallest and greatest valid characters
    const nextSmallest = new Map();
    nextSmallest.set('a', 'b');
    nextSmallest.set('b', 'a');
    nextSmallest.set('c', 'a');
    
    const nextGreatest = new Map();
    nextGreatest.set('a', 'c');
    nextGreatest.set('b', 'c');
    nextGreatest.set('c', 'b');

    // Calculate the starting indices for strings beginning with 'a', 'b', and 'c'
    let startA = 1;
    let startB = startA + (Math.pow(2, n - 1));
    let startC = startB + (Math.pow(2, n - 1));

    // Determine the first character based on the value of k
    if (k < startB) {
        result[0] = 'a';
        k -= startA;
    } else if (k < startC) {
        result[0] = 'b';
        k -= startB;
    } else {
        result[0] = 'c';
        k -= startC;
    }

    // Iterate through the remaining positions in the result string
    for (let i = 1; i < n; i++) {
        // Calculate the midpoint of the group for the current character position
        const mid = Math.pow(2, n - i - 1);

        if (k < mid) {
            result[i] = nextSmallest.get(result.at([i - 1]));
        } else {
            result[i] = nextGreatest.get(result.at([i - 1]));
            k -= mid;
        }
    }

    return result.join('');
};