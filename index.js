var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/dist'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// views is directory for all template files
app.set('views', __dirname + '/dist');

app.get('*', function(request, response) {
  response.render('./index.html');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
