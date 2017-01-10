'use strict';

var Heap = require('heap');
var RBTree = require('bintrees').RBTree;

var Util = require('../core/Util');
var Graph = require('../core/Graph');



class Visibility {
	static compute(g, obstacle) {
		return Visibility.sweepline(g.nodes, [obstacle]);
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
			var e = edges[index_e];
			var q = e.s;
			var dist = Util.distance(sweepPoint, q);
			if (dist < closestDistance){
				closestDistance = dist;
				B = q;
			} 
			q = e.e;
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

		var angleA = function(point){
			return that.angle(B.x - sweepPoint.x, B.y - sweepPoint.y, point.x - sweepPoint.x, point.y - sweepPoint.y)
		}
		//construct queue
		var queue = new Heap(function(node1, node2) {
			return angleA(node1) - angleA(node2);
	    });
		//only add points beyond offset
		console.log(points);
		for (var p = pointsOffset; p < points.length; p++){
			queue.push(points[p]);
		}	
		for (var index_e in edges){
			var e = edges[index_e];
			queue.push(e.s);
		}
		queue.heapify();
		//construct infinite line from p through B, call Bdir
		var Bdir = {};
		Bdir.x = (B.x - sweepPoint.x);
		Bdir.y = (B.y - sweepPoint.y);
		console.log(sweepPoint, B, Bdir);
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
			if (e1 === e2){
				return 0;
			}
			 var p1 = that.linePosOnAngle(e1.s, e1.e, sweepPoint, that.currentNode);
			 var p2 = that.linePosOnAngle(e2.s, e2.e, sweepPoint, that.currentNode); 
			 var d1 = Util.distance(sweepPoint, p1);
			 var d2 = Util.distance(sweepPoint, p2);
			 return d1 - d2;
		});

		var getOther = function(edge, point){
			if (point === edge.s){
				return edge.e;
			} else if (point === edge.e){
				return edge.s;
			}else{
				throw new Error();
			}
		}

		var getEdgeAngleDiff = function(edge, point){
			var other = getOther(edge, point);
			var angle = angleA(point);
			var otherAngle = angleA(other);
			var angleDiff = otherAngle - angle;
			return otherAngle;
		}

		//TODO: change this to non-"global"
		console.log(sweepPoint, Bdir)
		that.currentNode = B;
		for (var index_e in edges){
			var e = edges[index_e];
			if (Util.intersect(e.s.x, e.s.y, e.e.x, e.e.y, 
							sweepPoint.x,   sweepPoint.y,   Bdir.x,   Bdir.y)){
				//add clockwise closest to B
				if (e === B.edge1 && getEdgeAngleDiff(B.edge1, B) < Math.PI){
					continue;
				}
				if (e === B.edge2 && getEdgeAngleDiff(B.edge1, B) < Math.PI){
					continue;
				}
				console.log("STATUS INSERT", e.s.id, e.e.id);
				status.insert(e);
			}
		}
		console.log("POINT:" +	sweepPoint.id);
		console.log("B:" + 		B.id);
		console.log(points);
		//sweep algorithm
		console.log("EDGES", edges);
		while (!queue.empty()) {
			that.currentNode = queue.pop();
			var currentAngle = angleA(that.currentNode);
			console.log(that.currentNode.id, currentAngle);
			//check if q is from an obstacle
			if (!!that.currentNode.edge1 || !!that.currentNode.edge2){
				//update status
				var handleEdge = function(edge){
					//check if status already has edge
					if (status.find(edge) != null){
						//if this edge is also min, q is visible
						if (status.min() === edge){
							console.log("deleted as min ", edge.s.id, edge.e.id);
							visible.push(that.currentNode);
						}else{
							console.log("delete ", edge.s.id, edge.e.id);
						}
						//this point is the endpoint of the edge
						status.remove(edge);
					}else{
						//this point is the startpoint of the edge
						status.insert(edge);
						if (status.min() === edge){
							//inserted as min, q is visible
							console.log("inserted as min ", edge.s.id, edge.e.id);
							visible.push(that.currentNode);
						}else{
							console.log("inserted ", edge.s.id, edge.e.id);
						}
					}
				}
				handleEdge(that.currentNode.edge1);
				handleEdge(that.currentNode.edge2);
			}else{
				//q is not from an obstacle, find closest line
				var minEdge = status.min();
				//check if status is empty
				if (minEdge != null){
					//calculate sweep intersection point on closest line
					var currentPointOnMin = that.linePosOnAngle(minEdge.s, minEdge.e, sweepPoint, that.currentNode);
					//if closer than first line, point is visible
					console.log("minedge", minEdge.s.id, minEdge.e.id);
					console.log("closest point", currentPointOnMin);
					console.log("minedge dist", Util.distance(sweepPoint, currentPointOnMin));
					console.log("pointdist", Util.distance(sweepPoint, that.currentNode));
					if (Util.distance(sweepPoint, currentPointOnMin) > Util.distance(sweepPoint, that.currentNode)){
						console.log("closest");
						visible.push(that.currentNode);
					}else{
						console.log("not closest");
					}
				}else{
					visible.push(that.currentNode);
				}
			}
		}
		return visible;
	}

	static sweepline(points, obstacles){
		console.log("sweep");
		this.debugLog(points);
		this.debugLog(obstacles);
		var graph = new Graph();
		for (var p in points){
			graph.nodes.push(points[p]);
		}
		var edges = [];
		var addEdge = function(n, e){
			if (!n.edge1){
				n.edge1 = e;
			}else if (!n.edge2){
				n.edge2 = e;
			}else{
				throw new Error();
			}
		}
		for (var obs in obstacles){
			for (var p in obstacles[obs].nodes){
				var s = obstacles[obs].nodes[p];
				var e = obstacles[obs].nodes[(+p+1)%obstacles[obs].nodes.length];
				var edge = {s:s, e:e};
				addEdge(s, edge);
				addEdge(e, edge);
				edges.push(edge);
			}
		}
		points = graph.nodes;
		for (var index = 0; index < points.length - 1; index++){
			//calc visible among point pairs not yet checked (offset by index+1)
			var p = points[index];
			var visible = this.radialSweepPoint(p, points, index+1, edges);
			for (var v in visible){
				var s = p;
				var e = visible[v];
				graph.addEdge(s, e, Util.distance(s, e));
			}
			console.log(graph.edges);
			//TODO: temp return for debugging
			return graph;
		}
		return graph;		
	}

	static greedy(g, obstacle){
		console.log("Starting copy");
		var graph = new Graph();
		graph.copy(g);
		for (var node in obstacle.nodes) {
			var obstNode = obstacle.getNode(node);
			graph.addObstacleNode(obstNode.id, obstNode.x, obstNode.y);
		}
		console.log("Done with copy");
		console.log("Starting regular");

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
		console.log("Done regular");
		console.log("Starting obstacle edges");

		// :TODO: find a decent solution for adding all edges instead
		var prev = undefined;
		for (var key in obstacle.nodes) {
			var p = obstacle.nodes[key]
			if (prev) {
				graph.addEdge(prev, p, Util.distance(prev, p));
			}
			prev = p;
		}
		graph.addEdge(prev, obstacle.nodes[0], Util.distance(prev, obstacle.nodes[0]));
		console.log("Done.");
		return graph;
	}
}

module.exports = Visibility;
