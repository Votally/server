var dbConnection = require('../databaseSetup.js');

//checks if the user has received any friend requests and any contents to vote.
module.exports.getUsername = function(req, res){
  var userId = req.body.userId;
  var data = {};

  var getUsernameQuery = 'SELECT username, email FROM users WHERE userId = ?';
  dbConnection.query(getUsernameQuery, userId, function(error, rows){
    if (error){
      console.log(error);
    } else {
      data.username = rows[0].username;
      data.email = rows[0].email;
      res.send(data);
    }
  })
}


module.exports.checkUpdates = function(req, res){

  //take the userId information from the request.
  var userId = req.body.userId;

  //prepare the data object to send back with the properties.
  var data = {
    friendRequestCount: undefined,
    pendingCount: undefined,
    resultCompleteCount: undefined
  };

  //define the mysql query to use
  var countFriendRequestQuery = "SELECT * FROM friendRequests WHERE confirmerId = ?";
  var countPendingQuery = "SELECT contentId FROM receivers WHERE receiversId = ?";
  var checkStatusQuery = "SELECT s.contentId, s.complete_notice FROM status s JOIN contents c on s.contentId = c.contentId WHERE userId = ?";
  var changeStatusQuery = "UPDATE status SET complete_notice = 'sent' where contentId = ?";

  //first, check friendRequests database to check if there is any friend requests 
  dbConnection.query(countFriendRequestQuery, userId, function(error, rows){
    if(error){
      res.send(error);
    }else{
      //store the number of the requests in the data object
      data.friendRequestCount = rows.length;
      //second, check receivers datbase to check if there is any pending contents
      dbConnection.query(countPendingQuery, userId, function(error, rows){
        if(error){
          //if there is any error, send back the friend request count at least.
          res.send(data);
        }else{
          //store the number of the pending contents in the data object
          data.pendingCount = rows.length;
          //third check status database to check if there is any voting completed contents 
          dbConnection.query(checkStatusQuery, userId, function(error, rows){
            if(error){
              //if there is any error, send back the friend request count and pending count back.
              res.send(data);
            }else{
              var readyCount = 0;
              //check if there is any content with complete_notice as ready
              for(var i = 0; i < rows.length; i++){
                if(rows[i].complete_notice === 'ready'){
                  //if it is ready, increase the readyCount
                  readyCount++;
                  //change the complete_notice to sent
                  dbConnection.query(changeStatusQuery, rows[i].contentId);
                }
              }
              //store the number of the pending contents in the data object
              data.resultCompleteCount = readyCount;
              //send back the data to client
              res.send(data);
            }
          });
        }
      });
    }
  });
  
};
