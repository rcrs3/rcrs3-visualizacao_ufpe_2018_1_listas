const munLink = "https://visualizacao-ufpe.github.io/data_vis_assignments/2017.2/data/geojs-100-mun.json.txt";
const occurrenceLink = "https://raw.githubusercontent.com/nosbielcs/opendata_aig_brazil/master/data/oco.csv";
const esLink = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

var h = 500, w = 700;

var svg  = d3.select("body")
            .append("svg")
            .attr("height", h)
            .attr("width", w);

var projection = d3.geoMercator()
                    .translate([(w-200)/2 + 550, h/2 - 170])
                    .scale([600]);
var path = d3.geoPath().projection(projection);

var created_occ = false;
var created_occ_es = false;

function getColorMun(d) {
    return d > 40 ? '#67000d' :
           d > 20  ? '#a50f15' :
           d > 10  ? '#cb181d' :
           d > 5  ? '#ef3b2c' :
                     '#fb6a4a';
}

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

d3.json(munLink, function(error, data) {
    var occ_group = svg.append("g").attr("id", "p_ocorrencia").style("opacity", 0);

    occ_group.selectAll("path")
        .data(data["features"])
        .enter()
        .append("path")
        .attr("d", path);

    var ordinalScale = d3.scaleOrdinal()
                .domain(["ACIDENTE","INCIDENTE"])
                .range(["red", "blue", "green"]);

    d3.csv(occurrenceLink, function(error, data) {
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

d3.csv(occurrenceLink, function(error, data) {
    d3.json(esLink, function(error, json) {
        var occ_es_group = svg.append("g").attr("id", "p_ocorrencia_es").style("opacity", 0);

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
       
        occ_es_group.selectAll("path")
        .data(json["features"])
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d) {
            var value = d["properties"]["value"];
            return getColorEs(value);
        }).attr("stroke", "black")
        .attr("stroke-width", 0.5);

        var color_data = [0, 10, 20, 50, 100, 200, 500, 1000];
        for(var i = 0; i < color_data.length; i++) {
            svg.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("x", 450)
                .attr("y", 470 - 15*i)
                .attr("id", "p_ocorrencia_es")
                .style("opacity", 0)
                .style("fill", getColorEs(color_data[i] + 1));
        }

        for(var i = 0; i < color_data.length; i++) {
            var last = color_data.length - 1;
            svg.append("text")
                .attr("x", 470)
                .attr("y", 482 - 15*i)
                .attr("font-size", 15)
                .attr("id", "p_ocorrencia_es")
                .style("opacity", 0)
                .text(color_data[i] + (i === last?"+" : "-" + color_data[i + 1]) + " ocorrências");
        }

        check_occurrence()
    });

    d3.json(munLink, function(error, json) {
        var occ_mun_group = svg.append("g").attr("id", "p_ocorrencia_mun").style("opacity", 0);

        for(var i = 0; i < data.length; i++) {
            var dataState = data[i]["ocorrencia_cidade"].toLowerCase();
            var found = false;
            for(var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j]["properties"]["name"].toLowerCase();
                
                if(dataState === jsonState) {
                  //  console.log(dataState, jsonState);
                    if(json.features[j]["properties"]["value"] == null) {
                        json.features[j]["properties"]["value"] = 1;
                    } else {
                        json.features[j]["properties"]["value"]++;
                    }
                    found = true;
                }
            }
        }
        for(var i = 0; i < json.features.length; i++) {
            if(json.features[i]["properties"]["value"] == null) {
                json.features[i]["properties"]["value"] = 0;
            }
        }
              
        occ_mun_group.selectAll("path")
        .data(json["features"])
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d) {
            var value = d["properties"]["value"];
            return getColorMun(value);
        })
        .attr("stroke", "black")
        .attr("stroke-width", 0.05);
        
        var color_data = [0, 5, 10, 20, 40];
        for(var i = 0; i < color_data.length; i++) {
            svg.append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("x", 450)
                .attr("y", 470 - 15*i)
                .attr("id", "p_ocorrencia_mun")
                .style("opacity", 0)
                .style("fill", getColorMun(color_data[i] + 1));
        }

        for(var i = 0; i < color_data.length; i++) {
            var last = color_data.length - 1;
            svg.append("text")
                .attr("x", 470)
                .attr("y", 482 - 15*i)
                .attr("font-size", 15)
                .attr("id", "p_ocorrencia_mun")
                .style("opacity", 0)
                .text(color_data[i] + (i === last?"+" : "-" + color_data[i + 1]) + " ocorrências");
        }

        check_occurrence()
    });
});
//console.log(geojson)
