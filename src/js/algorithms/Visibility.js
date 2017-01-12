'use strict';

var Heap = require('heap');
var RBTree = require('bintrees').RBTree;

var Util = require('../core/Util');
var Graph = require('../core/Graph');



class Visibility {
	static compute(g, obstacle) {
		// return Visibility.sweepline(g.nodes, [obstacle]);
		return Visibility.greedy(g, obstacle);
	}

	static angle(x1, y1, x2, y2){
		var a = Math.atan2(y2, x2) - Math.atan2(y1, x1);
		if (a < 0){
			a += Math.PI*2;
		}
		return a;
	}

	static linePosOnAngle(start, end, sweepPoint, handlePoint){
		var dx = (handlePoint.x - sweepPoint.x);
		var dy = (handlePoint.y - sweepPoint.y);
		var l = Math.sqrt(dx*dx + dy*dy);
		var stretch = 1000000;
		//normalize and stretch
		dx = sweepPoint.x + dx/l * stretch;
		dy = sweepPoint.y + dy/l * stretch;
		return Util.intersect(start.x, start.y, end.x, end.y, 
						   	   sweepPoint.x,   sweepPoint.y,   dx, dy, true);
	}

	static debugLog(msg){
		if (true){
			var err = new Error(msg);
			console.log(msg);
			console.log(err);
		}
	}

	static radialSweepPoint(sweepPoint, points, pointsOffset, edges){
		var visible = [];
		var that = this;
		//find B
		//TODO: for obstacle points, B == p
		var B = undefined;
		var closestDistance = 1000000;//TODO: max_number?
		for (var index_e in edges){
			console.log("Test");
			var e = edges[index_e];
			var q = e.source;
			var dist = Util.distance(sweepPoint, q);
			if (dist < closestDistance){
				closestDistance = dist;
				B = q;
			} 
			q = e.target;
			var dist = Util.distance(sweepPoint, q);
			if (dist < closestDistance){
				closestDistance = dist;
				B = q;
			} 
		}
		//check B is found
		if (!B){
			console.log("FATAL: COULDNT FIND B");
			return visible;
		}
		
		var handleEvent = function(node) {
			var result = [];
			for (var edge in node.edges) {
				if (!(status.find(node.edges[edge]) === null)) {
					status.insert(node.edges[edge]);
				} else {
					status.remove(node.edges[edge]);
				}
				var min = status.min();
				if (!(Util.linesIntersect(sweepPoint, node, min.source, min.target))) {
					visible.push(node);
				}
			}
			return;
		}

		var angleA = function(point){
			return that.angle(B.x - sweepPoint.x, B.y - sweepPoint.y, point.x - sweepPoint.x, point.y - sweepPoint.y)
		}
		//construct queue
		var queue = new Heap(function(node1, node2) {
			return angleA(node1) - angleA(node2);
	    });
		//only add points beyond offset
		//console.log(points);
		for (var p = pointsOffset; p < points.length; p++){
			queue.push(points[p]);
		}	
		for (var index_e in edges){
			var e = edges[index_e];
			queue.push(e.source);
		}
		queue.heapify();
		
		//construct infinite line from p through B, call Bdir
		var Bdir = {};
		Bdir.x = (B.x - sweepPoint.x);
		Bdir.y = (B.y - sweepPoint.y);
		//console.log(sweepPoint, B, Bdir);
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
		Bdir.x += sweepPoint.x;
		Bdir.y += sweepPoint.y;
		//construct status with lines intersecting dir
		var status = new RBTree(function(e1, e2) {
			if (e1.source.id === e2.source.id && e1.target.id === e2.target.id){
				//console.log("EQ", e1.source.id, e1.target.id, e2.source.id, e2.target.id);
				return 0;
			}
			//console.log("cmp", e1.source.id, e1.target.id, e2.source.id, e2.target.id);
			
			var p1 = that.linePosOnAngle(e1.source, e1.target, sweepPoint, that.currentNode);
			var p2 = that.linePosOnAngle(e2.source, e2.target, sweepPoint, that.currentNode); 
			if (!p1){
				if (that.currentNode === e1.source) p1 = e1.source;
				if (that.currentNode === e1.target) p1 = e1.target;
			}
			if (!p2){
				if (that.currentNode === e2.source) p2 = e2.source;
				if (that.currentNode === e2.target) p2 = e2.target;
			}
			//console.log(p1, p2);
			var d1 = Util.distance(sweepPoint, p1);
			var d2 = Util.distance(sweepPoint, p2);
			return d1 - d2;
		});

		var getOther = function(edge, point){
			if (point === edge.source){
				return edge.target;
			} else if (point === edge.target){
				return edge.source;
			}else{
				throw new Error();
			}
		}

		var getEdgeAngleDiff = function(edge, point){
			var other = getOther(edge, point);
			var angle = angleA(point);
			var otherAngle = angleA(other);
			var angleDiff = Math.abs(otherAngle - angle);
			return angleDiff;
		}

		//TODO: change this to non-"global"
		//console.log(sweepPoint, Bdir)
		that.currentNode = B;
		loop:
		for (var index_e in edges){
			var e = edges[index_e];
			if (Util.intersect(e.source, e.target, sweepPoint, Bdir)){
				//add clockwise closest to B
				if (e === B.edge1 && getEdgeAngleDiff(B.edge1, B) < Math.PI){
					continue loop;
				}
				if (e === B.edge2 && getEdgeAngleDiff(B.edge2, B) < Math.PI){
					continue loop;
				}
				//console.log("STATUS INSERT", e.source.id, e.target.id);
				status.insert(e);
			}
		}
		//console.log("POINT:" +	sweepPoint.id);
		//console.log("B:" + 		B.id);
		//console.log(points);
		//sweep algorithm
		//console.log("EDGES", edges);
		console.log("QUEUE");
		console.log(queue);
		while (!queue.empty()) {
			that.currentNode = queue.pop();
			handleEvent(that.currentNode);
			
			
			var currentAngle = angleA(that.currentNode);
			//console.log(that.currentNode.id, currentAngle);
			//check if q is from an obstacle
			
		}
		return visible;
	}

