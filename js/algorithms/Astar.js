define(['../core/Util'], function(Util) {
	return function(start, goal) {
		var heuristic = Util.distance;

    var gScore = new Map();
    gScore.set(start, 0);
    var fScore = new Map();
    var hScore = new Map();
    fScore.set(start, heuristic(start, goal));
    var closed = new Map();
    var opened = new Map();

    // Initially, only the start node is known
		var openList = new Heap(function(nodeA, nodeB) {
			return fScore[nodeA.id] - fScore[nodeB.id];
    });
		openList.push(start);

		while (!openList.empty()) {
			var node = openList.pop();
			closed.set(node.id, true);

			if (node.id == goal.id) {
				return gScore.get(goal.id);
			}

			var edges = node.edges;
			for (var i = 0; i < edges.length; i++) {
				var edge = edges[i];
				var neighbor = edge.target.id == node.id ? edge.source : edge.target;

				if (closed.has(neighbor.id)) {
					continue;
				}

				var newWeight = gScore.get(node.id) + edge.weight;

				// Check if this is a new node, or the new weight is less
				if(!closed.has(neighbor.id) || newWeight < gScore.get(neighbor.id)) {
					if(!hScore.has(neighbor.id)) {
						hScore.set(neighbor.id, heuristic(neighbor, goal));
					}

					gScore.set(neighbor.id, newWeight);
					fScore.set(neighbor.id, newWeight + hScore.get(neighbor.id));

					if (!opened.has(neighbor.id)) {
						openList.push(neighbor);
						opened.set(neighbor.id, true);
					} else {
						openList.updateItem(neighbor);
					}
				}
			}
		}

		// Fail
		return 999999999999999;
	}
})