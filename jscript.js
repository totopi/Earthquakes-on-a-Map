// Store our API endpoint as queryUrl
let queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2011-03-04&endtime=2011-10-08&maxlongitude=156.6731&minlongitude=125.5571&maxlatitude=48.74894534&minlatitude=30.652832";
let plates = "data/boundaries.json";

// Function to size the markers nicely
function markerSize(eq) {
  return (Math.pow(eq, 3) / 2.3);
}

// Function to color the markers nicely
function markerColor(mag) {
  let magn = (Math.round(255 - (mag * 30))).toString(16);
  return (`#${magn}55${magn}`);
}

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  d3.json(plates, function(data2) {
    createFeature(data, data2)
    //console.log(data.features);
    // Using the features array sent back in the API data, create a GeoJSON layer and add it to the map
  })
});

function createFeature(earthquakeData, platesData) {
  let getInterval = function(quake) {
    // earthquake data only has a time, so we'll use that as a "start"
    // and the "end" will be that + some value based on magnitude
    // 18000000 = 30 minutes, so a quake of magnitude 5 would show on the
    // map for 150 minutes or 2.5 hours
    return {
      start: quake.properties.time,
      end:   quake.properties.time + (1000 * 60 * 60 * 24)
    };
  };
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + 
    new Date(feature.properties.time) + "<br />Magintude: " + feature.properties.mag + "</p>");
  }
  console.log(earthquakeData.features)

  let tectonicPlates = L.geoJSON(platesData, {
    style: {"fillColor": "none"}
  });
  let earthquakes = L.timeline(earthquakeData, {
    getInterval: getInterval,
    onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        stroke: true,
        color: 'black',
        weight: 1,
        fillColor: markerColor(feature.properties.mag),
        fillOpacity: 0.5
      });
     }
    });

  makeAMap(earthquakes, tectonicPlates);
}

function makeAMap(eq, plate) {
  // Define various map layers
  let streetmap = L.tileLayer("http://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NDg1bDA1cjYzM280NHJ5NzlvNDMifQ.d6e-nNyBDtmQCVwVNivz7A");
  let darkmap = L.tileLayer("https://api.mapbox.com/v4/mapbox.dark/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidG90b3BpIiwiYSI6ImNqaDFhaGh6ejAxcW4yeHJ5aDl4bjZ2YngifQ.ssPdnszdafCcNm4753AVJA");
  let lightmap = L.tileLayer("https://api.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidG90b3BpIiwiYSI6ImNqaDFhaGh6ejAxcW4yeHJ5aDl4bjZ2YngifQ.ssPdnszdafCcNm4753AVJA");
  let satmap = L.tileLayer("https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidG90b3BpIiwiYSI6ImNqaDFhaGh6ejAxcW4yeHJ5aDl4bjZ2YngifQ.ssPdnszdafCcNm4753AVJA");
  let wheatmap = L.tileLayer("https://api.mapbox.com/v4/mapbox.wheatpaste/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidG90b3BpIiwiYSI6ImNqaDFhaGh6ejAxcW4yeHJ5aDl4bjZ2YngifQ.ssPdnszdafCcNm4753AVJA");
  let piratemap = L.tileLayer("https://api.mapbox.com/v4/mapbox.pirates/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidG90b3BpIiwiYSI6ImNqaDFhaGh6ejAxcW4yeHJ5aDl4bjZ2YngifQ.ssPdnszdafCcNm4753AVJA");
  let comicmap = L.tileLayer("https://api.mapbox.com/v4/mapbox.comic/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidG90b3BpIiwiYSI6ImNqaDFhaGh6ejAxcW4yeHJ5aDl4bjZ2YngifQ.ssPdnszdafCcNm4753AVJA");
  let emeraldmap = L.tileLayer("https://api.mapbox.com/v4/mapbox.emerald/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidG90b3BpIiwiYSI6ImNqaDFhaGh6ejAxcW4yeHJ5aDl4bjZ2YngifQ.ssPdnszdafCcNm4753AVJA");
  let pencilmap = L.tileLayer("https://api.mapbox.com/v4/mapbox.pencil/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidG90b3BpIiwiYSI6ImNqaDFhaGh6ejAxcW4yeHJ5aDl4bjZ2YngifQ.ssPdnszdafCcNm4753AVJA");

  let eqLayer = L.layerGroup(eq);
  let plateLayer = L.layerGroup(plate);
  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Pirate Map": piratemap,
    "Street Map": streetmap,
    "Satellite Map": satmap,
    "Wheat Paste Map": wheatmap,
    "Light Map": lightmap,
    "Dark Map": darkmap,
    "Comic Map": comicmap,
    "Emerald Map": emeraldmap,
    "Pencil Map": pencilmap
  };

  let overlayMaps = {
    "3/11/2011 1 Year Map": eq,
    "Tectonic Plates Map": plate
  }

  // Create a new map
  let myMap = L.map("map", {
    center: [
      35.6895, 139.691
    ],
    zoom: 5,
    layers: [piratemap, eq, plate]
  });

  // Create a layer control containing our baseMaps
  // Be sure to add an overlay Layer containing the earthquake GeoJSON
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);

  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    let div = L.DomUtil.create('div', 'info legend'),
        mag = [0, 1, 2, 3, 4, 5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (let i = 0, ii = mag.length; i < ii; i++) {
        div.innerHTML +=
            '<i style="background:' + markerColor(mag[i]) + '"></i> ' +
            mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);
  timeify(eq, myMap)
};

function timeify(data, map) {
  let slider = L.timelineSliderControl({
    formatOutput: function(date){
      return new Date(date).toString();
    }
  });
  slider.addTo(map);
  slider.addTimelines(data);
}
// japan center 35.6895, 139.691