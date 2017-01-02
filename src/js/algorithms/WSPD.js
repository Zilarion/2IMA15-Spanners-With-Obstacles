'use strict';

var Util = require('../core/Util');
var Quadtree = require('../core/Quadtree');
var shortest = require('./Dijkstra');
var debug;

class WSPD {
	static calculate(graph, visibilityGraph, settings) {
		// Build quad tree
		var pointQuad = true;
		var bounds = {
		    x:0,
		    y:0,
		    width: settings.w,
		    height: settings.h
		}
		debug = {circles: [], rects: []};
		var quad = new QuadTree(bounds, pointQuad, 9999999, 1);
		quad.insert(graph.nodes);

		var t = settings.t
		var s = 4 * (t+1)/(t-1)

		var r = WSPD.wsPairs(quad.root, quad.root, quad, s);
		
		var map = {};
		for (var key in r) {
			var pair = r[key];

			debug.circles.push(WSPD.createCircle(pair.u))
			debug.circles.push(WSPD.createCircle(pair.v))

			var repu = WSPD.rep(pair.u);
			var repv = WSPD.rep(pair.v);

			// map[repu.id] ? map[repu.id].push(repv.id) : map[repu.id] = [repv.id];
			// map[repv.id] ? map[repv.id].push(repu.id) : map[repv.id] = [repu.id];
			// console.log(pair.u, pair.v)
			graph.addEdge(repu, repv, Util.distance(repu, repv));
		}
		// console.log(map)
		return debug;
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
	static wsPairs(u, v, T, s) {
		if (WSPD.isempty(WSPD.rep(u)) || WSPD.isempty(WSPD.rep(v)) || (WSPD.isLeaf(u) && WSPD.isLeaf(v) && u === v)) {
			return [];
		} else if (WSPD.seperated(u, v, s)) {
			return [{u: u, v: v}];
		} else {
			if (u._depth > v._depth) {
				var temp = v;
				v = u;
				u = temp;
			}
			debug.rects.push(u._bounds)
			debug.rects.push(v._bounds)
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