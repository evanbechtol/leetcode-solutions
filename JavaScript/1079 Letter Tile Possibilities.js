/**
 * @param {string} tiles
 * @return {number}
 */
var numTilePossibilities = function(tiles) {
    tiles = tiles.split('').sort().join('');
    let used = new Array(tiles.length).fill(false);

    const backTrack = () => {
        let count = 0;

        for (let i = 0; i < tiles.length; i++) {
            if (used[i] || (i > 0 && tiles[i] === tiles[i - 1] && !used[i - 1])) {
                continue;
            }

            used[i] = true;
            count += 1 + backTrack();
            used[i] = false;
        }

        return count;
    };

    return backTrack();
};