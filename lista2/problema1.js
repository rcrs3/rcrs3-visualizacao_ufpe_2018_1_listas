var h = 400, w = 800;

var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

var xScale = d3.scaleLinear()
        .domain([0, 11])
        .range([50, w - 10])

var yScale = d3.scaleLinear()
        .domain([d3.min(temperature["DailyMean"].map(d => d)), d3.max(temperature["DailyMean"].map(d => d))])
        .range([h - 200, 100]);

var records = temperature["RecordHigh"].concat(temperature["RecordLow"].reverse());

var yScalePink = d3.scaleLinear()
                    .domain([d3.min(records.map(d => d)), d3.max(records.map(d => d))])
                    .range([h - 100, 5]);
        
svg.append("polyline")
    .style("fill", "lightCoral")
    .style("stroke", "none")
    .attr("points", function() {
        var ret = "";
                
        var recordHigh = temperature["RecordHigh"];
        for(var i = 0; i < recordHigh.length; i++) {
            var y = recordHigh[i];
            if(i > 0) ret += " ";

            ret += xScale(i) + "," + yScalePink(y);
        }

        var recordLow = temperature["RecordLow"];
        for(var i = 0; i < recordLow.length; i++) {
            ret += " ";
            ret += xScale(recordLow.length - i - 1) + "," + yScalePink(recordLow[i]);
        }

        ret += " " + xScale(0) + "," + yScalePink(temperature["RecordHigh"][0]);
        
        return ret;
    });


svg.append("polyline")
    .style("fill", "none")
    .style("stroke", "black")
    .style("stroke-width", 4)
    .attr("points", function() {
        var ret = "";
        var dailyMean = temperature["DailyMean"];
        for(var i = 0; i < dailyMean.length; i++) {
            var y = dailyMean[i];
        
            if(i > 0) ret += " ";
            ret += xScale(i) + "," + yScale(y);
        }
    
        return ret;
    });

var month = {
    0: "2017",
    1: "February",
    2: "March",
    3: "April",
    4: "May",
    5: "June",
    6: "July",
    7: "August",
    8: "September",
    9: "October",
    10: "November",
    11: "December"
}
console.log(month);
var xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(i => month[i]);

var yAxis = d3.axisLeft()
            .scale(d3.scaleLinear().domain([35, 1]).range([5, h - 100]));

svg.append("g")
    .attr("transform", "translate(0," + (h - (h - 300)) + ")")
    .call(xAxis);


svg.append("g")
    .attr("transform", "translate(" + (h - (h - 50)) + ", 0)")
    .call(yAxis);

svg.append("text")
    .text("Time")
    .attr("x", w/2)
    .attr("y", (h - (h - 340)));