'use strict';

var Util = require('../core/Util');
var Graph = require('../core/Graph');
var Obstacle = require('../core/Obstacle');

class Generator {
	static createSimplePolygon(graph, obstacleSize, settings) {
		var obstacle = new Obstacle();
		var old = null;
		var fails = 0;
		outer_loop:
		while (obstacle.nodes.length != obstacleSize) {
			if (fails == 10) {
				obstacle = new Obstacle();
				old = null;
				fails = 0;
				continue outer_loop;
			}
			var varX = Util.getRandomArbitrary(0, settings.w);
			var varY = Util.getRandomArbitrary(0, settings.h);
			
			var points = obstacle.nodes.length;
			if (points>=2) {
				for (var j = 0; j < points-1; j++) {
					if (points == obstacleSize-1) {
						if (Util.linesIntersect(varX,varY,obstacle.getNode(0).x,obstacle.getNode(0).y,
								obstacle.getNode(j).x,obstacle.getNode(j).y,obstacle.getNode(j+1).x,obstacle.getNode(j+1).y)) {
										varX = Util.getRandomArbitrary(0, settings.w);
										varY = Util.getRandomArbitrary(0, settings.h);
										fails++;
										continue outer_loop;
						}
					}
					if (Util.linesIntersect(old.x,old.y,varX,varY,obstacle.getNode(j).x,obstacle.getNode(j).y,obstacle.getNode(j+1).x,obstacle.getNode(j+1).y)) {
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
			obstacle.addNode(obstacle.nodes.length+100,p.x,p.y);
			// graph.addNode(graph.nodes.length+1,p.x,p.y);
			old = p;
		}
		return obstacle;
	}
	
	static createNodes(graph, nrNodes, obstacle, settings) {
		while (graph.nodes.length != nrNodes) {
			var varX = Util.getRandomArbitrary(0, settings.w);
			var varY = Util.getRandomArbitrary(0, settings.h);
			
			if (!obstacle.inObstacle(varX, varY)) {
				graph.addNode(graph.nodes.length+1,varX,varY);
			}
		}
		return graph;
	}
}

module.exports = Generator;