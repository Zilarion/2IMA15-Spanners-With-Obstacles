
// Load algorithms
var greedy = require('./src/js/algorithms/Greedy');
var wspd = require('./src/js/algorithms/WSPD');
var visibility = require('./src/js/algorithms/Visibility');

// Load core
var Graph = require('./src/js/core/Graph');
var Obstacle = require('./src/js/core/Obstacle');

// Load random
var Generator = require('./src/js/data/Generator');

const fs = require('fs');

function dimensions(nodes, obstacle) {
	var dimo = obstacle.dimensions();

	for (var key in nodes) {
		var node = nodes[key];
		if (node.x > dimo.xmax) {
			dimo.xmax = node.x;
		}
		if (node.y > dimo.ymax) {
			dimo.ymax = node.y;
		}
		if (node.x < dimo.xmin) {
			dimo.xmin = node.x;
		}
		if (node.y < dimo.ymin) {
			dimo.ymin = node.y;
		}
	}
	return dimo;
}

function run() {
	const algorithms = {greedy: greedy.calculate, wspd: wspd.calculate };
	console.log("t, n, k, alg, weight, ms")
	var numObst = 10;
	settings = {
		w: 1920,
		h: 1080,
		t: 1.5
	}
	var obstacle = Generator.createSimplePolygon(numObst, settings);
	
	for (var i = 0; i < 800; i += 20){
		var nodes = Generator.createNodes(i, obstacle, settings);
		for (var key in algorithms) {
			var g = {nodes: nodes}

			var k = obstacle.nodes.length;
			var n = nodes.length;
			var dim = dimensions(nodes, obstacle);

			var alg = algorithms[key]; 
			var graph = new Graph();
			graph.copy(obstacle, true);
			graph.copy(g, false);


			var t0 = process.hrtime();
			var vgraph = visibility.compute(graph, obstacle);
			var result = alg(graph, vgraph, {t: settings.t, bounds: dim});
			var t1 = process.hrtime(t0);

			console.log(settings.t + "," + n + ","+k +","+key+","+result.totalWeight()+","+(t1[0] * 1e9 + t1[1])/1000000);
		}
	}
}

run();