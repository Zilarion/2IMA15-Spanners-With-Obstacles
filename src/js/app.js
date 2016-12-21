'use strict';

var Visualization = require('./vis/Visualization');
var Controller = require('./vis/Controller');
var greedy = require('./algorithms/Greedy');
var wspd = require('./algorithms/WSPD');

var vis_settings = {
	w: 1920,
	h: 1080
}

var controller_settings = {
	t: 1.1,
	algorithm: "greedy",
	algorithms: {
		"greedy": greedy.calculate,
		"WSPD": wspd.calculate
	}
	// [
	// 	{name: "greedy", function: greedy.calculate},
	// 	{name: "WSPD", function: wspd.calculate}
	// ]
}

var v = new Visualization(vis_settings);
var controller = new Controller(v, controller_settings);