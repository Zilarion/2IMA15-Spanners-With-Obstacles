'use strict';

var Util = require('../core/Util');
var QuadTree = require('../core/Quadtree');
var shortest = require('./Astar');

class WSPD {
	static calculate(graph, vgraph, settings) {
		// Build quad tree
		var pointQuad = true;
		var bounds = {
		    x: settings.bounds.xmin,
		    y: settings.bounds.ymin,
		    width: settings.bounds.xmax - settings.bounds.xmin,
		    height: settings.bounds.ymax - settings.bounds.ymin
		}
		var quad = new QuadTree(bounds, pointQuad, 9999999, 1);
		for (var key in graph.nodes) {
			var node = graph.nodes[key];
			if (!node.isObstacle()) {		
				quad.insert(node);
			}
		}

		var t = settings.t
		var s = 4 * (t+1)/(t-1)

		var r = WSPD.wsPairs(quad.root, quad.root, quad, s, vgraph);
		
		for (var key in r) {
			var pair = r[key];
			var repu = WSPD.rep(pair.u);
			var repv = WSPD.rep(pair.v);

			if (pair.u.children.length == 0 || pair.v.children.length == 0) {
				for (var k1 in pair.u) {
					for (var k2 in pair.u) {
						var n1 = pair.u[k1];
						var n2 = pair.u[k2];
						if (n1.id != n2.id) {
							if (!WSPD.isVisible(n1, n2, vgraph)) {
								// Two nodes in this set cannot see eachother, find the shortest path in vgraph
								WSPD.addPathToGraph(shortest.calculate(vgraph.nodes[n1.id], vgraph.nodes[n2.id]), graph);
							}
						}
					}
				}
			} else if (pair.u.children.length == 1 && pair.v.children.length == 1) {
				var n1 = pair.u.children[0];
				var n2 = pair.v.children[0];
				if (!WSPD.isVisible(n1, n2, vgraph)) {
					// console.log(n1.id, n2.id);
					// Two nodes in this set cannot see eachother, find the shortest path in vgraph
					WSPD.addPathToGraph(shortest.calculate(vgraph.nodes[n1.id], vgraph.nodes[n2.id]), graph);
				}
			} else {
				graph.addEdge(repu, repv, Util.distance(repu, repv));
			}
		}
		return graph;
	}

	static addPathToGraph(path, graph) {
		var prev = undefined;
		for (var p in path.sequence){
			var point = path.sequence[p];
			if (prev){
				var source = graph.nodes[prev.id] ? graph.nodes[prev.id] : prev;
				var target = graph.nodes[point.id] ? graph.nodes[point.id] : point;
				graph.addEdge(source, target, Util.distance(prev, point));
			}
			prev = point;
		}
	}

	static isVisible(n1, n2, vgraph) {
		var u = vgraph.nodes[n1.id];
		var v = vgraph.nodes[n2.id];
		for (var key in u.edges) {
			var neighbor = u.edges[key];
			if (neighbor.id == v.id) {
				return true;
			}
		}
		return false;
	}

	// Check if this node is a leaf
	static isLeaf(u) {
		return u.nodes.length == 0;
	}

	static distance(c1, c2) {
		var dx2 = Math.pow(c2.x - c1.x, 2);
		var dy2 = Math.pow(c2.y - c1.y, 2);

		var dCenter = Math.sqrt(dx2 + dy2);

		var result = dCenter - c1.r - c2.r;
		return result;
	}
	// Creates the bounding circle of a node u
	static createCircle(u) {
		return {
			x: WSPD.isLeaf(u) ? WSPD.rep(u).x : u._bounds.x + u._bounds.width / 2,
			y: WSPD.isLeaf(u) ? WSPD.rep(u).y : u._bounds.y + u._bounds.height / 2,
			r: WSPD.isLeaf(u) ? 0 : Math.sqrt(Math.pow(u._bounds.height, 2), Math.pow(u._bounds.width, 2))
		}
	}

	// Well seperated
	static seperated(u, v, s) {
		var cu = WSPD.createCircle(u);
		var cv = WSPD.createCircle(v);

		var maxr = cu.r > cv.r ? cu.r : cv.r;
		// cu.r = maxr;
		// cv.r = maxr;	

		var d = WSPD.distance(cu, cv);
		var result = d >= s * maxr;
		return result;
	}

	static isempty(u) {
		return Array.isArray(u) && u.length == 0;
	}

	// Representative of u
	static rep(u) {
		var result = [];
		if (WSPD.isLeaf(u)) {
			// If u is leaf
			if (u.children.length > 0) {
				// It has only one child, which is therefore the representative
				result = u.children[0];
			}
		} else {
			// If it is not a leaf
			for (var key in u.nodes) {
				var node = u.nodes[key];
				var rep = WSPD.rep(node);

				// Find it's first non empty subnode
				if (!WSPD.isempty(rep)) {
					// Our representative is this nodes representative
					result = rep;
					break;
				}
			}
		}
		return result;
	}

	static union(r1, r2) {
		if (r1.length == 0) {
			r1 = r1.concat(r2);
		}
		for (var k1 in r1) {
			var v1 = r1[k1];
			for (var k2 in r2) {
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
	static wsPairs(u, v, T, s, vGraph) {
		if (WSPD.isempty(WSPD.rep(u)) || WSPD.isempty(WSPD.rep(v)) || (WSPD.isLeaf(u) && WSPD.isLeaf(v) && u === v)) {
			return [];
		} else if (WSPD.seperated(u, v, s)) {
			return [{u: u, v: v}];
		} else {
			if (u._depth > v._depth && !WSPD.isLeaf(v)) {
				var temp = v;
				v = u;
				u = temp;
			}
			var childNodes = u.nodes;
			var result = [];
			for (var key in childNodes) {
				var childNode = childNodes[key];
				var r = WSPD.wsPairs(childNode, v, T, s);
				result = result.concat(r);
			}
			return result;
		}
	}
};

module.exports = WSPD;