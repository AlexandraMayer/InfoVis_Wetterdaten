var datearray = [];
colorrange = ["#7796BC", "#997AC0", "#95DF85"];
strokecolor = colorrange[0];

year = 2020;

var layers0;
var layers1;

var format = d3.time.format("%m/%d/%y");


var margin = {top: 40, right: 40, bottom: 30, left: 30};
var width = document.body.clientWidth - margin.left - margin.right;
var height = 450 - margin.top - margin.bottom;
var spaceBottomY = 10;

var svg = d3.select(".chart").append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height+ margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// todo fix responsive for axis

let loadPromise =  function loadData() {
    return new Promise((resolve) => {
        d3.csv("Daten2020.csv", function (data) {
            data2020 = data;
            d3.csv("Daten2019.csv", function (data) {
                data2019 = data
                resolve()
            })
        })
    });
}

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "remove")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("visibility", "hidden");

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height - spaceBottomY, 0]);

var z = d3.scale.ordinal()
    .range(colorrange);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(12)
    .tickFormat(d3.time.format('%B'));

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

function setUpGraph() {

    var data = []
    if (year === 2020) {
        document.getElementById("btn20").checked = true;
        data = data2020
    } else if (year === 2019) {
        document.getElementById("btn19").checked = true;
        data = data2019
    }

    data2019.forEach(function (d) {
        d.date = format.parse(d.date);
        d.normvalue = +d.normvalue;
    });
    data2020.forEach(function (d) {
        d.date = format.parse(d.date);
        d.normvalue = +d.normvalue;
    });

    layers0 = stack(nest.entries(data2020));
    layers1 = stack(nest.entries(data2019));

    if(year === 2019) {
        var t = layers0
        layers0 = layers1
        layers0 = t
    }

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

    svg.selectAll(".layer")
        .data(layers0)
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

            let mouseDocument = d3.mouse(document.getElementById("document"));
            let mouseDocumentX = mouseDocument[0];
            let mouseDocumentY = mouseDocument[1];

            const tooltipWidth = 230;
            let tooltipBoxLeft;
            if (mouseDocumentX > document.body.clientWidth - margin.right - tooltipWidth) {
                tooltipBoxLeft = mouseDocumentX - tooltipWidth - 7;
            } else {
                tooltipBoxLeft = mouseDocumentX + 2;
            }

            d3.select(this)
                .classed("hover", true)
                .attr("stroke", strokecolor)
                .attr("stroke-width", "0.5px")
            tooltip
                .html("<div style='font-size:16px; border-width: 1px; border-radius:10px; border-color:gray; background-color:white; opacity:0.9; border-style:solid; width:" + tooltipWidth + "px'>" + "&nbsp;" + d.key + "<br>&nbsp;" + valueData + "</div>")
                .style("left", tooltipBoxLeft + "px")
                .style("top", mouseDocumentY - 40 + "px")
                .style("visibility", "visible");
        })
        .on("mouseout", function(d, i) {
            svg.selectAll(".layer")
                .transition()
                .duration(250)
                .attr("opacity", "1");
            d3.select(this)
                .classed("hover", false)
                .attr("stroke-width", "0px")
            tooltip.style("visibility", "hidden");
        })

    var lineHeight = height - spaceBottomY + "px";
    var lineTop = d3.select(".chart").node().offsetTop + margin.top + "px";
    var lineBottom = d3.select(".chart").node().getBoundingClientRect().bottom  + "px";
    var lineLeft = d3.select(".chart").node().getBoundingClientRect().left  + "px";
    var vertical = d3.select(".chart")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "19")
        .style("width", "2px")
        .style("height", lineHeight)
        .style("top", lineTop)
        .style("bottom", lineBottom)
        .style("left", lineLeft)
        .style("background", "#ffffff")
        .style("visibility", "hidden");

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
}

function transition() {
    if (year === 2019) {
        d3.select(".corona").style("opacity", 0)
        x.domain(d3.extent(data2019, function (d) {
            return d.date;
        }));
    } else if (year === 2020) {
        d3.select(".corona").style("opacity", 1)
        x.domain(d3.extent(data2020, function (d) {
            return d.date;
        }));
    }
    var t;
    d3.selectAll("path")
        .data((t= layers1, layers1 = layers0, layers0 = t))
        .transition()
        .duration(1500)
        .attr("d", function(d) { return area(d.values);});
}

function changeYear(newYear) {
    if (year === newYear) {
        return
    }
    year = newYear
    transition();
}

function start() {
    loadPromise().then(() => {
        setUpGraph()
    })
}

start()