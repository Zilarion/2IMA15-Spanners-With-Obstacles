'use strict';


class DataManager {
	static export(nodes, obstacles, t) {
		var n = nodes.length;
		var m = obstacles.length;
		var a = t * 100;
		var b = 100;

		var result = 
			n + "\n" +
			m + "\n" +
			a + " " + b + "\n" +
			DataManager.points(nodes) +
			DataManager.obstacles(obstacles);

		return result;
	}

	static points(nodes) {
		var result = "";
		for (var key in nodes) {
			var node = nodes[key];
			result += node.x + " " + node.y + "\n";
		}
		return result;
	}

	static obstacles(obstacles) {
		var result = "";
		for (var key in obstacles) {
			var obstacle = obstacles[key];
			result += obstacle.x + " " + obstacle.y + "\n";
		}
		return result;
	}
}

module.exports = DataManager;