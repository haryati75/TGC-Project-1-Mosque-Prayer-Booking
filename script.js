// create the map object on Singapore
let singapore = [1.29, 103.85]; // Singapore latlng
let map = L.map('singapore-map')
map.setView(singapore, 13); // set the center point

// create global array that captures mosques 
// with its nearby carparks and carparks' availability 
let mosquesCarparks = [];  
let mosquesCarparksAvailable = [];
let radiusKM = 0.5;

// setup the tile layer
L.tileLayer(
   'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', 
   {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw' //demo access token
   }
).addTo(map);

// create the cluster group
let markerCluster = L.markerClusterGroup();
markerCluster.addTo(map);

// create separate group for mosques and carparks
let groupMosques = L.layerGroup();
let groupCarparks = L.layerGroup();
groupMosques.addTo(map);
groupCarparks.addTo(map);

// create separate layers for search results, mosque-radius, my-location
let layerSearchArea = L.layerGroup();
let layerLocateMe = L.layerGroup();
let layerMosqueRadius = L.layerGroup();
layerSearchArea.addTo(map);
layerLocateMe.addTo(map);
layerMosqueRadius.addTo(map);

// -----------------------------------
// create custom marker icons for map
// -----------------------------------
let mosqueIcon = L.icon({
   iconUrl: 'images/locate-mosque.png',
   iconSize: [50,50], // size of icon
   iconAnchor: [24, 48], // point of the icon which will correspond to marker's location
   popupAnchor: [-1, -40]
})

let carparkIcon = L.icon({
   iconUrl: 'images/parking.svg',
   iconSize: [40,40], // size of icon
   iconAnchor: [20,40], // point of the icon which will correspond to marker's location
   popupAnchor: [-1, -38]
})

// custom marker to locate current location (SVG vector file: can change colours)
let meIcon = L.icon({
   iconUrl: 'images/locate-me.svg',
   iconSize: [45,45], // size of icon
   iconAnchor: [41,45], // point of the icon which will correspond to marker's location
   popupAnchor: [-20, -42] // point from which the popup should open relative to the iconAnchor
})

// locate and plot current location
showCurrentLocation();

// ----------------------
// custom marker for MUIS
// ----------------------
let muisIcon = L.icon({
   iconUrl: 'images/muis-map.png',
   iconSize: [70,70], // size of icon
   iconAnchor: [40, 70], // point of the icon which will correspond to marker's location
   popupAnchor: [-3, -68]
})

// plot MUIS marker on map
let muis = [1.3428713, 103.8523594] 
let markerMuis = L.marker(muis, {icon: muisIcon});
markerMuis.addTo(map);
markerMuis.bindPopup(`
   <div class="marker-popup">
      <div class="d-flex flex-row align-items-center">
         <div><img src="images/muis-logo-small.png" alt="Muis Logo"/></div>
         <div class="mx-auto align-self-center"><h1><a href="https://www.muis.gov.sg">Majlis Ugama Islam Singapura</a></h1></div>
      </div>
      <p><i class="fas fas-popup fa-map-marked-alt"></i>273 Braddell Road,
      Singapore 579702</p>
      <p><i class="fas fas-popup fa-phone-alt"></i>(+65) 6359 1199</p>
      <p><i class="fas fas-popup fa-envelope-open-text"></i>info@muis.gov.sg</p>
      <hr class="my-2">
      <div class="d-flex flex-row align-items-center">
         <img src="images/muis-building-small.jpg" alt="Muis Building"/>
         <div class="col mx-1 text-align-right">
            <p><em>OURMASJID</em> is a community crowdfunding initiative supported by Muis to rally the community to provide funding support for mosque operations and staff.</p>
            <p class="align-self-center"><a href="https://ourmasjid.sg"><img src="images/logo-full-horizontal-small.png" alt="OurMasjid.sg Logo"/></a></p>
         </div>
      </div>
   </div>
`);

// adding Leaflet control for layers in Map
let baseLayers = null; 

let overlays = {
   'Mosques & Carparks' : markerCluster,
   'Around Mosques' : layerMosqueRadius,
   'Search Result' : layerSearchArea
}

L.control.layers(baseLayers, overlays).addTo(map);

// add watermark: OurMasjid logo on the map
L.Control.Watermark = L.Control.extend({
   onAdd: function(map) {
      let img = L.DomUtil.create('img');
      img.src = 'images/logo-full.png';
      img.style.width = '2.5rem';
      return img;
   },
   onRemove: function(map) {
      // Do nothing
   }
});

L.control.watermark = function(opts) {
   return new L.Control.Watermark(opts);
}

// position of the watermark on the map
L.control.watermark({ position: 'bottomright' }).addTo(map);

