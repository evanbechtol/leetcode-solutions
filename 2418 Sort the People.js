/**
 * @param {string[]} names
 * @param {number[]} heights
 * @return {string[]}
 */
var sortPeople = function(names, heights) {
        return names
        .map((name, index) => ({ name, height: heights[index] }))
        .sort((a, b) => b.height - a.height)
        .map(elem => elem.name)
};