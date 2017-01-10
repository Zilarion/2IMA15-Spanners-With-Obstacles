'use strict';

var Util = require('../core/Util');
var astar = require('./Astar');
var Combinatorics = require('js-combinatorics');
// var Worker = require('webworker-threads').Worker;

class Greedy {
	// constructor() {
	// 	this.worker = new Worker({
	// 		this.onmessage = function(event) {
				
	// 		};
 // 		});
	// }
	
	static calculate(graph, vgraph, settings) {
		var nodes = graph.nodes;
		var node_pairs = [];
		var t = settings.t;
		var debug = {edges: vgraph.edges};
		return;

		// Calculate all possible pairs
		cmb = Combinatorics.combination(['a','b','c','d'], 2)
		while(a = cmb.next()) {
			var n1 = a[0];
			var n2 = a[1];
			var path = astar.calculate(n1, n2, vgraph);
			if (!n1.isObstacle() && !n2.isObstacle()){
				node_pairs.push( {dist: path.length, path: path, n1: nodes[n1.id - 1], n2: nodes[n2.id - 1]} );
			}
		}

		// Sort based on distance
		node_pairs.sort(Util.dynamicSort("dist"));
		for (var key in node_pairs) {
			var pair = node_pairs[key];
			var n1 = pair.n1;
			var n2 = pair.n2;

			// Find shortest path in current graph
			var path = astar.calculate(n1, n2, graph);

			// If this is to large, add this pair as edge
			if (path.length > t * pair.dist) {
				var prev = undefined;
				for (var p in pair.path.sequence){
					var point = pair.path.sequence[p];
					if (prev){
						var source = graph.nodes[prev.id - 1] ? graph.nodes[prev.id- 1] : prev;
						var target = graph.nodes[point.id- 1] ? graph.nodes[point.id- 1] : point;
						graph.addEdge(source, target, Util.distance(prev, point));
					}
					prev = point;
				}
			}
		}
		return debug;
	}
};

module.exports = Greedy;