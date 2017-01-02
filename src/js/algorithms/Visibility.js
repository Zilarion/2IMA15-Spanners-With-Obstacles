'use strict';

var Heap = require('heap');
//var RBTree = require('bintrees').RBTree;

var Util = require('../core/Util');
var Graph = require('../core/Graph');



class Visibility {
	static compute(g, obstacle) {
		return Visibility.greedy(g, obstacle);
	}

	static angle(x1, y1, x2, y2){
		return Math.atan2(y2, x2) - Math.atan2(y1, x1)
	}

	static linePosOnAngle(start, end, findAngle){
		var sa = angleA(start);
		var ea = angleA(end);
		var span = Math.abs(sa - ea);
		var minAngle = sa > ea ? ea : sa;
		var minPoint = sa > ea ? end : start;
		var factor = (findAngle - minAngle)/span;
		//construct point for currentAngle
		var currentPointOnMin = {};
		//TODO: can we interpolate with angles like this?
		currentPointOnMin.x = start.x + (end.x - start.x)*factor;
		currentPointOnMin.y = start.y + (end.y - start.y)*factor;
		return currentPointOnMin;			
	}

	static radialSweepPoint(p, points, pointsOffset, edges){
		var visible = [];
		//find B
		//TODO: for obstacle points, B == p
		var B = undefined;
		var closestDistance = 1000000;
		for (var index_e in edges){
			var e = edges[index_e];
			var q = e.s;
			var dist = Util.distance(p, q);
			if (dist < closestDistance){
				closestDistance = dist;
				B = q;
			} 
			q = e.e;
			var dist = Util.distance(p, q);
			if (dist < closestDistance){
				closestDistance = dist;
				B = q;
			} 
		}
		var angleA = function(point){
			return angle(B.x - p.x, B.y - p.y, point.x - p.x, point.y - p.y)
		}
		//construct queue
		var queue = new Heap(function(node1, node2) {
			return angleA(node1) - angleA(node2);
	    });
		//only add points beyond offset
		for (var p = pointsOffset; p < points.length; p++){
			queue.push(points[q]);
		}	
		for (var index_e in edges){
			var e = edges[index_e];
			queue.push(e.s);
			queue.push(e.e);
		}
		heapify();
		//construct infinite line from p through B, call Bdir
		var Bdir = {};
		Bdir.x = (B.x - p.x);
		Bdir.y = (B.y - p.y);
		var dir_len = Math.sqrt(Bdir.x * Bdir.x + Bdir.y * Bdir.y);
		if (dir_len == 0){
			//if B == p, choose at random
			Bdir.x = 1;
			Bdir.y = 0;
			dir_len = 1;
		}
		//normalize
		Bdir.x /= dir_len;
		Bdir.y /= dir_len;
		//scale to "infinity"
		Bdir.x *= 100000;
		Bdir.y *= 100000;
		Bdir.x += p.x;
		Bdir.y += p.y;
		//construct status with lines intersecting dir
		//var status = new RBTree(function(e1, e2) {
			//TODO: does currentAngle update here?
		//	 var p1 = linePosOnAngle(e1.s, e1.e, currentAngle);
		//	 var p2 = linePosOnAngle(e2.s, e2.e, currentAngle); 
		//	 var d1 = Util.distance(p, p1);
		//	 var d2 = Util.distance(p, p2);
		//	 return d1 - d2;
		//});
		for (var index_e in edges){
			var e = edges[index_e];
			if (Util.intersect(e.s.x, e.s.y, e.e.x, e.e.y, 
						   	   p.x,   p.y,   Bdir.x,   Bdir.y)){
				//add clockwise closest to B
				status.insert(e);
			}
		}
		//sweep algorithm
		while (!queue.empty()) {
			var q = queue.pop();
			var currentAngle = angleA(q);
			//check if q is from an obstacle
			if (q.edge){
				//update status
				var edge = q.edge;
				//check if status already has edge
				if (status.find(edge) != null){
					//this point is the endpoint of the edge
					status.remove(edge);
				}else{
					//this point is the startpoint of the edge
					status.insert(q.edge);
				}
			}else{
				//q is not from an obstacle, find closest line
				var minEdge = status.min();
				//check if status is empty
				if (minEdge != null){
					//calculate sweep intersection point on closest line
					var linePos = linePosOnAngle(minEdge.s, minEdge.e, currentAngle);
					//if closer than first line, point is visible
					if (Util.distance(p, currentPointOnMin) < Util.distance(p, q)){
						visible.push(q);
					}
				}else{
					visible.push(q);
				}
			}
		}
		return visible;
	}

	static sweepline(points, obstacles){
		var graph = new Graph();
		for (var p in points){
			graph.nodes.push(points[p]);
		}
		var edges = [];
		for (var obs in obstacles){
			for (var p in obstacles[obs].nodes){
				var s = obstacles[obs].nodes[n];
				var e = obstacles[obs].nodes[(n+1)%obstacles[obs].nodes.length];
				var edge = {s:s, e:e};
				s.edge = edge;
				e.edge = edge;
				edges.push(edge);
			}
		}

		points = graph.nodes;
		for (var index in points){
			//calc visible among point pairs not yet checked (offset by index+1)
			var p = points[index];
			var visible = getVisiblePoints(p, points, index+1, edges);
			for (var v in visible){
				var s = p;
				var e = visible[v];
				graph.addEdge(s, e, Util.distance(s, e));
			}
			//TODO: temp return for debugging
			return;
		}
		return graph;		
	}

	static greedy(g, obstacle){
		var graph = new Graph();
		for (var node in g.nodes){
			graph.addExistingNode(g.nodes[node]);
		}
		for (var node in obstacle.nodes) {
			 graph.addExistingNode(obstacle.getNode(node));
		}

		var points = graph.nodes;
		for (var p = 0; p < points.length; p++){
			for (var q = p+1; q < points.length; q++){
				if (!Util.lineIntersectsObstacle(points[p], points[q], obstacle)){
					var pp = points[p];
					var qq = points[q];
					//check for boundary lines, which lie inside but do not intersect the polygon
					var midpoint = {};
					midpoint.x = pp.x + (qq.x - pp.x)/2;
					midpoint.y = pp.y + (qq.y - pp.y)/2;
					if (!Util.pointInsideObstacle(midpoint.x, midpoint.y, obstacle)){
						graph.addEdge(points[p], points[q], Util.distance(points[p], points[q]));
					}
				}
			}
		}
		return graph;
	}
}

module.exports = Visibility;
