define(function() {
	return function(start, goal, graph) {

			var dist = {};
			var Q = new Heap(
				function(nodeA, nodeB) {
				return dist[nodeA] - dist[nodeB];
	    });

			for (var key in graph.nodes) {
				var node = graph.nodes[key];
				if (node.id != start.id) {
					dist[node.id] = 99999999999;
				} else {
					dist[node.id] = 0;
				}
				Q.push(node);
			}

			while (!Q.empty()) {
				var u = Q.pop();
				for (var key in u.edges) {
					var e = u.edges[key];
					var v = e.target.id == u.id ? e.source : e.target;

					var alt = dist[u.id] + e.weight;
					if (alt < dist[v.id]) {
						dist[v.id] = alt;
						Q.updateItem(v.id);
					}
				}
			}
			return dist[goal.id];
	}
})