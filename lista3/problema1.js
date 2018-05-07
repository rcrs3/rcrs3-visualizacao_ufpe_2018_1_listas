var h = 500, w = 500;

var svg  = d3.select("body")
            .append("svg")
            .attr("height", h)
            .attr("width", w);

console.log("wtf");


var projection = d3.geoMercator()
                    .translate([w/2 + 550, h/2 - 170])
                    .scale([600]);
var path = d3.geoPath().projection(projection);

var created_occ = false;
var created_occ_es = false;

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

var check_occurrence = function() {
    var value = d3.select('input[name="ocorrencia"]:checked').property("value");
    
    if(value === "ocorrencia") {
        svg.selectAll("#p_ocorrencia_mun")
            .style("opacity", 0);

        svg.selectAll("#p_ocorrencia_es")
            .style("opacity", 0);
        
        svg.selectAll("circle")
                .style("opacity", 1);

        svg.selectAll("#p_ocorrencia")
            .style("opacity", 1);

    } else if(value === "ocorrencia_es") {
        svg.selectAll("circle")
            .style("opacity", 0);

        svg.selectAll("#p_ocorrencia")
            .style("opacity", 0);
        
        svg.selectAll("#p_ocorrencia_mun")
            .style("opacity", 0);

        svg.selectAll("#p_ocorrencia_es")
            .style("opacity", 1);

    } else if(value === "ocorrencia_mun") {
        svg.selectAll("circle")
            .style("opacity", 0);

        svg.selectAll("#p_ocorrencia")
            .style("opacity", 0);
       
        svg.selectAll("#p_ocorrencia_es")
            .style("opacity", 0);

        svg.selectAll("#p_ocorrencia_mun")
            .style("opacity", 1);
    }
}

var num_occ_es = new Array();

d3.json("data/geojs-100-mun.json", function(error, data) {
    var occ_group = svg.append("g").attr("id", "p_ocorrencia").style("opacity", 0);

    occ_group.selectAll("path")
        .data(data["features"])
        .enter()
        .append("path")
        .attr("d", path);

    var ordinalScale = d3.scaleOrdinal()
                .domain(["ACIDENTE","INCIDENTE"])
                .range(["red", "blue", "green"]);

    d3.csv("data/oco.csv", function(error, data) {
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return projection([d["ocorrencia_longitude"], d["ocorrencia_latitude"]])[0];
            })
            .attr("cy", function(d) {
                return projection([d["ocorrencia_longitude"], d["ocorrencia_latitude"]])[1];
            })
            .attr("r", 1.5)
            .style("fill", function(d)  {
                return ordinalScale(d["ocorrencia_classificacao"])
            })
            .style("opacity", 0);
            
        check_occurrence()
    });          
});

d3.csv("data/oco.csv", function(error, data) {
    d3.json("data/brazil-states.geojson", function(error, json) {
        var occ_es_group = svg.append("g").attr("id", "p_ocorrencia_es").style("opacity", 0);
        var color = d3.scaleQuantize()
                    .range(["rgb(254,229,217)",
                    "rgb(252,174,145)",
                    "rgb(251,106,74)",
                    "rgb(222,45,38)",
                    "rgb(239,59,44)",
                    "rgb(203,24,29)",
                    "rgb(153,0,13)"]);

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

        color.domain([d3.min(json.features, function(d) { return d["properties"]["value"]; }),
                    d3.max(json.features, function(d) { return d["properties"]["value"]; })]);
                
        occ_es_group.selectAll("path")
        .data(json["features"])
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d) {
            var value = d["properties"]["value"];
            return getColorEs(value);
        });

        check_occurrence()
    });

    d3.json("data/geojs-100-mun.json", function(error, json) {
        var occ_es_group = svg.append("g").attr("id", "p_ocorrencia_mun").style("opacity", 0);
        var color = d3.scaleQuantize()
                    .range(["rgb(254,229,217)",
                    "rgb(252,187,161)",
                    "rgb(252,146,114)",
                    "rgb(251,106,74)",
                    "rgb(165,15,21)"]);

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

        color.domain([d3.min(json.features, function(d) { return d["properties"]["value"]; }),
                    d3.max(json.features, function(d) { return d["properties"]["value"]; })]);
                
        occ_es_group.selectAll("path")
        .data(json["features"])
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d) {
            var value = d["properties"]["value"];
            return getColorNum(value);
        });

        check_occurrence()
    });
});
//console.log(geojson)