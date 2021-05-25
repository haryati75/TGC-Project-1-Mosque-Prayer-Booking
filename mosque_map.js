async function refreshMosqueCarparkAvailability (mosquesCarparks, URL) {
   // load carpark availability from source
   let response3 = await loadJSON(URL);
   let allCarparksAvailability = response3.items[0].carpark_data;

   // update carpark availability of all the nearby carparks in each mosque
   mosquesCarparksAvailable = await getCarparksAvailability(mosquesCarparks, allCarparksAvailability);
   return mosquesCarparksAvailable;
}

