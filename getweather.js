

const https = require("https");

try {
  var { weatherApiKey } = require("./secrets.json");
} catch (e) {
  console.log(e);
  var weatherApiKey = process.env.weatherApiKey;
}


const rootUrl = "https://api.openweathermap.org/data/2.5/";
const units = "&units=metric";
const searchType = "forecast";



module.exports.getWeather = function getWeather(cityCode, cb) {
  const req = https
    .get(
      `${rootUrl}${searchType}?id=${cityCode.id}${units}${weatherApiKey}`,
      res => {
        if (res.statusCode != 200) {
          cb(new Error(res.statusCode));
        } else {
          console.log("weather API statusCode ", res.statusCode);
          let body = "";
          res
            .on("data", chunk => (body += chunk))
            .on("end", () => {
              try {
                body = JSON.parse(body);
                cb(null, body);
              } catch (e) {
                console.log("response error", e);
              }
            });
        }
      }
    )
    .on("error", err => {
      console.log("ERROR: ", err);
    });
  https.end;
};
