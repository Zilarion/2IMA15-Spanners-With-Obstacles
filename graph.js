class Node {
	constructor(id, x, y) {
		this.id = id;
		this.edges = []
		this.x = x;
		this.y = y;
	}
	addEdge(target, weight) {
		console.log("added edge: ", {target: target, weight: weight});
		this.edges.push({target: target, weight: weight});
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

				console.log(dist[u.id]);
				console.log(e.weight);

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
}