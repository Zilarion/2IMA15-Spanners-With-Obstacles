'use strict';


class DataManager {
	static export(graph, obstacles, t) {
		var n = graph.nodes.length;
		var m = obstacles.length;
		var a = t - 1 * 100;
		var b = 100;

		var result = 
			n + "\n" +
			m + "\n" +
			a + " " + b + "\n" +
			DataManager.points(graph) +
			DataManager.obstacles(obstacles);

		return result;
	}

	static points(graph) {
		var result = "";
		for (var key in graph.nodes) {
			var node = graph.nodes[key];
			result += node.x + " " + node.y + "\n";
		}
		return result;
	}

	static obstacles(obstacles) {
		var result = "";
		for (var key in obstacles) {
			var obstacle = graph.nodes[key];
			result += obstacle.x + " " + obstacle.y + "\n";
		}
		return result;
	}
}

module.exports = DataManager;