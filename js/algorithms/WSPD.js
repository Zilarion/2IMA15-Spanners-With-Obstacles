define(['../core/Util', './Astar'], function(Util, shortest){
	return function WSPD(graph, settings) {
		// Build quad tree
		var pointQuad = true;
		var bounds = {
		    x:0,
		    y:0,
		    width: settings.w,
		    height: settings.h
		}
		var quad = new QuadTree(bounds, pointQuad, 1000, 1);

		quad.insert(graph.nodes);

		// Check if this node is a leaf
		function isLeaf(u) {
			return u.nodes.length == 0;
		}

		function intersects(c1, c2) {
			var dx = Math.pow(c1.x - c2.x, 2);
			var dy = Math.pow(c1.y - c2.y, 2);
			var radiussum = c1.r + c2.r;
			return dx + dy <= Math.pow(radiussum, 2);
		}

		// Well seperated
		function seperated(u, v, s) {
			var circleU = {
				x: u._bounds.x + u._bounds.width / 2,
				y: u._bounds.y + u._bounds.height / 2,
				r: isLeaf(u) ? 0 :  Math.sqrt(Math.pow(u._bounds.height, 2), Math.pow(u._bounds.width, 2))
			}
			var circleV = {
				x: v._bounds.x + v._bounds.width / 2,
				y: v._bounds.y + v._bounds.height / 2,
				r: isLeaf(v) ? 0 : Math.sqrt(Math.pow(v._bounds.height, 2), Math.pow(v._bounds.width, 2))
			}
			return !intersects(circleU, circleV);
		}

		// Representative of u
		function rep(u) {
			if (isLeaf(u) && u.children[0] != undefined) {
				return u.children[0];
			} else {
				return [];
			}
		}

		// ws pairs function
		function wsPairs(u, v, T, s) {
			var result = [];
			if (rep(u) == [] || rep(v) == [] || (isLeaf(u) && isLeaf(v) && u == v)) {
				result = [];
			} else if (seperated(u, v, s)) {
				result = [{u, v}];
			} else {
				if (u._depth > v._depth) {
					var temp = v;
					v = u;
					u = temp;
				}
				var childNodes = u.nodes;
				for (key in childNodes) {
					var childNode = childNodes[key];
					var r = wsPairs(childNode, v, T, s);
					result = result.concat(r);
				}
			}		
			return result;
		}

		var s = 4 * (settings.t+1) / (settings.t-1)
		var r = wsPairs(quad.root, quad.root, quad, s);
		// console.log(r)
		for (var key in r) {
			// console.log("Pair: ", pair)
			var pair = r[key];
			var repu = rep(pair.u);
			var repv = rep(pair.v);
			// console.log("representatives", repu, repv)
			if (repu.id && repv.id) {
				// console.log(repu, repv)
				graph.addEdge(repu, repv, 1);
			}
		}
	}
});



