// Most of this is stolen from https://bl.ocks.org/mbostock/3711652
"use strict";

require("../styles/main.scss");

var topojson = require("topojson");
var d3 = Object.assign({},
    require("d3"),
    require("d3-time"),
    require("d3-time-format"),
    require("d3-geo"),
    require("d3-geo-projection"));

var width = 960;
var height = 500;

var projections = [
    {name: "Aitoff", projection: d3.geoAitoff()},
    {name: "Albers", projection: d3.geoAlbers().scale(145).parallels([20, 50])},
    {name: "August", projection: d3.geoAugust().scale(60)},
    {name: "Baker", projection: d3.geoBaker().scale(100)},
    {name: "Boggs", projection: d3.geoBoggs()},
    {name: "Bonne", projection: d3.geoBonne().scale(120)},
    {name: "Bromley", projection: d3.geoBromley()},
    {name: "Collignon", projection: d3.geoCollignon().scale(93)},
    {name: "Craster Parabolic", projection: d3.geoCraster()},
    {name: "Eckert I", projection: d3.geoEckert1().scale(165)},
    {name: "Eckert II", projection: d3.geoEckert2().scale(165)},
    {name: "Eckert III", projection: d3.geoEckert3().scale(180)},
    {name: "Eckert IV", projection: d3.geoEckert4().scale(180)},
    {name: "Eckert V", projection: d3.geoEckert5().scale(170)},
    {name: "Eckert VI", projection: d3.geoEckert6().scale(170)},
    {name: "Eisenlohr", projection: d3.geoEisenlohr().scale(60)},
    {name: "Equirectangular (Plate Carrée)", projection: d3.geoEquirectangular()},
    {name: "Hammer", projection: d3.geoHammer().scale(165)},
    {name: "Hill", projection: d3.geoHill()},
    {name: "Goode Homolosine", projection: d3.geoHomolosine()},
    {name: "Kavrayskiy VII", projection: d3.geoKavrayskiy7()},
    {name: "Lambert cylindrical equal-area", projection: d3.geoCylindricalEqualArea()},
    {name: "Lagrange", projection: d3.geoLagrange().scale(120)},
    {name: "Larrivée", projection: d3.geoLarrivee().scale(95)},
    {name: "Laskowski", projection: d3.geoLaskowski().scale(120)},
    {name: "Loximuthal", projection: d3.geoLoximuthal()},
    // (Broken) {name: "Mercator (broken)", projection: d3.geoMercator().scale(90)},
    {name: "Miller", projection: d3.geoMiller().scale(100)},
    {name: "McBryde–Thomas Flat-Polar Parabolic", projection: d3.geoMtFlatPolarParabolic()},
    {name: "McBryde–Thomas Flat-Polar Quartic", projection: d3.geoMtFlatPolarQuartic()},
    {name: "McBryde–Thomas Flat-Polar Sinusoidal", projection: d3.geoMtFlatPolarSinusoidal()},
    {name: "Mollweide", projection: d3.geoMollweide().scale(165)},
    {name: "Natural Earth", projection: d3.geoNaturalEarth()},
    {name: "Nell–Hammer", projection: d3.geoNellHammer()},
    {name: "Orthographic (somewhat broken)", projection: d3.geoOrthographic().scale((height - 10) / 2)},
    {name: "Polyconic", projection: d3.geoPolyconic().scale(100)},
    {name: "Robinson", projection: d3.geoRobinson()},
    {name: "Sinusoidal", projection: d3.geoSinusoidal()},
    {name: "Sinu-Mollweide", projection: d3.geoSinuMollweide()},
    {name: "van der Grinten", projection: d3.geoVanDerGrinten().scale(75)},
    {name: "van der Grinten IV", projection: d3.geoVanDerGrinten4().scale(120)},
    {name: "Wagner IV", projection: d3.geoWagner4()},
    {name: "Wagner VI", projection: d3.geoWagner6()},
    {name: "Wagner VII", projection: d3.geoWagner7()},
    {name: "Winkel Tripel", projection: d3.geoWinkel3()}
];

projections.forEach((o) => {
    o.projection.rotate([0, 0]).center([0, 0]);
});

var projectionSelector = d3.select(".projection-selector")
    .on("change", onProjectionChange);

projectionSelector.selectAll("option")
    .data(projections)
    .enter().append("option")
    .text(function(d) { return d.name; });

var currentProjection = projections[0].projection;

var path = d3.geoPath(currentProjection);

// A "graticule" is a network of lines representing meridians and parallels
var graticule = d3.geoGraticule();

// SVG into which we'll draw
var svg = d3.select(".container").append("svg")
    .attr("width", width)
    .attr("height", height);

// Draw the map outline (it's only a Sphere before being projected)
svg.append("defs").append("path")
    .datum({ type: "Sphere" })
    .attr("id", "sphere")
    .attr("d", path);
svg.append("use")
    .attr("class", "stroke")
    .attr("xlink:href", "#sphere");
svg.append("use")
    .attr("class", "ocean")
    .attr("xlink:href", "#sphere");

// Draw the graticule
svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

// Draw the world
d3.json("data/world-110m.json", (error, world) => {
    if (error) throw error;

    // Draw the land
    svg.insert("path", ".graticule")
        .datum(topojson.feature(world, world.objects.land))
        .attr("class", "land")
        .attr("d", path);
});

function onProjectionChange() {
    update(projections[this.selectedIndex]);
}

function update(newProjection) {
    svg.selectAll("path")
        .transition()
        .duration(750)
        .attrTween("d", projectionTween(currentProjection, newProjection.projection));

    currentProjection = newProjection.projection;
}

