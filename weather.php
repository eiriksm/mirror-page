<?php
$url = sprintf('http://www.yr.no/place/%s/%s/%s/%s/forecast.xml',
  urldecode($_GET['country']),
  urldecode($_GET['county']),
  $_GET['municipality'],
  $_GET['town']);
$data = file_get_contents($url);
print "weatherCallback(" . json_encode(array('data' => $data)) . ')';
?>
