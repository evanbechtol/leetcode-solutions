/**
 * @param {number} limit
 * @param {number[][]} queries
 * @return {number[]}
 */
var queryResults = function (limit, queries) {
    const result = [];
    const balls = new Map();
    const distinctColors = new Map();


    for (let i = 0; i < queries.length; i++) {
        const targetBall = queries[i][0];
        const color = queries[i][1];

        // the ball has already been colored
        if (balls.has(targetBall)) {
            const prevColor = balls.get(targetBall);

            // no change in color
            if (prevColor === color) {
                result.push(distinctColors.size);
                continue;
            }

            // this was the only ball for that color
            // delete the key, since no other balls are this color
            if (distinctColors.get(prevColor) === 1) {
                distinctColors.delete(prevColor);
            } else {
                // decrement the count, since there are other balls with this color
                distinctColors.set(prevColor, distinctColors.get(prevColor) - 1);
            }
        }

        // set the color for the current ball
        balls.set(targetBall, color);
        // update the colors with our new color
        distinctColors.set(color, (distinctColors.get(color) || 0) + 1);
        result.push(distinctColors.size);
    }

    return result;
};