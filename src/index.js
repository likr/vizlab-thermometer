import angular from 'angular';
import angularfire from 'angularfire';
import shinsekai from 'shinsekai';
import Firebase from 'firebase';

angular.module('vizlab-thermometer', [angularfire, shinsekai])
  .factory('records', ($firebaseArray) => {
    const ref = new Firebase('https://vizlab-thermometer.firebaseio.com/records')
      .limitToLast(10);
    return $firebaseArray(ref);
  })
  .directive('temperatureChart', (Scale, records) => {
    return {
      restrict: 'E',
      template: `
        <svg width="900" height="900">
          <g>
            <circle ng-repeat="record in chart.records"
                ss-cx="chart.xScale.scale(record.timestamp)"
                ss-cy="chart.yScale.scale(record.temperature)"
                r="5"/>
          </g>
          <g ss-axis="'left'" ss-ticks="10" ss-scale="chart.yScale"
              transform="translate(50,50)"/>
          <g ss-axis="'bottom'" ss-ticks="10" ss-scale="chart.xScale"
              ss-format="chart.timeFormat"
              transform="translate(50,850)"/>
        </svg>
      `,
      controllerAs: 'chart',
      controller: class Chart {
        constructor() {
          const now = new Date();
          this.records = records;
          this.xScale = new Scale()
            .domain(now - 86400000, now)
            .range(0, 800);
          this.yScale = new Scale()
            .domain(0, 50)
            .range(800, 0);
        }

        timeFormat(t) {
          return new Date(t).toLocaleFormat('%m/%d %H:%M');
        }
      }
    };
  });
