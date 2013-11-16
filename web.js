var express = require('express');
var fs = require('fs');
var app = express.createServer(express.logger());
var htmlFile = 'index.html';

app.get('/', function(request, response) {
    response.send(fs.readFileSync(htmlFile).toString());
});

app.use(express.static(__dirname + '/assets'));
// Then reference sources like '/css/style.css'

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
