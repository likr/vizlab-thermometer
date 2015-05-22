import d3 from 'd3';

const render = (options) => {
  const {width, height, timeDomain, temperatureDomain} = options,
        leftMargin = 50,
        rightMargin = 50,
        topMargin = 50,
        bottomMargin = 50,
        contentsWidth = width - leftMargin - rightMargin,
        contentsHeight = height - topMargin - bottomMargin,
        xRatio = 20,
        yRatio = 4,
        timeScale = d3.time.scale()
          .domain(timeDomain)
          .range([0, contentsWidth * xRatio])
          .nice(),
        temperatureScale = d3.scale.linear()
          .domain(temperatureDomain)
          .range([contentsHeight * yRatio, 0]),
        temperatureColor = d3.scale.quantize()
          .domain([10, 30])
          .range([
            d3.hsl(240, 0.8, 0.5),
            d3.hsl(200, 0.8, 0.5),
            d3.hsl(160, 0.8, 0.5),
            d3.hsl(120, 0.8, 0.5),
            d3.hsl(80, 0.8, 0.5),
            d3.hsl(40, 0.8, 0.5),
            d3.hsl(0, 0.8, 0.5)
          ]),
        timeAxis = d3.svg.axis()
          .scale(timeScale)
          .ticks(12 * xRatio)
          .orient('bottom'),
        temperatureAxis = d3.svg.axis()
          .scale(temperatureScale)
          .ticks(40)
          .orient('left');

  const initialize = (svg) => {
    svg.append('clipPath')
      .attr('id', 'contents-region')
      .append('rect')
      .attr({
        x: 0,
        y: -topMargin,
        width: contentsWidth + rightMargin,
        height: contentsHeight + topMargin
      });
    svg.append('clipPath')
      .attr('id', 'time-axis-region')
      .append('rect')
      .attr({
        x: 0,
        y: 0,
        width: contentsWidth + rightMargin,
        height: bottomMargin
      });
    svg.append('clipPath')
      .attr('id', 'temperature-axis-region')
      .append('rect')
      .attr({
        x: -leftMargin,
        y: -topMargin,
        width: leftMargin,
        height: height
      });

    const contentsWrapper = svg.append('g')
            .classed('contents-wrapper', true)
            .attr({
              'clip-path': 'url(#contents-region)',
              transform: `translate(${leftMargin},${topMargin})`
            }),
          contents = contentsWrapper.append('g')
            .classed('contents', true)
            .attr('transform', `translate(${contentsWidth * (1 - xRatio)},${contentsHeight * (3 - yRatio)})`),
          timeAxisWrapper = svg.append('g')
            .classed('time-axis-wrapper', true)
            .attr({
              'clip-path': 'url(#time-axis-region)',
              transform: `translate(${leftMargin},${height - bottomMargin})`
            }),
          timeAxisG = timeAxisWrapper.append('g')
            .classed('time-axis', true)
            .attr('transform', `translate(${contentsWidth * (1 - xRatio)},0)`)
            .call(timeAxis),
          temperatureAxisWrapper = svg.append('g')
            .classed('temperature-axis-wrapper', true)
            .attr({
              'clip-path': 'url(#temperature-axis-region)',
              transform: `translate(${leftMargin},${topMargin})`
            }),
          temperatureAxiG = temperatureAxisWrapper.append('g')
            .classed('temperature-axis', true)
            .attr('transform', `translate(0,${contentsHeight * (3 - yRatio)})`)
            .call(temperatureAxis);
    svg.selectAll('g.tick line')
      .attr('stroke', 'black');
    svg.selectAll('path.domain')
      .attr({
        stroke: 'black',
        fill: 'none'
      });

    const zoom = d3.behavior.zoom()
      .scaleExtent([1, 1])
      .translate([contentsWidth * (1 - xRatio), contentsHeight * (3 - yRatio)])
      .on('zoom', function () {
        const e = d3.event,
              x = Math.min(Math.max(e.translate[0], contentsWidth * (1 - xRatio)), 0),
              y = Math.min(Math.max(e.translate[1], contentsHeight * (1 - yRatio)), 0);
        zoom.translate([x, y]);
        contents
          .attr('transform', `translate(${x},${y})`);
        timeAxisG
          .attr('transform', `translate(${x},0)`);
        temperatureAxiG
          .attr('transform', `translate(0,${y})`);
      });
    svg.call(zoom);
  };

  return (selection) => {
    selection.each(function (records) {
      const svg = d3.select(this);
      if (svg.select('g.contents').empty()) {
        initialize(svg);
      }
      svg.select('g.contents')
        .selectAll('g.points')
        .data(records, (d) => d.$id)
        .enter()
        .append('g')
        .classed('points', true)
        .attr('transform', (d) => `translate(${timeScale(d.timestamp)},${temperatureScale(20)})`)
        .append('circle')
        .attr({
          fill: (d) => temperatureColor(d.temperature),
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
