/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 */
var FindElements = function(root) {
    this.seen = new Set();
    
    // initialize the tree
    dfs(root, 0, this.seen);
};

const dfs = (currNode, currValue, seen) => {
    if (!currNode) {
        return;
    }

    seen.add(currValue);
    dfs(currNode.left, currValue * 2 + 1, seen);
    dfs(currNode.right, currValue * 2 + 2, seen);
};

/** 
 * @param {number} target
 * @return {boolean}
 */
FindElements.prototype.find = function(target) {
    return this.seen.has(target);
};

/** 
 * Your FindElements object will be instantiated and called as such:
 * var obj = new FindElements(root)
 * var param_1 = obj.find(target)
 */