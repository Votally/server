var jwt = require('jwt-simple');
var bcrypt = require('bcrypt-nodejs');
var dbConnection = require('../databaseSetup.js');
var crypto = require('crypto');

//===============EXPORT FUNCTIONS=====================

module.exports.login = function(req, res){
	var username = req.body.username;
	var password = req.body.password;

	//check the password in the users table with username
	findPassword(username, function(error, rows){
		if(error){ 
			console.error(error);
			res.send({'error': 'There was an internal error.'});
		}else{
			//if no password is returned, response back.
			if(rows.length === 0){
				res.send({'error': 'The username does not match our record.'});
			}else{
				var savedHash = rows[0].password;
				var userId = rows[0].userId;
				//compare password with becrypted password
				bcrypt.compare(password, savedHash, function(error, isMatched){
					if(error){ 
						console.error(error);
						res.send({'error': 'There was an internal error.'});
					}else{
						if(isMatched){
							//create a token, send it back and store it in the database
							createToken(function(token){
								res.send({
									'userId': userId,
									'token': token
								});
								saveToken(userId, token);
							});
						}else{
							res.send({'error': 'The password does not match our record.'});
						}
					}
			  });
			}
		}
	});
};

module.exports.signup = function(req, res){
	var username = req.body.username;
  var password = req.body.password;
  // var phone = req.body.phone;
  var phone = 1234567890;
  // var email = req.body.email;
  var email = 'satoko@gmail.com';

  checkIfDataExist(username, phone, email, function(error, rows){
  	if(error){ 
  		console.error(error);
  		res.send({'error': 'There was an internal error.'});
  	};
  	if(rows.length === 0){
  		//if the data does not exist, hash password.
  		console.log('no collision with the db');
  		hashPassword(password, function(hash){
  			// save the user data including the hash
  			console.log('hashed password', hash);
  			saveUser(username, hash, phone, email, function(error){
  				if(error){
  					console.error(error);
  					res.send(error);
  				}else{
  					//get the userId from newly inserted row in users table
  					console.log('saved the user');
  					getUserId(username, function(error, rows){
  						if(error){ res.send( { 'error':'could not save the user info.'} ) }
  						var userId = rows[0].userId;
  					  //make token and send it back to user
	  					createToken(function(token){
	  						var data = {
	  							'userId': userId,
	  							'token': token
	  						};
	  						res.send(data);
	  						//save the token in the users table.
	  						saveToken(userId, token);	
	  					});
  					});
  				}
  			});
  		});
  		
  	}else{
  		res.send({ 'error': 'The given infromation already exist in our record.'});
  	}
  });

};

//==============HEALPER FUNCTIONS=====================

var findPassword = function(username, callback){
	dbConnection.query("SELECT password, userId FROM users WHERE username = '" + username + "';", callback);
};

var createToken = function(callback){
	crypto.randomBytes(48, function(ex, buf){
  	var token = buf.toString('hex');
  	callback(token);
	});
};

var saveToken = function(userId, token){
	console.log('saving token...')
  dbConnection.query("UPDATE users SET token = '" + token + "' WHERE userId = '" + userId +"';", function(error) {
    if(error){	console.error(error); }
  });
};

var checkIfDataExist = function(username, phone, email, callback){
	dbConnection.query("SELECT userId FROM users WHERE username = '" + username + "' or phone = '" + phone + "' or email = '" + email + "';", callback);
};

var hashPassword = function(password, callback){
	bcrypt.hash(password, null, null, function(error, hash){
		if(error){ 
			console.error(error);
		}else{
			callback(hash);
		}
	});
};

var saveUser = function(username, hash, phone, email, callback){
	dbConnection.query("INSERT into users (username, password, phone, email) values ('" + username + "', '" + hash + "', '" + phone + "', '" + email + "');", callback);
};

var getUserId = function(username, callback){
	dbConnection.query("SELECT userId from users where username = '" + username + "';", callback);
}
