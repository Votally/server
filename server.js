var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var user = require('./user/user.js');
var home = require('./home/home.js');
var friends = require('./friends/friends.js');
var receivers = require('./receivers/receiverLogic.js');
var pending = require('./pending/pending.js');
var results = require('./results/results.js');

var app = express();

// app.use(express.static(__dirname + '/www')); 
// app.use(express.static(__dirname + '/app'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//user-login/signup/logout routes
app.post('/user/login', user.login);
app.post('/user/signup', user.signup);
app.post('/user/logout', user.logout);

//home route
app.post('/home/checkUpdates', home.checkUpdates);

// //friends route
app.post('/friends/checkRequest', friends.checkRequest);
app.post('/friends/requestFriend', friends.requestFriend);
app.post('/friends/confirmFriend', friends.confirmFriend);
app.post('/friends/declineFriend', friends.declineFriend);

//receivers route
app.post('/receivers/getContacts', receivers.getContacts);
app.post('/receivers/sendContent', receivers.sendContent);

//pending route
app.post('/pending/getPending', pending.getPending);
app.post('/pending/sendVote', pending.sendVote);

//results route
app.post('/results/getResults', results.getResults);

//server listen
app.listen(process.env.PORT || '8080');

module.exports = app;