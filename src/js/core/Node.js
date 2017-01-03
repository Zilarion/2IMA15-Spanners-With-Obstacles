"use strict";

class Node {
	constructor(id, x, y, graph, obstacle) {
		this.id = id;
		this.edges = []
		this.x = x;
		this.y = y;
		this.graph = graph;
		this.obstacle = obstacle ? obstacle : false;
	}
	addEdge(edge) {
		this.edges.push(edge);
	}
	setEdges(edges) {
		this.edges = edges;
	}
	getEdges() {
		return this.edges;
	}
	isObstacle() {
		return this.obstacle;
	}
};

module.exports = Node;