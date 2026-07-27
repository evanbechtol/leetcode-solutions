/**
 * Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:

    Open brackets must be closed by the same type of brackets.
    Open brackets must be closed in the correct order.
    Every close bracket has a corresponding open bracket of the same type.

 

Example 1:

Input: s = "()"

Output: true

Example 2:

Input: s = "()[]{}"

Output: true

Example 3:

Input: s = "(]"

Output: false

Example 4:

Input: s = "([])"

Output: true

Example 5:

Input: s = "([)]"

Output: false

 

Constraints:

    1 <= s.length <= 104
    s consists of parentheses only '()[]{}'.
 */

/**
 * Time complexity: O(n). You have to check each character at least once in the worst-case.
 * Space complexity: O(n). In the worst case, you may have to add each character to the stack.
 */
class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();

        for (char ch : s.toCharArray()) {
            // It's simpler to push the equivalent closing parentheses, because you can do a direct
            // comparison to the characters, instead of having specific edge case checking logic for open/close characters.
            if (ch == '(') {
                stack.push(')');
            } else if (ch == '[') {
                stack.push(']');
            } else if (ch == '{') {
                stack.push('}');
            } else {
                // If we get here, the character that we are looking at is a closing parentheses
                // If the stack is empty, the string is not valid & we return false
                // OR if the stack pop returns a character that is not the current character, we return false.
                if (stack.isEmpty() || stack.pop() != ch) {
                    return false;
                }
            }
        }

        // If the stack is empty, then the string was valid
        return stack.isEmpty();
    }
}