import React, { Component } from 'react'
import ReactHighcharts from 'react-highcharts'
require('highcharts-more')(ReactHighcharts.Highcharts)

const TICK_INTERVAL = 0.1
const INV_TICK_INTERVAL = 1 / TICK_INTERVAL

export class OddsChart extends Component {

  getChartData() {
    const { groups } = this.props
    const categories = Object.keys(groups).map(o => +o).sort((a, b) => a - b)
    return {
      chart: {
        type: 'bubble',
        zoomType: 'xy'
      },
      title: {
        text: ''
      },
      xAxis: {
        title: 'Odds range',
        tickInterval: TICK_INTERVAL
      },
      yAxis: {
        title: 'Chance of success',
        labels: {
          format: '{value}%'
        }
      },
      plotOptions: {
        bubble: {
          minSize: 15
        }
      },
      series: [{
        type: 'line',
        dataLabels: {
          enabled: false
        },
        enableMouseTracking: false,
        name: 'Theoretical hitrate',
        data: categories.map(c => ({
          x: c,
          y: 100 / c
        }))
      }, {
        name: 'Hit rate',
        data: categories.map(c => ({
          x: +c,
          y: groups[c].hitrate,
          z: groups[c].n,
          n: groups[c].n,
        })),
        dataLabels: {
          enabled: true,
          format: '{point.z:.0f}'
        }
      }],
      tooltip: {
        formatter: function() {
          const group = groups[this.x]
          return `Odds range: <b>${this.x}</b><br />Hit rate: <b>${Math.round(group.hitrate * 10) / 10}%</b><br />Theoretical hitrate: <b>${Math.round(100 / this.x * 10) / 10}%</b><br />Flat net result: <b>${ Math.round(group.flatResult * 10) / 10 } units</b><br />Number of trades: <b>${group.n}</b>`
        }
      }
    }
  }

  render() {
    return (
      <div className='panel'>
        <header className='panel-heading'>
          True closing odds vs hit rate breakdown
          <i className='ionicons ion-ios-help-outline'
            data-tip='The blue line shows the theoretical hit rate.<br />If the true closing line ends in 2.0, that should be won 50% of the time.<br />The balls indicate your actual hit rate, so you can see how you run in different odds ranges.<br /> The number and size of the ball indicates how many trades.<br />When the sample gets bigger, the balls and the dots will be aligned.'
            data-for='analytics-explainer'
          />
        </header>
        <div className='panel-body'>
          <ReactHighcharts config={this.getChartData()} />
        </div>
      </div>
    )
  }
}
