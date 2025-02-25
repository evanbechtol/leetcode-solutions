/**
 * @param {number[][]} edges
 * @param {number} bob
 * @param {number[]} amount
 * @return {number}
 */
var mostProfitablePath = function (edges, bob, amount) {
    const n = amount.length;
    const graph = Array.from({ length: n }, () => []); 
    // Step 1: Construct adjacency list for the tree
    for (const [u, v] of edges) {
        graph[u].push(v);
        graph[v].push(u);
    }
    // Step 2: Find the exact path of Bob from `bob` to `0`
    let bobTime = Array(n).fill(Infinity);
    let bobPath = new Map();
    function findBobPath(node, parent, depth) {
        bobPath.set(node, depth);
        if (node === 0) return true;
        for (const neighbor of graph[node]) {
            if (neighbor !== parent && findBobPath(neighbor, node, depth + 1)) {
                return true;
            }
        }
        bobPath.delete(node);
        return false;
    }
    findBobPath(bob, -1, 0);

    // Mark Bob's reach time from his path
    bobTime = Array(n).fill(Infinity);
    let time = 0;
    for (const [node, t] of bobPath.entries()) {
        bobTime[node] = t;
    }
    let maxIncome = -Infinity;
    // Step 3: DFS for Alice to find the most profitable path
    function dfsAlice(node, parent, currTime, income) {
        // Case 1: Alice reaches first -> Full reward
        if (currTime < bobTime[node]) {
            income += amount[node];
        }
        // Case 2: Both reach at the same time -> Half reward
        else if (currTime === bobTime[node]) {
            income += amount[node] / 2;
        }
        // Case 3: Bob reaches first -> No reward
        let isLeaf = true;
        for (const neighbor of graph[node]) {
            if (neighbor !== parent) {
                isLeaf = false;
                dfsAlice(neighbor, node, currTime + 1, income);
            }
        }

        // If it's a leaf, update maxIncome
        if (isLeaf) {
            maxIncome = Math.max(maxIncome, income);
        }
    }
    dfsAlice(0, -1, 0, 0);  
    return maxIncome;
};