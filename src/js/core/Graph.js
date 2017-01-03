var Node = require('./Node');

class Graph {
	constructor() {
		this.nodes = [];
		this.edges = [];
	}

	load(data) {
		for (var key in data.nodes) {
			var node = data.nodes[key];
			this.addNode(node.id, node.x, node.y);
		}
	}

	addNode(id, x, y) {
		this.nodes.push(new Node(id, x, y, this));
	}

	addObstacleNode(id, x, y) {
		this.nodes.push(new Node(id, x, y, this, true));
	}

	copy(graph) {
		for (var key in graph.nodes) {
			var node = graph.nodes[key];
			this.addNode(node.id, node.x, node.y);
		}

		for (var key in graph.edges) {
			var edge = graph.edges[key];
			var source = this.nodes[edge.source.id];
			var target = this.nodes[edge.target.id];
			var weight = edge.weight;
			this.addEdge(source, target, weight);
		}
	}

	addEdge(source, target, weight) {
		var newEdge = {source: source, target: target, weight: weight};
		source.addEdge(newEdge)
		target.addEdge(newEdge)
		this.edges.push(newEdge);
	}

	totalWeight() {
		var sum = 0;
		for (var key in this.edges) {
			sum += this.edges[key].weight
		}
		return sum;
	}
	
	clearEdges() {
		for (var key in this.nodes) {
			var n = this.nodes[key];
			n.edges = [];
		}
		this._edges = [];
	}

	set nodes(n) {
    this._nodes = n;
  }
	get nodes() {
    return this._nodes;
  }

  set edges(e) {
  	this._edges = e;
  }
  get edges() {
  	return this._edges;
  }
  toJson() {
  	return {
  		nodes: this.nodes,
  		edges: this.edges
  	}
  }
};

module.exports = Graph;