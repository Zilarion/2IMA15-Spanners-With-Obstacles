define(['../core/Graph', '../algorithms/Greedy', '../algorithms/WSPD', '../../data', '../core/Util'], function(Graph, greedy, wspd, inputData, util) {
	return {
		// Parameters
		lastRun: 0,					// How long the last run took in ms
		g: null, 						// Graph
		container: null, 		// the container used
		settings: {					// The settings of the visualization
			w: 1920,
			h: 1080,
			t: 1.1
		},
		init: function() {

			var selector = document.getElementById('selectedObstacle');
			for (var obs in inputData.obstacles){
				if (!this.obstacles){
					this.obstacles = inputData.obstacles[obs];
				}
				var opt = document.createElement("option");
				opt.innerHTML = obs;
				selector.appendChild(opt)
			}

			this.g = new Graph();
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

		  this.lastRun = 0;

		  var that = this;
			this.svg.on("click", function() {
				var coords = d3.mouse(this);
			  var newData= {
					x: Math.round(coords[0]),
			    y: Math.round(coords[1])
			  };
			  var nodes = that.g.nodes;
			  that.g.addNode(nodes.length + 1, newData.x, newData.y);
			  that.recalculate();
			});

			function getRandomArbitrary(min, max) {
			  return Math.random() * (max - min) + min;
			}

			for (var i = 0; i < 10; i++) {
				this.g.addNode(this.g.nodes.length, getRandomArbitrary(0, this.settings.w), getRandomArbitrary(0, this.settings.h))
			}
			this.recalculate();
		},
		// Update the visualization
		update: function() {
			var data = this.g;

			this.svg
				.selectAll("circle")
				.remove();

			this.svg
				.selectAll("line")
				.remove();
				
			this.svg
				.selectAll("polyline")
				.remove();

			this.svg
				.selectAll("text")
				.remove();


			//obstacles
			this.svg.selectAll("polyline")
				.data(this.obstacles)
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

			var nodeAttr = nodes
				.attr("cx", function (d) { return d.x; })
				.attr("cy", function (d) { return d.y; })
				.attr("r", function (d) { return 2; })
				.style("fill", "blue");

			//Add the SVG Text Element to the svgContainer
			var text = this.svg.selectAll("text")
				.data(data.nodes)
				.enter()
				.append("text");

			//Add SVG Text Element Attributes
			var textLabels = text
			 .attr("x", function(d) { return d.x - 3; })
			 .attr("y", function(d) { return d.y - 3; })
			 .text( function (d) { return d.id })
			 .attr("font-family", "sans-serif")
			 .attr("font-size", "12px")
			 .attr("fill", "red");

			var edges = this.svg
				.selectAll("line")
				.data(data.circedge)
				.enter()
				.append("line")

			var edgeAttr = edges
				.attr("x1", function (d) { return d.x1; })
				.attr("y1", function (d) { return d.y1; })
				.attr("x2", function (d) { return d.x2; })
				.attr("y2", function (d) { return d.y2; })
				.style("stroke", "grey" )
				.attr( "opacity", 0.2 )

			// var edgeAttr = edges
			// 	.attr("x1", function (d) { return d.source.x; })
			// 	.attr("y1", function (d) { return d.source.y; })
			// 	.attr("x2", function (d) { return d.target.x; })
			// 	.attr("y2", function (d) { return d.target.y; })
			// 	.style("stroke", "grey" )
		 //    .attr( "opacity", 0.2 )
				// .transition()
				// 	.delay(function(d, i) { return i * 10 })
		  //   	.duration(10)
		  //   	.attr( "opacity", 1 );

			var rects = this.svg
							.selectAll("rect")
							.data(data.rects)
							.enter()
							.append("rect");

			var rectattr = rects
				.attr("x", function (d) { return d.x; })
				.attr("y", function (d) { return d.y; })
				.attr("width", function (d) { return d.width; })
				.attr("height", function (d) { return d.height; })
				.style("stroke", "grey" )
				.style("fill", "none" )
				.style("opacity", "0.1" )

			var circles = this.svg
						.selectAll("circle")
						.data(data.circles)
						.enter()
						.append("circle");

			var cirattr = circles
				.attr("cx", function (d) { return d.x; })
				.attr("cy", function (d) { return d.y; })
				.attr("r", function (d) { return d.r == 0 ? 5 : d.r; })
				.style("stroke", "grey" )
				.style("fill", "none" )
				.style("opacity", "1" )

		  $("#d_nodes").html(data.nodes.length);
		  $("#d_edges").html(data.edges.length);
		  $("#d_weight").html(data.totalWeight().toFixed(3));
		  $("#d_time").html(lastRun.toFixed(0) + " ms");
		},
	 	recalculate: function() {
		  this.g.clearEdges();

		  var t0 = performance.now();
			// greedy(this.g, this.settings, this.obstacles);
			wspd(this.g, this.settings);
			var t1 = performance.now();
			lastRun = t1 - t0;

		  this.update();

		},
		// Update the settings based on the input values
		updateSettings: function() {
			tvalue = parseFloat(document.getElementById('tvalue').value);	
			selectedObstacle = document.getElementById('selectedObstacle').value;
			newObstacles = inputData.obstacles[selectedObstacle];
			if (newObstacles){
				this.obstacles = newObstacles;
			}
			if (tvalue != NaN && tvalue >= 1) {
				this.settings.t = tvalue;
			}


			this.recalculate();
		},
		// Clear all points from the graph
		clearPoints: function(){
			this.g.nodes = [];
			this.recalculate();
		}
	}
});