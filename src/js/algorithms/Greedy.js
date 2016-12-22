'use strict';

var Util = require('../core/Util');
var astar = require('./Astar');
var Visibility = require('./Visibility');

class Greedy {
	static calculate(graph, obstacle, settings) {
		var nodes = graph.nodes;
		var node_pairs = [];
		var t = settings.t;
		
		nodes = Visibility.compute(graph.nodes, obstacle);

		// Calculate all possible pairs
		for (var i in nodes) {
				for (var j = i; j < nodes.length; j++) {
					if (i != j) {
						// If they don't match, calculate distance and add
						var n1 = nodes[i];
						var n2 = nodes[j];
						node_pairs.push( {dist: Util.distance(n1, n2), n1: n1, n2: n2} );
					}
				}
		}

		// Sort based on distance
		node_pairs.sort(Util.dynamicSort("dist"));
		for (var key in node_pairs) {
			var pair = node_pairs[key];
			var n1 = pair.n1;
			var n2 = pair.n2;

			// Find shortest path in current graph
			var dist = astar.calculate(n1, n2, graph);
			
			// If this is to large, add this pair as edge
			if (dist > t * pair.dist) {
				graph.addEdge(n1, n2, pair.dist);
			}
		}
	}
};

module.exports = Greedy;