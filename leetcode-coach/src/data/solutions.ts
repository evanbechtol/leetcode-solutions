export const curatedCodeSamples: Record<number, Record<string, string>> = {
  1: {
    Python: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, value in enumerate(nums):
        complement = target - value
        if complement in seen:
            return [seen[complement], i]
        seen[value] = i
    return []`,
    Java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[] { seen.get(complement), i };
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`,
    'C++': `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.count(complement)) return {seen[complement], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
    Rust: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        use std::collections::HashMap;
        let mut seen = HashMap::new();
        for (i, &value) in nums.iter().enumerate() {
            if let Some(&j) = seen.get(&(target - value)) {
                return vec![j as i32, i as i32];
            }
            seen.insert(value, i);
        }
        vec![]
    }
}`,
  },
  121: {
    Python: `def max_profit(prices: list[int]) -> int:
    min_price = float("inf")
    best = 0
    for price in prices:
        min_price = min(min_price, price)
        best = max(best, price - min_price)
    return best`,
    Java: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int best = 0;
        for (int price : prices) {
            minPrice = Math.min(minPrice, price);
            best = Math.max(best, price - minPrice);
        }
        return best;
    }
}`,
    'C++': `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = INT_MAX, best = 0;
        for (int price : prices) {
            minPrice = min(minPrice, price);
            best = max(best, price - minPrice);
        }
        return best;
    }
};`,
    Rust: `impl Solution {
    pub fn max_profit(prices: Vec<i32>) -> i32 {
        let mut min_price = i32::MAX;
        let mut best = 0;
        for price in prices {
            min_price = min_price.min(price);
            best = best.max(price - min_price);
        }
        best
    }
}`,
  },
  3: {
    Python: `def length_of_longest_substring(s: str) -> int:
    last = {}
    left = best = 0
    for right, char in enumerate(s):
        if char in last:
            left = max(left, last[char] + 1)
        last[char] = right
        best = max(best, right - left + 1)
    return best`,
    Java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (last.containsKey(c)) left = Math.max(left, last.get(c) + 1);
            last.put(c, right);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
    'C++': `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> last(256, -1);
        int left = 0, best = 0;
        for (int right = 0; right < s.size(); ++right) {
            left = max(left, last[(unsigned char)s[right]] + 1);
            last[(unsigned char)s[right]] = right;
            best = max(best, right - left + 1);
        }
        return best;
    }
};`,
    Rust: `impl Solution {
    pub fn length_of_longest_substring(s: String) -> i32 {
        use std::collections::HashMap;
        let mut last = HashMap::new();
        let (mut left, mut best) = (0, 0);
        for (right, ch) in s.chars().enumerate() {
            if let Some(&index) = last.get(&ch) {
                left = left.max(index + 1);
            }
            last.insert(ch, right);
            best = best.max(right - left + 1);
        }
        best as i32
    }
}`,
  },
  704: {
    Python: `def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    Java: `class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`,
    'C++': `class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
};`,
    Rust: `impl Solution {
    pub fn search(nums: Vec<i32>, target: i32) -> i32 {
        let (mut left, mut right) = (0_i32, nums.len() as i32 - 1);
        while left <= right {
            let mid = left + (right - left) / 2;
            match nums[mid as usize].cmp(&target) {
                std::cmp::Ordering::Equal => return mid,
                std::cmp::Ordering::Less => left = mid + 1,
                std::cmp::Ordering::Greater => right = mid - 1,
            }
        }
        -1
    }
}`,
  },
  42: {
    Python: `def trap(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    left_max = right_max = water = 0
    while left < right:
        if height[left] <= height[right]:
            left_max = max(left_max, height[left])
            water += left_max - height[left]
            left += 1
        else:
            right_max = max(right_max, height[right])
            water += right_max - height[right]
            right -= 1
    return water`,
    Java: `class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] <= height[right]) {
                leftMax = Math.max(leftMax, height[left]);
                water += leftMax - height[left++];
            } else {
                rightMax = Math.max(rightMax, height[right]);
                water += rightMax - height[right--];
            }
        }
        return water;
    }
}`,
    'C++': `class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] <= height[right]) {
                leftMax = max(leftMax, height[left]);
                water += leftMax - height[left++];
            } else {
                rightMax = max(rightMax, height[right]);
                water += rightMax - height[right--];
            }
        }
        return water;
    }
};`,
    Rust: `impl Solution {
    pub fn trap(height: Vec<i32>) -> i32 {
        if height.is_empty() { return 0; }
        let (mut left, mut right) = (0, height.len() - 1);
        let (mut left_max, mut right_max, mut water) = (0, 0, 0);
        while left < right {
            if height[left] <= height[right] {
                left_max = left_max.max(height[left]);
                water += left_max - height[left];
                left += 1;
            } else {
                right_max = right_max.max(height[right]);
                water += right_max - height[right];
                right -= 1;
            }
        }
        water
    }
}`,
  },
}