// ------------------------------------------------------------
// Functions: Toggling Layers and Groups, Finding locations
// ------------------------------------------------------------
function getLocation(strSearch, allMosques) {
   let s = strSearch.trim().toLowerCase();
   let result = [];
   for (let m of allMosques) {

      // readme.md on the search criteria method
      if (m.postal_code === s || m.sector_code === s || m.general_location.toLowerCase() === s || m.mosque.toLowerCase().includes(s) || m.address.toLowerCase().includes(s) || m.general_location.toLowerCase().includes(s)) {
         result.push(L.latLng([m.location.latitude, m.location.longitude]));
         continue;
      } else if (m.carparks_nearby.length > 0) {

         // find at least 1 carpark's address that match
         for (let c of m.carparks_nearby) {
            if (c.address.toLowerCase().includes(s)) {
               result.push(L.latLng([m.location.latitude, m.location.longitude]));
               break; // break from carpark loop and move to next mosque, if any
            }
         }
      } 
   }

   // minimise criss-cross polygon
   if (result.length > 2) {
      sortLatLngBubble(result);
   }
   
   return result;
}

// draw a circle around mosque marker if only one mosque found
function plotSearchMosque (latLng, radius) {
   // clear the search layer and remove from map
   layerSearchArea.clearLayers();
   map.removeLayer(layerSearchArea);

   L.circle(latLng, {
      color: 'red',
      fillColor: 'pink',
      fillOpacity: 0.3,
      radius: radius
   }).addTo(layerSearchArea);

   map.addLayer(layerSearchArea);
   map.setView(latLng, 16);
}

// draw a polyline or polygon if more than one mosque found
function plotSearchMosquesPolygon (latLngs) {
   // clear the search layer and remove from map
   layerSearchArea.clearLayers();
   map.removeLayer(layerSearchArea);

   // draw a polyline if 2 latLngs only
   if (latLngs.length == 2) {
      let polyline = L.polyline(latLngs, { color: 'red' }).addTo(layerSearchArea);

      map.fitBounds(polyline.getBounds());

   } else {

      // else, draw a polygon
      let polygon = L.polygon(latLngs, {
         color: 'red',
         fillColor: 'pink',
         fillOpacity: 0.3,
      }).addTo(layerSearchArea);

      map.fitBounds(polygon.getBounds());
   }

   map.addLayer(layerSearchArea);
}

// show my current location
function showCurrentLocation() {
   map.locate({setView: true, maxZoom: 13});
   map.on('locationfound', onLocationFound);
   map.on('locationerror', onLocationError);
}

function onLocationFound(e) {
   // clear previous locate me marker-layer
   layerLocateMe.clearLayers();
   map.removeLayer(layerLocateMe);

   let radius = e.accuracy;
   let me = L.marker(e.latlng, {icon: meIcon});
   me.addTo(layerLocateMe);
   me.bindPopup(`<i class="fas fas-popup fa-street-view"></i>You are within ${(radius/1000)} km from this point`).openPopup();
   L.circle(e.latlng, radius).addTo(layerLocateMe);
   layerLocateMe.addTo(map)
}

// show error message if current location is not found
function onLocationError(e) {
   // clear previous locate me marker-layer
   if (map.hasLayer(layerLocateMe)) {
      layerLocateMe.clearLayers();
      map.removeLayer(layerLocateMe);
   }
   alert(e.message, "** Current Location not detected.");
}

// ------------------------------------------------------------
// Functions: Plotting of markers using Leaflet JS 
// ------------------------------------------------------------
// plot mosque markers to map
function plotMosqueMarkers() {
   for (let m of mosquesCarparksAvailable) {
      let mosqueLatLng = L.latLng([m.location.latitude, m.location.longitude]);
      let mosqueMarker = L.marker(mosqueLatLng, {icon: mosqueIcon});
      mosqueMarker.addTo(groupMosques);
      mosqueMarker.addTo(markerCluster);
         
      // mosque popup
      mosqueMarker.bindPopup(`
      <div class="marker-popup">
         <div class="d-flex flex-row align-items-end mx-auto">
            <i class="fas fa-mosque"></i>
            <h1>Masjid ${m.mosque}</h1>
         </div>

         <p><i class="fas fas-popup fa-map-marked-alt"></i>${m.address}</p>
         <p><i class="fas fas-popup fa-phone-alt"></i>${m.telephone}</p>
         <p><i class="fas fas-popup fa-draw-polygon"></i>District: ${m.general_location}</p>
         <hr class="my-2">

         <input type="email" class="form-control" id="exampleDropdownFormEmail1" placeholder="me@mail.com">
         <small style="padding-bottom: 10px" class="form-text text-muted">We'll never share your email with anyone else.</small>
         <div class="btn-group mt-10">
            <button type="button" class="btn btn-outline-success btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
               Book a Prayer Today
            </button>
            <div class="dropdown-menu">
               <a class="dropdown-item dd-prayer" href="#">Zuhur</a>
               <a class="dropdown-item dd-prayer" href="#">Asar</a>
               <a class="dropdown-item dd-prayer" href="#">Maghrib</a>
               <a class="dropdown-item dd-prayer" href="#">Isyak</a>
               <div class="dropdown-divider"></div>
               <a class="dropdown-item dd-prayer" href="#">Friday</a>
            </div>
         </div>
      </div>
      `);
   }
}