	static sweepline(g, obstacles){
		console.log("sweep");
		var graph = new Graph();
		// Copy nodes from graph to the new graph
		graph.copy(g, false);
		// Copy obstacle nodes to the new graph
		for (var i=0; i<obstacles.length; i++) {
			graph.copy(obstacles[i], true);
		}
		var points = graph.nodes;
		for (var index = 0; index < points.length; index++){
			//calc visible among point pairs not yet checked (offset by index+1)
			var p = points[index];
			var visible = this.radialSweepPoint(p, points, index+1, graph.edges);
			console.log("VISIBLE from node " + p.id);
			console.log(visible);
			for (var v in visible){
				var s = p;
				var e = visible[v];
				//graph.addEdge(s, e, Util.distance(s, e));
			}
			//console.log(graph.edges);
			//TODO: temp return for debugging
			//return graph;
		}
		return graph;		
	}

	static greedy(g, obstacle){
		console.log("Computing visibility");
		var graph = new Graph();
		for (var node in obstacle.nodes) {
			var obstNode = obstacle.getNode(node);
			graph.addObstacleNode(obstNode.id, obstNode.x, obstNode.y);
		}
		graph.copy(g, false);

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

		// :TODO: find a decent solution for adding all edges instead
		var prev = undefined;
		for (var key in obstacle.nodes) {
			var p = obstacle.nodes[key]
			if (prev) {
				graph.addEdge(prev, p, Util.distance(prev, p));
				console.log(prev.id, p.id)
			}
			prev = p;
		}
		graph.addEdge(prev, obstacle.nodes[0], Util.distance(prev, obstacle.nodes[0]));
		console.log("Done computing visibility");

		return graph;
	}
}

module.exports = Visibility;
