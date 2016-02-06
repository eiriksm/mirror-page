'use strict';
var config = require('../config');
var util = require('util');
var mode = 'weather';
var request = require('superagent');
var m = require('moment');
var parseString = require('xml2js').parseString;
var el = document.getElementById('weather');
var cl = document.getElementById('clock');
var modeEls = {
  weather: document.getElementById('weathermode'),
  bus: document.getElementById('busmode')
}
setInterval(function() {
  cl.innerHTML = m().format('ddd DD.MM HH:mm:ss')
}, 1000);

var symbols = {
  1: 'wi-day-sunny',
  2: 'wi-cloudy',
  12: 'wi-sleet',
  9: 'wi-hail',
  7: 'wi-day-sleet',
  13: 'wi-snow',
  3: 'wi-cloudy',
  4: 'wi-cloud'
}


window.weatherCallback = function(data) {
  var bod = data.data;
  // Get rid of that xml.
  parseString(bod, function(err, result) {
    console.log(result);
    result.weatherdata.forecast[0].tabular[0].time.forEach(function(n, i) {
      if (i > 7) {
        return;
      }
      var symbol = 'wi-lunar-eclipse';
      var symNum = n.symbol[0]['$'].number;
      if (symbols[symNum]) {
        symbol = symbols[symNum];
      }
      else {
        console.log(symNum);
      }
      var date = m(n['$'].from);
      el.innerHTML += '<div class="weatherline">' +
        '<div class="temp">' + n.temperature[0]['$'].value + ' <i class="wi ' + symbol + '"></i></div>' +
        '<div>' + n.precipitation[0]['$'].value + 'mm</div>' +
        '<div class="date">' + date.format('DD.MM HH:mm') + '</div>' +
        '</div>';
    })
  })
}

function changeMode(m) {
  mode = m;
  for (var prop in modeEls) {
    if (prop == mode) {
      modeEls[prop].style.display = 'block';
    }
    else {
      modeEls[prop].style.display = 'none';
    }
  }
}

window.busCallback = function(d) {
  // Clear all bus data.
  var bEl = document.getElementById('bus');
  bEl.innerHTML = '';
  // Inform about latest update time.
  // Cycle sorted departures.
  var added = 0;
  for (var i = 0, len = d.sortedByTime.length; i < len; i++) {
    var line = d.schedule[d.sortedByTime[i].l];
    // Check if it has passed.
    var dep = line.departures[d.sortedByTime[i].d];
    if (dep.p) {
      continue;
    }
    if (added > 10) {
      continue;
    }
    added++;
    var timeText = '<span class="ot">' + m(dep.t).format('HH:mm') + '</span>';
    if (dep.rt) {
      timeText = '<span class="nt">' + m(dep.rt).format('HH:mm') + ' </span><s>' + timeText + '</s>';
    }
    timeText = '<span class="tw">' + timeText + '</span>';
    timeText = '<div class="bustime">' + timeText + ' <span class="tn">' + line.line + '</span> ' + line.name + '</div>';
    bEl.innerHTML += timeText;
  }
  bEl.innerHTML += 'Updated at ' + d.serverTime;
}

function checkWeather() {
  var url = util.format('weather.php?country=%s&county=%s&municipality=%s&town=%s', config.country, config.county, config.municipality, config.town);
  var script = document.createElement('script');
  script.src = url;
  script.type = 'text/javascript';
  document.getElementsByTagName('head')[0].appendChild(script);
}
checkWeather();

function checkBus() {
  // Sorry bartebuss, I am abusing your service. Thanks though.
  var url = 'http://bartebuss.no/api/unified/' + config.stopId + '?callback=busCallback'
  var script = document.createElement('script');
  script.src = url;
  script.type = 'text/javascript';
  document.getElementsByTagName('head')[0].appendChild(script);
}

function poll() {
  request
    .get('//' + window.location.hostname + ':8866/subscribe/mirrormode')
    .end(function(e, d) {
      poll();
      if (e || d.statusCode != 200) {
        return;
      }
      if (!e && d.text != mode) {
        // Change mode.
        changeMode(d.text);
        if (mode == 'bus') {
          checkBus();
          setTimeout(function() {
            changeMode('weather');
          }, 2 * 60000);
        }
      }
  })
}
poll();

