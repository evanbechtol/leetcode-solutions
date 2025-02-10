
// My solution
var clearDigits = function (s) {
    const split = s.split('');

    for (let i = 1; i < split.length; i++) {
        const isDigit = /\d/;
        if (isDigit.test(split[i])) { 
            split.splice(i - 1, 2);
            i = 0;
        }
    }
    
    return split.join('');
};

// Stack solution
var clearDigits = function(s) {
    let stack = [];
    for (let c of s) {
        if (!isNaN(c)) {
            if (stack.length) stack.pop();
        } else {
            stack.push(c);
        }
    }
    return stack.join("");
};