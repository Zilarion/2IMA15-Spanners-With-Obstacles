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

	static pDistance(segment, p) {
		var x = p.x;
		var y = p.y;
		var x1 = segment.source.x;
		var y1 = segment.source.y;
		var x2 = segment.target.x;
		var y2 = segment.target.y;

		var A = x - x1;
		var B = y - y1;
		var C = x2 - x1;
		var D = y2 - y1;

		var dot = A * C + B * D;
		var len_sq = C * C + D * D;
		var param = -1;
		if (len_sq != 0) //in case of 0 length line
			param = dot / len_sq;

		var xx, yy;

		if (param < 0) {
			xx = x1;
			yy = y1;
		}
		else if (param > 1) {
			xx = x2;
			yy = y2;
		}
		else {
			xx = x1 + param * C;
			yy = y1 + param * D;
		}

		var dx = x - xx;
		var dy = y - yy;
		return Math.sqrt(dx * dx + dy * dy);
	}

	// Runs sweepPoint all points in g given an obstacle
	static sweep(g, obstacle) {
		console.log("Sweeping")
		var graph = new Graph();
		graph.fullcopy(g, false);

		for (var i = 0; i < graph.nodes.length; i++){
			var p = graph.nodes[i]
			var visible = Visibility.sweepPoint(p, graph, obstacle);
			for (var key in visible) {
				var visibleP = visible[key];
				graph.addEdge(p, visibleP, Util.distance(p, visibleP));
			}
			// return graph;//debug return for only 1 pt
		}

		return graph;
	}

	static rightOfLine(point, start, end){
		var det = (end.x - start.x) * (point.y - start.y) - (end.y - start.y) * (point.x - start.x);
		if (det == 0){
			return false;//on the line
		}
		var result = false;
		if (det < 0){
			result = true;;
		}
		//check vertical line for some reason
		if (start.x == end.x){
			result != result;
		}
		return result;
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
		if (point.isObstacle()){
			//check incident edge
			var inc = point.incidentEdge;
			var ant = point.antecedentEdge;
			var right1 = Visibility.rightOfLine( {x: 100000000000, y: 0}, inc.source, inc.target);
			var right2 = Visibility.rightOfLine( {x: 100000000000, y: 0}, ant.source, ant.target);
			var e1Angle = Visibility.angle(point, inc.source);
			var e2Angle = Visibility.angle(point, ant.target);
			Visibility.ignoreNewPoints = e1Angle < e2Angle;
			point.incidentEdge = undefined;//cleanup?
		}else{
			Visibility.ignoreNewPoints = false;
		}
		var visible = [];
		for (var key in events) {
			var event = events[key];
			Visibility.currentEvent = event;
			Visibility.handleEvent(point, event, status, visible);
		}
		return visible;
	}

	static pushVisible(visible, node){
		if (!Visibility.ignoreNewPoints){
			visible.push(node);
		}	
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
					console.log("visible min==null");
					Visibility.pushVisible(visible, node);
				} else {
					if (!Visibility.segIntersect(min.segment.source, min.segment.target, sweepPoint, node)) {
						console.log("no intersect: ", [min.segment.source.id, min.segment.target.id], [sweepPoint.id, node.id])
						Visibility.pushVisible(visible, node);						
					}
				}
			break;
			case "segment":
				if (sweepPoint.isObstacle() && (e.segment.source.id === sweepPoint.id || e.segment.target.id === sweepPoint.id)){
					Visibility.ignoreNewPoints = !Visibility.ignoreNewPoints;
				}
				var min = status.min();
				if (min != null){
					console.log("old min: ", [min.segment.source.id, min.segment.target.id])
				}else{
					console.log("new min!");
					Visibility.pushVisible(visible, node);
				}

				if(status.find({id: e.segment.source.id, segment: e.segment, node: node}) == null) {
					console.log("Add:", [e.segment.source.id, e.segment.target.id])
				 	var gNode = (node.id === e.segment.source.id)? e.segment.target : e.segment.source;
					status.insert({id: e.segment.source.id, segment: e.segment, node: gNode });
				} else {
					console.log("Remove:", [e.segment.source.id, e.segment.target.id])
					status.remove({id: e.segment.source.id, segment: e.segment, node: node});
					if (min != null && (min.segment.source.id === node.id || min.segment.target.id === node.id)){
						Visibility.pushVisible(visible, node);
					}
				}

				var min = status.min();
				if (min != null)
					console.log("current min: ", [min.segment.source.id, min.segment.target.id])
				if(min == null || min.id == node.id) {
					// console.log(min != null ? ("id equal: ", [min.segment.source.id, min.segment.target.id, min.id, node.id]) : "null")
					 Visibility.pushVisible(visible, node);
				}
			break;
		}
	}
	
	
	// Initialize the status given a sweepPoint, graph and the obstacle
	static initStatus(sweepPoint, graph, obstacle, events) {
		var status = {
			insert: function(el){
				console.log("INSERT");
				Visibility.statusArray.push(el);
			},
			find: function(el){
				for (var key in Visibility.statusArray){
					var obj = Visibility.statusArray[key];
					if (obj.id === el.id){
						return obj;
					}
				}
				return null;
			},
			min:function(el){
				var minDist = 1000000000;
				var min = null;
				for (var key in Visibility.statusArray){
					var obj = Visibility.statusArray[key];
					var src = obj.segment.source;
					var tgt = obj.segment.target;
					var ev = Visibility.currentEvent.node;
					var dist;
					if (ev === src || ev === tgt){
						if (ev === src){
							dist = Util.distance(src, sweepPoint);
						}else if (ev === tgt){
							dist = Util.distance(tgt, sweepPoint);
						}
					}else{
						//calc dir
						var dirx = (ev.x - sweepPoint.x);
						var diry = (ev.y - sweepPoint.y);
						var l = Math.sqrt(dirx*dirx + diry*diry);
						var dirx = (dirx/l) * 100000000 + sweepPoint.x;
						var diry = (diry/l) * 100000000 + sweepPoint.y;
						//intersect sweepPoint - dir with segment.source - segment.end
						var pt = Util.intersect(sweepPoint.x, sweepPoint.y, dirx, diry,
												src.x, src.y, tgt.x, tgt.y,
												true);
						dist = Util.distance(pt, sweepPoint);
					}
					if (dist < minDist){
						minDist = dist;
						min = obj;
					}
				}
				return min;
			},
			remove: function(el){
				console.log("REMOVE");
				for (var key in Visibility.statusArray){
					var obj = Visibility.statusArray[key];
					if (obj.id === el.id){
						console.log("REM : " + Visibility.statusArray);
						Visibility.statusArray.splice(key, 1);
						console.log("REM : " + Visibility.statusArray);
						return;
					}
				}
			}
		}
		Visibility.statusArray = [];

		// Go through all segments and insert all segments that we currently intersect
		var initial = [];
		for (var key in obstacle.edges) {
			var segment = obstacle.edges[key];
			if (Visibility.segIntersect(segment.source, segment.target, sweepPoint, {x: 100000000000, y: 0})) {
				status.insert({id: segment.source.id, segment: segment})
				initial.push([segment.source.id, segment.target.id]);
			}
		}
		// console.log(initial);

		return status;
	}

	// Initializes the event queue given a point, graph and the obstacle
	static initEvents(point, graph, obstacle) {
		var eventQueue = [];

		// Insert all points
		for (var key in graph.nodes) {
			var node = graph.nodes[key];
			if (!node.isObstacle() && point.id != node.id) {
				// eventQueue.push({event: "point", node: node});
			}
		}

		// Insert all obstacle segments
		for (var key in obstacle.edges) {
			var edge = obstacle.edges[key];
			eventQueue.push({event: "segment", node: edge.source, segment: edge});
			eventQueue.push({event: "segment", node: edge.target, segment: edge});
			if (edge.target.id === point.id){
				point.incidentEdge = edge;
			}
			if (edge.source.id === point.id){
				point.antecedentEdge = edge;// #pedantic_errors
			}
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

			if (e1Angle == e2Angle && e1.segment && e2.segment) {
				// If equal, sort on distance to this segment
				var e1Dist = Visibility.pDistance(e1.segment, point);
				var e2Dist = Visibility.pDistance(e2.segment, point);
				return (e1Dist - e2Dist);
			}
			return (e1Angle - e2Angle);
		});

		return eventQueue;
	}
}

module.exports = Visibility;
