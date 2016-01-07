var m = require('moment');
var parseString = require('xml2js').parseString;
var el = document.getElementById('weather');
var cl = document.getElementById('clock');
setInterval(function() {
  cl.innerHTML = m().format('ddd DD.MM HH:mm:ss')
}, 1000)
window.callback = function(data) {
  console.log(arguments);
  var bod = data.data;
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
}
