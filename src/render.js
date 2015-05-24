import d3 from 'd3';

const render = (options) => {
  const {width, height, timeDomain, temperatureDomain, zoom} = options,
        leftMargin = 50,
        rightMargin = 50,
        topMargin = 50,
        bottomMargin = 70,
        contentsWidth = width - leftMargin - rightMargin,
        contentsHeight = height - topMargin - bottomMargin,
        xRatio = 10,
        yRatio = 4,
        timeScale = d3.time.scale()
          .domain(timeDomain)
          .range([0, contentsWidth * xRatio])
          .nice(),
        temperatureScale = d3.scale.linear()
          .domain(temperatureDomain)
          .range([contentsHeight * yRatio, 0]),
        temperatureColor = d3.scale.quantize()
          .domain([5, 35])
          .range([
            d3.hsl(240, 0.8, 0.5),
            d3.hsl(192, 0.8, 0.5),
            d3.hsl(144, 0.8, 0.5),
            d3.hsl(96, 0.8, 0.5),
            d3.hsl(48, 0.8, 0.5),
            d3.hsl(0, 0.8, 0.5)
          ]),
        timeAxis = d3.svg.axis()
          .scale(timeScale.copy().range([0, zoom.scale() * contentsWidth * xRatio]))
          .ticks(12 * xRatio)
          .orient('bottom'),
        temperatureAxis = d3.svg.axis()
          .scale(temperatureScale.copy().range([zoom.scale() * contentsHeight * yRatio, 0]))
          .ticks(40)
          .orient('left'),
        line = d3.svg.line()
          .x((d) => timeScale(d.timestamp))
          .y((d) => temperatureScale(d.temperature)),
        gridColor = '#ccc',
        frameColor = '#000';

  const initialize = (svg) => {
    svg.style({
      cursor: 'move',
      'user-select': 'none',
      '-moz-user-select': 'none',
      '-webkit-user-select': 'none',
      '-ms-user-select': 'none'
    });
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
          temperatureAxisG = temperatureAxisWrapper.append('g')
            .classed('temperature-axis', true)
            .attr('transform', `translate(0,${contentsHeight * (3 - yRatio)})`)
            .call(temperatureAxis);

    svg.selectAll('g.tick line')
      .attr('stroke', frameColor);
    svg.selectAll('path.domain')
      .attr({
        stroke: frameColor,
        fill: 'none'
      });
    timeAxisG.selectAll('text')
      .attr('transform', 'rotate(60)');

    const xTicks = timeScale.ticks(timeAxis.ticks()[0]),
          xStart = timeScale(xTicks[0]),
          xStop = timeScale(xTicks[xTicks.length - 1]),
          yTicks = temperatureScale.ticks(temperatureAxis.ticks()[0]),
          yStart = temperatureScale(yTicks[0]),
          yStop = temperatureScale(yTicks[yTicks.length - 1]);
    for (const time of xTicks) {
      const x = timeScale(time);
      contents.append('line')
        .attr({
          stroke: gridColor,
          x1: x,
          y1: yStart,
          x2: x,
          y2: yStop
        });
    }
    for (const temperature of yTicks) {
      const y = temperatureScale(temperature);
      contents.append('line')
        .attr({
          stroke: gridColor,
          x1: xStart,
          y1: y,
          x2: xStop,
          y2: y
        });
    }

    contents.append('path')
      .classed('line', true)
      .attr({
        fill: 'none',
        stroke: '#444'
      });
    contents.append('g')
      .classed('points', true);

    const minScale = 1 / Math.min(xRatio, yRatio);
    zoom
      .scaleExtent([minScale, 1])
      .translate([contentsWidth * (1 - xRatio), contentsHeight * (3 - yRatio)])
      .on('zoom', function () {
        const e = d3.event,
              scale = e.scale,
              xLimitScale = d3.scale.linear()
                .domain([minScale, 1])
                .range([1 / 6, 1]),
              yLimitScale = d3.scale.linear()
                .domain([minScale, 1])
                .range([0, 1]),
              x = Math.min(Math.max(e.translate[0], contentsWidth * (1 - xRatio) * xLimitScale(scale)), 0),
              y = Math.min(Math.max(e.translate[1], contentsHeight * (1 - yRatio) * yLimitScale(scale)), 0);
        zoom.translate([x, y]);
        timeAxis
          .scale()
          .range([0, scale * contentsWidth * xRatio]);
        temperatureAxis
          .scale()
          .range([scale * contentsHeight * yRatio, 0]);
        contents
          .attr('transform', `translate(${x},${y})scale(${scale})`);
        timeAxisG
          .attr('transform', `translate(${x},0)`)
          .call(timeAxis)
          .selectAll('text')
          .style('text-anchor', 'start');
        temperatureAxisG
          .attr('transform', `translate(0,${y})`)
          .call(temperatureAxis);
      });
    svg.call(zoom);
  };

  return (selection) => {
    selection.each(function (records) {
      const svg = d3.select(this);
      if (svg.select('g.contents').empty()) {
        initialize(svg);
      }

      const oldData = svg.selectAll('g.point').data(),
            map = new Map();
      for (const d of oldData) {
        map.set(d.$id, d);
      }

      const dataSelection = svg.select('g.points')
        .selectAll('g.point')
        .data(records, (d) => d.$id);
      dataSelection
        .enter()
        .append('g')
        .classed('point', true)
        .attr('transform', (d) => `translate(${timeScale(d.timestamp)},${temperatureScale(20)})`)
        .append('circle')
        .attr({
          fill: (d) => temperatureColor(d.temperature),
          r: 5
        });
      dataSelection
        .exit()
        .remove();

      const oldLine = d3.svg.line()
        .x((d) => timeScale(d.timestamp))
        .y((d) => temperatureScale(map.has(d.$id) ? d.temperature : 20));
      svg.select('path.line')
        .attr('d', oldLine(records));
    });

    selection.selectAll('g.point')
      .attr('transform', (d) => `translate(${timeScale(d.timestamp)},${temperatureScale(d.temperature)})`);
    selection.select('g.time-axis')
      .call(timeAxis)
      .selectAll('text')
      .style('text-anchor', 'start');
    selection.select('g.temperature-axis')
      .call(temperatureAxis);
    selection.select('path.line')
      .attr('d', line);
  };
};

export default render;
