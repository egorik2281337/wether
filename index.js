const express = require("express");
const app = express();
const getWeather = require("./utils/getweather");
const logCities = require("./utils/logcities");
const searchCity = require("./utils/searchCity");
const db = require("./utils/db");
const port = 8080;

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

let mainResult = {
  wResult: {}
};



app.get("/city", (req, res) => {
  console.log("/city request came in", req.query);
  let searchField = req.query.q;

 

  let citiesResult = logCities.logCities(searchField);
  res.send(citiesResult);
});



app.get("/initial-weather", (req, res) => {
  console.log("/initial-weather request came in", req.query);
  
  let cLat = parseFloat(req.query.q.latitude);
  let cLon = parseFloat(req.query.q.longitude);
  getWeather.getWeather(logCities.getInitCity(cLat, cLon), (err, rslt) => {
    if (err) {
      console.log("weather error");
    } else {
      
      res.json(rslt);
    }
  });
});

app.get("/weather", (req, res) => {
  console.log("/weather request came in", req.query);
  let cityName = req.query.q.slice(0, req.query.q.indexOf(","));
  let countryName = req.query.q.slice(req.query.q.indexOf(", ") + 1);
  console.log("city name", cityName);
  console.log("country name", countryName.trim());

  getWeather.getWeather(
    
    logCities.getCityId(cityName.trim(), countryName.trim()),
    (err, rslt) => {
      if (err) {
        console.log("weather error", err);
      } else {
       
        mainResult = rslt;
        res.json(mainResult);
      }
    }
  );
});

app.listen(process.env.PORT || port, () => console.log("server is listening"));
