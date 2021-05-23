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

// date format: d/m/yyyy to follow prayerTimes format
function getPrayerInfoByDate(date, prayerTimes) {
    let schedule = [];
    for (let p of prayerTimes) {
        // get date's prayer time and each session as an array
        // { session: 'Subuh', time: '5 34' }
        if (date == p.Date) {
            schedule = Object.entries(p).slice(2).map( ([key, value]) => {
                return {
                'session' : key,
                'time' : value.replace(' ',':')
                }
            })
            return {
                'Date' : p.Date,
                'Day' : p.Day,
                'schedule' : schedule
            }
        }
    }
    // if not found, return empty schedule
    return {
        'Date' : date,
        'Day' : 'Schedule not found for this date',
        'schedule' : schedule
    }
}

// update each mosque with its district and postal information
function getMosquesDistricts (arrMosques, arrDistrictCodes) {
    let transformedMosques = arrMosques.map( (m) => {
        m['postal_code'] = m.address.slice(-6);
        m['sector_code'] = m.address.slice(-6,-4);

        for (let dc of arrDistrictCodes) {
            if (dc.postal_sector.includes(m.sector_code)) {
                m['postal_sector'] = dc.postal_sector;
                m['general_location'] = dc.general_location;
                m['postal_district'] = dc.postal_district;
                break;
            }
        }
        return m;
    })
    return transformedMosques;
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