function projectionTween(projection0, projection1) {
    return function(d) {
        var t = 0;

        var projection = d3.geoProjection(project)
            .scale(1)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath(projection);

        function project(λ, φ) {
            λ *= 180 / Math.PI, φ *= 180 / Math.PI;
            var p0 = projection0([λ, φ]), p1 = projection1([λ, φ]);
            return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]];
        }

        return function(_) {
            t = _;
            return path(d);
        };
    };
}

// Satellites
// Based on https://bl.ocks.org/syntagmatic/6c149c08fc9cde682635

var satellitejs = require("satellite.js");

var satelliteDatas = [
    { name: "", file: "none" },
    { name: "Space Stations", file: "data/stations.txt" },
    { name: "Geostationary Satellites", file: "data/geostationary.txt" },
    { name: "GPS Satellites", file: "data/gps.txt" },
    { name: "Science Satellites", file: "data/science.txt" },
    { name: "Weather Satellites", file: "data/weather.txt" },
    { name: "Cube Satellites", file: "data/cubesats.txt" },
    { name: "FLOCK 3P 25", file: "data/flock3p25.txt" },
    { name: "zomg satellites!", file: "all" }
];

var satSelector = d3.select(".sat-selector")
    .on("change", drawSatellites);

satSelector.selectAll("option")
    .data(satelliteDatas)
    .enter().append("option")
    .text(function(d) { return d.name; });

var clearSatellites = () => {
    if (timer) {
        timer.stop();
    }
    d3.selectAll(".satellite-group").remove();
};

d3.select(".run").on("click", () => {
    if (timer) {
        timer.stop();
        timer = null;
    } else {
        drawSatellites();
    }
});

function drawSatellites() {
    clearSatellites();

    var allSatFiles = () => {
        return satelliteDatas
            .filter(d => d.file !== "all" && d.file !== "none")
            .map(d => d.file);
    };

    var satData = satelliteDatas[satSelector.property("selectedIndex")];

    if (satData.file === "none") {
        return;
    }

    var satFiles = satData.file === "all" ? allSatFiles() : [ satData.file ];
    var satDataQueue = d3.queue();
    satFiles.forEach(file => satDataQueue.defer(d3.text, file));

    loadSatData(satDataQueue);
}

var loadSatData = (satDataQueue) => {
    satDataQueue.awaitAll((error, files) => {
        if (error) throw error;

        var satellites = [];
        var data = files.join("\n");
        var lines = data.split("\n");
        lines.forEach(function(line) {
            if (line.length == 0) return;

            if (line[0] == "1") {
                let obj = satellites[satellites.length-1];
                obj.tle1 = line;
                return;
            }

            if (line[0] == "2") {
                let obj = satellites[satellites.length-1];
                obj.tle2 = line;
                return;
            }

            satellites.push({
                name: line.trim()
            });
        });

        startTimer(satellites);
    });
};

var timer;
var now = new Date();
var startTimer = (satellites) => {
    var timeFormat = d3.timeFormat("%Y-%m-%d %H:%M");
    var speed = 500; // N times faster than real time

    timer = d3.timer(function(elapsed) {
        var time = new Date(now.getTime() + speed*elapsed);

        // Display the current time
        d3.select(".time").text(timeFormat(time));

        satellites.forEach(function(sat) {
            plotsat(sat, time);
        });
    });
};

function plotsat(satellite, time) {
    var satrec = satellitejs.twoline2satrec(satellite.tle1, satellite.tle2);

    // increment time by 5 minutes

    var positionAndVelocity = satellitejs.propagate(
        satrec,
        time.getUTCFullYear(),
        time.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
        time.getUTCDate(),
        time.getUTCHours(),
        time.getUTCMinutes(),
        time.getUTCSeconds()
    );

    if (!positionAndVelocity.position) {
        if (time.getTime() - now.getTime() > 1000) return;
        console.log("No position data for:");
        console.log(satellite, satrec);
        return;
    }

    var gmst = satellitejs.gstimeFromDate(
        time.getUTCFullYear(),
        time.getUTCMonth() + 1, // Note, this function requires months in range 1-12.
        time.getUTCDate(),
        time.getUTCHours(),
        time.getUTCMinutes(),
        time.getUTCSeconds()
    );

    // The position_velocity result is a key-value pair of ECI coordinates.
    // These are the base results from which all other coordinates are derived.
    var positionEci = positionAndVelocity.position,
        velocityEci = positionAndVelocity.velocity;

    var positionGd = satellitejs.eciToGeodetic(positionEci, gmst);
    drawSat(satellite, positionGd);
}

function drawSat(sat, pos) {
    var xy = currentProjection([pos.longitude*180/Math.PI, pos.latitude*180/Math.PI]);

    var satDomId = sat.name.replace(/^[^a-z]+|[^\w:-]+/gi, "");
    var group = d3.select("#" + satDomId);
    if (!group.size()) {
        group = svg.append("g")
            .attr("class", "satellite-group")
            .attr("id", satDomId);

        // A dot for the satellite
        group.append("circle")
            .attr("cx", -2)
            .attr("cy", -8)
            .attr("class", "satellite")
            .attr("r", 4);

        // Name label
        group.append("text")
            .attr("x", 4)
            .attr("y", 4)
            .attr("class", "satellite-label")
            .text(sat.name);
    }

    group.attr("transform", `translate(${xy[0]}, ${xy[1]})`);
}

// Load the default satellite data right away
drawSatellites();
