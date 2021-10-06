require( "dotenv" ).config();

const mysql = require( "mysql" );
const DB_CONSTRING = process.env.CLEARDB_DATABASE_URL;
const con_match =
  /mysql:\/{2}([0-9a-f]+):([0-9a-f]+)@([^\/]+).(heroku_[0-9a-f]+)/.exec(
    DB_CONSTRING
  );

const
  host = con_match[ 3 ] ,
  user = con_match[ 1 ] ,
  password = con_match[ 2 ] ,
  database = con_match[ 4 ];

const con = mysql.createConnection( { host , user , password } );

module.exports = { con , database };