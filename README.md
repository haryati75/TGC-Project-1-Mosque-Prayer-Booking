# Mosque Prayer Booking Web App
Mock up web app for booking a prayer session at mosques in Singapore using *Leaflet* interactive map. The map also shows nearby ***HDB car parks** with **live-updates of available lots*** - specially for congregant drivers who needs to find HDB parking lots around the mosque area since the mosques have very limited/none parking areas.

## Technology use
1. HTML/CSS - Mobile responsive design
2. Javascript
3. LeafletJS map with custom markers (SVG icons)
3. Bootstrap UI
4. JSON data - AXIOS
5. Geo coordinates using Singapore SVY21 format
6. Fontawesome

## Business Use Case
After Singapore’s circuit-breaker in Mar 2020, mosques in Singapore are gradually opening up for Muslims to pray at the mosques.  Since Dec 2020, Muis announced mosques may re-open with limited congregants for the weekly Friday prayers. Now, most mosques offer other daily prayer sessions (Zuhur, Asar, etc).  However, there is no more walk-ins allowed and congregants need to book a prayer slot before visiting the mosques.

Congregants who drive also face difficulty to find available parking lots as most mosques do not provide or have limited parking spaces.  This creates traffic congestion with illegal parkings of nearby roads. This happens usually during the weekly Friday prayers, which is obligatory for Muslim men to attend the sermons and perform their prayers at the mosques at around 1pm to 2pm.

To manage crowd control, the app only allows booking for today only.

#### *Note*: As of this update (May 2021) There is no public API to access the available prayer slots at the mosques.

## Objectives
To create a *mobile-responsive* web app to:
1. Book a prayer slot at a mosque for today
2. Allow users to find a nearby car park to the mosque
3. Show availability of parking lots at the selected car park
4. Search mosques by name, district, postal code or street name 
5. Allow user to locate his/her current location 

# Data Sources
The app requires data extracted from public domains:
* Muis.gov.sg 
    * Mosque Directory (Web HTML to CSV)
    * Prayer Times for year 2021 (PDF to CSV)
    * OurMasjid.sg and OurMuslim.sg - community portals to show presentation of information from Muis
* Data.gov.sg
    * HDB Carpark Information (CSV)
    * HDB Carpark Availability (JSON API)
* OneMap.gov.sg API
    * Getting (x,y) and (lat,lng) coordinates from address/postal codes of mosques 
    * Getting (lat,lng) coordinates from carparks which has (x,y) format in Singapore SVY21 map system
* URA.gov.sg
    * Districts from sector code

To improve efficiency, mosques and carpark geo data were extracted from OneMap separately and reuse as complete JSON files in the app.

# UI Design and Process Flow
Below showcase the UI design prior to app development:

![Prayer Booking Process](images/readme-UI-flow.jpg)


Some features like donation are possible future enhancements.

Sample screenshot from mobile phone to book a prayer based on a carpark which is near a mosque and have available parking lots.

![Book from carpark](images/iphone-screen-carpark.png)

# Website
https://mosque-prayer-booking.netlify.app/

![Mosque Prayer Booking on Multi-devices](images/multi-device-screenshot.png)


