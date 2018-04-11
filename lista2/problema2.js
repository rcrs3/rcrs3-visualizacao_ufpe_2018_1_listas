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

    var barGroup = svg.append("g");

    barGroup.selectAll("rect")
            .data(auxArray)
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(i))
            .attr("y", (d, i) => (h - yScaleHeight(d.value) - 40))
            .attr("width", w/auxArray.length - 30)
            .attr("height", d => yScaleHeight(d.value))
            .attr("fill", "Lavender");

    var yScale = d3.scaleLinear()
                .domain([0, 
                d3.max(auxArray.map(d => d.value))])
                .range([h - 40,
                h - yScaleHeight(auxArray[0].value) - 40]);

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

})();

var scatterplot = (function() {
    var w = 700, h = 600;

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
            .attr("r", 5);
    
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
})();