// plot carpark markers to map
function plotCarparks() {
   for (let m of mosquesCarparksAvailable) {
      for (let c of m.carparks_nearby) {
         // lots available and percentage
         let percentAvailable = parseInt(c.lots_info.lots_available) / parseInt(c.lots_info.total_lots) * 100;
   
         let cMarker = L.marker([c.location.latitude, c.location.longitude], {icon: carparkIcon});
         cMarker.addTo(groupCarparks);
         cMarker.addTo(markerCluster);
         cMarker.bindPopup(`
         <div class="marker-popup">
            <div class="d-flex flex-row align-items-end mx-auto">
               <i class="fas fa-parking"></i>
               <h1>Carpark near Masjid ${m.mosque}</h1>
            </div>

            <p><i class="far fas-popup fa-map"></i> ${c.address} - ${c.carpark_no}</p>
            <p><i class="fas fas-popup fa-info-circle"></i>${c.carpark_type}</p>
            <p><i class="fas fas-popup fa-car-side"></i>Available Lots: ${c.lots_info.lots_available} / ${c.lots_info.total_lots} (${percentAvailable.toFixed(2)}%)</p>
            <p><i class="fas fas-popup fa-history"></i>Last updated: ${c.lots_updated_on}</p>
            <hr class="my-2">
            <input type="email" class="form-control" id="exampleDropdownFormEmail2" placeholder="me@mail.com">
            <small style="padding-bottom: 10px" class="form-text text-muted">We'll never share your email with anyone else.</small>
            <div class="btn-group mt-10">
               <button type="button" class="btn btn-outline-success btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Book a Prayer Today
               </button>
               <div class="dropdown-menu">
                  <a class="dropdown-item dd-prayer" href="#">Zuhur</a>
                  <a class="dropdown-item dd-prayer" href="#">Asar</a>
                  <a class="dropdown-item dd-prayer" href="#">Maghrib</a>
                  <a class="dropdown-item dd-prayer" href="#">Isyak</a>
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item dd-prayer" href="#">Friday</a>
               </div>
            </div>
         </div>
         `);
      }
   }
}

function plotMosqueRadius() {
   for (let m of mosquesCarparksAvailable) {
      let mosqueLatLng = L.latLng([m.location.latitude, m.location.longitude]);
      if (m.carparks_nearby.length > 0) {
         // mosque cirle radius 
         mosqueRadius = L.circle(mosqueLatLng, {
            color: 'green',
            fillColor: 'yellow',
            fillOpacity: 0.5,
            radius: radiusKM * 1000
         })
         mosqueRadius.addTo(layerMosqueRadius);
      }
   }
}

// ------------------------------------------------------------
// Footer section for Prayer Times (DOM element rendering)
// ------------------------------------------------------------
// display prayer times at footer
function displayPrayerTimes(prayerTimes) {
   // get today's date in same format as prayer times (d/m/yyyy)
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
      divElement.className = "col-6 col-md-4 col-lg-2 prayer-time"

      let pElement = document.createElement('p');
      pElement.innerHTML = s.session + ' | ' + s.time;

      divElement.appendChild(pElement);
      prayerTimesDiv.appendChild(divElement);
   }
}

// ------------------------------------------------------------
// Navbar section for District listing (DOM element rendering)
// ------------------------------------------------------------
function loadDistrictDropdown(arrObjDistricts) {
   // sort the District codes to prepare for Dropdown list
   let arrDistricts = arrObjDistricts.map( d => {
      return d.general_location;
   })
   let sortedDistricts = arrDistricts.sort();

   let dropdownDistricts = document.getElementById('districts');
   // for (let dc of rawDistrictCodes) {
   for (let dc of sortedDistricts) {
      let aElement = document.createElement('a');
      aElement.className = "dropdown-item district";
      aElement.href = "#"
      aElement.innerText = dc;
      dropdownDistricts.appendChild(aElement);
   }
}

