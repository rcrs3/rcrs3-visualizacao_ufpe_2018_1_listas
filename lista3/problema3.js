var h = 500, w = 800;

var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

var dist = function(rm1, rm2) {
    var ret = 0;
    for(var i = 0; i < 20; i++) {
        ret += (rm1[i] - rm2[i]) * (rm1[i] - rm2[i]);
    }

    return Math.sqrt(ret);
}

d3.tsv("data/series_historicas.xls", function(error, data) {
    var region = [];
    var porc_year = [];

    for(var i = 0; i < data.length; i++) {
        region.push(data[i]["Regiao"]);
        rm = [];
        for(var j = 1990; j <= 2009; j++) {
            rm.push(parseFloat(data[i][j.toString()].replace(',', '.')));
        }

        porc_year.push(rm);
    }
    //console.log(porc_year);

    var opt = {epsilon: 10, dim: 2};

    var tsne = new tsnejs.tSNE(opt);

    var dists = [];

    for(var i = 0; i < porc_year.length; i++) {
        var aux = [];
        for(var j = 0; j < porc_year.length; j++) {
            aux.push(dist(porc_year[i], porc_year[j]));
        }
        dists.push(aux);
    }
    tsne.initDataDist(dists);

    for(var i = 0; i < 5000; i++) {
        tsne.step();
    }

    var coord = tsne.getSolution();
    console.log(coord);

    var xScale = d3.scaleLinear()
                    .domain([d3.min(coord.map(d => d[0])), d3.max(coord.map(d => d[0]))])
                    .range([50, 600 - 10])

    var yScale = d3.scaleLinear()
                    .domain([d3.min(coord.map(d => d[1])), d3.max(coord.map(d => d[1]))])
                    .range([h - 200, 100]);

    svg.selectAll("circle")
        .data(coord)
        .enter()
        .append("circle")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "yellow")
        .attr("r", 8)
        .attr("cx", d => xScale(d[0]))
        .attr("cy", d => yScale(d[1]))
        .on("mouseover", function(d, i) {
            svg.append("text")
                .attr("x", xScale(d[0]))
                .attr("y", yScale(d[1]))
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .text(region[i]);  
        })
        .on("mouseout", function() {
            svg.selectAll("text")
                .remove();  
        });
});