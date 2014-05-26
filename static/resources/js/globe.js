;(function(w, d3, undefined){
    "use strict";

    var width, height;
    function getSize(){
        width = w.innerWidth,
        height = w.innerHeight;

        if(width === 0 || height === 0){
            setTimeout(function(){
                getSize();
            }, 100);
        }
        else {
            init();
        }
    }

    var color_map = {
	0: "#FF0000",
	1: "#FF0000",
	2: "#FF5500",
	3: "#FF9100",
	4: "#FFB300",
	5: "#FFFF00",
	6: "#DEFF00",
	7: "#B3FF00",
	8: "#91FF00",
	9: "#00FF00",
    }

    function init(){

        //Setup path for outerspace
        var space = d3.geo.azimuthal()
            .mode("equidistant")
            .translate([width / 2, height / 2]);

        space.scale(space.scale() * 2);

        var spacePath = d3.geo.path()
            .projection(space)
            .pointRadius(1);

        //Setup path for globe
        var projection = d3.geo.azimuthal()
            .mode("orthographic")
            .translate([width / 2, height / 2]);

        var scale0 = projection.scale();

        var path = d3.geo.path()
            .projection(projection)
            .pointRadius(2);

        //Setup zoom behavior
        var zoom = d3.behavior.zoom(true)
            .translate(projection.origin())
            .scale(projection.scale())
            .scaleExtent([100, 800])
            .on("zoom", move);

        var circle = d3.geo.greatCircle();

        var svg = d3.select("#globe")
            .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                    .call(zoom)
                    .on("dblclick.zoom", null);

        svg.append("rect")
            .attr("class", "frame")
            .attr("width", width)
            .attr("height", height);

        //Create the base globe
        var backgroundCircle = svg.append("circle")
            .attr('cx', width / 2)
            .attr('cy', height / 2)
            .attr('r', projection.scale())
            .attr('class', 'globe')
            .attr("filter", "url(#glow)")
            .attr("fill", "url(#gradBlue)");

        var g = svg.append("g"),
            features;

        //Add all of the countries to the globe

        var world_countries = "/world_countries_cpi.json";
        d3.json(world_countries, function(collection) {
            features = g.selectAll(".feature").data(collection.features);
            features.enter().append("path")
                .attr("class", "feature")
                .attr("d", function(d){ return path(circle.clip(d)); });

	    var feature = g.selectAll("path")
		.data(collection.features)
		.style("fill", function(d) {
		    var cpi = d.properties.cpi;
                    var active = d.properties.active;
		    if (cpi < 100 && active) {
			return color_map[Math.floor(cpi/10)];
		    } else {
			return "#808080"
		    }
		})
		.append("svg:title")
		.text(function(d) { return d.properties.name + ": " + d.properties.cpi; });

        });

        //Redraw all items with new projections
        function redraw(){
            features.attr("d", function(d){
                return path(circle.clip(d));
            });
        }


        function move() {
            if(d3.event){
                var scale = d3.event.scale;
                var origin = [d3.event.translate[0] * -1, d3.event.translate[1]];

                projection.scale(scale);
                space.scale(scale * 3);
                backgroundCircle.attr('r', scale);
                path.pointRadius(2 * scale / scale0);

                projection.origin(origin);
                circle.origin(origin);

                var spaceOrigin = [origin[0] * -1, origin[1] * -1];
                space.origin(spaceOrigin);
                redraw();
            }
        }

        function randomLonLat(){
            return [Math.random() * 360 - 180, Math.random() * 180 - 90];
        }
    }

    getSize();

}(window, d3));
