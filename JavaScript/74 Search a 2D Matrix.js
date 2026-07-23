/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
var searchMatrix = function(matrix, target) {
    let left = 0;
    let right = matrix.length - 1;
    let rowLeft = 0;
    let rowRight = matrix[0].length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
    
        // target should be in this array
        if (target >= matrix[mid][rowLeft] && target <= matrix[mid][rowRight]) {
            return binarySearch(matrix[mid], target);
        } else {
            // target is not in the current array
            // target is less than our lowest element of the current array
            if (target < matrix[mid][rowLeft]) {
                right = mid - 1;
            } else {
                // target is greater than the highest element of the current array
                left = mid + 1;
            }
        }
    }

    return false;
};

const binarySearch = (arr, target) => {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (arr[mid] === target) {
            return true;
        }

        if (arr[mid] > target) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }

    return false;
}