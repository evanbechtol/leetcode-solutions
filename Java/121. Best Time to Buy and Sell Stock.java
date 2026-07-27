
/**
 * You are given an array prices where prices[i] is the price of a given stock on the ith day.
 *
 *  *You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.
 *
 *  *Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.
 *
 *
 *
 *  *Example 1:
 *
 *  *Input: prices = [7,1,5,3,6,4]
 * Output: 5
 * Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
 * Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.
 *
 *  *Example 2:
 *
 *  *Input: prices = [7,6,4,3,1]
 * Output: 0
 * Explanation: In this case, no transactions are done and the max profit = 0.
 *
 *
 *
 *  *Constraints:
 *
 *  *1 <= prices.length <= 105
 * 0 <= prices[i] <= 104
 */
/**
 * 1. Calculate the profit from selling today after buying at the lowest earlier price.
 * 2. Update the maximum profit if today’s profit is better.
 * 3. Update the lowest price if today’s price is lower.
 *
 *  *Price   Lowest so far   Profit today   Max profit
 * 7       7               0              0
 * 1       1               0              0
 * 5       1               4              4
 * 3       1               2              4
 * 6       1               5              5
 * 4       1               3              5
 *
 *  *Time complexity: O(n) — one pass through the prices.
 * Space complexity: O(1) — only two variables are needed.
 */
class Solution {

    public int maxProfit(int[] prices) {
        int maxProfit = 0;
        int minPrice = prices[0];

        for (int i = 1; i < prices.length; i++) {
            int profit = prices[i] - minPrice;

            minPrice = Math.min(minPrice, prices[i]);
            maxProfit = Math.max(maxProfit, profit);
        }

        return maxProfit;
    }
}
