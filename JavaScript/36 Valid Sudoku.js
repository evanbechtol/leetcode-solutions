/**
 * @param {character[][]} board
 * @return {boolean}
 */
var isValidSudoku = function(board) {
    const rows = Array.from({ length: 9 }, () => new Set());
    const cols = Array.from({ length: 9 }, () => new Set());
    const boxes = Array.from({ length: 9 }, () => new Set());

    for (let row = 0; row < 9; row++) {
        for(let col = 0; col < 9; col++) {
            // no input in this box
            if (board[row][col] === '.') {
                continue;
            }

            const value = board[row][col];
            // this is the index of the current 3x3 box
            const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);

            // checks to see if this value has already appeared in a row, col, or the current 3x3 box
            if (rows[row].has(value) || cols[col].has(value) || boxes[boxIndex].has(value)) {
                return false;
            }

            rows[row].add(value);
            cols[col].add(value);
            boxes[boxIndex].add(value);
        }
    }

    return true;
};