define(function() {
	return function(graph, start, goal) {
			var Q = new BinaryHeap(
			  function(element) { return element.dist; },
			  function(element) { return element.node.id; },
			  'dist'
			);

			var dist = {};

			for (var key in graph.nodes) {
				var node = graph.nodes[key];
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
			return dist;
	}
})