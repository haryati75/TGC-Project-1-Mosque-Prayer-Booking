let singapore = [1.29, 103.85]; // Singapore latlng
let map = L.map('map').setView(singapore, 13); // set the center point

// setup the tile layers
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
   attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
   maxZoom: 18,
   id: 'mapbox/streets-v11',
   tileSize: 512,
   zoomOffset: -1,
   accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw' //demo access token
}).addTo(map);

// create the cluster group
let markerCluster = L.markerClusterGroup();
markerCluster.addTo(map);

// show my current location
map.locate({setView: true, maxZoom: 13});

function onLocationFound(e) {
   // let radius = e.accuracy;
   let radius = 2000; // within 2km 
   
   L.marker(e.latlng).addTo(map)
      .bindPopup("You are within " + (radius/1000) + " km from this point").openPopup();
   L.circle(e.latlng, radius).addTo(map);
}

map.on('locationfound', onLocationFound);

// show error message if current location is not found
function onLocationError(e) {
   alert(e.message);
}

map.on('locationerror', onLocationError);

// wait for the DOM to be ready before loading
window.addEventListener('DOMContentLoaded', async function () {

   // *********************************
   // LOAD Data
   // *********************************
   // load carpark information with geo location - data.gov.sg (HDB)
   let response1 = await loadJSON('data/carpark-info.json');
   let carparks = response1.carparks;
   
   // load mosque info with geo location
   // address and postal from muis.gov.sg
   let response2 = await loadJSON('data/mosques.json');
   let mosques = response2.mosques;

   // ------------------------------------------------------------
   // Setup Mosque Districts in NavBar (DOM Dropdown List rendering)
   // ------------------------------------------------------------
   // load sector locations to map with mosques and carpark postal code
   let rawDistrictCodes = await loadCSV('data/sector-area.csv');
   let transformedMosques = getMosquesDistricts(mosques, rawDistrictCodes);

   let dropdownDistricts = document.getElementById('districts');
   for (let dc of rawDistrictCodes) {
      let aElement = document.createElement('a');
      aElement.className = "dropdown-item district";
      aElement.href = "#"
      aElement.innerText = dc.general_location;
      dropdownDistricts.appendChild(aElement);
  }

   // ------------------------------------------------------------
   // Setup Main Objects: Mosques with nearby carparks assigned
   // ------------------------------------------------------------
   // get carparks within radius of mosques
   let radiusKM = 0.5;
   let mosquesCarparks = await getNearbyCarparks(transformedMosques, carparks, radiusKM);
   // console.log(mosques_carparks);

   // load carpark availability from data.gov.sg API JSON - HDB only
   let response3 = await loadJSON('https://api.data.gov.sg/v1/transport/carpark-availability');
   let allCarparksAvailability = response3.items[0].carpark_data;

   // update carpark availability of all the nearby carparks in each mosque
   let mosquesCarparksAvailable = await getCarparksAvailability(mosquesCarparks, allCarparksAvailability);
   console.log(mosquesCarparksAvailable);

   // ------------------------------------------------------------
   // Setup Footer section for Prayer Times (DOM element rendering)
   // ------------------------------------------------------------
   // load prayer times for 2021 from muis.gov.sg
   let prayerTimes = await loadCSV('data/prayer-times-2021.csv');
   // today's date in same format as prayer times (d/m/yyyy)
   let today = new Date().toJSON().slice(0,10);
   let [yyyy, mm, dd] = today.split('-').map(d => parseInt(d));
   today = dd+'/'+mm+'/'+yyyy
   let datePrayerInfo = getPrayerInfoByDate(today, prayerTimes);

   // fill up prayer times at footer
   let footerPrayerDate = document.getElementById('prayer-date');
   footerPrayerDate.innerHTML = datePrayerInfo.Date + ' (' + datePrayerInfo.Day +')';
   // render the list here
   let prayerTimesDiv = document.querySelector('#prayer-times');
   for (let s of datePrayerInfo.schedule) {
      let divElement = document.createElement('div');
      divElement.className = "col col-lg-4 col-6 prayer-time"

      let pElement = document.createElement('p');
      pElement.innerHTML = s.session + ' | ' + s.time;

      divElement.appendChild(pElement);
      prayerTimesDiv.appendChild(divElement);
   }

   // *********************************
   // PLOT MAP MARKERS
   // *********************************

   // mark each mosque to the map
   for (let m of mosquesCarparksAvailable) {
      let mosqueLatLng = L.latLng([m.location.latitude, m.location.longitude]);
      let mosqueMarker = L.marker(mosqueLatLng);
      mosqueMarker.addTo(markerCluster);

      // mosque popup
      mosqueMarker.bindPopup(`
      <i class="fas fa-mosque"></i>
      <h1>Masjid ${m.mosque}</h1>
      <p>${m.address}</p>
      <p>${m.telephone}</p>
      <button>Book</button>
      `);

      if (m.carparks_nearby.length > 0) {
         // mosque cirle radius 
         L.circle(mosqueLatLng, {
            color: 'green',
            fillColor: 'yellow',
            fillOpacity: radiusKM,
            radius: 1000
         }).addTo(map);
      }
   }

   // mark the carparks near each mosque
   for (let m of mosquesCarparksAvailable) {
      for (let c of m.carparks_nearby) {
         // lots available and percentage
         let percentAvailable = parseInt(c.lots_info.lots_available) / parseInt(c.lots_info.total_lots) * 100;

         let cMarker = L.marker([c.location.latitude, c.location.longitude]);
         cMarker.addTo(markerCluster);
         cMarker.bindPopup(`
            <i class="fas fa-parking"></i>
            <h2>Carpark near Masjid ${m.mosque} - ${c.carpark_no}</h2>
            <p>${c.address}</p>
            <p>${c.carpark_type}</p>
            <p>Available: ${c.lots_info.lots_available} / ${c.lots_info.total_lots} (${percentAvailable.toFixed(2)}%)</p>
         `);
      }
   }

})



