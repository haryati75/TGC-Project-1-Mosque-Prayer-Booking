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
   // load mosque data
   let response1 = await axios.get('data/mosque.json');
   let mosques = response1.data.mosques;
   // console.log(mosques);

   // mark each mosque to the map
   for (let mosque of mosques) {
      let mosqueLatLng = L.latLng([mosque.location.latitude, mosque.location.longitude]);
      let mosqueMarker = L.marker(mosqueLatLng);
      mosqueMarker.addTo(markerCluster);

      // mosque popup
      mosqueMarker.bindPopup(`
      <h2>${mosque.name}</h2>
      <p>${mosque.address}</p>
      <button>Book</button>
      `);

      // mosque cirle radius of 1km 
      L.circle(mosqueLatLng, {
         color: 'green',
         fillColor: 'yellow',
         fillOpacity: 0.5,
         radius: 1000
      }).addTo(map);

   }

   // load carpark information and convert its coordinate from X,Y (Singapore SVY21 format) to latlng format
   let response2 = await axios.get('https://data.gov.sg/api/action/datastore_search?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c&limit=100');
   let carparksInfo = response2.data.result.records;
   // console.log(carparksInfo);

   for (let carpark of carparksInfo) {
      // console.log([carpark.car_park_no, carpark.x_coord, carpark.y_coord]);
      // carpark.x_coord, carpark.y_coord
      // car_park_no
      // address
      // car_park_type

      let carparkGeo = await axios.get(`https://developers.onemap.sg/commonapi/convert/3414to4326?X=${carpark.x_coord}&Y=${carpark.y_coord}`)
      console.log(carparkGeo.data);
      let carparkMarker = L.marker([carparkGeo.data.latitude, carparkGeo.data.longitude]);
      carparkMarker.addTo(markerCluster);
      carparkMarker.bindPopup(`
      <h2>${carpark.car_park_no}</h2>
      <p>${carpark.address}</p>
      <p>${carpark.car_park_type}</p>
      `);
   }
})
