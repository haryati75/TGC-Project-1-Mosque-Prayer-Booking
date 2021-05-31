function swap (arr, x, y) {
    let temp = arr[x];
    arr[x] = arr[y];
    arr[y] = temp;
}

// Bubble Sort Algorithm
// Compare every 2 adjacent values and 
// swaps them if the first one is bigger than the second one
// repeat the passes, with the biggest value "bubbling" to the top
function sortLatLngBubble (arrLatLngs) {
    let len = arrLatLngs.length;

    // Do we sort by latitude or longitude?
    let arrLat = arrLatLngs.map(a => a.lat);
    let minLat = Math.min(...arrLat);
    let maxLat = Math.max(...arrLat);

    // if Lat hits > 2, sort by lng? This seems to work for Singapore map, most of the time
    if (((maxLat - minLat)/minLat * 100) > 2) {
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < len - 1 - i; j++) {
                if (arrLatLngs[j].lng > arrLatLngs[j + 1].lng) { // compare longitude in [lat,lng]
                    swap(arrLatLngs, j, j + 1);
                }
            }
        }
    } else {
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < len - 1 - i; j++) {
                if (arrLatLngs[j].lat > arrLatLngs[j + 1].lat) { // compare longitude in [lat,lng]
                    swap(arrLatLngs, j, j + 1);
                }
            }
        }
    }

    return arrLatLngs;
}