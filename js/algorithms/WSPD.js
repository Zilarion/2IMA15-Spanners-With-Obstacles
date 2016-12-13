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

		function distance(c1, c2) {
			var dx = Math.pow(c1.x - c2.x, 2);
			var dy = Math.pow(c1.y - c2.y, 2);
			var r = Math.pow(c1.r + c2.r, 2);
			var result = dx + dy - r < 0 ? 0 : Math.sqrt(dx + dy - r);
			// console.log(c1, c2, result)
			return result;
		}
		// Creates the bounding circle of a node u
		function createCircle(u) {
			return {
				x: isLeaf(u) ? rep(u).x : u._bounds.x + u._bounds.width / 2,
				y: isLeaf(u) ? rep(u).y : u._bounds.y + u._bounds.height / 2,
				r: isLeaf(u) ? 0 : Math.sqrt(Math.pow(u._bounds.height, 2), Math.pow(u._bounds.width, 2)) / 2
			}
		}

		// Well seperated
		function seperated(u, v, s) {
			var cu = createCircle(u);
			var cv = createCircle(v);
			var maxr = cu.r > cv.r ? cu.r : cv.r;
			cu.r = maxr;
			cv.r = maxr;

			var d = distance(cu, cv);
			return d >= s * maxr;
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

		// ws pairs function
		function wsPairs(u, v, T, s) {
			var result = [];
			if (isempty(rep(u)) || isempty(rep(v)) || (isLeaf(u) && isLeaf(v) && u == v)) {
				result = [];
			} else if (seperated(u, v, s)) {
				var cv = createCircle(v);
				var cu = createCircle(u);
				// console.log(cv, v)
				var maxr = cu.r > cv.r ? cu.r : cv.r;
				cu.r = maxr;
				cv.r = maxr;

				graph.circles.push(cu);
				graph.circles.push(cv);

				graph.circedge.push({x1: cu.x, x2: cv.x, y1: cu.y, y2: cv.y })
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
		var t = settings.t
		var s = 4 * (t+1) / (t-1)

		graph.circles = [];
		graph.circedge = [];
		var r = wsPairs(quad.root, quad.root, quad, s);
		
		var map2 = {};
		var rects = [];
		for (var key in r) {
			var pair = r[key];
			var repu = pair.u.children[0];
			var repv = pair.v.children[0];

			rects.push(pair.u._bounds)
			rects.push(pair.v._bounds)

			// map[repu.id] ? map[repu.id].push(repv.id) : map[repu.id] = [repv.id];
			// map[repv.id] ? map[repv.id].push(repu.id) : map[repv.id] = [repu.id];
			if (repu != undefined && repv != undefined) {
				// map2[repu.id] ? map2[repu.id].push(repv.id) : map2[repu.id] = [repv.id];
				// map2[repv.id] ? map2[repv.id].push(repu.id) : map2[repv.id] = [repu.id];
				// console.log(repu.id, repv.id)
				graph.addEdge(repu, repv, Util.distance(repu, repv));
			}
		}

		graph.rects = rects;
		// console.log(map2);
	}
});



