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
		var quad = new QuadTree(bounds, pointQuad, 9999999, 1);
		quad.insert(graph.nodes);

		// Check if this node is a leaf
		function isLeaf(u) {
			return u.nodes.length == 0;
		}

		function distance(c1, c2) {
			var dx = Math.pow(c1.x - c2.x, 2);
			var dy = Math.pow(c1.y - c2.y, 2);
			var r = Math.pow(c1.r + c2.r, 2);
			var result = dx + dy - r < 0 ? 0 : Math.sqrt(dx + dy - r);

			if (result) {
				// console.log(c1, c2);
			}
			return result;
		}
		// Creates the bounding circle of a node u
		function createCircle(u, depth, leaves) {
			if (u._depth > depth) {
				return createCircle(u.parent, depth, leaves);
			}
			return {
				x: leaves ? rep(u).x : u._bounds.x + u._bounds.width / 2,
				y: leaves ? rep(u).y : u._bounds.y + u._bounds.height / 2,
				r: leaves ? 0 : Math.sqrt(Math.pow(u._bounds.height, 2), Math.pow(u._bounds.width, 2))
			}
		}

		// Well seperated
		function seperated(u, v, s) {
			var leaves = false;
			if (isLeaf(u) && isLeaf(v)) {
				leaves = true;
			}
			var depth = u._depth > v._depth ? v._depth : u._depth;

			var cu = createCircle(u, depth, leaves);
			var cv = createCircle(v, depth, leaves);

			var maxr = cu.r > cv.r ? cu.r : cv.r;
			cu.r = maxr;
			cv.r = maxr;

			var d = distance(cu, cv);
			var result =  d >= s * maxr;
			if (true) {
				cu.color = result ? "black" : "red";
				cv.color = result ? "black" : "red";
				graph.circles.push(cu);
				graph.circles.push(cv);

				if (!leaves) {
					graph.circedge.push({x1: cu.x, x2: cv.x, y1: cu.y, y2: cv.y })
				}
			}
			return result;
		}

		function isempty(u) {
			return Array.isArray(u);
		}
		// Representative of u
		function rep(u) {
			if (isLeaf(u)) {
				if (u.children.length > 0) {
					return u.children[0];
				}
				else {
					return [];
				}
			} else {
				for (var key in u.nodes) {
					var node = u.nodes[key]
					var r = rep(node);
					if (!isempty(r)) {
						return r;
					}
				}
			}
			return [];
		}
		function union(r1, r2) {
			if (r1.length == 0) {
				r1 = r1.concat(r2);
			}
			for (var k1 in r1) {
				var v1 = r1[k1];
				for (k2 in r2) {
					var v2 = r2[k2];
					if ((v1[0] == v2[0] && v1[1] == v2[1]) || (v1[0] == v2[1] && v1[1] == v2[0])) {
						continue;
					}
					r1.push(v2);
				}
			}
			return r1;
		}

		// ws pairs function
		function wsPairs(u, v, T, s) {
			var result = [];
			graph.rects.push(u._bounds)
			graph.rects.push(v._bounds)
			if (isempty(rep(u)) || isempty(rep(v)) || (isLeaf(u) && isLeaf(v) && u == v)) {
				result = [];
			} else if (seperated(u, v, s)) {
				return [{u, v}];
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
					// result = union(result, r);
					// console.log(r, result);
				}
			}		
			return result;
		}
		var t = settings.t
		var s = 4 * (t+1) / (t-1)
		console.log("t: ", t, "s: ", s)

		graph.circles = [];
		graph.circedge = [];
		graph.rects = [];
		var r = wsPairs(quad.root, quad.root, quad, s);
		
		var map2 = {};
		for (var key in r) {
			var pair = r[key];
			var repu = rep(pair.u);
			var repv = rep(pair.v);
			
			map2[repu.id] ? map2[repu.id].push(repv.id) : map2[repu.id] = [repv.id];
			map2[repv.id] ? map2[repv.id].push(repu.id) : map2[repv.id] = [repu.id];
			// console.log(repu.id, repv.id)
			graph.addEdge(repu, repv, Util.distance(repu, repv));
			
		}
		console.log(map2);
	}
});



