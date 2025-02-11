/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @return {Array}
 */
var join = function (arr1, arr2) {
    const map = new Map();

    // provides O(1) lookup for the index based on the id
    for (const obj of arr1) {
        map.set(obj.id, obj);
    }

    for (const obj of arr2) {
        // doesn't exist in arr1, push it in
        if (!map.has(obj.id)) {
            map.set(obj.id, obj);
        } else {
            // this exists on the map already
            const prevObj = map.get(obj.id);
            for (const key of Object.keys(obj)) {
                prevObj[key] = obj[key];
            };
        }
    }

    const result = [];

    // build the result array
    for (const key of map.keys()) {
        result.push(map.get(key));
    }

    return result.sort((a, b) => a.id - b.id);
};