/*
 * For this problem, an important piece of information to notice is that
 * the timestamp passed into the set function is always increasing.
 * Meaning, our data structure will be monotically increasing, based
 * on 'timestamp'. 
 * 
 * IMPORTANT: The problem specifically says "key-value store". This is an
 *            indicator for the type of data structure we should use; map.
 *
 * Using this information, we can use a binary search in the 'get'
 * method to determine which data we should return. We use the timestamps
 * to determine which value we should return. 
 * 
 * Since we always may need to return the previous value, we need to update 
 * our return value every time we move the left pointer. This is because the 
 * left pointer would always be the previous value, in the event that we don't 
 * find our target timestamp.
 *
 * The data structure is going to be a key/value store with the following structure:
 * key: [value, timestamp]
 */
var TimeMap = function() {
    this.map = new Map();
};

/** 
 * @param {string} key 
 * @param {string} value 
 * @param {number} timestamp
 * @return {void}
 */
TimeMap.prototype.set = function(key, value, timestamp) {
    if (!this.map.has(key)) {
        this.map.set(key, []);
    }

    this.map.get(key).push([value, timestamp]);
};

/** 
 * @param {string} key 
 * @param {number} timestamp
 * @return {string}
 */
TimeMap.prototype.get = function(key, timestamp) {
    // we know that every value we iterate over matches our key
    // so anything in 'arr' is going to be a timestamp for the
    // for the correct key
    const arr = this.map.get(key) || [];
    let left = 0;
    let right = arr.length - 1;
    let res = '';

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const [value, currentTime] = arr[mid];

        // we found the target timestamp
        if (currentTime === timestamp) {
            return value;
        }

        if (currentTime <= timestamp) {
            left = mid + 1;
            
            // this was the previous timestamp's value. we update
            // just in case we can't find the target timestamp,
            // since we need to return the previous timestamp's value
            res = value;
        } else {
            // narrow the window, as the right side doesn't contain
            // the target that we are looking for
            right = mid - 1;
        }
        
    }
    
    // if we get here, then we didn't find our target,
    // and we return the previous timestamp's value
    return res;
};

/** 
 * Your TimeMap object will be instantiated and called as such:
 * var obj = new TimeMap()
 * obj.set(key,value,timestamp)
 * var param_2 = obj.get(key,timestamp)
 */