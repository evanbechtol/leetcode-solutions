/**
 * @param {number[][]} items1
 * @param {number[][]} items2
 * @return {number[][]}
 */
var mergeSimilarItems = function(items1, items2) {
    const map = new Map();

    for (const [val, weight] of items1) {
        map.set(val, weight);
    }

    for (const [val, weight] of items2) {
        map.set(val, (map.get(val) || 0) + weight)
    }

    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
};