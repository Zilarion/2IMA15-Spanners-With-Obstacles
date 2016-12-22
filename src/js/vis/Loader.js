'use strict'

var d3 = require('d3');

class Loader {
  constructor(config) {
    var radius = Math.min(config.width, config.height) / 6;
    var tau = 2 * Math.PI;

    var arc = d3.arc()
            .innerRadius(radius*0.5)
            .outerRadius(radius*0.9)
            .startAngle(0);

    this.group = config.svg.append('g')
        .classed(config.id, true)
        .attr("transform", "translate(" + config.width / 2 + "," + config.height / 2 + ")")

    var background = this.group.append("path")
            .datum({ endAngle: 0.33 * tau })
            .classed(config.id, true)
            .style("fill", "#4D4D4D")
            .attr("d", arc)
            .call(spin, 1500)

    function spin(selection, duration) {
        selection.transition()
            .ease(d3.easeLinear)
            .duration(duration)
            .attrTween("transform", function() {
                return d3.interpolateString("rotate(0)", "rotate(360)");
            });

        setTimeout(function() { spin(selection, duration); }, duration);
    }

    function transitionFunction(path) {
        path.transition()
            .duration(7500)
            .attrTween("stroke-dasharray", tweenDash)
            .each("end", function() { d3.select(this).call(transition); });
    }
  }

  opacity(value) {
    this.group.style('opacity', value)
  }

  get element() {
    return this.group;
  }
}

module.exports = Loader;