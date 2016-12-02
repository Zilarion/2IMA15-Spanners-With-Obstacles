define(['../core/Graph', '../algorithms/Greedy'], function(Graph, greedy) {
	var settings = {
		w: window.innerWidth - 20,
		h: window.innerHeight - 60,
		t: 1.1
	}

	var g = new Graph();
	var svg = d3.select("#view").append("svg").attr("width", settings.w).attr("height", settings.h).style("border", "1px solid black");


	var result = {
		view: svg,
		graph: g,
		update: function(data) {
			svg
				.selectAll("circle")
				.remove();

			svg
				.selectAll("line")
				.remove();

			var nodes = svg
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
			var text = svg.selectAll("text")
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

			var edges = svg
				.selectAll("line")
				.data(data.edges)
				.enter()
				.append("line")


			var edgeAttr = edges
				.attr("x1", function (d) { return d.source.x; })
				.attr("y1", function (d) { return d.source.y; })
				.attr("x2", function (d) { return d.target.x; })
				.attr("y2", function (d) { return d.target.y; })
				.style("stroke", "grey" )
		  //   .attr( "opacity", 0 )
				// .transition()
				// 	.delay(function(d, i) { return i * 10 })
		  //   	.duration(10)
		  //   	.attr( "opacity", 1 );
		},

	 	recalculate: function() {
		  g.clearEdges();
			greedy(g, settings.t);
		  this.update(g);
		},

		updateSettings: function() {
			tvalue = parseFloat(document.getElementById('tvalue').value);
			if (tvalue != NaN && tvalue >= 1) {
				settings.t = tvalue;
			}
			this.recalculate();
		}
	}

	svg.on("click", function() {
		var coords = d3.mouse(this);
	  var newData= {
			x: Math.round(coords[0]),
	    y: Math.round(coords[1])
	  };
	  var nodes = g.nodes;
	  g.addNode(nodes.length + 1, newData.x, newData.y);
	  result.recalculate(g);
	});

	function getRandomArbitrary(min, max) {
	  return Math.random() * (max - min) + min;
	}

	for (var i = 0; i < 50; i++) {
		g.addNode(g.nodes.length, getRandomArbitrary(0, settings.w), getRandomArbitrary(0, settings.h))
	}
	return result;
});