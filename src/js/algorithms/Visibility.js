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

	static segIntersect(a, b, c, d) {
		function ccw(a, b, c) {
			return (c.y-a.y) * (b.x-a.x) > (b.y-a.y) * (c.x-a.x)
		}
		return ccw(a,c,d) != ccw(b,c,d) && ccw(a,b,c) != ccw(a,b,d);
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
					visible.push(node);
				} else {
					if (!Visibility.segIntersect(min.segment.source, min.segment.target, sweepPoint, node)) {
						visible.push(node);						
					}
					return;
				}
			break;
			case "segment":
				if(status.find({id: e.segment.source.id, segment: e.segment}) == null) {
					console.log("Add:", [e.segment.source.id, e.segment.target.id])
					status.insert({id: e.segment.source.id, segment: e.segment});
				} else {
					console.log("Remove:", [e.segment.source.id, e.segment.target.id])
					status.remove({id: e.segment.source.id, segment: e.segment});
				}
				var min = status.min();
				if(min == null || min.id == e.segment.source.id) {
					console.log("min == null or id's are equal")
					visible.push(node);
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
		});

		// Go through all segments and insert all segments that we currently intersect
		for (var key in obstacle.edges) {
			var segment = obstacle.edges[key];
			if (Visibility.segIntersect(segment.source, segment.target, sweepPoint, {x: 10000000, y: 0})) {
				status.insert({id: segment.source.id, segment: segment})
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
			eventQueue.push({event: "segment", node: edge.source, segment: edge});
			eventQueue.push({event: "segment", node: edge.target, segment: edge});
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

		return eventQueue;
	}
}

module.exports = Visibility;
