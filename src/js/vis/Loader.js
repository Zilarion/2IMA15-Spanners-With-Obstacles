'use strict'

var d3 = require('d3');

class Loader {
  constructor(config) {
    this.text = config.svg.append("text")
            .classed(config.id, true)
            .attr("x", function(d) { return config.width/2; })
            .attr("y", function(d) { return config.height/2; })
            .style("font-size","34px")
            .style("text-anchor", "middle")
            .text( function (d) { return "Loading....." })
  }

  opacity(value) {
    this.text.style('opacity', value)
  }

  get element() {
    return this.text;
  }
}

module.exports = Loader;