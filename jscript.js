// Store our API endpoint as queryUrl
let queryUrl = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2011-03-04&endtime=2012-03-04&maxlongitude=156.6731&minlongitude=125.5571&maxlatitude=48.74894534&minlatitude=30.652832";
let plates = "/data/plates.json";

function markerSize(eq) {
  return (Math.pow(eq,5))*8;
}
// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  d3.json(plates, function(data2) {
    makeAMap(data.features, data2)
    console.log(data2);
    })
});

function makeAMap(earthquakes, plates) {
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
  // Define streetmap and darkmap layers
  let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG90b3BpIiwiYSI6ImNqaDFhaGh6ejAxcW4yeHJ5aDl4bjZ2YngifQ.ssPdnszdafCcNm4753AVJA");

  let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG90b3BpIiwiYSI6ImNqaDFhaGh6ejAxcW4yeHJ5aDl4bjZ2YngifQ.ssPdnszdafCcNm4753AVJA");

  let eqLayer = L.layerGroup(eqMarkers);
  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  let overlayMaps = {
    "Earthquake Map": eqLayer
  };

  // Create a new map
  let myMap = L.map("map", {
    center: [
      35.6895, 139.6917
    ],
    zoom: 5,
    layers: [streetmap, eqLayer]
  });

  // Create a layer control containing our baseMaps
  // Be sure to add an overlay Layer containing the earthquake GeoJSON
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);
};