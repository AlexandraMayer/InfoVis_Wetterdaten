var margin = {top: 20, right: 30, bottom: 0, left: 10},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

data2019 = [];
data2020 = [];
keys = [];
var layers0;
var layers1;
var layers;
var area

let loadPromise =  function loadData() {
    return new Promise((resolve, reject) => {
        setTimeout( () => {
            d3.csv("TestDaten2020.csv", function (data) {
                data2020 = data;
                keys = data.columns.slice(1)
                d3.csv("TestDaten2019.csv", function (data) {
                    data2019 = data
                    resolve([data2019, data2020])
                })
            })
        } , 2000
        );
    });
}

function setUpGraph() {
    var x = d3.scaleLinear()
        .domain(d3.extent(year === 2019 ? data2019 : data2020, function(d) {
            return Number(d.Monat); }))
        .range([ 0, width ]);

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height)
        .text("Monat");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([-2, 2])
        .range([ height, 0 ]);

    // color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeDark2);

    //stack the data?
    var stackedData = d3.stack().keys(keys).offset(d3.stackOffsetWiggle)
    layers1 = stackedData(data2019)
    layers0 = stackedData(data2020)
    layers = layers0.concat(layers1);

    // create a tooltip
    var Tooltip = svg
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("opacity", 0)
        .style("font-size", 17)

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
        Tooltip.style("opacity", 1)
        d3.selectAll(".myArea").style("opacity", .2)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }
    var mousemove = function(d,i) {
        grp = keys[i]
        Tooltip.text(grp)
    }
    var mouseleave = function(d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
    }

    // Area generator
    area = d3.area()
        .x(function(d) { return x(d.data.Monat); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })

    // Show the areas
    svg
        .selectAll("mylayers")
        .data(layers0)
        .enter()
        .append("path")
        .attr("class", "myArea")
        .style("fill", function(d) { return color(d.key); })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

}

function transition() {
    var t;
    d3.selectAll("path").data((t= layers1, layers1 = layers0, layers0 = t)).transition().duration(2500).attr("d", area);
}

year = 2020;

function changeYear(newYear) {
    if (year === newYear) {
        return
    }
    year = newYear
    transition();
}

function start() {
    loadPromise().then((res) => {
        setUpGraph()
    })
}

start()