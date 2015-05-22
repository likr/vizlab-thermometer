import angular from 'angular';
import angularfire from 'angularfire';
import d3 from 'd3';
import Firebase from 'firebase';

const render = (options) => {
  const {width, height, timeDomain, temperatureDomain} = options,
        leftMargin = 50,
        rightMargin = 50,
        topMargin = 50,
        bottomMargin = 50,
        timeScale = d3.time.scale()
          .domain(timeDomain)
          .range([0, width - leftMargin - rightMargin])
          .nice(),
        temperatureScale = d3.scale.linear()
          .domain(temperatureDomain)
          .range([height - topMargin - bottomMargin, 0]),
        timeAxis = d3.svg.axis()
          .scale(timeScale)
          .orient('bottom'),
        temperatureAxis = d3.svg.axis()
          .scale(temperatureScale)
          .orient('left');

  return (selection) => {
    selection.each(function (records) {
      console.log(records);
      const element = d3.select(this);
      if (element.select('g.contents').empty()) {
        element.append('g')
          .classed('contents', true)
          .attr('transform', `translate(${leftMargin},${topMargin})`);
        element.append('g')
          .classed('time-axis', true)
          .attr('transform', `translate(${leftMargin},${height - bottomMargin})`)
          .call(timeAxis);
        element.append('g')
          .classed('temperature-axis', true)
          .attr('transform', `translate(${leftMargin},${topMargin})`)
          .call(temperatureAxis);
        element.selectAll('g.tick line')
          .attr('stroke', 'black');
        element.selectAll('path.domain')
          .attr({
            stroke: 'black',
            fill: 'none'
          });
      }
      element.select('g.contents')
        .selectAll('g.points')
        .data(records, (d) => d.$id)
        .enter()
        .append('g')
        .classed('points', true)
        .attr('transform', (d) => `translate(${timeScale(d.timestamp)},${height - topMargin - bottomMargin})`)
        .append('circle')
        .attr({
          r: 5
        });
    });

    selection.selectAll('g.points')
      .attr('transform', (d) => `translate(${timeScale(d.timestamp)},${temperatureScale(d.temperature)})`);
    selection.select('g.time-axis')
      .call(timeAxis);
    selection.select('g.temperature-axis')
      .call(temperatureAxis);
  };
};

angular.module('vizlab-thermometer', [angularfire])
  .factory('records', ($firebaseArray) => {
    const ref = new Firebase('https://vizlab-thermometer.firebaseio.com/records');
    return $firebaseArray(ref);
  })
  .directive('temperatureChart', (records) => {
    return {
      restrict: 'E',
      link: (scope, element) => {
        const root = d3.select(element[0])
                .style({
                  position: 'absolute',
                  left: '10px',
                  right: '10px',
                  top: '10px',
                  bottom: '10px'
                }),
              svg = root.append('svg')
                .datum(records)
                .style({
                  width: '100%',
                  height: '100%'
                }),
              draw = () => {
                const now = new Date();
                svg.transition()
                  .delay(300)
                  .duration(500)
                  .call(render({
                    width: element[0].clientWidth,
                    height: element[0].clientHeight,
                    timeDomain: [now - 86400000, +now],
                    temperatureDomain: [0, 50]
                  }));
              };
        let loaded = false;

        records.$loaded().then(() => {
          loaded = true;
          draw();
        });
        records.$watch(() => {
          if (loaded) {
            draw();
          }
        });
      }
    };
  });
