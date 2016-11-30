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
}

class Graph {
	constructor() {
		this.nodes = [];
		this.edges = [];
	}

	load(data) {
		console.log("Loading...");
		console.log(data);

		for (var key in data.nodes) {
			var node = data.nodes[key];
			this.nodes.push(new Node(node.id, node.x, node.y, this));
		}
		console.log("loaded all data: ");
		console.log(this.nodes);
	}

	addNode(id, x, y) {
		this.nodes.push(new Node(id, x, y, this));
	}

	addEdge(source, target, weight) {
		var newEdge = {source: source, target: target, weight: weight};
		source.addEdge(newEdge)
		target.addEdge(newEdge)
		this.edges.push(newEdge);
	}

	// Shortest path using Dijkstra
	shortestPath(start, goal) {
		var Q = new BinaryHeap(
		  function(element) { return element.dist; },
		  function(element) { return element.node.id; },
		  'dist'
		);

		var dist = {};

		for (var key in this.nodes) {
			var node = this.nodes[key];
			if (node.id != start.id) {
				dist[node.id] = 99999999999;
			} else {
				dist[node.id] = 0;
			}
			Q.push({node: node, dist: dist[node.id]});
		}

		while (Q.size() != 0) {
			var u = Q.pop().node;
			for (var key in u.edges) {
				var e = u.edges[key];
				var v = e.target.id == u.id ? e.source : e.target;

				var alt = dist[u.id] + e.weight;
				if (alt < dist[v.id]) {
					dist[v.id] = alt;
					Q.decreaseKey(v.id, alt);
				}
			}
		}
		return dist[goal.id];
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
}