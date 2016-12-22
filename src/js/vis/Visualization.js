'use strict';

var d3 = require('d3');
var $ = require('jquery');
const EventEmitter = require('events');

class Visualization extends EventEmitter {
	constructor(settings) {
		super();
		this.settings = settings;
		
		this.container = d3.select("div#container");
		var aspect = this.settings.w / this.settings.h;

		this.svg = this.container
			.append("svg")
			.attr("width", this.settings.w)
			.attr("height", this.settings.h)
			.attr("ar", aspect)
			.attr("preserveAspectRatio", "xMinYMid")
	  	.attr("viewBox", "0 0 " + this.settings.w + " " + this.settings.h)
	  	.classed("svg-element", true);

		// On resize		
		$(window).on("resize", function(e) {
			var targetWidth = $("div#container").width();
	    var svg = d3.select(".svg-element");
	    var aspect = svg.attr("ar");
	    var targetHeight = Math.round(targetWidth / aspect)
	    svg.attr("width", targetWidth);
	    svg.attr("height", targetHeight);
		}).trigger("resize");

		// On click
	  var that = this;
		this.svg.on("click", function() {
			var coords = d3.mouse(this);
		  var position = {
				x: Math.round(coords[0]),
		    y: Math.round(coords[1])
		  };
		  that.emit('click', position);
		});

		this.data = {nodes: [], edges: []};
	}

	// Update the visualization
	update() {
		var data = this.data;

		this.svg.selectAll("*").remove();


		//obstacles
		var obstacle = this.svg
			.selectAll("polyline")
		 	.data([data.obstacle])
		 	.enter()
		 	.append("polyline")
		 	.attr("points", function(d){
		 		var str = "";
		 		for (var i = 0; i < d.length; i++){
		 			str += d[i].x + "," + d[i].y + " ";
		 		}
		 		//close loop
		 		str += d[0].x + "," + d[0].y;
		 		return str;
		 	})
		 	.attr("stroke-width", "1px")
		 	.attr("stroke", "rgb(100,100,100)")
		 	.attr("fill", "rgb(220,220,220)");


		var nodes = this.svg
			.selectAll("circle")
			.data(data.nodes)
			.enter()
			.append("circle")
			.attr("cx", function (d) { return d.x; })
			.attr("cy", function (d) { return d.y; })
			.attr("r", function (d) { return 2; })
			.style("fill", function(d) { return d.color ? d.color : "blue"});

		//Add the SVG Text Element to the svgContainer
		var text = this.svg.selectAll("text")
			.data(data.nodes)
			.enter()
			.append("text")
			.attr("x", function(d) { return d.x - 3; })
			.attr("y", function(d) { return d.y - 3; })
			.text( function (d) { return d.id })
			.attr("font-family", "sans-serif")
			.attr("font-size", "12px")
			.attr("fill", "red");

		var edges = this.svg
			.selectAll("line")
			.data(data.edges)
			.enter()
			.append("line")
			.attr("x1", function (d) { return d.source.x; })
			.attr("y1", function (d) { return d.source.y; })
			.attr("x2", function (d) { return d.target.x; })
			.attr("y2", function (d) { return d.target.y; })
			.style("stroke", "grey" )
	    .attr( "opacity", 1 )

	  if (data.debug) {
		  if (data.debug.rects) {
				var rects = this.svg
					.selectAll("rect")
					.data(data.debug.rects)
					.enter()
					.append("rect")
					.attr("x", function (d) { return d.x; })
					.attr("y", function (d) { return d.y; })
					.attr("width", function (d) { return d.width; })
					.attr("height", function (d) { return d.height; })
					.style("stroke", "grey" )
					.style("fill", "none" )
					.style("opacity", 0.1 )
			}

			if (data.debug.circles) {
				var dur = 500;
				var circles = this.svg
					.selectAll("wspd_circle")
					.data(data.debug.circles)
					.enter()
					.append("circle")
					.attr("cx", function (d) { return d.x; })
					.attr("cy", function (d) { return d.y; })
					.attr("r", function (d) { return d.r == 0 ? 15 : d.r; })
					.style("stroke", function(d) { return d.color } )
					.style("fill", "none" ) 
		   //  	.attr( "opacity", 0 )
					// .transition()
					// 	.delay(function(d, i) {
					// 		var isEven = (i%2 == 0);
					// 		var delay = isEven ? (i * dur) : (i-1) * dur;
					// 		return delay;
					// 	})
			  //   	.duration(dur/2)
			  //   	.attr( "opacity", 1 )
		   //  	.transition()
		   //  		.delay(dur)
			  //   	.duration(dur)
			  //   	.attr( "opacity", 0 );
	    }
	  }
	}

	// Clear all points from the graph
	clearPoints(){
		this.g.nodes = [];
		this.recalculate();
	}

	setData(data) {
		this.data = data;
	}

	get height() {
		return this.settings.h;
	}
	
	get width() {
		return this.settings.w;
	}
};

module.exports = Visualization;