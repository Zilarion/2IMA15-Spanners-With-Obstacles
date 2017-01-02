'use strict';

var Util = require('../core/Util');
var Heap = require('heap');

class Astar {
	static calculate(start, goal, graph) {
		var heuristic = Util.distance;

    var gScore = new Map();
    gScore.set(start.id, 0);
    var fScore = new Map();
    var hScore = new Map();
    fScore.set(start, heuristic(start, goal));
    var closed = new Map();
    var opened = new Map();
		var backward = new Map();

    // Initially, only the start node is known
		var openList = new Heap(function(nodeA, nodeB) {
			return fScore.get(nodeA.id) - fScore.get(nodeB.id);
    });
		openList.push(start);

		// While our heap is not yet empty
		while (!openList.empty()) {
			// pop the next node and close it
			var node = openList.pop();
			closed.set(node.id, true);

			// If this is our goal, we are done!
			if (node.id == goal.id) {
				//walkback
				var path = {};
				path.length = gScore.get(goal.id);
				path.sequence = [goal];
				var prev = goal;
				while(prev.id != start.id){
					prev = backward.get(prev.id);
					path.sequence.splice(0,0,prev);
				}
				return path;
			}

			// Check all our edges to find new neighbors
			var edges = node.edges;
			for (var i = 0; i < edges.length; i++) {
				var edge = edges[i];
				var neighbor = edge.target.id == node.id ? edge.source : edge.target;

				// If we already processed this node, skip it
				if (closed.has(neighbor.id)) {
					continue;
				}

				// Calculate the total cost to get to this neighbor
				var newG = gScore.get(node.id) + edge.weight;

				// Check if this is a new node, or the new g score is less
				if(!closed.has(neighbor.id) || newG < gScore.get(neighbor.id)) {
					// Update the hscore if there is none yet
					backward.set(neighbor.id, node);
					if(!hScore.has(neighbor.id)) {
						hScore.set(neighbor.id, heuristic(neighbor, goal));
					}

					// Set our gscore and fscore
					gScore.set(neighbor.id, newG);
					fScore.set(neighbor.id, newG + hScore.get(neighbor.id));

					// If we did not open this neighbor yet
					if (!opened.has(neighbor.id)) {
						// Push it into our queue
						openList.push(neighbor);
						opened.set(neighbor.id, true);
					} else {
						// Just update the item
						openList.updateItem(neighbor);
					}
				}
			}
		}

		// Fail
		return {length: 999999999999999, sequence:[]};
	}
};

module.exports = Astar;