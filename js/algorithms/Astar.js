define(['../core/Util'], function(Util) {
	return function(start, goal) {
    // The set of nodes already evaluated.
		var closedSet = {}
    // The set of currently discovered nodes still to be evaluated.
    // Initially, only the start node is known.

		var openSet = new Heap(function(nodeA, nodeB) {
			return nodeA.f - nodeB.f;
    });
		openSet.push(start);

    // For each node, which node it can most efficiently be reached from.
    // If a node can be reached from many nodes, cameFrom will eventually contain the
    // most efficient previous step.
		var cameFrom = {};

		// For each node, the cost of getting from the start node to that node.
    var gScore = new Map();
    // The cost of going from start to start is zero.
    gScore.set(start, 0);
    // For each node, the total cost of getting from the start node to the goal
    // by passing by that node. That value is partly known, partly heuristic.
    var fScore = new Map();

    // For the first node, that value is completely heuristic.
    fScore.set(start, Util.distance(start,goal));

		while (openSet.size() != 0) {
			var current = openSet.pop().node;
			if (current == goal)
				return cameFrom;

		}
	}
})