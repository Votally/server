var dbConnection = require('../databaseSetup.js');
var addS3PictureDataToPending = require('../aws.js').addS3PictureDataToPending;

module.exports.getPending = function(req, res){
  var userId = req.body.userId;
  //get contentId from receivers table with userId;
  //get contents data from contents table with contentId;
  //get pictureData from pictures table with pictureId;
  //get username from users table with userId;
  getPendingContents(userId, res, addS3PictureDataToPending);
};

module.exports.sendVote = function(req, res){
  var userId = req.body.userId;
  var contentId = req.body.contentId;
  var vote = req.body.vote;

  //look up the contents table with the contentId 
  // if the vote is 1, store 1 in yes, if the vote is -1, store 1 in no, if no, end the response
  if(vote === 1){
    saveYes(contentId, res);
  }
  if(vote === -1){
    saveNo(contentId, res);
  }
  if(vote === 0){
    res.end();
  }

  //delete connection in receivers table
  deleteFromReceivers(userId, contentId);

  //increase the vote_count in status table and checkStatus as a callback
  saveStatus(contentId, checkStatus);
};

// ===================HELPER FUNCTIONS=======================

var getPendingContents = function(userId, res, callback){
  dbConnection.query("SELECT p.data, c.topic, u.username, c.contentId, c.pictureId FROM receivers r JOIN contents c on r.contentID = c. contentID join pictures p on c.pictureID = p.pictureID join users u on c.userId = u.userId WHERE receiversId = '" + userId + "';", function(error, rows) {
    if(error){
      res.send(error);
    }else{
      callback(rows, res);
    }
  });
};

var saveYes = function(contentId, res){
  console.log('receive yes on ' + contentId );
  dbConnection.query("UPDATE contents SET yes = yes+1 WHERE contentId = '" + contentId +"';", function(error) {
    if(error){ res.send(error); }
  });
  res.end();
};

var saveNo = function(contentId, res){
  console.log('receive no on ' + contentId );
  dbConnection.query("UPDATE contents SET no = no+1 WHERE contentId = '" + contentId +"';", function(error) {
    if(error){ res.send(error); }
  });
  res.end();
};

var deleteFromReceivers = function(userId, contentId){
  console.log('deleteing content:' + contentId + ' from the table');
  dbConnection.query("DELETE FROM receivers WHERE receiversId = '" + userId + "' and contentId = '" + contentId + "';", function(error) {
    if(error){ console.error(error); }
  });
};

var saveStatus = function(contentId, callback){
  var query = "UPDATE status SET vote_count = vote_count+1 WHERE contentId = ?";
  dbConnection.query(query, contentId, function(error) {
    if(error){ console.error(error); }
    callback(contentId);
  });
};

var checkStatus = function(contentId){
  var checkQuery = "SELECT receiver_count, vote_count FROM status WHERE contentId = ?";
  var updateQuery = "UPDATE status SET complete_notice = 'ready' WHERE contentId = ?";
  
  dbConnection.query(checkQuery, contentId, function(error, rows) {
    if(error){ console.error(error); }
    //check to see if the votes is completed by checking receiver_count and vote_count
    if(rows[0].receiver_count === rows[0].vote_count){
      //if yes, update the complete_notice to ready in status table
      dbConnection.query(updateQuery, contentId, function(error) {
        if(error){ console.error(error); }
      });
    }
  });
};

