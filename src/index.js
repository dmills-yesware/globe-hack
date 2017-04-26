require("./styles/main.scss");
import * as d3 from 'd3';
import * as topojson from 'topojson';

let canvas = d3.select("#world-map");
let width = canvas.property("width");
let height = canvas.property("height");
let context = canvas.node().getContext("2d");

let projection = d3.geoOrthographic()
    .translate([width / 2, height / 2])
    .precision(0.1);

let path = d3.geoPath()
    .projection(projection)
    .context(context);

d3.json("data/world-50m.json", function(error, world) {
    if (error) throw error;

    var sphere = { type: "Sphere" };
    var land = topojson.feature(world, world.objects.land);

    let render = function() {
        context.clearRect(0, 0, width, height);

        // White-out the area where we're drawing the earth
        context.beginPath();
        path(sphere);
        context.fillStyle = "#fff";
        context.fill();

        // Draw the land
        context.beginPath();
        path(land);
        context.fillStyle = "#000";
        context.fill();

        // Draw the circle around the outside
        context.beginPath();
        path(sphere);
        context.stroke();
    };

    render();
});
