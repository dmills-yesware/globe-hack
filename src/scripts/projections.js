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
  //  {name: "Mercator", projection: d3.geoMercator().scale(490 / 2 / Math.PI)},
    {name: "Miller", projection: d3.geoMiller().scale(100)},
    {name: "McBryde–Thomas Flat-Polar Parabolic", projection: d3.geoMtFlatPolarParabolic()},
    {name: "McBryde–Thomas Flat-Polar Quartic", projection: d3.geoMtFlatPolarQuartic()},
    {name: "McBryde–Thomas Flat-Polar Sinusoidal", projection: d3.geoMtFlatPolarSinusoidal()},
    {name: "Mollweide", projection: d3.geoMollweide().scale(165)},
    {name: "Natural Earth", projection: d3.geoNaturalEarth()},
    {name: "Nell–Hammer", projection: d3.geoNellHammer()},
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

// The projection selector
var menu = d3.select(".projection-selector")
    .on("change", onChange);

menu.selectAll("option")
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

function onChange() {
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

var satellite = require("satellite.js");

d3.text("data/stations.txt", function(error, data) {
    if (error) throw error;

    var stations = [];
    var lines = data.split("\n");
    lines.forEach(function(line) {
        if (line.length == 0) return;

        if (line[0] == "1") {
            let obj = stations[stations.length-1];
            obj.tle1 = line;
            return;
        }

        if (line[0] == "2") {
            let obj = stations[stations.length-1];
            obj.tle2 = line;
            return;
        }

        stations.push({
            name: line.trim()
        });
    });

    var now = new Date();
    var timeFormat = d3.timeFormat("%Y-%m-%d %H:%M");

    d3.timer(function(elapsed) {
        var time = new Date(now.getTime() + 300*elapsed);
        //context2.clearRect(0,0,width,height);
        //
        //context2.font = "bold 14px sans-serif";
        //context2.fillStyle = "#333";
        //context2.textAlign = "center";
        //context2.fillText(timeFormat(time),width/2,20);
        d3.select(".time").text(timeFormat(time));

        d3.selectAll(".satellite").remove();

        stations.forEach(function(d) {
           plotsat(d, time);
        });
    });

    function plotsat(station, time) {
        var satrec = satellite.twoline2satrec(station.tle1, station.tle2);

        // increment time by 5 minutes

        var positionAndVelocity = satellite.propagate(
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
            console.log(station, satrec);
            return;
        }

        var gmst = satellite.gstimeFromDate(
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

        var positionGd = satellite.eciToGeodetic(positionEci, gmst);
        drawSat(station, positionGd);
    }
});

function drawSat(sat, pos) {
    var name = sat.name;
    var xy = currentProjection([pos.longitude*180/Math.PI, pos.latitude*180/Math.PI]);

    svg.append("circle")
        .attr("class", "satellite")
        .attr("cx", xy[0])
        .attr("cy", xy[1])
        .attr("r", 4);

    //context2.fillStyle = color(name);
    //context2.beginPath();
    //context2.arc(xy[0],xy[1],2,0,2*Math.PI);
    //context2.fill();
    //
    //context2.font = "bold 11px sans-serif";
    //context2.textAlign = "center";
    //context2.fillText(name, xy[0], xy[1]+14);
}

