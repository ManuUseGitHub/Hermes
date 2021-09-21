var fs = require( "fs" );
const Users = require( "./ZiQuatorze/Users/index.js" );

const DEFAULT_LANG = process.env.DEFAULT_LANG;

const langs = {};
const langFolder = "./ZiQuatorze/lang";
fs.readdirSync( langFolder ).forEach( ( langFile ) => {
    const lang = langFile.split( ".js" )[ 0 ].replace( "ja" , "jp" );
    langs[ lang ] = require( `${langFolder}/${langFile}` );
} );

// First, checks if it isn't implemented yet.
if ( !String.prototype.format ) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace( /{(\d+)}/g , function( match , number ) { 
        return typeof args[ number ] != "undefined"
          ? args[ number ]
          : match
        ;
      } );
    };
  }

class Internalization {
    constructor( users ) {
        this.users = users;
    }

    init( ressources ) {
        this.ressources = ressources;
    }
    tr( key , role , format = [] ) {
        const lang = /^M-([a-zA-Z]{0,3})$/.exec( role );
        let result;
        
        if( result = langs[ lang[ 1 ].toLowerCase() ][ key ] ){
            result = result.format( ...format );
        };
        
        return result || langs[ DEFAULT_LANG ][ key ];
    };

    tu( key , user , format = [] ) {
        const role = this.users.getLanguagesOfMember( user )[ 0 ];
        return this.tr( key , role , format );
    };

    tuid( key , userId , format = [] ) {
        const user = this.users.getUserFromItsId( userId );
        return this.tu( key , user , format );
    };
}
module.exports = Internalization;