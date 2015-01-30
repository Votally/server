var AWS = require('aws-sdk');
AWS.config.update({ 
  "accessKeyId": process.env.AWS_ID, 
  "secretAccessKey": process.env.AWS_KEY, 
  "region": 'us-west-1' 
});
var s3 = new AWS.S3({params: {Bucket: 'votally.img'}});

s3.saveImageOnS3 = function(pictureId, data){
  //The key has to be a string.
  pictureId = pictureId.toString();
  s3.upload({Key: pictureId, Body: data}, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("uploaded picture to http://s3-us-west-1.amazonaws.com/votally.img/" + pictureId);
    }
  });
};

s3.addS3PictureData = function(resultArray, res){
  var i = 0;

  // retrieve data from S3
  function getS3Object(){
    console.log('getObject called with ', i);
    var content = resultArray[i];

    s3.getObject({ Key: content.pictureId.toString() }, function(err, picData){
      if(err){ console.log(err); }

      //send the data as base64 code
      content.data = 'data:image/jpeg;base64' + picData.Body;
      i++;
      // continue calling the same function through the array
      if(i < resultArray.length){
        getS3Object(i);
      }
      //once it is done, send the response back
      if(i >= resultArray.length){
        res.send(resultArray);
      }
    });

  };

  if(resultArray.length > 0){
    getS3Object(i);
  } 
};

s3.addS3PictureDataToPending = function(resultArray, res){
  var i = 0;

  // retrieve data from S3
  function getS3Object(){
    console.log('getObject called with ', i);
    var content = resultArray[i];

    s3.getObject({ Key: content.pictureId.toString() }, function(err, picData){
      if(err){ console.log(err); }

      //send the data as base64 code
      content.data = 'data:image/jpeg;base64' + picData.Body;
      i++;
      // continue calling the same function through the array
      if(i < resultArray.length){
        getS3Object(i);
      }
      //once it is done, send the response back
      if(i >= resultArray.length){
        res.send({ contents: resultArray });
      }
    });

  };
  if(resultArray.length > 0){
    getS3Object(i);
  } 
};

module.exports = s3;