class Solution {
    public int lengthOfLongestSubstring(String s) {
        int longest = 0;
        int left = 0;
        Set<String> seen = new HashSet<>();

        for (int right = 0; right < s.length(); right++) {
            while(seen.contains(s.charAt(right))) {
                seen.remove(s.charAt(left));
                left++;
            }

            seen.add(String.valueOf(s.charAt(right)));
            longest = Math.max(longest, right - left + 1);
        }


        return longest;        
    }
}