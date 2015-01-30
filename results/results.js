var dbConnection = require('../databaseSetup.js');
var addS3PictureData = require('../aws.js').addS3PictureData;

//getResults is a function that is called by the server in server.js that queries to the database to get results depending on the userId in the local storage
module.exports.getResults = function(req, res){
  //*** still need to check if userId gets accessed ***
  var userId = req.body.userId;
  // var userId = 10
  // console.log(req, "REQUEST")
  // console.log(response, "what is the response in getResults")
  //Query used to access mySQL tables
  var query = 'select contents.userid, users.username, contents.topic, contents.yes, contents.no, pictures.pictureId, pictures.data from contents join users on contents.userId = users.userId and users.userId='+ userId + ' join pictures on contents.pictureId = pictures.pictureId';
  
  dbConnection.query(query, function(error, data){
    if(error){
      console.log("Could not get results from db because: ", error);
    } else {
      addS3PictureData(data, res);
    }
  })
};

// =================== Query Functions ===================//

//expect to return an object with 
// function getResultsContents (userId, response){
//   userId = '10';
//   //dbConnection.query() method is used to make queries to the mySQL database
// };



//To test if the server grabs the correct things from the database
/* 

Expect this on client end: - expect response.send to show this
[{
    topic: 'string',
    picture: some kind of data for pictures,
    userId: 1234,
    userName: 'string',
    yes: 4,
    no: 1
  }]
db: test
Inserting: - sql commands 

insert into users (userId, username, password) values (10, 'treelala', 'somepass')
insert into contents (contentId, userId, pictureId, topic, yes, no) values (1, 10, 100, 'cool?', 4, 1);
insert into pictures (pictureId, data) values (100, LOAD_FILE('/Users/teresayung/ThesisProject/server/snowboard-2.jpg'));

Retrieving: 

'select contents.userid, users.username, contents.topic, contents.yes, contents.no, pictures.data from contents join users on contents.userId = users.userId and users.userId='+ userId + ' join pictures on contents.pictureId = pictures.pictureId';

*/

