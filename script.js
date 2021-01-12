var datearray = [];
colorrange = ["#045A8D", "#556B2F", "#FF0000"];
strokecolor = colorrange[0];

var format = d3.time.format("%m/%d/%y");

var margin = {top: 70, right: 40, bottom: 30, left: 30};
var width = document.body.clientWidth - margin.left - margin.right;
var height = 450 - margin.top - margin.bottom;

var svg = d3.select(".chart").append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height+ margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // todo fix responsive for axis

function drawGraph() {
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", "100px")
        .style("left", "55px");

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height-10, 0]);

    var z = d3.scale.ordinal()
        .range(colorrange);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(12)
        .tickFormat(d3.time.format("%B"));

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(0);

    var stack = d3.layout.stack()
        .offset("silhouette")
        .values(function(d) { return d.values; })
        .x(function(d) { return d.date; })
        .y(function(d) { return d.normvalue; });

    var nest = d3.nest()
        .key(function(d) { return d.key; });

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function(d) { return x(d.date); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });

    var graph = d3.csv(inputFile, function(data) {
        // Reset graph params
        svg.selectAll('*').remove();

        data.forEach(function(d) {
            d.date = format.parse(d.date);
            d.normvalue = +d.normvalue;
        });

        var layers = stack(nest.entries(data));

        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", function(d) { return area(d.values); })
            .style("fill", function(d, i) { return z(i); });


        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxis.orient("right"));

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis.orient("left"));

        svg.selectAll(".layer")
            .attr("opacity", 1)
            .on("mouseover", function(d, i) {
                svg.selectAll(".layer").transition()
                    .duration(250)
                    .attr("opacity", function(d, j) {
                        return j != i ? 0.6 : 1;
                    })})

            .on("mousemove", function(d, i) {
                mouse = d3.mouse(this);
                mouseX = mouse[0];
                mouseY = mouse[1];
                var invertedx = x.invert(mouseX);
                var selected = (d.values);
                for (var k = 0; k < selected.length; k++) {
                    datearray[k] = selected[k].date
                }

                let differences = [];
                datearray.forEach(function(d) {
                    differences.push(Math.abs(invertedx.getTime() - d.getTime()));
                });
                let indexClosest = differences.indexOf(Math.min(...differences));

                mousedate = datearray[indexClosest];
                valueData = d.values[indexClosest].value;

                let tooltipBoxLeft;
                if (mouseX > width - 110) {
                    tooltipBoxLeft = mouseX - 80;
                } else {
                    tooltipBoxLeft = mouseX + 40;
                }

                d3.select(this)
                    .classed("hover", true)
                    .attr("stroke", strokecolor)
                    .attr("stroke-width", "0.5px")
                tooltip
                    .html("<div style='font-size:16px; border-width: 1px; border-radius:10px; border-color:gray; background-color:white; opacity:0.9; border-style:solid; width: 110px'>" + "&nbsp;" + d.key + "<br>&nbsp;" + valueData + "</div>")
                    .style("left", tooltipBoxLeft + "px")
                    .style("top", mouseY + 120 + "px")
                    .style("visibility", "visible");
            })
            .on("mouseout", function(d, i) {
                svg.selectAll(".layer")
                    .transition()
                    .duration(250)
                    .attr("opacity", "1");
                d3.select(this)
                    .classed("hover", false)
                    .attr("stroke-width", "0px"),
                    tooltip.style("visibility", "hidden");
            })

        var vertical = d3.select(".chart")
            .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "2px")
            .style("height", "350px")
            .style("top", "130px")
            .style("bottom", "30px")
            .style("left", "0px")
            .style("background", "#fff");

        d3.select(".chart")
            .on("mousemove", function(){
                mouse = d3.mouse(this);
                mouseX = mouse[0] + 5;
                vertical.style("left", mouseX + "px" ).style("visibility", "visible");
            })
            .on("mouseover", function(){
                mouse = d3.mouse(this);
                mouseX = mouse[0] + 5;
                vertical.style("left", mouseX + "px").style("visibility", "visible");
            })
            .on("mouseout", function (){
                vertical.style("visibility", "hidden");
            });
    });
}

inputFile = "TestDaten2020.csv";

function changeYear(year) {
    inputFile = `TestDaten${year}.csv`;
    drawGraph();
}

drawGraph();