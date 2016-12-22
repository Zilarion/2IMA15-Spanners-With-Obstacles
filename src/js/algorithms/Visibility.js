'use strict';

var Util = require('../core/Util');
var Graph = require('../core/Graph');


class Visibility {
	static compute(points, obstacles) {
		return Visibility.greedy(points, obstacles);
	}

	static greedy(points, obstacles){
		var graph = new Graph();
		for (var p in points){
			graph.nodes.push(points[p]);
		}
		for (var obs in obstacles){
			for (var p in obstacles[obs].nodes){
				graph.nodes.push(obstacles[obs].nodes[p]);
			}
		}

		points = graph.nodes;
		for (var p = 0; p < points.length; p++){
			for (var q = p+1; q < points.length; q++){
				var intersect = false;
				for (var obstacle in obstacles){
					if (Util.lineIntersectsObstacle(points[p], points[q], obstacles[obstacle])){
						intersect = true;
						break;
					}
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
