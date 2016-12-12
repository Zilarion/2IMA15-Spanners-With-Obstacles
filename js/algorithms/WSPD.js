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

		// Well seperated
		function seperated(u, v, s) {
			console.log(u, v, s)
			return false;
		}

		// Representative of u
		function rep(u) {
			if (u.children == null) {
				return u;
			} else {
				return [];
			}
		}

		// ws pairs function
		function wsPairs(u, v, T, s) {
			if (rep(u) == [] || rep(v) == [] || (u.children == null && v.children == null && u == v)) {
				return [];
			} else if (seperated(u, v, s)) {
				return [{u, v}];
			} else {
				if (u.depth > v.depth) {
					var temp = v;
					v = u;
					u = temp;
				}
				var childs = u.children;
				var result = [];
				for (key in childs) {
					var child = childs[key];
					var r = wsPairs(child, v, T, s);
					result.concat(r);
				}
				return result;
			}
		}
		wsPairs(quad.root, quad.root, quad, 1);

	}
});



