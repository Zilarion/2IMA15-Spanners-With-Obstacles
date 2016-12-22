'use strict';

var Util = require('../core/Util');
var Graph = require('../core/Graph');

class Generator {
	static createSimplePolygon(obstacleSize, settings) {
		var obstacle = [];
		var old = null;
		var fails = 0;
		outer_loop:
		while (obstacle.length != obstacleSize) {
			if (fails == 10) {
				obstacle = [];
				old = null;
				fails = 0;
				continue outer_loop;
			}
			var varX = Util.getRandomArbitrary(0, settings.w);
			var varY = Util.getRandomArbitrary(0, settings.h);
			
			var points = obstacle.length;
			if (points>=2) {
				for (var j = 0; j < points-1; j++) {
					if (points == obstacleSize-1) {
						if (Util.linesIntersect(varX,varY,obstacle[0].x,obstacle[0].y,
								obstacle[j].x,obstacle[j].y,obstacle[j+1].x,obstacle[j+1].y)) {
										varX = Util.getRandomArbitrary(0, settings.w);
										varY = Util.getRandomArbitrary(0, settings.h);
										fails++;
										continue outer_loop;
						}
					}
					if (Util.linesIntersect(old.x,old.y,varX,varY,obstacle[j].x,obstacle[j].y,obstacle[j+1].x,obstacle[j+1].y)) {
						varX = Util.getRandomArbitrary(0, settings.w);
						varY = Util.getRandomArbitrary(0, settings.h);
						fails++;
						continue outer_loop;
					}
				}
			}
			var p = {
				x: varX,
				y: varY
			}
			fails = 0;
			obstacle.push(p);
			old = p;
		}
		return obstacle;
	}
	
	static createNodes(nrNodes, obstacle, settings) {
		var graph = new Graph();
		
		outer_loop:
		while (graph.nodes.length != nrNodes) {
			var count = 0;
			var varX = Util.getRandomArbitrary(0, settings.w);
			var varY = Util.getRandomArbitrary(0, settings.h);
			
			inner_loop:
			for (var i = 0; i < obstacle.length; i++) {
				if (Util.linesIntersect(0,0,varX,varY, obstacle[i].x,obstacle[i].y,obstacle[(i+1)%obstacle.length].x,obstacle[(i+1)%obstacle.length].y)) {
					count++;
					continue inner_loop;
				}
			}
			
			if (count % 2 != 0) {
				continue outer_loop;
			}
			graph.addNode(graph.nodes.length+1,varX,varY);
		}
		return graph;
	}
}

module.exports = Generator;