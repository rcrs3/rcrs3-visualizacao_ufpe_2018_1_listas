var histogram = (function() {
    var w = 400, h = 400;

    var svg = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .attr("class", "histogram");

    var numFlights = [];


    for(var i = 0; i < trips.length; i++) {

        if((trips[i]["carrier"] in numFlights)) {
            numFlights[trips[i]["carrier"]]++;
        } else {
            var str = trips[i]["carrier"];
            numFlights[str] = 1;
        }
    }

    var auxArray = [];

    for(var i in numFlights) {
        auxArray.push({key: i, value: numFlights[i]});
    }

    var xScale = d3.scaleLinear()
                    .domain([0, 2])
                    .range([50, w - 120])

    var yScaleHeight = d3.scaleLinear()
                    .domain([0, 
                    d3.max(auxArray.map(d => d.value))])
                    .range([0, h - 40]);

    var yScale = d3.scaleLinear()
                    .domain([0, 
                    d3.max(auxArray.map(d => d.value))])
                    .range([h - 40,
                    h - yScaleHeight(auxArray[0].value) - 40]);

    var barGroup = svg.append("g");

    var colors = {
        "Gol": "Orange",
        "Tam": "Red",
        "Azul": "Blue"
    };

    barGroup.selectAll("rect")
            .data(auxArray)
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(i))
            .attr("y", (d, i) => (h - yScaleHeight(d.value) - 40))
            .attr("width", w/auxArray.length - 30)
            .attr("height", d => yScaleHeight(d.value))
            .attr("fill", d => colors[d.key])
            .attr("class", d => d.key);

   
    var xAxis = d3.axisBottom()
                .scale(xScale)
                .ticks(2)
                .tickFormat(i => auxArray[i].key);
                
    var yAxis = d3.axisLeft()
                .scale(yScale)


    svg.append("g")
        .attr("transform", "translate(50," + (h - (h - 370)) + ")")
        .call(xAxis);
        
    svg.append("g")
        .attr("transform", "translate(" + 40 + ",0)")
        .call(yAxis);
    
    return {
        getBars: function() {
            return barGroup;
        },
        scaleHeight: function(d) {
            return yScaleHeight(d);
        },
        getHeight: function() {
            return h;
        }
    };
})();

