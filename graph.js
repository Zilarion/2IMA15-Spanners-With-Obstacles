class Node {
	constructor(id, x, y) {
		this.id = id;
		this.edges = []
		this.x = x;
		this.y = y;
	}
	addEdge(edge) {
		this.edges.push(edge);
	}
}

class Graph {
	constructor() {
		this.nodes = [];
	}

	load(data) {
		console.log("Loading...");
		console.log(data);

		for (var key in data.nodes) {
			var node = data.nodes[key];
			this.nodes.push(new Node(node.id, node.x, node.y));
		}
		console.log("loaded all data: ");
		console.log(this.nodes);
	}

	addNode(node) {
		this.nodes[node_id] = node;
	}

	set nodes(n) {
    this._nodes = n;
  }
	get nodes() {
    return this._nodes;
  }
}