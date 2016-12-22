'use strict';

var Util = require('../core/Util');
var Graph = require('../core/Graph');


class Visibility {
	static compute(g, obstacle) {
		return Visibility.greedy(g, obstacle);
	}

	static greedy(g, obstacle){
		var graph = new Graph();
		for (var node in g.nodes){
			graph.nodes.push(g.getNode(node));
		}
		for (var node in obstacle.nodes) {
			graph.nodes.push(obstacle.getNode(node));
		}

		var points = graph.nodes;
		for (var p = 0; p < points.length; p++){
			for (var q = p+1; q < points.length; q++){
				if (!Util.lineIntersectsObstacle(points[p], points[q], obstacle)){
					graph.addEdge(points[p], points[q], Util.distance(points[p], points[q]));
				}
			}
		}
		return graph;
	}
}

module.exports = Visibility;
