/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {string} traversal
 * @return {TreeNode}
 */
var recoverFromPreorder = function (traversal) {
    let stack = [];
    let i = 0;
    const n = traversal.length;

    while (i < n) {
        let depth = 0;

        // Count the depth of the current node
        while (i < n && traversal[i] === '-') {
            depth++;
            i++;
        }

        let num = 0;
        // Get the value of the current node
        while (i < n && !isNaN(traversal[i])) {
            num = num * 10 + parseInt(traversal[i]);
            i++;
        }

        let node = new TreeNode(num);

        // Pop nodes from the stack until the depth is less than the current depth
        while (stack.length > depth) {
            stack.pop();
        }

        // If the stack is not empty, add the current node as the child of the top node
        if (stack.length > 0) {
            if (!stack[stack.length - 1].left) {
                stack[stack.length - 1].left = node;
            } else {
                stack[stack.length - 1].right = node;
            }
        }

        // Add the current node to the stack
        stack.push(node);
    }

    return stack[0];
};