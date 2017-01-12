'use strict';

var Heap = require('heap');
var RBTree = require('bintrees').RBTree;

var Util = require('../core/Util');
var Graph = require('../core/Graph');



class Visibility {
	static compute(g, obstacle) {
		return Visibility.sweep(g, obstacle);
		// return Visibility.greedy(g, obstacle);
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
						   	   sweepPoint.x, sweepPoint.y, dx, dy, true);
	}

	static angle(center, point) {
		var dx = point.x - center.x
    var dy = point.y - center.y
    if (dx == 0 ){
      if (dy < 0)
          return Math.PI * 3 / 2
      return Math.PI / 2
    }
    if (dy == 0){
      if (dx < 0)
        return Math.PI
      return 0
    }
    if (dx < 0)
        return Math.PI + Math.atan(dy / dx)
    if (dy < 0)
        return 2 * Math.PI + Math.atan(dy / dx)
    return Math.atan(dy / dx)
	}

	static segmentDist(segment, center, node) {
		var pOnSegment = Visibility.linePosOnAngle(segment.source, segment.target, center, node);
		return Util.distance(pOnSegment, center);
	}

	static sweep(g, obstacle) {
		console.log("Sweeping")
		var graph = new Graph();
		graph.copy(obstacle, true);
		graph.copy(g, false);

		for (var i = 0; i < graph.nodes.length; i++){
			var p = graph.nodes[i]
			var visible = Visibility.sweepPoint(p, graph, obstacle);

			for (var key in visible) {
				var visibleP = visible[key];
				graph.addEdge(p, visibleP);
			}
			return graph;
		}

		return graph;
	}

	static sweepPoint(point, graph, obstacle) {
		// S = obstacle edges
		// Vs = obstacle nodes
		// Gs = endpoint nodes of S
		// Vs = nodes with set of edges Es

		var status = new RBTree(function(n1, n2) {
			if (n1.id === n2.id) {
				return 0;
			}
			var n1Dist = Util.distance(n1.data.node, point);
			var n2Dist = Util.distance(n2.data.node, point);
			return n1Dist - n2Dist;
		});

		// Initialize event queue
		var events = this.initEvents(point, graph, obstacle);

		var visible = [];
		while (events.size > 0) {
			var event = events.min();
			Visibility.handleEvent(point, event, status, visible);
			events.remove(event);
		}
		// console.log(visible);
		return visible;
	}

	static handleEvent(center, e, status, visible) {
		var eventType = e.event;
		var node = e.node;

		switch(eventType) {
			case "point":
				var min = status.min();
				if(min == null) {
					visible.push(node);
				} else {
					var distToSegment = Visibility.segmentDist(min.data.segment, center, node);
					var distToNode = Util.distance(node, center);

					if (distToSegment > distToNode) {
						visible.push(node);
					}
				}
			break;
			case "start":
				status.insert({id: node.id, data: {node: node, segment: e.segment}});
				var min = status.min();
				if(min == null || min.id == node.id) {
					visible.push(node);
				}
			break;
			case "end":
				status.remove({id: e.startNode.id, data: {node: e.startNode}});
				var min = status.min();
				if(min == null || min.id == node.id) {
					visible.push(node)
				}
			break;
		}
	}

	static initEvents(point, graph, obstacle) {
		var eventQueue = new RBTree(function(n1, n2) {
			var e1 = n1.node;
			var e2 = n2.node;
			if (e1.id == e2.id) {
				return 0;
			}

			// Sort on angle
			var e1Angle = Visibility.angle(point, e1);
			var e2Angle = Visibility.angle(point, e2);

			if (e1Angle == e2Angle) {
				// If equal, sort on distance to this segment
				e1Dist = Util.distance(e1, point);
				e2Dist = Util.distance(e2, point);
				return (e1Dist - e2Dist);
			}
			return (e1Angle - e2Angle);
		});

		// Insert all points
		for (var key in graph.nodes) {
			var node = graph.nodes[key];
			if (!node.isObstacle()) {
				eventQueue.insert({event: "point", node: node});
			}
		}

		// Insert all obstacle segments
		for (var key in obstacle.edges) {
			var edge = obstacle.edges[key];
			var source = edge.source;
			var target = edge.target;
			var endEvent = {event: "end", node: graph.nodes[target.id], startNode: graph.nodes[source.id]};
			eventQueue.insert(endEvent);
			eventQueue.insert({event: "start", node: graph.nodes[source.id], segment: edge});
		}

		return eventQueue;
	}

	// static greedy(g, obstacle){
	// 	console.log("Computing visibility");
	// 	var graph = new Graph();
	// 	graph.copy(obstacle, true);
	// 	graph.copy(g, false);

	// 	var points = graph.nodes;
	// 	for (var p = 0; p < points.length; p++){
	// 		for (var q = p+1; q < points.length; q++){
	// 			if (!Util.lineIntersectsObstacle(points[p], points[q], obstacle)){
	// 				var pp = points[p];
	// 				var qq = points[q];
	// 				//check for boundary lines, which lie inside but do not intersect the polygon
	// 				var midpoint = {};
	// 				midpoint.x = pp.x + (qq.x - pp.x)/2;
	// 				midpoint.y = pp.y + (qq.y - pp.y)/2;
	// 				if (!Util.pointInsideObstacle(midpoint.x, midpoint.y, obstacle)){
	// 					graph.addEdge(points[p], points[q], Util.distance(points[p], points[q]));
	// 				}
	// 			}
	// 		}
	// 	}

	// 	// :TODO: find a decent solution for adding all edges instead
	// 	var prev = undefined;
	// 	for (var key in obstacle.nodes) {
	// 		var p = obstacle.nodes[key]
	// 		if (prev) {
	// 			graph.addEdge(prev, p, Util.distance(prev, p));
	// 		}
	// 		prev = p;
	// 	}
	// 	graph.addEdge(prev, obstacle.nodes[0], Util.distance(prev, obstacle.nodes[0]));
	// 	console.log("Done computing visibility");

	// 	return graph;
	// }
}

module.exports = Visibility;
