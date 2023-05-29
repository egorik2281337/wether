(function() {
  

  var map;
  var view;
  var input = $("#city-input");
  var buttonSearch = $("#btn-search");
  var weatherResultsDiv = $("#weather-results-container");
  var weatherBoxes;

  var mRslt = {};
  var searchResultsDiv = $("#results");

  var latCord = null;
  var lonCord = null;

  var infoOverlay = $("#info-overlay");
  var infoButton = $("#info-button-container");
  var closeButton = $(".btn-close");
  var infoBox = $("#info-box");

  $(document).ready(function() {
    searchResultsDiv.hide();
    useNavigator();
   
  });

  infoOverlay.addClass("onscreen");

  infoButton.on("click", function() {
    infoOverlay.addClass("onscreen");
  });

  closeButton.on("click", function() {
    infoOverlay.removeClass("onscreen");
  });

  infoOverlay.on("click", function(event) {
    infoOverlay.removeClass("onscreen");
  });

  infoBox.on("click", function(e) {
    e.stopPropagation();
    return;
  });

  buttonSearch.on("mousedown", function() {
    callClick();
  });

  function useNavigator() {
    var currentPos = navigator.geolocation.getCurrentPosition(
      function(pos) {
        latCord = pos.coords.latitude;
        lonCord = pos.coords.longitude;
        console.log("current position", pos);
        view = new ol.View({
          center: ol.proj.fromLonLat([lonCord, latCord]),
          zoom: 12
        });
        
        initMap();
        initWeather(latCord, lonCord);
      },
      function(err) {
        console.log("uups, something went wrong", err);
        
        view = new ol.View({
          center: ol.proj.fromLonLat([13.41053, 52.524368]),
          zoom: 12
        });
        initMap();
        initWeather(52.524368, 13.41053);

        
      },
      {
        enableHighAccuracy: true
      }
    );
  }

  

  function initWeather(lat, lon) {
    $.ajax({
      url: "/initial-weather",
      method: "GET",
      data: {
        q: {
          latitude: lat,
          longitude: lon
        }
      },
      success: function(initWeatherData) {
        console.log("initWeatherData", initWeatherData);
        renderWeather(initWeatherData);
      },
      error: function() {
        console.log("Something went wront in initWeather");
      }
    });
  }

  

  input.on("input focus", function() {
    gettingResults(250);
  });
  input.on("keydown", function(event) {
    var index = (this.index = $(".selected").index());
    var rslts = $(".result");
    var selected = (this.selected = $(".selected"));
    console.log("index", index, event.which);

    if (event.which == 40 || event.which == 38) {
      event.preventDefault();
    }
    if (event.which == 40) {
      if (index < 0) {
        rslts.eq(0).addClass("selected");
      } else if (index < rslts.length - 1) {
        rslts.eq(index).removeClass("selected");
        rslts
          .eq(index)
          .next()
          .addClass("selected");
      }
    }
    if (event.which == 38) {
      https: if (index > 0) {
        rslts.eq(index).removeClass("selected");
        rslts
          .eq(index)
          .prev()
          .addClass("selected");
      } else if (index == -1) {
        $(".result")
          .eq(rslts.length - 1)
          .addClass("selected");
      }
    }

    if (event.which == 13) {
      if (searchResultsDiv.css("display") == "none") {
        if (input.val() != 0) {
          callClick();
        }
      } else {
        input.val($(".selected").text());
        searchResultsDiv.hide();
      }
    }
    checkIfOnScreen($(".selected"));
  });

  checkIfOnScreen(this.selected);

  
  function callClick() {
    $.ajax({
      url: "/weather",
      method: "GET",
      data: {
        q: input.val()
      },
      success: function(weatherResult) {
        var mRslt = weatherResult;
        console.log("weather query result", mRslt);

        var wLst = mRslt.list;
        var cDet = mRslt.city;

        console.log(wLst);

        renderWeather(weatherResult);
        flyToLocation(cDet.coord.lon, cDet.coord.lat, function() {});
      }
    });
  }

  
  function checkIfOnScreen(elem) {
    if (
      elem.offset().top + elem.height() >
      searchResultsDiv.height() + searchResultsDiv.offset().top
    ) {
      searchResultsDiv.scrollTop(
        searchResultsDiv.scrollTop() + elem.outerHeight()
      );
    }
    if (searchResultsDiv.offset().top > elem.offset().top) {
      searchResultsDiv.scrollTop(
        searchResultsDiv.scrollTop() - elem.outerHeight()
      );
    }
  }

  
  function flyToLocation(lon, lat, done) {
    console.log("flyToLocation fires", lat, lon);
    var duration = 2000;
    var zoom = view.getZoom();
    var parts = 2;
    var called = false;
    function callback(complete) {
      --parts;
      
      if (called) {
        return;
      }
      if (parts === 0 || !complete) {
        called = true;
        done(complete);
      }
    }
    view.animate(
      {
        center: ol.proj.fromLonLat([lon, lat]),
        duration: duration
      },
      callback
    );
    view.animate(
      {
        zoom: zoom - 1,
        duration: duration / 2
      },
      {
        zoom: zoom,
        duration: duration / 2
      },
      callback
    );
  }

  
  function initMap() {
    console.log("initMap");

    map = new ol.Map({
      target: "map",
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: view
    });
  }

  
  var timeOutId;
  function gettingResults(delay) {
    if (timeOutId) {
      clearTimeout(timeOutId);
      timeOutId = null;
    }
    timeOutId = setTimeout(function() {
      console.log("gettingResults fires");
      if (input.val().length == 0) {
        searchResultsDiv.hide();
        return;
      } else {
        if (input.val().indexOf(",") != -1) {
          input.val(input.val().slice(0, input.val().indexOf(",")));
        }
        $.ajax({
          url: "/city",
          method: "GET",
          data: {
            q: input.val()
          },
          success: function(data) {
            handleCities(data);
          }
        });
      }
    }, delay);
  }

  
  function handleCities(cities) {
    console.log("handleCities fires", cities);
    var htmlToAdd = "";
    var results = [];
    if (cities.length == 0) {
      searchResultsDiv.html("");
      htmlToAdd += "<div class='result noresult'>No cities found</div>";
    } else {
      for (var i = 0; i < cities.length; i++) {
        htmlToAdd +=
          "<div class='result'>" +
          cities[i].name +
          ", " +
          cities[i].country +
          "</div>";
        results.push(cities[i]);
        if (i == 49) {
          break;
        }
      }
    }
    searchResultsDiv.html(htmlToAdd);
    searchResultsDiv.show();

    input.blur(function() {
      this.index = -1;
      searchResultsDiv.hide();
    });

    
    $(".result").on("mouseenter", function(event) {
      for (var j = 0; j < results.length; j++) {
        if ($(event.target).hasClass("noresult")) {
          $(".result")
            .eq(j)
            .removeClass("selected");
        }
        if (
          $(".result")
            .eq(j)
            .hasClass("selected") == true
        ) {
          $(
            $(".result")
              .eq(j)
              .removeClass("selected")
          );
        }
      }
      $(event.target).addClass("selected");
    });

    $(".result").on("mousedown", function(event) {
      if ($(event.target).hasClass("noresult")) {
        return;
      }
      input.val(event.target.innerHTML);
      searchResultsDiv.hide();
    });

    $(".result").on("mouseleave", function(event) {
      $(event.target).removeClass(".selected");
    });
  }

  
  function renderWeather(weatherResult) {
    var mRslt = weatherResult;
    console.log("weather query result", mRslt);

    var wLst = mRslt.list;
    var cDet = mRslt.city;

    var htmlToAdd =
      "<h3>Weather forecast, " + cDet.name + ", " + cDet.country + "</h3>";
    for (var i = 0; i < wLst.length; i++) {
      htmlToAdd +=
        "<div data-number=" +
        i +
        " class='weather-result'><div class='img-container'><img data-icon=" +
        wLst[i].weather[0].icon +
        " src='https://openweathermap.org/img/w/" +
        wLst[i].weather[0].icon +
        ".png'></div><p class='date-and-time'>" +
        wLst[i].dt_txt +
        "</p><p><b>Temperature:</b> " +
        wLst[i].main.temp +
        "°C</p><p><b>Pressure:</b> " +
        wLst[i].main.pressure +
        "Pa</p><p><b>Humidity:</b> " +
        wLst[i].main.humidity +
        "%</p><p><b>Description:</b> " +
        wLst[i].weather[0].description +
        "</p><p><b>Wind speed and direction:</b> " +
        wLst[i].wind.speed +
        "m/s, " +
        wLst[i].wind.deg +
        "°</p></div>";
    }

    weatherResultsDiv.html(htmlToAdd);
    weatherBoxes = $(".weather-result");

    $("#container-left").animate(
      {
        scrollTop: 0
      },
      500
    );
  }

  
})();
