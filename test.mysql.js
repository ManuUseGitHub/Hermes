var mysql = require( "mysql" );
require( "dotenv" ).config();

const DB_CONSTRING = process.env.CLEARDB_DATABASE_URL;
const fs = require( "fs" );

const con_match = /mysql:\/{2}([0-9a-f]+):([0-9a-f]+)@([^\/]+).(heroku_[0-9a-f]+)/.exec( DB_CONSTRING );

const host = con_match[ 3 ] ,
  user = con_match[ 1 ] , 
  password = con_match[ 2 ] , 
  database = con_match[ 4 ];

const con = mysql.createConnection( { host  , user  , password  } );

con.connect( function ( err ) {
  if ( err ) throw err;
  console.log( "Connected!" );
  const sql = `SELECT * FROM ${database}.commonly_used_verbs`;
  con.query( sql , function ( err , result ) {
    if ( err ) throw err;

    const lines = result.map( r => {
      const { verb_id ,
        infinitive ,
        preterits ,
        particip ,
        translate ,
        u_id ,
        usage ,
        f_id ,
        form } = r;
      const lang = "en";
      const text = `${infinitive},${preterits},${particip}`;
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q="${text}"`.replace( " " , "%20" );
      const line = { inf : infinitive , pret : preterits , part : particip , tran : translate , usage , url };
      return line;
    } );
    fs.writeFileSync( "./ZiQuatorze/assets/Verbs/commons.json" , JSON.stringify( { verbs : lines } ) , {
      flag : "w"
    } , err => {

      if ( err ) {
        console.error( err );
        return;
      }

      //file written successfully
    } );
    con.destroy();
  } );
}
);