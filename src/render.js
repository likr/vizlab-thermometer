import d3 from 'd3';

const render = (options) => {
  const {width, height, timeDomain, temperatureDomain} = options,
        leftMargin = 50,
        rightMargin = 50,
        topMargin = 50,
        bottomMargin = 50,
        contentsWidth = width - leftMargin - rightMargin,
        contentsHeight = height - topMargin - bottomMargin,
        timeScale = d3.time.scale()
          .domain(timeDomain)
          .range([0, contentsWidth * 10])
          .nice(),
        temperatureScale = d3.scale.linear()
          .domain(temperatureDomain)
          .range([contentsHeight, 0]),
        timeAxis = d3.svg.axis()
          .scale(timeScale)
          .ticks(80)
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
          .attr('transform', `translate(${leftMargin - contentsWidth * 9},${topMargin})`);
        element.append('g')
          .classed('time-axis', true)
          .attr('transform', `translate(${leftMargin - contentsWidth * 9},${height - bottomMargin})`)
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

        const zoom = d3.behavior.zoom()
          .scaleExtent([1, 1])
          .translate([leftMargin - contentsWidth * 9, topMargin])
          .on('zoom', function () {
            const e = d3.event;
            let x = e.translate[0];
            if (x < leftMargin - contentsWidth * 9) {
              x = leftMargin - contentsWidth * 9;
              zoom.translate([x, topMargin]);
            }
            element.select('g.contents')
              .attr('transform', `translate(${x},${topMargin})`);
            element.select('g.time-axis')
              .attr('transform', `translate(${x},${height - bottomMargin})`);
          });
        element.call(zoom);
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

export default render;
