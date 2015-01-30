var mysql = require('mysql');

var dbConnection;

if (process.env.NODE_ENV === 'production') {
  dbConnection = mysql.createConnection({
    host: "us-cdbr-azure-west-a.cloudapp.net",
    user: "bffa2351040f6c",
    password: "81c5b268",
    database: "thesisdb"
  });
} else {
  dbConnection = mysql.createConnection({
    // host: "localhost",
    // user: "team",
    // password: "agate",
    // database: "yesno"

    user: "root",
    password: "",
    database: "test"
  });
}

dbConnection.connect();

module.exports = dbConnection;
