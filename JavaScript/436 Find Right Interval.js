/**
 * @param {number[][]} intervals
 * @return {number[]}
 */
var findRightInterval = function (intervals) {
    const n = intervals.length;
    const map = new Map();

    const binarySearch = (target, left, right) => {
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const [start, end] = intervals[mid];

            if (start === target) {
                return map.get(start);
            }

            if (start < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return left === n ? -1 : map.get(intervals[left][0]);
    };

    for (let i = 0; i < n; i++) {
        const [start, end] = intervals[i];
        map.set(start, i);
    }

    intervals.sort((a, b) => a[0] - b[0]);
    const result = [];

    for (let i = 0; i < n; i++) {
        const [start, end] = intervals[i];

        const minIndex = binarySearch(end, 0, n - 1);
        result[map.get(start)] = minIndex;
    }

    return result;
};