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

function drawGraph(){
    // Parse the Data
    d3.csv(inputFile, function(data) {
        // Reset graph params
        svg.selectAll('*').remove();
        // List of groups = header of the csv files
        var keys = data.columns.slice(1);

        console.log(keys);

        // Add X axis
        var x = d3.scaleLinear()
            .domain(d3.extent(data, function(d) {
                console.log(d.Monat);
                return Number(d.Monat); }))
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height*0.9 + ")")
            .call(d3.axisBottom(x));
        //.select(".domain").remove()
        // Customization
        //svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height)
            .text("Month");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([-2, 2])
            .range([ height, 0 ]);

        // color palette
        var color = d3.scaleOrdinal()
            .domain(keys)
            .range(d3.schemeDark2);

        //stack the data?
        var stackedData = d3.stack()
            .offset(d3.stackOffsetSilhouette)
            .keys(keys)
            (data)

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
        var area = d3.area()
            .x(function(d) { return x(d.data.Monat); })
            .y0(function(d) { return y(d[0]); })
            .y1(function(d) { return y(d[1]); })

        // Show the areas
        svg
            .selectAll("mylayers")
            .data(stackedData)
            .enter()
            .append("path")
            .attr("class", "myArea")
            .style("fill", function(d) { return color(d.key); })
            .attr("d", area)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

    })
}

inputFile="TestDaten2020.csv";

function changeYear(year) {
    inputFile=`TestDaten${year}.csv`;
    console.log(inputFile);
    drawGraph();
}

drawGraph();