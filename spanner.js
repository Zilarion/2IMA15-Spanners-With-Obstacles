function distance(n1, n2) {
	var dx = n1.x - n2.x;
	var dy = n1.y - n2.y;

	return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function greedy_spanner(graph, t) {
	nodes = graph.nodes;
	node_pairs = [];

	// Calculate all possible pairs
	for (var i in nodes) {
			for (var j = i; j < nodes.length; j++) {
				if (i != j) {
					// If they don't match, calculate distance and add
					var n1 = nodes[i];
					var n2 = nodes[j];
					node_pairs.push( {dist: distance(n1, n2), n1: n1, n2: n2} );
				}
			}
	}

	// Sort based on distance
	node_pairs.sort(dynamicSort("dist"));
	for (var key in node_pairs) {
		var pair = node_pairs[key];
		var n1 = pair.n1;
		var n2 = pair.n2;

		// Find shortest path in current graph
		var dist = graph.shortestPath(n1, n2);

		// If this is to large, add this pair as edge
		if (dist > t * pair.dist) {
			graph.addEdge(n1, n2, pair.dist);
		}
	}
}
