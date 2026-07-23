/**
 * @param {string} str1
 * @param {string} str2
 * @return {string}
 */
var shortestCommonSupersequence = function (str1, str2) {
    if (str1 === str2) return str1;

    const m = str1.length;
    const n = str2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(-1));

    for (let i = 0; i <= m; i++) {
        dp[i][0] = 0;
    }

    for (let j = 0; j <= n; j++) {
        dp[0][j] = 0;
    }

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            // match
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = 1 + dp[i - 1][j - 1];
            } else {
                // not match
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // backtracking
    let i = m;
    let j = n;
    let str = [];

    while (i > 0 && j > 0) {
        if (str1[i - 1] === str2[j - 1]) {
            str.unshift(str1[i - 1]);
            i--;
            j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
            str.unshift(str1[i - 1]);
            i--;
        } else {
            str.unshift(str2[j - 1]);
            j--;
        }
    }

    // adding remaining characters
    while (i > 0) {
        str.unshift(str1[i - 1]);
        i--;
    }

    while (j > 0) {
        str.unshift(str2[j - 1]);
        j--;
    }

    return str.join('');
};