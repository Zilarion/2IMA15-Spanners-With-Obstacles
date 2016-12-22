'use strict';


class DataManager {
	static export(nodes, obstacle, t) {
		var n = nodes.length;
		var m = obstacle.nodes.length;
		var a = t * 100;
		var b = 100;

		var result = 
			n + "\n" +
			m + "\n" +
			a + " " + b + "\n" +
			DataManager.points(nodes) +
			DataManager.obstacle(obstacle);

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

	static obstacle(obstacle) {
		var result = "";
		for (var key in obstacle.nodes) {
			var node = obstacle.getNode(key);
			result += node.x + " " + node.y + "\n";
		}
		return result;
	}
}

module.exports = DataManager;