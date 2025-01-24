/**
 *  URL: https://leetcode.com/problems/find-eventual-safe-states/
 *  Description: We are given a directed graph of n nodes with each node labeled from 0 to n - 1. The graph is represented by a 2D integer array graph where graph[i] is an integer array of nodes that have an incoming edge from node i.
The problem states that a node is a terminal node if there are no outgoing edges. A node is a safe node if every possible path starting from that node leads to a terminal node (or another safe node).
Our task is to return a sorted array of all the safe nodes of the graph.

    Example 1: 
        Input: graph = [[1,2],[2,3],[5],[0],[5],[],[]]
        Output: [2,4,5,6]
        Explanation: The given graph is shown above.
        Nodes 5 and 6 are terminal nodes as there are no outgoing edges from either of them.
        Every path starting at nodes 2, 4, 5, and 6 all lead to either node 5 or 6.
    
    Example 2:
        Input: graph = [[1,2,3,4],[1,2],[3,4],[0,4],[]]
        Output: [4]
        Explanation:
        Only node 4 is a terminal node, and every path starting at node 4 leads to node 4.
*/

/**
 * @description The goal: return all the nodes which do not result in a cycle. 
 * 
 * This approach uses Kahn's algorithm to find the safe nodes in the graph (https://leetcode.com/explore/learn/card/graph/623/kahns-algorithm-for-topological-sorting/3886/)
 * we first find the indegree of every node in the graph, and then we iterate over the nodes with an indegree of 0
 * we add these nodes to a queue, and then iterate over the queue, decrementing the indegree of the neighboring nodes
 * if the indegree of a node becomes 0, we add it to the queue
 * 
 * We can see that if there is a cycle, the indegree of nodes in the cycle cannot be set to 0 due to cyclic dependency. 
 * We are unable to visit the cycle's nodes. We are also unable to visit any node with an incoming edge 
 * from any node in the cycle. 
 * Similarly, realize that any node with an incoming edge from nodes 3 or 5 would not have been 
 * visited.
 * @param {number[][]} graph
 * @return {number[]}
 */
var eventualSafeNodes = function(graph) {
    const n = graph.length;
    const reversedGraph = Array.from({ length: n }, () => []);
    const outDegree = Array(n).fill(0);
    const queue = [];
    const safeNodes = [];

    // Build the reversed graph and calculate the outdegree of each node
    for (let i = 0; i < n; i++) {
        outDegree[i] = graph[i].length;
        for (const neighbor of graph[i]) {
            reversedGraph[neighbor].push(i);
        }
    }

    // Add all the terminal nodes (those with outdegree 0) to the queue
    for (let i = 0; i < n; i++) {
        if (outDegree[i] === 0) {
            queue.push(i);
        }
    }

    // Process nodes in the queue
    while (queue.length) {
        // Remove the first node from the queue and process it.
        const node = queue.shift();

        // Add the current node to the list of safe nodes.
        safeNodes.push(node);

        // Iterate through all neighbors of the current node in the reversed graph.
        for (const neighbor of reversedGraph[node]) {

            // Decrease the outdegree of the neighbor. 
            // For Kahn's algorithm, we decrement the outdegree of the neighbor.
            outDegree[neighbor]--;

            // If the neighbor's outdegree becomes 0, it means it is now a terminal node.            
            if (outDegree[neighbor] === 0) {
                // Add the neighbor to the queue to be processed next.
                queue.push(neighbor);
            }
        }
    }

    // Return the safe nodes sorted in ascending order.
    return safeNodes.sort((a, b) => a - b);
};