"use strict";

class Node {
	constructor(id, x, y, graph) {
		this.id = id;
		this.edges = []
		this.x = x;
		this.y = y;
		this.graph = graph;
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
};

module.exports = Node;