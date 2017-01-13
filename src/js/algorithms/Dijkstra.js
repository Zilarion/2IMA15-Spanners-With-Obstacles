'use strict';

var Heap = require('heap');

class Dijkstra {
	static calculate(start, goal, graph) {
			var dist = {};
			var Q = new Heap(function(nodeA, nodeB) {
				return dist[nodeA.id] - dist[nodeB.id];
	    });

			for (var key in graph.nodes) {
				var node = graph.nodes[key];
				if (node.id != start.id) {
					dist[node.id] = 999999999999999;
				} else {
					dist[node.id] = 0;
				}
			}

			for (var key in graph.nodes) {
				Q.push(graph.nodes[key]);
			}

			while (!Q.empty()) {
				var u = Q.pop();
				if (u.edges.length == 0 && u.id == start.id) {
					break;
				}
				for (var key in u.edges) {
					var e = u.edges[key];
					var v = e.target.id == u.id ? e.source : e.target;
					var alt = dist[u.id] + e.weight;
					if (alt < dist[v.id]) {
						dist[v.id] = alt;
						Q.updateItem(v.id);
						Q.heapify()
					}
				}
			}
			return {length: dist[goal.id], sequence: seq};
	}
}

module.exports = Dijkstra;