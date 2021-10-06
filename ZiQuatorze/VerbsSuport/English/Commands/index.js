module.exports = class EnglishVerbsCommand {

    constructor( vutils ){
        this.vutils = vutils;
    }

    setZ13MessagesCheck( message , Resources , users ){
        if ( /^z13\s[\w]+.*/.test( message.content ) ) {
            message.delete();
        
            const match = /^z13 (get|search|download|help) ([\w\-]+\+?)(?: ([\w\-]+))?/i.exec( message.content );
            if( match ) {
    
                const user = users.getUserFromItsId( message.author.id );
                const role = users.getLanguagesOfMember( user )[ 0 ];
    
                const action = match[ 1 ];
                const arg = match[ 2 ];
                const lang = match[ 3 ] || role;
    
                switch( action ) {
                    case "get" :
                        this.vutils.displayeVerbs( message , arg , Resources , lang );
                        break;
                    case "search" :
                        this.vutils.search( arg );
                        break;
                    case "download" :
                        this.vutils.downloadVerb( arg );
                        break;
                    case "help" :
                        this.vutils.helpWithVerbs( arg );
                }
            }
            else {
                doSomethingWithTheFirstEmbedTitled( message , "irregular verbs" , ( m ) => {
                    deleteFoundMessage( m );
                    message.channel.send( "you have made a mistake with the command z13" );
                } , 5 );
            }
        }
    };
};