// *****************************************
// DECLARATIVE SECTION HERE
// *****************************************
// wait for the DOM to be ready before loading
window.addEventListener('DOMContentLoaded', async function () {
   // *********************************
   // LOAD Data
   // *********************************
   // load prayer times for 2021 from muis.gov.sg
   let prayerTimes = await loadCSV('data/prayer-times-2021.csv');
   displayPrayerTimes(prayerTimes);

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
   loadDistrictDropdown(rawDistrictCodes);

   // ------------------------------------------------------------
   // Setup Main Objects: Mosques with nearby carparks assigned
   // ------------------------------------------------------------
   // get carparks within radius of mosques
   mosquesCarparks = await getNearbyCarparks(transformedMosques, carparks, radiusKM);

   // update with carpark lots availability for each carpark
   mosquesCarparksAvailable = await refreshMosqueCarparkAvailability(mosquesCarparks, 'https://api.data.gov.sg/v1/transport/carpark-availability')
   // console.log(mosquesCarparksAvailable);

   // *********************************
   // PLOT MAP MARKERS
   // *********************************
   // mark each mosque to the map with the radius 
   plotMosqueMarkers();
   plotMosqueRadius();

   // mark the carparks near each mosque
   plotCarparks();

   // hide the Mosque and Carpark markers as these markers are shown by Cluster Marker layer
   map.removeLayer(groupMosques);
   map.removeLayer(groupCarparks);

   let today = new Date().toJSON();
   document.querySelector('#carpark-refresh').innerHTML = `<i class="fas fa-history"></i> Last refreshed on ${today}`;

   // create listeners for rendered dropdown inside DOMContentLoaded
   for (let district of document.querySelectorAll(".district")) {
      district.addEventListener('click', function(e){
         let val = e.target.innerText;
         let radius = 600;

         if (val.length > 0) {
            let result = getLocation(val, mosquesCarparksAvailable);
            if (result.length > 1) {
               plotSearchMosquesPolygon(result, radius);
            } else if (result.length == 1) {
               plotSearchMosque(result[0], radius);
            } else {
               alert("No mosque found in the location: ", val);
            }
         }
      })
   }

   // for (let marker of document.querySelectorAll(".dd-prayer")) {
   //    marker.addEventListener('click', function(e) {
   //       alert("click marker: " + e.target.innerText)
   //    })
   // }
})

// *********************************************
// REFRESH carpark availability every 3 minutes
// *********************************************
setInterval(async function() {
   
   // carpark availability
   mosquesCarparksAvailable = await refreshMosqueCarparkAvailability(mosquesCarparks, 'https://api.data.gov.sg/v1/transport/carpark-availability')
   
   markerCluster.clearLayers(); // clear all the markers
   groupMosques.clearLayers();
   groupCarparks.clearLayers();

   // replot all the markers
   plotMosqueMarkers();
   plotCarparks();

   // map.removeLayer(groupMosques);
   // map.removeLayer(groupCarparks);
   // map.addLayer(markerCluster);

   let today = new Date().toJSON();
   document.querySelector('#carpark-refresh').innerHTML = today;


}, 180000) // 1s = 1000

// *********************************
// TOGGLE clicks on navbar icons
// *********************************
document.querySelector('#toggle-mosques-fas').addEventListener('click', function(e) {
   if (map.hasLayer(groupMosques)) {
      map.removeLayer(groupMosques);
      this.style.color = "#bdd2b6";
   } else {
      map.addLayer(groupMosques);
      this.style.color = "#678B12";
   }
})

document.querySelector('#toggle-carparks-fas').addEventListener('click', function() {
   if (map.hasLayer(groupCarparks)) {
      map.removeLayer(groupCarparks);
      this.style.color = "#bdd2b6";
   } else {
      map.addLayer(groupCarparks);
      this.style.color = "#678B12";
   }
})

// Locate me is not toggle but to serve as getting current location
// Layer is always turn-on. similar to Muis
document.querySelector('#locate-me-fas').addEventListener('click', function() {

   showCurrentLocation();

})

// *********************************
// SEARCH FUNCTION EVENTS
// *********************************
document.querySelector('#btn-search').addEventListener('click', function () {
   let val = document.getElementById('input-search').value;
   let radius = 600;

   if (val.length > 0) {
      let result = getLocation(val, mosquesCarparksAvailable);
      if (result.length > 1) {
         plotSearchMosquesPolygon(result);
      } else if (result.length == 1) {
         plotSearchMosque(result[0], radius);
      } else {
         alert("No mosque found in the location: ", val);
      }
   }
})

// let selectedPrayer = document.querySelectorAll(".dd-prayer")
// for (let p of selectedPrayer) {
//    p.addEventListener('click', function(e) {
//       alert('click me W');
//    })
// }
