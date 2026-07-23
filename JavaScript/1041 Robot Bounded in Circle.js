/*
Edge cases:
    1. Instructions has no 'G': it never moves forward -> return true
    2. Instructions has no 'L' or 'R': it never turns -> return false
*/
/**
 * @description URL: https://leetcode.com/problems/robot-bounded-in-circle/description/?envType=study-plan-v2&envId=programming-skills
 * @param {string} instructions
 * @return {boolean}
 */
var isRobotBounded = function(instructions) {
    // On the left turn:
    //   orientation = (4 + orientation - 1) % 4
    // On the right turn:
    //   orientation = (4 + orientation + 1) % 4
    let orientation = 0; // 0 = North, 1 = West, 2 = South, 3 = East
    let x = 0;
    let y = 0;
    const moves = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // This represents moving N, E, S, W (respectively)

    for (const ins of instructions) {
        if (ins === 'L') {
            orientation = (4 + orientation - 1) % 4;
        } else if (ins === 'R') {
            orientation = (4 + orientation + 1) % 4;
        } else {
            x = x + moves[orientation][0];
            y = y + moves[orientation][1];
        }
    }    

    const isAtOrigin = x === 0 && y === 0;
    const isHeadingNorth = orientation === 0; // Robot cannot make a cycle if it is heading in the initial dir of North

    return isAtOrigin || !isHeadingNorth;
};