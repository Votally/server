//var Q = require('q');
var mysql = require('../databaseSetup.js');
var saveImageOnS3 = require('../aws.js').saveImageOnS3;

module.exports = {
  getContacts: function(req, res, next){
    //get userid from POST request
    var userId = req.body.userId;

    //define the mysql query to use
    var getContactsQuery = 'SELECT contacts.friendId, users.username FROM contacts INNER JOIN users ON users.userId = contacts.friendId WHERE contacts.userId = ?';

    //perform mysql query, prep and send results to the client
    mysql.query(getContactsQuery, userId, function(error, data){
      if (error){
        console.log(error, "MYSQL ERROR");
      } else {
        data = {receivers: data}
        res.send(data);
      }
    })
  },

  sendContent: function(req, res, next){

    //get content from POST request
    var userId = req.body.content.userId;
    var topic = req.body.content.topic;
    var picture = req.body.content.picture;
    var receivers = req.body.receivers;

    //define the mysql query to use
    var postPicDataQuery = 'INSERT INTO pictures (data) VALUES (?)';
    var postContentQuery = 'INSERT INTO contents (topic, userId, pictureId) VALUES (?, ?, ?)';
    var saveStatusQuery = 'INSERT INTO status (contentId, receiver_count) VALUES (?, ?)';
    var selectReceiversQuery = 'INSERT INTO receivers (contentId, receiversId) VALUES';

    //start mysql transaction for adding new content
    mysql.beginTransaction(function(err) {
      if (err) { 
        console.log(err);
      }

      //add a new picture to db as part of transaction
      mysql.query(postPicDataQuery, 'picture', function(err, result) {
        if (err) { 
          mysql.rollback(function() {
            console.log(err, 'PICTURE');
          });
        } else {
          var pictureId = result.insertId;
          //upload the image to AWS S3
          saveImageOnS3(pictureId, picture);
        }

        //add the content information to db as part of transaction
        mysql.query(postContentQuery, [topic, userId, pictureId], function(err, result) {
          if (err) { 
            mysql.rollback(function() {
              console.log(err, 'CONTENT');
            });
          } else {
            var contentId = result.insertId;
          }

          // insert contentId and receiver_count into status table
          mysql.query(saveStatusQuery, [contentId, receivers.length], function(err){
            if (err) { 
              mysql.rollback(function() {
                console.log(err, 'STATUS');
              });
            }

            //finish composing the query to insert all the receivers
            for (var i=0; i<receivers.length; i++){
              var escapedReceiver = mysql.escape(receivers[i]);
              selectReceiversQuery += '(' + contentId + ', ' + escapedReceiver + '),';
            }
            selectReceiversQuery = selectReceiversQuery.slice(0,-1);
            
            //add all the receivers for the content to db as part of transaction
            mysql.query(selectReceiversQuery, function(err, result) {
              if (err) { 
                mysql.rollback(function() {
                  console.log(err, 'RECEIVERS');
                });
              } else {
                res.end()
              }

              //commit the whole transaction
              mysql.commit(function(err) {
                if (err) { 
                  mysql.rollback(function() {
                    console.log(err, 'COMMIT');
                  });
                }
              });
            });
          
          });
        });
      });
    });
  }

  };
