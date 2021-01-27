var datearray = [];
//colorrange = ["#7796BC", "#997AC0", "#95DF85"];
colorrange = ["#03DAC6", "#3700B3", "#B00020"];
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

/**
 * Daten aus Dateien zu Laden. In Promise, damit der Graph erst gezeichnet wird, wenn die Daten geladen sind.
 * @returns {Promise}
 */
let loadPromise =  function loadData() {
    return new Promise((resolve, reject) => {
        try {
            d3.csv("Daten2020.csv", function (data) {
                data2020 = data;
                try {
                    d3.csv("Daten2019.csv", function (data) {
                        data2019 = data;
                        resolve()
                    })
                } catch (error) {
                    reject(error);
                }
            })
        } catch (error) {
            reject(error);
        }
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

var germanFormatters = d3.locale({
    "decimal": ",",
    "thousands": ".",
    "grouping": [3],
    "currency": ["€", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%d.%m.%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    "shortDays": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    "months": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    "shortMonths": ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
});

var customTimeFormat = germanFormatters.timeFormat.multi([
    [".%L", function(d) { return d.getMilliseconds(); }],
    [":%S", function(d) { return d.getSeconds(); }],
    ["%I:%M", function(d) { return d.getMinutes(); }],
    ["%Hh", function(d) { return d.getHours(); }],
    ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
    ["%b %d", function(d) { return d.getDate() != 1; }],
    ["%B", function(d) { return d.getMonth()+1; }],
    ["%Y", function() { return true; }]
]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(customTimeFormat);

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

/**
 * Funktion, die den Graphen erstellt. Wird nur einmal ganz am Anfang aufgerufen (bei Wechsel nur noch tranisiton)
 */
function setUpGraph() {

    // Je nach dem welches Jahr zu Beginn gesetzt wurde (siehe Anfang Datei), Daten in Array laden und Button auswählen.
    var data = []
    if (year === 2020) {
        document.getElementById("btn20").checked = true;
        data = data2020
    } else if (year === 2019) {
        document.getElementById("btn19").checked = true;
        data = data2019
    }

    // Daten für 2019 und 2020 verarbeiten
    data2019.forEach(function (d) {
        d.date = format.parse(d.date);
        d.normvalue = +d.normvalue;
    });
    data2020.forEach(function (d) {
        d.date = format.parse(d.date);
        d.normvalue = +d.normvalue;
    });

    // Stacked layers für Streamgraph für 2019 und 2020 erstellen)
    layers0 = stack(nest.entries(data2020));
    layers1 = stack(nest.entries(data2019));

    // layers tauschen wenn 2019 als erstes ausgewählt ist
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
        .call(xAxis)
        .selectAll(".tick text")
        .style("text-anchor", "center")
        .attr("x",width/24);

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
            svg.selectAll(".layer")
                .transition(name = "mouseoverOpacity")
                .duration(250)
                .attr("opacity", function(d, j) {
                    return j !== i ? 0.6 : 1;
                })})

        .on("mousemove", function(d) {
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

            let tooltipValueData;
            let tooltipBorderColor;
            if (d.key === "Gesamt Corona Positive") {
                tooltipValueData = valueData + " Personen";
                tooltipBorderColor = colorrange[0];
            } else if (d.key === "Anzahl Flüge Deutschland") {
                tooltipValueData = valueData + " Flüge";
                tooltipBorderColor = colorrange[1];
            } else if (d.key === "Abweichung Wettervorhersage") {
                tooltipValueData = valueData + " °C";
                tooltipBorderColor = colorrange[2];
            }
            tooltip
                .html("<div class='tooltipBox' style='width:" + tooltipWidth + "px; border-color:" + tooltipBorderColor
                    + "'> &nbsp;" + d.key + "<br>&nbsp;" + tooltipValueData + "</div>")
                .style("left", tooltipBoxLeft + "px")
                .style("top", mouseDocumentY - 40 + "px")
                .style("visibility", "visible");
        })
        .on("mouseout", function() {
            svg.selectAll(".layer")
                .transition(name = "mouseoutOpacity")
                .duration(250)
                .attr("opacity", "1");
            d3.select(this)
                .classed("hover", false)
                .attr("stroke-width", "0px")
            tooltip.style("visibility", "hidden");
        })

    var lineHeight = height + "px";
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
        .style("background", "#007e90")
        .style("visibility", "hidden");

    d3.select(".chart")
        .on("mousemove", function(){
            mouse = d3.mouse(this);
            mouseX = mouse[0] + 5;
            if (mouseX < margin.left + 9 || mouseX > width + margin.right - 22) {
                vertical.style("visibility", "hidden");
            } else {
                vertical.style("left", mouseX + "px" ).style("visibility", "visible");
            }
        })
        .on("mouseout", function (){
            vertical.style("visibility", "hidden");
        });
}

/**
 * Übergang zwischen den Jahren animieren
 */
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
    // Layers austauschen und Übergang animieren
    var t;
    d3.selectAll("path")
        .data((t= layers1,
        layers1 = layers0,
        layers0 = t))
        .transition(name = "changeLayers")
        .duration(1500)
        .attr("d", function(d) { return area(d.values);});
}

/**
 * Funktion, die aufgerufen wird, wenn einer der Jahreszahlenbuttons geklickt wurde. Animation des Übergangs wird
 * aufgerufen, wenn sich das Jahr verändert hat.
 *
 * @param newYear: das Jahr, das zu dem Button gehört der geklickt wurde.
 */
function changeYear(newYear) {
    if (year === newYear) {
        return;
    }
    year = newYear;
    transition();
}

/**
 * Funktion zur Erstellung des Graphen. Zuerst werde Daten geladen, wenn diese Promise resolved ist, wird der Graph
 * erstellt.
 */
function start() {
    loadPromise().then(() => {
        setUpGraph()
    }).catch((reason) => {
        console.error("Something went wrong while loading the Data: " + reason)
    })
}

//Erstellen des Graphen
start();