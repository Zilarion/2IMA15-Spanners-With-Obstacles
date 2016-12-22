'use strict';

var Util = require('../core/Util');
var Graph = require('../core/Graph');


class Visibility {
	static compute(points, obstacle) {
		return Visibility.greedy(points, obstacle);
	}

	static greedy(points, obstacle){
		var graph = new Graph();
		for (var p in points){
			graph.nodes.push(points[p]);
		}
		for (var node in obstacle.nodes) {
			graph.nodes.push(obstacle.getNode(node));
		}

		points = graph.nodes;
		for (var p = 0; p < points.length; p++){
			for (var q = p+1; q < points.length; q++){
				var intersect = false;
				if (Util.lineIntersectsObstacle(points[p], points[q], obstacle)){
					intersect = true;
					break;
				}
				if (!intersect){
					graph.addEdge(points[p], points[q], Util.distance(points[p], points[q]));
				}
			}
		}
		return graph;
	}
}

module.exports = Visibility;
