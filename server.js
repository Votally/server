var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var user = require('./user/user.js');
var receivers = require('./receivers/receivers.js');
var pending = require('./pending/pending.js');
var results = require('./results/results.js');

var app = express();

app.use(express.static(__dirname + '/app'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// connect to mysql database
var connection = mysql.createConnection({
	host: '',
  user: '',
  password:''
}); 

//user-login/signup routes
app.post('/user/login', user.login);
app.post('/user/signup', user.signup);

//receivers route
app.get('/receivers/getContacts', receivers.getContacts);
app.post('/receivers/sendContent', receivers.sendContent);

//pending route
app.get('/pending/getPending', pending.getPending);
app.post('/pending/sendVote', pending.sendVote);

//results route
app.get('/results/getResults', results.getResults);

//server listen
app.listen(process.env.PORT || '8080');

module.exports = app;