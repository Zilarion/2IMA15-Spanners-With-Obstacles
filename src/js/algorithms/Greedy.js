'use strict';

var Util = require('../core/Util');
var astar = require('./Astar');

class Greedy {
	static calculate(graph, visibilityGraph, settings) {
		var nodes = graph.nodes;
		var node_pairs = [];
		var t = settings.t;
		var debug = {edges: visibilityGraph.edges};

		// Calculate all possible pairs
		for (var i in nodes) {
				for (var j = i; j < nodes.length; j++) {
					if (i != j) {
						// If they don't match, calculate distance and add
						var n1 = nodes[i];
						var n2 = nodes[j];
						var path = astar.calculate(n1, n2, visibilityGraph);
						node_pairs.push( {dist: path.length, path: path, n1: n1, n2: n2} );
					}
				}
		}

		graph.clearEdges();
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
						graph.addEdge(prev, point, Util.distance(prev, point));
					}
					prev = point;
				}
			}
		}
		return debug;
	}
};

module.exports = Greedy;