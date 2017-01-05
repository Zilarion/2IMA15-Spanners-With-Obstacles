'use strict';

var $ = require('jquery');
var Node = require('../core/Node')
var Obstacle = require('../core/Obstacle')

class DataManager {
	constructor(element_id) {
		this.datasets = [];
		this.bound = element_id;
		this.update();
	}

	addDataset(data) {
		var lines = data.split('\n');

		// Read in all basic values
		var numNodes = lines[0];
		var numObstacles = lines[1];
		var tvalLine = lines[2].split(' ');
		var tval = +tvalLine[0] / +tvalLine[1];

		var nodes = [];

		// Load all nodes
		for(var i = 3; i < 3 + +numNodes; i++){
			var node = lines[i].split(' ');
			nodes.push({id: i-2, x: node[0], y: node[1]});
		}

		// Load all obstacles
		var obstacle = new Obstacle();
		for(var i = 3 + +numNodes; i < 3 + +numNodes + +numObstacles; i++) {
			var oNode = lines[i].split(' ');
			obstacle.addNode(i - 2 - numNodes, oNode[0], oNode[1]);
		}

		// Construct data
		var cID = this.datasets.length + 1;
		var newData = {
			nodes: nodes,
			obstacle: obstacle,
			t: tval,
			id: cID + (data.id ? ": " + data.id : "") // set name to given id, otherwise just set it to the dataset number
		};

		this.datasets.push(newData);
		this.update();

		return newData;
	}

	update() {
		if (this.bound === undefined) {
			return;
		}
		var element = $(this.bound);

		// Clear
		element.empty();
		var table = document.createElement("table");
		table.className = "table"

		var header = document.createElement("tr");
		header.className = "tablerow header"
		table.append(header);

		header.innerHTML = "<th class='cell'>Id</th><th class='cell'>n</th><th class='cell'>k</th><th class='cell'>t</th>";

		for (var i = 0; i < this.datasets.length; i++) {
			var dataset = this.datasets[i];
			var row = document.createElement("tr");

			var idtd = document.createElement("td");
			idtd.innerHTML = dataset.id
			idtd.className = "cell";

			var ntd = document.createElement("td");
			ntd.innerHTML = dataset.nodes.length
			ntd.className = "cell";

			var ktd = document.createElement("td");
			ktd.innerHTML = dataset.obstacle.size();
			ktd.className = "cell";

			var tvaltd = document.createElement("td");
			tvaltd.innerHTML = dataset.t;
			tvaltd.className = "cell";

			row.append(idtd);
			row.append(ntd);
			row.append(ktd);
			row.append(tvaltd);

			row.className = "tablerow";

			table.append(row);
		}
		element.append(table);
	}

	getDatasets() {
		return this.datasets;
	}

	getLastDataset() {
		return this.datasets[this.datasets.length - 1];
	}

	bind(element_id) {
		this.bound = element_id;
	}

	static export(nodes, obstacle, t) {
		var n = nodes.length;
		var m = obstacle.nodes.length;
		var a = t * 100;
		var b = 100;

		var result = 
			n + "\n" +
			m + "\n" +
			a + " " + b + "\n" +
			DataManager.points(nodes) +
			DataManager.obstacle(obstacle);

		return result;
	}

	static points(nodes) {
		var result = "";
		for (var key in nodes) {
			var node = nodes[key];
			result += node.x + " " + node.y + "\n";
		}
		return result;
	}

	static obstacle(obstacle) {
		var result = "";
		for (var key in obstacle.nodes) {
			var node = obstacle.getNode(key);
			result += node.x + " " + node.y + "\n";
		}
		return result;
	}
}

module.exports = DataManager;