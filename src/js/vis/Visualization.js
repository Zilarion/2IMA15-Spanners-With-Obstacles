'use strict';

var d3 = require('d3');
var $ = require('jquery');
const EventEmitter = require('events');
var Spinner = require('spin');
var Loader = require('./Loader')

class Visualization extends EventEmitter {

	constructor(settings) {
		super();
		this.settings = settings;
		
		this.container = d3.select("div#container");
		var aspect = this.settings.w / this.settings.h;

		// setup svg
		this.svg = this.container
			.append("svg")
			.attr("width", this.settings.w)
			.attr("height", this.settings.h)
			.attr("ar", aspect)
			.attr("preserveAspectRatio", "xMinYMid")
	  	.classed("svg-element", true);

	 	this.view = this.svg.append("g");


		this.data = {nodes: [], edges: []};
		this.loader = new Loader({width: this.settings.w, height: this.settings.h, svg: this.svg, id: "loader"});

		this.setupListeners();
	}

	size(dimensions) {
  	this.svg
			.attr("viewBox", dimensions.xmin + " " + dimensions.ymin + " " + dimensions.xmax + " " + dimensions.ymax)
			this.settings.dim = dimensions;
	}

	setupListeners() {
		// On click
	  var that = this;
		this.svg.on("click", function() {
			var coords = d3.mouse(this);
			var svg = d3.select(".svg-element");


		  var position = {
				x: Math.round(coords[0]),
		    	y: Math.round(coords[1])
		  };


		  if (that.zoomify){
				//transform mouse coords to graph space
				var transform = that.zoomify;
				position.x = (position.x - transform.x)/transform.k;
				position.y = (position.y - transform.y)/transform.k;
		  }
		  that.emit('click', position);
		});

		// On resize		
		$(window).on("resize", function(e) {
			var targetWidth = $("div#container").width();
	    var svg = d3.select(".svg-element");
	    var aspect = svg.attr("ar");
	    var targetHeight = Math.round(targetWidth / aspect)
	    svg.attr("width", targetWidth);
	    svg.attr("height", targetHeight);
		}).trigger("resize");

		var zoom = d3.zoom()
	    .on("zoom", function () {
			that.zoomify = d3.event.transform;
	      that.view.attr("transform", d3.event.transform)
			});

		this.svg.call(zoom);
	}

	loading(status) {
		if (status) {
			this.view.selectAll("*:not(.loader)").remove();
			this.loader.opacity(1);
		} else {
			this.loader.opacity(0);
		}
	}

	// Update the visualization
	update(debug) {
		var data = this.data;
		var width = this.settings.dim.xmax - this.settings.dim.xmin;

		//obstacles
		var obstacle = this.view
			.selectAll("polyline")
		 	.data([data.obstacle])
		 	.enter()
		 	.append("polyline")
		 	.attr("points", function(d){
		 		var str = "";
		 		for (var i = 0; i < d.nodes.length; i++){
		 			str += d.getNode(i).x + "," + d.getNode(i).y + " ";
		 		}
		 		//close loop
		 		str += d.getNode(0).x + "," + d.getNode(0).y;
		 		return str;
		 	})
		 	.attr("stroke-width", width/800)
		 	.attr("stroke", "rgb(100,100,100)")
		 	.attr("fill", "rgb(220,220,220)")
			.attr( "opacity", 0.3 )
		

		var nodes = this.view
			.selectAll("circle")
			.data(data.nodes)
			.enter()
			.append("circle")
			.attr("cx", function (d) { return d.x; })
			.attr("cy", function (d) { return d.y; })
			.attr("r", function (d) { return width/400; })
			.style("fill", function(d) { return d.color ? d.color : "blue"});

		var edges = this.view
			.selectAll("line")
			.data(data.edges)
			.enter()
			.append("line")
			.attr("x1", function (d) { return d.source.x; })
			.attr("y1", function (d) { return d.source.y; })
			.attr("x2", function (d) { return d.target.x; })
			.attr("y2", function (d) { return d.target.y; })
			.style("stroke", "grey" )
			.attr("stroke-width", width/800)
			.attr( "opacity", 1 )

	  if (debug) {	  	
			//Add the SVG Text Element to the svgContainer
			var text = this.view.selectAll("text.ids")
				.data(data.nodes.concat(data.obstacle.nodes))
				.enter()
				.append("text")
				.attr("x", function(d) { return d.x + (width/1200); })
				.attr("y", function(d) { return d.y - (width/1600); })
				.text( function (d) { return d.id; })
				.attr("font-family", "sans-serif")
				.attr("font-size", (9*width)/400)
				.attr("fill", "red")
				.classed("ids", true);

			if (data.debug) {
				var dur = 500;


				if (data.debug.edges) {
					var edges = this.view
								.selectAll("line")
								.data(data.debug.edges)
								.enter()
								.append("line")
								.attr("x1", function (d) { return d.source.x; })
								.attr("y1", function (d) { return d.source.y; })
								.attr("x2", function (d) { return d.target.x; })
								.attr("y2", function (d) { return d.target.y; })
								.style("stroke", "red" )
							.attr( "opacity", 0.2 )
				}


			  if (data.debug.rects) {
					var rects = this.view
						.selectAll("rect")
						.data(data.debug.rects)
						.enter()
						.append("rect")
						.attr("x", function (d) { return d.x; })
						.attr("y", function (d) { return d.y; })
						.attr("width", function (d) { return d.width; })
						.attr("height", function (d) { return d.height; })
						.style("stroke", "grey" )
			    	.style( "fill", "none" )
			    	.style( "opacity", 0.1 )
						.transition()
							.delay(function(d, i) {
								var isEven = (i%2 == 0);
								var delay = isEven ? (i * dur) : (i-1) * dur;
								return delay;
							})
				    	.duration(dur/2)
				    	.style( "fill", function(d,i) {
				    		return (i%2 == 0) ? "red" : "green"
				    	})
			    	.on("end", function(d,i) {
			    		d3.select(this).transition()
							.delay(500).style("fill", "none");
			    	});
				}

				if (data.debug.circles) {
					var circles = this.view
						.selectAll("wspd_circle")
						.data(data.debug.circles)
						.enter()
						.append("circle")
						.attr("cx", function (d) { return d.x; })
						.attr("cy", function (d) { return d.y; })
						.attr("r", function (d) { return d.r == 0 ? 15 : d.r; })
						.style("stroke", function(d) { return d.color ? d.color : "black" } )
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
		this.svg.selectAll(".loader").raise();
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