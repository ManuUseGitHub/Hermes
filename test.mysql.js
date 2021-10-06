
require( "dotenv" ).config();

const fs = require( "fs" );
const constructArgv = require( "./ArgumentParser" );
const { con , database } = require( "./Connexion/Heroku" );
const { getCommons , getRare , getFromForm } = require( "./Verbs/Calls" );
const args = constructArgv();
const { type } = args;

const connectAndGet = ( options ) => {
  const {
    sql ,
    filename ,
    alias = "" ,
    base = "./ZiQuatorze/assets/Verbs" ,
    writing = false ,
    resultMappingCB
  } = options;

  con.connect( function ( err ) {
    if ( err ) throw err;
    console.log( "Connected!" , `executing ${alias}` );

    con.query( sql , function ( err , result ) {
      if ( err ) throw err;

      const lines = result.map( ( r ) => { return resultMappingCB( r ); } );
      const woptions = { flag : "w" };
      const filecontent = JSON.stringify( { verbs : lines } );
      const filepath = `${base}/${filename}`;

      const callback = ( err ) => {
        if ( err ) {
          console.error( err );
          return;
        }

        console.log( `successfully written file ${filepath}` );
      };

      if ( writing )
        fs.writeFileSync( filepath , filecontent , woptions , callback );

      con.destroy();
    } );
  } );
};

let requestResult = undefined;

// execution 
switch ( type ) {
  case "commons" :
    requestResult = connectAndGet( getCommons( args , database ) );
    break;

  case "rare" :
    requestResult = connectAndGet( getRare( args , database ) );
    break;

  default :
    requestResult = connectAndGet( getFromForm( args , database , type ) );
}
