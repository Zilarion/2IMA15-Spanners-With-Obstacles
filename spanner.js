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

function greedy_spanner(graph) {
	nodes = graph.nodes;
	node_pair = [];

	for (var i in nodes) {
			for (var j in nodes) {
				if (i != j) {
					var n1 = nodes[i];
					var n2 = nodes[j];
					node_pair.push( {dist: distance(n1, n2), n1: n1, n2: n2} );
				}
			}
	}

	node_pair.sort(dynamicSort("dist"));
	console.log(node_pair);
}