var scatterplot = (function(histo) {
    var w = 700, h = 600;
    var auxArray = [];
    var selection;

    var svg = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .attr("class", "scatterplot");

    var circleGroup = svg.append("g");
    var circles = circleGroup.selectAll("circle").data(trips);
    
    var daysDiff = function(a, b) {
        a = new Date(a[6] + a[7] + a[8] + a[9], a[3] + a[4], a[0] + a[1]);
        b = new Date(b[6] + b[7] + b[8] + b[9], b[3] + b[4], b[0] + b[1]);
                
        var diff = Math.abs(a.getTime() - b.getTime());
        var days = diff / (1000 * 3600 * 24);
        
        return days;
    };
    
    var colors = {
        "Gol": "Orange",
        "Tam": "Red",
        "Azul": "Blue"
    };
    
    var xScale = d3.scaleLinear()
                    .domain([0,
                    d3.max(trips.map(d => daysDiff(d["post"], d["start"])))])
                    .range([40, w - 5]);

    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(trips.map(d => d["price"]))])
                    .range([h - 30, 10]);
    
    circles.enter()
            .append("circle")
            .attr("cx", function(d) {
                var post = d["post"];
                var start = d["start"];

                return xScale(daysDiff(post, start));
            })
            .attr("cy", d => yScale(d["price"]))
            .attr("r", 5)
            .attr("fill", d => colors[d["carrier"]])
            .attr("class", d => d["carrier"]);
    
    var xAxis = d3.axisBottom()
                .scale(xScale);

    var yAxis = d3.axisLeft()
                .scale(yScale);

    svg.append("g")
        .attr("transform", "translate(0," + (h - 30) + ")")
        .call(xAxis);
    
    svg.append("g")
        .attr("transform", "translate(" + 40 + ",0)")
        .call(yAxis);
    
    var updateBars = function(selectedPoints, isBrush) {
        auxArray = [];
        var numFlights = [];

        numFlights["Gol"] = 0;
        numFlights["Tam"] = 0;
        numFlights["Azul"] = 0;

        for(var i = 0; i < trips.length; i++) {
            var selected = false;
            for(var j = 0; j < selectedPoints.length; j++) {
                if(selectedPoints[j] == i) selected = true;
            }

            if(!selected && isBrush) continue;
            
            numFlights[trips[i]["carrier"]]++;
            
        }
    
        for(var i in numFlights) {
            auxArray.push({key: i, value: numFlights[i]});
        }

        histo.getBars().selectAll("rect")
                .data(auxArray)
                .attr("y", d => (histo.getHeight() - histo.scaleHeight(d.value) - 40))
                .attr("height", d => histo.scaleHeight(d.value));
    }

    var brush = d3.brush();
    
    var brushGroup = svg.append("g")
                        .attr("class", "brush");
    
    var selectedPoints = [];
    var changeColor = function(d, i, circleClass) {
        
        var colorsMark = {
            "Gol": "DarkOrange",
            "Tam": "DarkRed",
            "Azul": "DarkBlue"
        };
        var x = xScale(daysDiff(d['post'], d['start']));
        var y = yScale(d['price']);
                      
        if((typeof selection !== "undefined") && circleClass != (d["carrier"] + '0') &&
            selection[0][0] <= x && x <= selection[1][0] &&
            selection[0][1] <= y && y <= selection[1][1]) {
                    selectedPoints.push(i);
                    return colorsMark[d["carrier"]];
            }
            return colors[d["carrier"]];
    }

    brush.on("brush", function(d, i) {
        selectedPoints = [];
        selection = d3.event.selection;

        circleGroup.selectAll("circle")
                    .attr("fill", (d, i) => changeColor(d, i, d3.select(this).attr("class")));
        
        updateBars(selectedPoints, true);

    }).on("start", function(d, i) {
        
        circleGroup.selectAll("circle")
                    .attr("fill", d => colors[d["carrier"]])
                    .style("opacity", 1)
                    .attr("class", d => d["carrier"]);
    
        updateBars([], false);
    });
    brushGroup.call(brush);

    histo.getBars().selectAll("rect")
            .on("click", function(d, i) {

                var rect = d3.select(this);
                
                if(rect.attr("class") === d.key) {
                    rect.style("opacity", 0.3)
                        .attr("class", d.key + '0');
                } else {
                    rect.style("opacity", 1)
                        .attr("class", d.key);
                }

                circleGroup.selectAll("circle")
                            .style("opacity", function(arr, j) {
                                var x = xScale(daysDiff(arr['post'], arr['start']));
                                var y = yScale(arr['price']);
                                var circleClass = d3.select(this).attr("class");
                                var rectClass = rect.attr("class");
                                var circleOpacity = d3.select(this).style("opacity");
                                if(typeof selection === "undefined") {
                                    
                                    if(rectClass === circleClass + '0' || 
                                    rectClass === circleClass.substring(0, circleClass.length-1)) {
                                        return (circleOpacity === '0'? 1 : 0);
                                    } else return 1;
                                    
                                }
                                
                                if(rectClass === circleClass + '0' || 
                                rectClass === circleClass.substring(0, circleClass.length-1)) {
                                    d3.select(this).attr("class", rectClass);
                                    circleClass = d3.select(this).attr("class");
                                } 
                                if(selection[0][0] > x || x > selection[1][0] ||
                                    selection[0][1] > y || y > selection[1][1]) {
                                        d3.select(this).attr("class", arr["carrier"] + '0');
                                        circleClass = d3.select(this).attr("class");
                                    }

                                var ret = (circleClass[circleClass.length-1] === '0');
                                
                                return (ret? 0 : 1);
                            });
            });

})(histogram);