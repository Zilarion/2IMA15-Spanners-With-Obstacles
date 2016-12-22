var Node = require('./Node');

class Graph {
	constructor() {
		this.nodes = [];
		this.edges = {};
	}

	load(data) {
		for (var key in data.nodes) {
			var node = data.nodes[key];
			var n = new Node(node.id, node.x, node.y, this);
			this.addExistingNode(n);
		}
	}

	addNode(id, x, y) {
		var n = new Node(id, x, y, this);
		this.addExistingNode(n);
	}

	addExistingNode(node){
		this.nodes.push(node);
		this.edges[node.id] = [];
	}

	addEdge(source, target, weight) {
		var newEdge = {source: source, target: target, weight: weight};
		this.edges[source.id].push(newEdge);
		this.edges[target.id].push(newEdge);
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
			// n.edges = [];
		}
		// this._edges = [];
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