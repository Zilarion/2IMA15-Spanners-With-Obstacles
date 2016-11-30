var w = 1000;
var h = 600;

var svg = d3.select("#view").append("svg").attr("width", w).attr("height", h).style("border", "1px solid black");


var g = new Graph();
g.load(data);

greedy_spanner(g);

function update() {
	var nodes = svg
		.selectAll("circle")
		.data(g.nodes)
		.enter()
		.append("circle");

	var nodeAttr = nodes
		.attr("cx", function (d) { return d.x; })
		.attr("cy", function (d) { return d.y; })
		.attr("r", function (d) { return 2; })
		.style("fill", function(d) { return "blue"; });


	var edges = svg
		.selectAll("line")
		.data(g.edges)
		.enter()
		.append("line");

	var edgeAttr = edges
		.attr("x1", function (d) { return d.source.x; })
		.attr("y1", function (d) { return d.source.y; })
		.attr("x2", function (d) { return d.target.x; })
		.attr("y2", function (d) { return d.target.y; })
		.style("stroke", function(d) { return "grey"; });

	console.log(edges)
}

update();

svg.on("click", function() {
	var coords = d3.mouse(this);
    var newData= {
		x: Math.round(coords[0]),
        y: Math.round(coords[1])
    };
    data.nodes.push(newData);
    update();
});
