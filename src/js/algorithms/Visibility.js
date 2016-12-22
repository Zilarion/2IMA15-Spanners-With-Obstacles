'use strict';

var Util = require('../core/Util');
var Graph = require('../core/Graph');
var Heap = require('heap');;
var BinarySearchTree = require('../core/BinarySearchTree');


class Visibility {
	static compute(points, obstacle) {
		return Visibility.greedy(points, obstacle);
	}


	static angle(x1, y1, x2, y2){
		return Math.atan2(y2, x2) - Math.atan2(y1, x1)
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
		var status = new BinarySearchTree();
		for (var index_e in edges){
			var e = edges[index_e];
			if (Util.intersect(e.s.x, e.s.y, e.e.x, e.e.y, 
						   	   p.x,   p.y,   Bdir.x,   Bdir.y)){
				//add clockwise closest to B
				if (angleA(e.e) > angleA(e.s)){
					status.insert(e.s);
				}else{
					status.insert(e.e);
				}
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
				if (status.contains(edge.p)){
					status.remove(edge.p);
				}else{
					status.insertWithKeyChecks(q);
				}
			}else{
				//q is not from an obstacle
				//calculate sweep intersection point on closest line
				var min = status.findMin().edge;
				var sa = angleA(min.s);
				var ea = angleA(min.e);
				var span = Math.abs(sa - ea);
				var minAngle = sa > ea ? ea : sa;
				var minPoint = sa > ea ? min.e : min.s;
				var factor = (currentAngle - minAngle)/span;
				var currentPointOnMin = {};//construct point for currentAngle
				//TODO: can we interpolate like this?
				currentPointOnMin.x = min.s.x + (min.e.x - min.s.x)*factor;
				currentPointOnMin.y = min.s.y + (min.e.y - min.s.y)*factor;
				//if closer than first line, point is visible
				if (Util.distance(p, currentPointOnMin) < Util.distance(p, q)){
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

	static greedy(points, obstacle){
		var graph = new Graph();
		for (var p in points){
			graph.nodes.push(points[p]);
		}
		for (var node in obstacle.nodes) {
			graph.nodes.push(obstacle.getNode(node));
		}

		points = graph.nodes;
		for (var p = 0; p < points.length; p++){
			for (var q = p+1; q < points.length; q++){
				var intersect = false;
				if (Util.lineIntersectsObstacle(points[p], points[q], obstacle)){
					intersect = true;
					break;
				}
				if (!intersect){
					graph.addEdge(points[p], points[q], Util.distance(points[p], points[q]));
				}
			}
		}
		return graph;
	}
}

module.exports = Visibility;
