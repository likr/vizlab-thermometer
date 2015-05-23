import angular from 'angular';
import angularfire from 'angularfire';
import d3 from 'd3';
import downloadable from 'd3-downloadable';
import Firebase from 'firebase';
import render from './render';

angular.module('vizlab-thermometer', [angularfire])
  .factory('records', ($firebaseArray) => {
    const ref = new Firebase('https://vizlab-thermometer.firebaseio.com/records');
    return $firebaseArray(ref);
  })
  .directive('temperatureChart', (records) => {
    return {
      restrict: 'E',
      link: (scope, element) => {
        const zoom = d3.behavior.zoom(),
              root = d3.select(element[0])
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
                })
                .call(downloadable().filename('chart')),
              draw = () => {
                const now = new Date();
                svg.transition()
                  .delay(300)
                  .duration(500)
                  .call(render({
                    width: element[0].clientWidth,
                    height: element[0].clientHeight,
                    timeDomain: [now - 864000000, +now],
                    temperatureDomain: [0, 40],
                    zoom
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
