async function loadCSV(url) {
    // read in the raw CSV file
    let response = await axios.get(url);

    // convert to json
    let json = await csv().fromString(response.data);

   return json;
}

async function loadJSON(url) {
    // read in the raw CSV file
    let response = await axios.get(url);

    // return as an Array of JSON objects
    return response.data;
}

function getNearbyCarparks(arrMosques, arrCarparks, radiusKM) {
    for (let m of arrMosques) {
        for (let c of arrCarparks) {

          // calculate distance in KM
          let distanceKM = distance(m.location.latitude, m.location.longitude, c.location.latitude, c.location.longitude, 'K');
          
          if (distanceKM <= radiusKM) {
            m.carparks_nearby.push(c);
          }
        }
      }
    return arrMosques;
}

function getCarparksAvailability(arrMosquesCarparks, arrAvailability) {
    for (let m of arrMosquesCarparks) {
        let newCarparksNearby = []
        for (let mc of m.carparks_nearby) {
           let lotsInfo = arrAvailability.find(c => c.carpark_number === mc.carpark_no)
           
           // if carpark found, save its lots information
           if (lotsInfo != undefined) {
              mc['lots_info'] = lotsInfo.carpark_info[0];
              newCarparksNearby.push(mc);
           } 
        }
        m.carparks_nearby = newCarparksNearby;
    }
    return arrMosquesCarparks;
}
