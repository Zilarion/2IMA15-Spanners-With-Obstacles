define(function() {
  "use strict";

	return class Node {
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
	}
});