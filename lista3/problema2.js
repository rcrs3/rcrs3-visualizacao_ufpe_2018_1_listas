const munLink = "https://visualizacao-ufpe.github.io/data_vis_assignments/2017.2/data/geojs-100-mun.json.txt";
const occurrenceLink = "https://raw.githubusercontent.com/nosbielcs/opendata_aig_brazil/master/data/oco.csv";
const esLink = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";


var map = L.map('map').setView([-15, -50], 4);
var mapboxAccessToken = "pk.eyJ1IjoiY2FybmVybyIsImEiOiJjamd2aGI3NXowZ3d6MnFvOTdwcXNxeGM0In0.Gc8wEDsW856v8BTgRx_m3Q";
                        
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
id: 'mapbox.light',
attribution:
    'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>'

}).addTo(map);

var legend = L.control({position: 'bottomright'});
var layerEs;
var layerMun;
var jsonEs;
var jsonMun;
var csvOco;
var circles = [];

function getColorEs(d) {
    return d > 1000 ? '#67000d' :
           d > 500  ? '#a50f15' :
           d > 200  ? '#cb181d' :
           d > 100  ? '#ef3b2c' :
           d > 50   ? '#fb6a4a' :
           d > 20   ? '#fc9272' :
           d > 10   ? '#fcbba1' :
                      '#fee0d2';
}

function getColorMun(d) {
    return d > 40 ? '#67000d' :
           d > 20  ? '#a50f15' :
           d > 10  ? '#cb181d' :
           d > 5  ? '#ef3b2c' :
                     '#fb6a4a';
}

function styleOc(feature) {
    return {
        weight: 1,
        dashArray: '1',
        color: 'black'
    };
}

function styleMun(feature) {
    return {
        fillColor: getColorMun(feature.properties.value),
        weight: 0.5,
        opacity: 1,
        color: 'black',
        dashArray: '1',
        fillOpacity: 0.8
    };
}

function styleEs(feature) {
    return {
        fillColor: getColorEs(feature.properties.value),
        weight: 1,
        opacity: 1,
        color: 'black',
        dashArray: '1',
        fillOpacity: 0.8
    };
}

var color = {
    "ACIDENTE": "red",
    "INCIDENTE": "blue",
    "INCIDENTE GRAVE": "green"
};

var check_occurrence = function() {
    var value = d3.select('input[name="ocorrencia"]:checked').property("value");
    
    if(layerEs != null) {
        layerEs.remove();
    }
    if(layerMun != null) {
        layerMun.remove();
    }
    if(legend != null) {
        legend.remove();
    }

    for(var i = 0; i < circles.length; i++) {
        circles[i].remove();
    }
    circles = [];

    if(value === "ocorrencia") {
        layerMun = L.geoJson(jsonMun, {style: styleOc});
        layerMun.addTo(map);

        for(var i = 0; i < csvOco.length; i++) {
            var circle = L.circle([csvOco[i]["ocorrencia_latitude"],csvOco[i]["ocorrencia_longitude"]], {
                color: color[csvOco[i]["ocorrencia_classificacao"]],
                fillColor: '#f03',
                fillOpacity: 1,
                radius: 2
            }).addTo(map);
            circles.push(circle);
        }

    } else if(value === "ocorrencia_es") {
        layerEs = L.geoJson(jsonEs, {style: styleEs});
        layerEs.addTo(map);

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                labels = [];

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColorEs(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + ' ocorrências<br>' : '+ ocorrências');
            }

            return div;
        };

        legend.addTo(map);

    } else if(value === "ocorrencia_mun") {
        layerMun = L.geoJson(jsonMun, {style: styleMun});
        layerMun.addTo(map);
        
        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 5, 10, 20, 40],
                labels = [];

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColorMun(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + ' ocorrências<br>' : '+ ocorrências');
            }

            return div;
        };

        legend.addTo(map);
    }
}

d3.csv(occurrenceLink, function(error, data) {
    csvOco = data;
    d3.json(esLink, function(error, json) {
        

        for(var i = 0; i < data.length; i++) {
            var dataState = data[i]["ocorrencia_uf"];
            
            for(var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j]["properties"]["sigla"];
                if(dataState === jsonState) {
                
                    if(json.features[j]["properties"]["value"] == null) {
                        json.features[j]["properties"]["value"] = 1;
                    } else {
                        json.features[j]["properties"]["value"]++;
                    }
                }
            }
        }
        jsonEs = json;
        check_occurrence();
    });
    
    d3.json(munLink, function(error, json) {
        //legend.remove();
        map.removeLayer(L.geoJson());
        
        for(var i = 0; i < data.length; i++) {
            var dataState = data[i]["ocorrencia_cidade"].toLowerCase();
            
            for(var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j]["properties"]["name"].toLowerCase();
                if(dataState === jsonState) {
                //  console.log(dataState, jsonState);
                    if(json.features[j]["properties"]["value"] == null) {
                        json.features[j]["properties"]["value"] = 1;
                    } else {
                        json.features[j]["properties"]["value"]++;
                    }
                }
            }
        }
        jsonMun = json;
        check_occurrence();
    });
});