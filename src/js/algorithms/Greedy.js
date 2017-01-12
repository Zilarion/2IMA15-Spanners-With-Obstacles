'use strict';

var Util = require('../core/Util');
var astar = require('./Astar');
var Combinatorics = require('js-combinatorics');

class Greedy {
	static calculate(graph, vgraph, settings) {
		var nodes = graph.nodes;
		var node_pairs = [];
		var t = settings.t;
		var nObst = vgraph.nodes.length - graph.nodes.length;

		if (nodes.length <= 1) {
			return graph;
		}

		// Calculate all possible pairs
		var cmb = Combinatorics.combination(nodes, 2)
		var a = cmb.next();
		while(a != null) {
			var n1 = vgraph.nodes[a[0].id];
			var n2 = vgraph.nodes[a[1].id];
			var path = astar.calculate(n1, n2);
			if (!n1.isObstacle() && !n2.isObstacle()){
				node_pairs.push( {dist: path.length, path: path, n1: nodes[n1.id - nObst], n2: nodes[n2.id - nObst]} );
			}
			a = cmb.next();
		}

		// Sort based on distance
		node_pairs.sort(Util.dynamicSort("dist"));
		for (var key in node_pairs) {
			var pair = node_pairs[key];
			var n1 = pair.n1;
			var n2 = pair.n2;

			// Find shortest path in current graph
			var newPath = astar.calculate(n1, n2);
			
			// If this is to large, add this pair as edge
			if (newPath.length > t * pair.dist) {
				console.log(newPath.length, pair.dist)
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