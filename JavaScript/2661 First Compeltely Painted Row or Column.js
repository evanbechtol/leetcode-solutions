/**
 * URL: https://leetcode.com/problems/first-completely-painted-row-or-column/
 * You are given a 0-indexed integer array arr, and an m x n integer matrix mat. arr and mat both contain all the integers in the range [1, m * n].
    Go through each index i in arr starting from index 0 and paint the cell in mat containing the integer arr[i].
    Return the smallest index i at which either a row or a column will be completely painted in mat.

    Example 1: 
        Input: arr = [1,3,4,2], mat = [[1,4],[2,3]]
        Output: 2
        Explanation: The moves are shown in order, and both the first row and second column of the matrix become fully painted at arr[2].

    Example 2:
        Input: arr = [2,8,7,4,1,3,5,6,9], mat = [[3,2,5],[1,4,6],[8,7,9]]
        Output: 3
        Explanation: The second column becomes fully painted at arr[3].
 */
/**
 * @param {number[]} arr
 * @param {number[][]} mat
 * @return {number}
 */
var firstCompleteIndex = function (arr, mat) {
    const row = mat.length;
    const col = mat[0].length;
    const pos = new Map();
    
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++){
            pos.set(mat[i][j], [i, j]);
        }
    }
    
    const rowCount = new Array(row).fill(0);
    const colCount = new Array(col).fill(0);
    
    for (let i = 0; i < arr.length; i++) {
        const [r, c] = pos.get(arr[i]);

        rowCount[r]++;
        colCount[c]++;

        if (rowCount[r] === col || colCount[c] === row) {
            return i;
        }
    }

    return arr.length - 1;
};