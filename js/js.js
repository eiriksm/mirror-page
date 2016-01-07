var request = require('superagent');
var m = require('moment');
var parseString = require('xml2js').parseString;
var url = 'http://crossorigin.me/http://www.yr.no/place/Norway/S%C3%B8r-Tr%C3%B8ndelag/Trondheim/Trondheim/forecast.xml';
var el = document.getElementById('weather');
var cl = document.getElementById('clock');
setInterval(function() {
  cl.innerHTML = m().format('ddd DD.MM HH:mm:ss')
}, 1000)
function tryToFetchSomething() {
  request.get(url)
    .end(function(e, res) {
      if (e) {
        alert(e);
        alert(res.statusCode);
        alert(JSON.stringify(res)) // rly?
        return;
      }
      var bod = res.text;
      // Get rid of that xml.
      parseString(bod, function(err, result) {
        result.weatherdata.forecast[0].tabular[0].time.forEach(function(n, i) {
          if (i > 5) {
            return;
          }
          var date = m(n['$'].from);
          el.innerHTML += '<div class="weatherline">' + 
            '<div class="temp">' + n.temperature[0]['$'].value + '</div>' +
            '<div class="date">' + date.format('DD.MM HH:mm') + '</div>' +
            '</div>';
        })
      })
  })
}
setTimeout(tryToFetchSomething, 2000);
setTimeout(tryToFetchSomething, 10000);