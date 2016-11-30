class Node {
	constructor(id, x, y, graph) {
		this.id = id;
		this.edges = []
		this.x = x;
		this.y = y;
		this.graph = graph;
	}
	addEdge(target, weight) {
		var newEdge = {source: this, target: target, weight: weight};
		console.log("added edge: ", newEdge);
		this.edges.push(newEdge);
		this.graph.addEdge(newEdge)
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

	addNode(node) {
		this.nodes[node_id] = node;
	}
	addEdge(edge) {
		this.edges.push(edge);
	}

	shortestPath(start, goal) {
		console.log('---------------');
		console.log("Shortest path", {start: start, goal: goal});
		var Q = new BinaryHeap(
		  function(element) { return element.dist; },
		  function(element) { return element.node.id; },
		  'dist'
		);

		var dist = {};
		var prev = {};

		for (var key in this.nodes) {
			var node = this.nodes[key];
			if (node.id != start.id) {
				console.log(node);
				dist[node.id] = 99999999999;
			} else {
				dist[node.id] = 0;
			}
			Q.push({node: node, prev: null, dist: dist[node.id]});
		}

		while (Q.size() != 0) {
			var u = Q.pop().node;
			for (var key in u.edges) {
				var e = u.edges[key];
				var v = e.target;

				var alt = dist[u.id] + e.weight;
				if (alt < dist[v.id]) {
					console.log("ALT ROUTE: ", alt)
					dist[v.id] = alt;
					prev[v.id] = u; 
					Q.decreaseKey(v.id, alt);
				}
			}
		}
		console.log("Final dist: ", dist);
		return dist[goal.id];
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
}