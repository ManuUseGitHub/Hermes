var fs = require( "fs" );
const Users = require( "./ZiQuatorze/Users/index.js" );

const DEFAULT_LANG = process.env.DEFAULT_LANG;

const langs = {};
const langFolder = "./ZiQuatorze/lang";
fs.readdirSync( langFolder ).forEach( ( langFile ) => {
    const lang = langFile.split( ".js" )[ 0 ].replace( "ja" , "jp" );
    langs[ lang ] = require( `${langFolder}/${langFile}` );
} );

class Internalization {

    init( ressources ) {
        this.ressources = ressources;
        Users.init( ressources );
    }
    tr( key , role ) {
        const lang = /^M-([a-zA-Z]{0,3})$/.exec( role );
        let result = langs[ lang[ 1 ].toLowerCase() ][ key ];
        
        return result || langs[ DEFAULT_LANG ][ key ];
    };

    tu( key , user ) {
        const role = Users.getLanguagesOfMember( user )[ 0 ];
        return this.tr( key , role );
    };

    tuid( key , userId ) {
        const user = Users.getUserFromItsId( userId );
        return this.tu( key , user );
    };
}
module.exports = new Internalization();