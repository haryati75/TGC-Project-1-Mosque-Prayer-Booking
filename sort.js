function swap (arr, x, y) {
    let temp = arr[x];
    arr[x] = arr[y];
    arr[y] = temp;
}

// Compare every 2 adjacent values and 
// swaps them if the first one is bigger than the second one
// repeat the passes, with the biggest value "bubbling" to the top
function sortBubble (arr) {
    let len = arr.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr, j, j + 1);
            }
        }
    }
    return arr;
}