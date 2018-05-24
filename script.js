// Store our API endpoint as queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to size the markers nicely
function markerSize(eq) {
  return (Math.pow(eq, 3) / 2);
}

// Function to color the markers nicely
function markerColor(mag) {
  let magn = (Math.round(255 - (mag * 30))).toString(16);
  return (`#${magn}55${magn}`);
}

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  //console.log(data)
  createFeature(data)
  //console.log(data.features);
  // Using the features array sent back in the API data, create a GeoJSON layer and add it to the map
});

function createFeature(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + 
    new Date(feature.properties.time) + "<br />Magintude: " + feature.properties.mag + "</p>");
  }
  console.log(earthquakeData.features)


  let earthquakes = L.geoJSON(earthquakeData, {
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

  makeAMap(earthquakes);
}

function makeAMap(eq) {
  console.log(eq);
/*
  let earthquakes = eq.features
  let eqmeta = {
    "count": eq.count,
    "time": eq.generated
  }

  let eqMarkers = [];
  for (let i = 0, ii = earthquakes.length; i < ii; i++) {
    let eq = earthquakes[i];
    if (eq.properties.mag > 4) {
    eqMarkers.push(
      L.circle([eq.geometry.coordinates[1], eq.geometry.coordinates[0]], {
        stroke: false,
        fillOpacity: 0.25,
        color: "blue",
        fillColor: "blue",
        radius: markerSize(eq.properties.mag)
      })
    );
  }
  }
  console.log(eqMarkers);
  */
  // Define streetmap and darkmap layers
  let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG90b3BpIiwiYSI6ImNqaDFhaGh6ejAxcW4yeHJ5aDl4bjZ2YngifQ.ssPdnszdafCcNm4753AVJA");

  let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG90b3BpIiwiYSI6ImNqaDFhaGh6ejAxcW4yeHJ5aDl4bjZ2YngifQ.ssPdnszdafCcNm4753AVJA");

  let eqLayer = L.layerGroup(eq);
  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  let overlayMaps = {
    "Earthquake Map": eq
  }

  // Create a new map
  let myMap = L.map("map", {
    center: [
      34, -118
    ],
    zoom: 7,
    layers: [streetmap, eq]
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
};

// japan center 35.6895, 139.6917

