var maximumSum = function(nums) {
    let mp = new Array(82).fill(-1);
    let ans = -1;

    for (let num of nums) {
        let sumDigits = [...String(num)].reduce((sum, d) => sum + Number(d), 0);

        if (mp[sumDigits] !== -1)
            ans = Math.max(ans, num + mp[sumDigits]);

        mp[sumDigits] = Math.max(mp[sumDigits], num);
    }

    return ans;
};