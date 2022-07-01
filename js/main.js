require([
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend",
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/BasemapGallery",
  "esri/request",
  "esri/Graphic",
  "esri/geometry/Polyline",
  "esri/rest/route",
  "esri/rest/support/RouteParameters",
  "esri/rest/support/FeatureSet",
  "esri/rest/support/PolylineBarrier",
], (
  FeatureLayer,
  Legend,
  esriConfig,
  Map,
  MapView,
  BasemapGallery,
  esriRequest,
  Graphic,
  Polyline,
  route,
  RouteParameters,
  FeatureSet,
  PolylineBarrier
) => {
  // adding the api key
  esriConfig.apikey =
    "AAPK920537f0fb6f41a3ad0cfb9ff3ef200esarslu7Dh8ucXUawPAalwF4NgCY8UnEbGc9bRwobWGo_GifbtNbxT8G1fWTZxhzO";

  // creating the map
  const myMap = new Map({
    basemap: "streets-night-vector",
  });

  const myView = new MapView({
    map: myMap,
    container: "map",
    center: [-72.699997, 41.599998],
    zoom: 15,
    // zoom: 7,
  });

  // adding legend button
  const legenButton = document.getElementById("LegendButton");
  const legend = new Legend({
    view: myView,
  });
  myView.ui.add(legenButton, "bottom-right");
  let legendFlag = false;
  legenButton.addEventListener("click", async () => {
    if (legendFlag == false) {
      await myView.ui.add(legend, "bottom-right");
      fillLegendDiv();
      legendFlag = true;
    } else {
      myView.ui.remove(legend);
      legendFlag = false;
    }
  });

  // adding button to change basemap
  const basemapButton = document.getElementById("BaseMapGalleryButton");
  const basemapGallery = new BasemapGallery({
    view: myView,
  });
  myView.ui.add(basemapButton, "top-right");
  let bmFlag = false;
  basemapButton.addEventListener("click", () => {
    if (bmFlag == false) {
      myView.ui.add(basemapGallery, "top-right");
      bmFlag = true;
    } else {
      myView.ui.remove(basemapGallery);
      bmFlag = false;
    }
  });

  // getting road data from our network dataset on ArcGIS developer
  const reqUrl =
    "https://services8.arcgis.com/QWDoBCFVF4uvXJEY/arcgis/rest/services/finalfinal_shp/FeatureServer/0/query";
  const reqOpt = {
    query: {
      where: "1=1",
      outFields: "*",
      f: "pjson",
      geometry: "",
      geometryType: "esriGeometryEnvelope",
      spatialRel: "esriSpatialRelContains",
    },
  };

  let roads = [];
  // the button which will be clicked to start prediction
  const predict = document.getElementById("predict");
  // to fill the dropdown list with time (24 hours)
  fillHoursList();

  predict.addEventListener("click", () => {
    let extent = myView.extent;
    reqOpt.query.geometry = `${extent.xmin}, ${extent.ymin}, ${extent.xmax}, ${extent.ymax},`;

    esriRequest(reqUrl, reqOpt).then((res) => {
      // weather api limited to 60 request per minute for free
      if (res.data.features.length < 60) {
        alert("Calling open weather map api...");

        res.data.features.map((road) => {
          const lon = road.attributes.START_X;
          const lat = road.attributes.START_Y;

          fetch(
            // b6a1d244375449bbe4ac12889634b68b new
            // f004107bf5aff5c33764a133031f3846 working
            `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=850a7ba50dcc47f35faff935194b4a78&units=imperial`,
            { method: "GET" }
          )
            .then(function (res) {
              res
                .json()
                .then(function (weather) {
                  let Start_Time = Date.now();
                  let date = new Date(Start_Time);
                  const hours = date.getHours() - 6;

                  let defaultResult = {
                    lon,
                    lat,
                    MTFC: road.attributes.MTFAC,
                    Sunrise_Sunset:
                      road.attributes.Sunrise_Su === "Night" ? 0 : 1,
                    Shape_Length: road.attributes.Shape__Length,
                    Eculidian_length: road.attributes.Eculiden_L,
                    Sinusity: road.attributes.Sinuisty,
                    Road_Category: road.attributes.Road_Categ,
                  };
                  const choosenHour = document.getElementById("hours");
                  let result;
                  if (choosenHour.value === "1") {
                    result = {
                      ...defaultResult,
                      ...weatherCurrent(weather, Start_Time, hours),
                    };
                  } else {
                    result = {
                      ...defaultResult,
                      ...weatherLater(
                        weather,
                        choosenHour.value,
                        Start_Time,
                        hours
                      ),
                    };
                  }
                  fetch(
                    `http://ec2-3-11-70-161.eu-west-2.compute.amazonaws.com/predict/?MTFC=${result.MTFC}&Start_Time=${result.Start_Time}&Time_Interval=${result.Time_Interval}&Temperature_F_=${result.Temperature_F_}&Wind_Chill_F_=${result.Wind_Chill_F_}&Humidity___=${result.Humidity___}&Pressure_in_=${result.Pressure_in_}&Visibility_mi_=${result.Visibility_mi_}&Wind_Speed_mph_=${result.Wind_Speed_mph_}&Sunrise_Sunset=${result.Sunrise_Sunset}&Shape_Length=${result.Shape_Length}&Eculidian_length=${result.Eculidian_length}&Sinusity=${result.Sinusity}&Road_Category=${result.Road_Category}&Weather_Condition_Clear=${result.Weather_Condition_Clear}&Weather_Condition_Cloudy=${result.Weather_Condition_Cloudy}&Weather_Condition_Fog=${result.Weather_Condition_Fog}&Weather_Condition_Heavy_Rain=${result.Weather_Condition_Heavy_Rain}&Weather_Condition_Rainy=${result.Weather_Condition_Rainy}&Weather_Condition_Snowing=${result.Weather_Condition_Snowing}&Weather_Condition_Stormy=${result.Weather_Condition_Stormy}&Weather_Condition_Thunder_Storm=${result.Weather_Condition_Thunder_Storm}&Weather_Condition_Windy=${result.Weather_Condition_Stormy}`
                    // "http://ec2-3-11-70-161.eu-west-2.compute.amazonaws.com/predict/?MTFC=2&Start_Time=146656&Time_Interval=0&Temperature_F_=60&Wind_Chill_F_=23&Humidity___=4&Pressure_in_=65&Visibility_mi_=10&Wind_Speed_mph_=46&Sunrise_Sunset=1&Shape_Length=100&Eculidian_length=1565&Sinusity=1.55&Road_Category=1&Weather_Condition_Clear=1&Weather_Condition_Cloudy=0&Weather_Condition_Fog=0&Weather_Condition_Heavy_Rain=0&Weather_Condition_Rainy=0&Weather_Condition_Snowing=0&Weather_Condition_Stormy=0&Weather_Condition_Thunder_Storm=0&Weather_Condition_Windy=0"
                  ).then((res) => {
                    res.json().then((modelResult) => {
                      road["output"] = modelResult;
                    });
                  });

                  roads.push(road);
                  setTimeout(() => {
                    drawRoads(roads);
                  }, 1000);
                })

                .catch(function (error) {
                  console.log(error);
                });
            })
            .catch(function (error) {
              console.log(error);
            });
        });
      }
    });
  });

  function weatherCurrent(weather, Start_Time, hours) {
    let result = {
      Start_Time,
      Time_Interval: hours < 6 ? 0 : hours < 12 ? 1 : hours < 18 ? 2 : 3,
      clouds: weather.current.clouds,
      Humidity___: weather.current.humidity,
      Temperature_F_: weather.current.temp,
      Visibility_mi_: weather.current.visibility / 1609.344, // from meter to miles
      Wind_Chill_F_:
        weather.current.temp < 70
          ? 53.74 +
            0.6215 * weather.current.temp -
            35.75 * weather.current.wind_speed ** 0.16 +
            0.4275 * weather.current.temp * weather.current.wind_speed ** 0.16
          : 51,
      Wind_Speed_mph_: weather.current.wind_speed,
      Pressure_in_: weather.current.pressure / 33.865, // from hPa to inches
      Weather_Condition_Clear:
        weather.current.weather[0].main === "Clear" ? 1 : 0,
      Weather_Condition_Cloudy:
        weather.current.weather[0].main === "Clouds" ? 1 : 0,
      Weather_Condition_Fog: weather.current.weather[0].main === "Fog" ? 1 : 0,
      Weather_Condition_Heavy_Rain:
        weather.current.weather[0].main === "Rain" ? 1 : 0,
      Weather_Condition_Rainy:
        weather.current.weather[0].main === "Rain" ? 1 : 0,
      Weather_Condition_Snowing:
        weather.current.weather[0].main === "Snow" ? 1 : 0,
      Weather_Condition_Stormy:
        weather.current.weather[0].main === "Thunderstorm" ? 1 : 0,
      Weather_Condition_Thunder_Storm:
        weather.current.weather[0].main === "Thunderstorm" ? 1 : 0,
    };
    return result;
  }
  function weatherLater(weather, hour, Start_Time) {
    Start_Time += hour * 60 * 60 * 1000;
    let date = new Date(Start_Time);
    const hours = date.getHours() - 6;
    let result = {
      Start_Time,
      Time_Interval: hours < 6 ? 0 : hours < 12 ? 1 : hours < 18 ? 2 : 3,
      clouds: weather.hourly[hour - 1].clouds,
      Humidity___: weather.hourly[hour - 1].humidity,
      Temperature_F_: weather.hourly[hour - 1].temp,
      Visibility_mi_: weather.hourly[hour - 1].visibility / 1609.344, // from meter to miles
      Wind_Chill_F_:
        weather.hourly[hour - 1].temp < 70
          ? 53.74 +
            0.6215 * weather.hourly[hour - 1].temp -
            35.75 * weather.hourly[hour - 1].wind_speed ** 0.16 +
            0.4275 *
              weather.hourly[hour - 1].temp *
              weather.hourly[hour - 1].wind_speed ** 0.16
          : 51,
      Wind_Speed_mph_: weather.hourly[hour - 1].wind_speed,
      Pressure_in_: weather.hourly[hour - 1].pressure / 33.865, // from hPa to inches
      Weather_Condition_Clear:
        weather.hourly[hour - 1].weather[0].main === "Clear" ? 1 : 0,
      Weather_Condition_Cloudy:
        weather.hourly[hour - 1].weather[0].main === "Clouds" ? 1 : 0,
      Weather_Condition_Fog:
        weather.hourly[hour - 1].weather[0].main === "Fog" ? 1 : 0,
      Weather_Condition_Heavy_Rain:
        weather.hourly[hour - 1].weather[0].main === "Rain" ? 1 : 0,
      Weather_Condition_Rainy:
        weather.hourly[hour - 1].weather[0].main === "Rain" ? 1 : 0,
      Weather_Condition_Snowing:
        weather.hourly[hour - 1].weather[0].main === "Snow" ? 1 : 0,
      Weather_Condition_Stormy:
        weather.hourly[hour - 1].weather[0].main === "Thunderstorm" ? 1 : 0,
      Weather_Condition_Thunder_Storm:
        weather.hourly[hour - 1].weather[0].main === "Thunderstorm" ? 1 : 0,
    };
    return result;
  }
  function fillHoursList() {
    const hoursList = document.getElementById("hours");
    let Start_Time = Date.now();
    let date = new Date(Start_Time);
    const hour = date.getHours() - 6;
    for (let i = 1; i <= 24; i++) {
      const element = document.createElement("option");
      element.value = i;
      element.innerText =
        hour + i < 24 ? ` ${hour + i} : 00 ` : ` ${hour + i - 24} : 00`;
      hoursList.appendChild(element);
    }
  }

  let barriers = [];
  let barriersLayer = [];
  let ployline;
  let polylineBarrier;
  function drawRoads(roads) {
    const lineSymbol1 = {
      type: "simple-line", // green color
      color: [0, 255, 0],
      width: 4,
    };
    const lineSymbol2 = {
      type: "simple-line", // orange color
      color: [226, 119, 40],
      width: 4,
    };
    const lineSymbol3 = {
      type: "simple-line", // red color
      color: [225, 0, 0],
      width: 4,
    };
    const defaultSymbol = {
      type: "simple-line", // black color
      color: [0, 0, 0],
      width: 0,
    };
    roads.map((road) => {
      ployline = {
        type: "polyline",
        paths: road.geometry.paths[0],
        spatialReference: { wkid: 3857 },
      };
      const myGraphic = new Graphic({
        geometry: ployline,
        symbol:
          road["output"] === 1
            ? lineSymbol1
            : road["output"] === 2
            ? lineSymbol2
            : road["output"] === 3
            ? lineSymbol3
            : defaultSymbol,
      });

      barriers.push(myGraphic);
      myView.graphics.add(myGraphic);

      // creating barriers layer for future analysis
      polylineBarrier = [
        new PolylineBarrier({
          geometry: ployline,
        }),
      ];
      barriersLayer.push(polylineBarrier);
    });

    // creating feature layer from graphics layer for future analysis
    const myRenderer = {
      type: "unique-value",
      legendOptions: {
        title: "Route type",
      },
      field: "output",
      uniqueValueInfos: [
        {
          value: 1,
          label: "Low Risk",
          symbol: {
            type: "simple-line", // green color
            color: [0, 255, 0],
            width: 4,
          },
        },
        {
          value: 2,
          label: "Medium Risk",
          symbol: {
            type: "simple-line", // orange color
            color: [226, 119, 40],
            width: 4,
          },
        },
        {
          value: 3,
          label: "High Risk",
          symbol: {
            type: "simple-line", // red color
            color: [225, 0, 0],
            width: 4,
          },
        },
      ],
      defaultSymbol: {
        type: "simple-line", // black color
        color: [0, 0, 0],
        width: 0,
      },
    };
    let myLayer = new FeatureLayer({
      source: barriers,
      objectIdField: "ObjectID",
      renderer: myRenderer,
    });

    // myMap.add(myLayer);
    // myMap.layers.push(mylayer);
  }

  // to fill the legend
  function fillLegendDiv() {
    const legend = document.getElementsByClassName("esri-legend__message")[0];
    legend.innerHTML = ` <h3>Predicted Road Categories</h3> 
    <table>

  <tr>
  <td>
  <ul>
    <li>Low Risk</li>
    <li>Medium Risk</li>
    <li>High Risk</li>
  </ul>
  </td>
  <td>
  <ul style="list-style-type: none">
    <li style="font-weight: bolder; color: green; padding-bottom: 5px">ـــــــــــــــــ</li>
    <li style="font-weight: bolder; color: orange; padding-bottom: 5px">ـــــــــــــــــ</li>
    <li style="font-weight: bolder; color: red; padding-bottom: 5px">ـــــــــــــــــ</li>
  </ul>
  </td>
  </tr>
</table>
      `;
    console.log(legend);
  }
});

var navBar = document.querySelector("nav");
window.onscroll = () => {
  if (window.scrollY >= 10) navBar.classList.add("scroll");
  else navBar.classList.remove("scroll");
};
