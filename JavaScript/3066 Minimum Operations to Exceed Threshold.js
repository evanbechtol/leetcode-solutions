/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
var minOperations = function (nums, k) {
    let numOps = 0;
    const queue = new MinPriorityQueue();

    // add all nums into our min priority queue
    for (const num of nums) {
        queue.enqueue(num);
    }

    // repeat until we only have a single element left, or 
    // our smallest number is greater than or equal to k
    while (queue.size() && queue.front().element < k) {
        // get the smallest number
        const x = queue.dequeue().element;

        // get the second smallest number
        const y = queue.dequeue().element;

        // add the result of our op back into the queue
        queue.enqueue(Math.min(x, y) * 2 + Math.max(x, y));
        ++numOps;
    }

    return numOps;
};