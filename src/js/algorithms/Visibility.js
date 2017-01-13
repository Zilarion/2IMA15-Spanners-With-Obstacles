'use strict';

var Heap = require('heap');
var RBTree = require('bintrees').RBTree;

var Util = require('../core/Util');
var Graph = require('../core/Graph');
var math = require('mathjs');

class Visibility {
	static compute(g, obstacle) {
		return Visibility.sweep(g, obstacle);
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

	// Calculates if a segment intersects with the segment between two points
	static intersects(segment, sweepPoint, node) {
		// This should give a point on which the segment and the line between sweepPoint -> node cross
		var p = math.intersect(
			[segment.source.x, segment.source.y], 
			[segment.target.x, segment.target.y], 
			[sweepPoint.x, sweepPoint.y],
			[node.x, node.y]
		);  

		// If p is null, then we know the segments do not cross and hence p is in front of the segment
		console.log(p, [segment.source.x, segment.source.y], [segment.target.x, segment.target.y], [sweepPoint.x, sweepPoint.y], [node.x,node.y]);
		return p == null ? p : {x: p[0], y: p[1]};
	}

	static distanceToSegment(segment, p) {
		var s1 = segment.source;
		var s2 = segment.target;
		var top = math.abs((s2.y - s1.y) * p.x - (s2.x - s1.x) * p.y + s2.x * s1.y - s2.y * s1.x)
		var bottom = math.sqrt(math.pow(s2.y - s1.y ,2) + math.pow(s2.x - s1.x, 2));
		return top/bottom;
	}

	// Runs sweepPoint all points in g given an obstacle
	static sweep(g, obstacle) {
		console.log("Sweeping")
		var graph = new Graph();
		graph.copy(obstacle, true);
		graph.copy(g, false);

		for (var i = 0; i < graph.nodes.length; i++){
			var p = graph.nodes[i]
			if (!p.isObstacle()) {
				var visible = Visibility.sweepPoint(p, graph, obstacle);
				for (var key in visible) {
					var visibleP = visible[key];
					graph.addEdge(p, visibleP);
				}
				return graph;
			}
		}

		return graph;
	}

	// Sweeps a single point given a graph and obstacle
	static sweepPoint(point, graph, obstacle) {
		// S = obstacle edges
		// Vs = obstacle nodes
		// Gs = endpoint nodes of S
		// Vs = nodes with set of edges Es

		// Initialize the status and event queue
		var events = this.initEvents(point, graph, obstacle);
		var status = this.initStatus(point, graph, obstacle, events);

		var visible = [];
		for (var key in events) {
			var event = events[key];
			Visibility.handleEvent(point, event, status, visible);
		}
		return visible;
	}

	// Handles an event e given a sweepPoint for a certain status. Fills up visible array with visible points from center
	static handleEvent(sweepPoint, e, status, visible) {
		var eventType = e.event;
		var node = e.node;
		console.log('-------------')
		console.log(eventType, node.id);
		switch(eventType) {
			case "point":
				var min = status.min();
				if(min == null) {
					console.log("min");
					visible.push(node);
				} else {
					var p = Visibility.intersects(min.segment, sweepPoint, node);
					console.log([min.segment.source.id, min.segment.target.id], [sweepPoint.id,node.id]);
					if (p == null) {
						console.log("No intersection, so visible")
						visible.push(node);						
					}
					var distToNode = Util.distance(sweepPoint, node);
					var distToSegment = Util.distance(sweepPoint, p);
					
					console.log(distToSegment, distToNode)
					if (distToSegment > distToNode) {
						console.log("Point is in front of segment")
						visible.push(node);
					} else {
						console.log("Segment is closer than the point");
					}
				}
			break;
			case "start":
				status.insert({id: e.segment.source.id, segment: e.segment});
				var min = status.min();
				if(min == null) {
					console.log("min == null or id's are equal")
					visible.push(node);
				}
			break;
			case "end":
				status.remove({id: e.segment.source.id, segment: e.segment});
				var min = status.min();
				if(min == null) {
					console.log("min == null or id's are equal");
					visible.push(node)
				}
			break;
		}
	}

	// Initialize the status given a sweepPoint, graph and the obstacle
	static initStatus(sweepPoint, graph, obstacle, events) {
		var status = new RBTree(function(n1, n2) {
			if (n1.id == n2.id) {
				return 0;
			}
			return Visibility.distanceToSegment(n1.segment, sweepPoint) - Visibility.distanceToSegment(n2.segment, sweepPoint);
			// Set distance from the start/source point
			// var n1Dist = Util.distance(n1.data.node, sweepPoint);
			// var n2Dist = Util.distance(n2.data.node, sweepPoint);
			// if (n1Dist == n2Dist) {
			// 	// Set distance to be the distance to the target point instead
			// 	n1Dist = Util.distance(n1.data.segment.target, sweepPoint);
			// 	n2Dist = Util.distance(n2.data.segment.target, sweepPoint);
			// }
			// return n1Dist - n2Dist;
		});

		// // Fill with all points 180 before our loop
		// var edges = [];
		// for (var key in obstacle.edges) {
		// 	var edge = obstacle.edges[key];
		// 	// If the start of the edge is within 180 of the start
		// 	if (Visibility.angle(sweepPoint, edge.source) <= 180) {
		// 		// And the end isn't in this 180 degrees
		// 		if (!(Visibility.angle(sweepPoint, edge.target) <= 180)) {
		// 			// We have to add this one to the status
		// 			edges.push(edge);
		// 		}
		// 	}
		// }

		// edges.sort(function(e1, e2) {
		// 	Visibility.angle(sweepPoint, edge.source)
		// });

		// Go through all events and update only loop already
		for (var key in events) {
			var e = events[key];
			switch(e.event) {
				case "start":
					var inserted = status.insert({id: e.segment.source.id, segment: e.segment});
					// console.log("ins ", [e.segment.source.id, e.segment.target.id], ": ", inserted)
				break;
				case "end":
					var removed = status.remove({id: e.segment.source.id, segment: e.segment});
					// console.log("rem ", [e.segment.source.id, e.segment.target.id], ": ", removed)
				break;
			}
		}

		return status;
	}

	// Initializes the event queue given a point, graph and the obstacle
	static initEvents(point, graph, obstacle) {
		var eventQueue = [];

		// Insert all points
		for (var key in graph.nodes) {
			var node = graph.nodes[key];
			if (!node.isObstacle() && point.id != node.id) {
				eventQueue.push({event: "point", node: node});
			}
		}

		// Insert all obstacle segments
		for (var key in obstacle.edges) {
			var edge = obstacle.edges[key];
			var source = edge.source;
			var target = edge.target;
			// This doesn't work, the start points are the points which we see first! Then we get the end points. :TODO:
			eventQueue.push({event: "end", node: graph.nodes[target.id], segment: edge});
			eventQueue.push({event: "start", node: graph.nodes[source.id], segment: edge});
		}

		eventQueue.sort(function(e1, e2) {
			var n1 = e1.node;
			var n2 = e2.node;
			if (n1.id == n2.id) {
				return 0;
			}

			// Sort on angle
			var e1Angle = Visibility.angle(point, n1);
			var e2Angle = Visibility.angle(point, n2);

			if (e1Angle == e2Angle) {
				// If equal, sort on distance to this segment
				var e1Dist = Util.distance(n1, point);
				var e2Dist = Util.distance(n2, point);
				return (e1Dist - e2Dist);
			}
			return (e1Angle - e2Angle);
		});

		for (var key in eventQueue) {
			var event = eventQueue[key];
		}

		return eventQueue;
	}
}

module.exports = Visibility;
