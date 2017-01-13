'use strict';

var Util = require('../core/Util');
var astar = require('./Astar');
var Combinatorics = require('js-combinatorics');

class Greedy {
	static calculate(graph, vgraph, settings) {
		var nodes = graph.nodes;
		var node_pairs = [];
		var t = settings.t;

		if (nodes.length <= 1) {
			return graph;
		}
		// Calculate all possible pairs
		console.log("Calculating pairs");
		for (var i = 0; i < nodes.length; i++) {
			for (var j = i; j < nodes.length; j++) {
				var n1 = vgraph.nodes[i];
				var n2 = vgraph.nodes[j];

				if (!n1.isObstacle() && !n2.isObstacle()){
					var path = astar.calculate(n1, n2);
					node_pairs.push( {dist: path.length, path: path, n1: nodes[n1.id], n2: nodes[n2.id]} );
				}
			}
		}
		console.log("Got all the pairs");
		// Sort based on distance
		node_pairs.sort(Util.dynamicSort("dist"));
		for (var key in node_pairs) {
			var pair = node_pairs[key];
			var n1 = pair.n1;
			var n2 = pair.n2;

			// console.log(n1.id, n2.id);
			// Find shortest path in current graph
			var newPath = astar.calculate(n1, n2);
			
			// If this is to large, add this pair as edge
			if (newPath.length > t * pair.dist) {
				var prev = undefined;
				for (var p in pair.path.sequence){
					var point = pair.path.sequence[p];
					if (prev){
						var source = graph.nodes[prev.id] ? graph.nodes[prev.id] : prev;
						var target = graph.nodes[point.id] ? graph.nodes[point.id] : point;
						graph.addEdge(source, target, Util.distance(prev, point));
					}
					prev = point;
				}
			}
		}
		return graph;
	}
};

module.exports = Greedy;