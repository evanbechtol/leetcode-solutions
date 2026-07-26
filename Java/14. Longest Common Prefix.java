/**
 * Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string "".

 

Example 1:

Input: strs = ["flower","flow","flight"]
Output: "fl"

Example 2:

Input: strs = ["dog","racecar","car"]
Output: ""
Explanation: There is no common prefix among the input strings.

 

Constraints:

    1 <= strs.length <= 200
    0 <= strs[i].length <= 200
    strs[i] consists of only lowercase English letters if it is non-empty.
 */

/**
Horizontal scanning:
    1. store our prefix as the first string in the array
    2. starting from the second string in the array, 
[
        1. check if the current string starts with the prefix
        2. if it does not, remove the last character from the prefix and repeat step 1
        3. if the prefix becomes empty, return an empty string
    ]
    3. return the prefix after checking all strings in the array

    // Show a visual of example of this algorithm with the example input ["flower","flow","flight"]
        Start:
            strings = ["flower", "flow", "flight"]
            prefix  = "flower"

        Compare prefix with "flow":
            "flow".startsWith("flower") -> false
            prefix = "flowe"
            "flow".startsWith("flowe")  -> false
            prefix = "flow"
            "flow".startsWith("flow")   -> true

            flower
            flow
            ||||
            prefix = "flow"

        Compare prefix with "flight":
            "flight".startsWith("flow") -> false
            prefix = "flo"
            "flight".startsWith("flo")  -> false
            prefix = "fl"
            "flight".startsWith("fl")   -> true

            flow
            flight
            ||
            prefix = "fl"

        All strings have been checked:
            return "fl"
 */
class Solution {
    public String longestCommonPrefix(String[] strs) {
        String prefix = strs[0];

        for (int i = 1; i < strs.length; i++) {
            while(!strs[i].startsWith(prefix)) {
                prefix = prefix.substring(0, prefix.length() - 1);

                if (prefix.isEmpty()) {
                    return "";
                }
            }
        }

        return prefix;
    }
}
