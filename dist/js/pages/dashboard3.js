/* global Chart:false */

(function () {
  'use strict'

  var ticksStyle = {
    color: '#495057',
    font: {
      weight: 'bold'
    }
  }

  var mode = 'index'
  var intersect = true
  var commonOptions = {
    maintainAspectRatio: false,
    interaction: {
      mode: mode,
      intersect: intersect
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }

  var salesCanvas = document.getElementById('sales-chart')
  // eslint-disable-next-line no-unused-vars
  var salesChart = new Chart(salesCanvas, {
    type: 'bar',
    data: {
      labels: ['JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
      datasets: [
        {
          backgroundColor: '#007bff',
          borderColor: '#007bff',
          data: [1000, 2000, 3000, 2500, 2700, 2500, 3000]
        },
        {
          backgroundColor: '#ced4da',
          borderColor: '#ced4da',
          data: [700, 1700, 2700, 2000, 1800, 1500, 2000]
        }
      ]
    },
    options: {
      ...commonOptions,
      scales: {
        y: {
          grid: {
            display: true,
            lineWidth: 1,
            color: 'rgba(0, 0, 0, .2)',
            drawBorder: false
          },
          ticks: {
            beginAtZero: true,
            ...ticksStyle,
            callback: function (value) {
              if (value >= 1000) {
                value /= 1000
                value += 'k'
              }

              return '$' + value
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            ...ticksStyle
          }
        }
      }
    }
  })

  var visitorsCanvas = document.getElementById('visitors-chart')
  // eslint-disable-next-line no-unused-vars
  var visitorsChart = new Chart(visitorsCanvas, {
    type: 'line',
    data: {
      labels: ['18th', '20th', '22nd', '24th', '26th', '28th', '30th'],
      datasets: [{
        data: [100, 120, 170, 167, 180, 177, 160],
        backgroundColor: 'transparent',
        borderColor: '#007bff',
        pointBorderColor: '#007bff',
        pointBackgroundColor: '#007bff',
        fill: false
      },
      {
        data: [60, 80, 70, 67, 80, 77, 100],
        backgroundColor: 'transparent',
        borderColor: '#ced4da',
        pointBorderColor: '#ced4da',
        pointBackgroundColor: '#ced4da',
        fill: false
      }]
    },
    options: {
      ...commonOptions,
      scales: {
        y: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            beginAtZero: true,
            suggestedMax: 200,
            ...ticksStyle
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            ...ticksStyle
          }
        }
      }
    }
  })
})()

// lgtm [js/unused-local-variable]
