

const cities = require("./city.list.json");
const db = require("./db");


module.exports.logCities = function logCities(searchFieldVal) {
  let result = cities.filter(city =>
    city.name.toLowerCase().startsWith(searchFieldVal.toLowerCase())
  );
  return result;
};



module.exports.getInitCity = function getInitCity(lat, lon) {
  let closest = [];
  let lastDistance = distance(
    lat,
    cities[0].coord.lat,
    lon,
    cities[0].coord.lon
  );
  for (let i = 0; i < cities.length; i++) {
    let currentDistance = distance(
      lat,
      cities[i].coord.lat,
      lon,
      cities[i].coord.lon
    );
    if (currentDistance < lastDistance) {
      closest[0] = cities[i];
      lastDistance = currentDistance;
    }
  }
  console.log("closest lat", closest);
  return closest[0];
};



function distance(lat1, lat2, lon1, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon1 - lon2) * Math.PI) / 180;
  const a =
    0.5 -
    Math.cos(dLat) / 2 +
    (Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (1 - Math.cos(dLon))) /
      2;
  let result = R * 2 * Math.asin(Math.sqrt(a));
  return result;
}



module.exports.getCityId = function getCityId(cityName, countryName) {
  console.log(
    "cityName and countryName in getCityId function",
    cityName,
    countryName
  );
  let result = cities.filter(
    city =>
      city.name.toLowerCase() == cityName.toLowerCase() &&
      city.country == countryName
  );
  return result[0];
};
