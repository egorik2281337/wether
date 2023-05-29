

const cities = require("./city.list.json");
const fs = require("fs");

let queryStringBegin = `INSERT INTO cities(openweather_id, name, country, lat, lon)
VALUES`;
let queryStringEnd = `;`;

let queryStringMiddle = ``;

for (let i = 0; i < cities.length; i++) {
  let cityName = "";
  if (cities[i].name.indexOf("'") != -1) {
    cityName = replaceSingleQuote(cities[i].name);
  } else {
    cityName = cities[i].name;
  }

  queryStringMiddle += `
  (
  ${cities[i].id},
  '${cityName}',
  '${cities[i].country}',
  ${cities[i].coord.lat},
  ${cities[i].coord.lon}
)`;

  if (i != cities.length - 1) {
    queryStringMiddle += `,`;
  }
}
let queryStringComplete = queryStringBegin + queryStringMiddle + queryStringEnd;
fs.writeFile("insertFromJson.sql", queryStringComplete, err => {
  if (err) {
    throw err;
  }
  console.log("File is created successfully");
});


function replaceSingleQuote(text) {
  text.replace("'", "''");
}
