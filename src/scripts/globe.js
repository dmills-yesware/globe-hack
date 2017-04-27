"use strict";

require("../styles/main.scss");
import * as d3 from 'd3';
import * as topojson from 'topojson';

var canvas = d3.select("#world-map");
var width = canvas.property("width");
var height = canvas.property("height");
var context = canvas.node().getContext("2d");

var projections = {
    "Mercator": d3.geoMercator()
        .translate([width / 2, height / 2])
        .precision(0.1),
    "Orthographic": d3.geoOrthographic()
        .scale((height - 10) / 2)
        .translate([width / 2, height / 2])
        .precision(0.1)
};

var projection = projections["Mercator"];

var projectionSelector = d3
    .select(".projection-selector")
    .on('change', onProjectionChange);

var options = projectionSelector
    .selectAll('option')
    .data(Object.keys(projections))
    .enter()
    .append('option')
    .text(function (d) { return d; });


function onProjectionChange() {
    projection = projections[projectionSelector.property('value')];
    render();
}

var render;

d3.json("data/world-50m.json", function(error, world) {
    if (error) throw error;

    var sphere = { type: "Sphere" };
    var land = topojson.feature(world, world.objects.land);

    render = function() {
        var path = d3.geoPath()
            .projection(projection)
            .context(context);

        context.clearRect(0, 0, width, height);

        // Without land we just have ocean
        context.beginPath();
        path(sphere);
        context.fillStyle = "#C0E7FF";
        context.fill();

        // Draw the land
        context.beginPath();
        path(land);
        context.fillStyle = "#333";
        context.fill();

        // Draw the circle around the outside
        context.beginPath();
        path(sphere);
        context.stroke();
    };

    render();
});
