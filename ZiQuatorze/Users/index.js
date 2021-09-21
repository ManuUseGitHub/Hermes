const { _Guild } = require( "../Resources" );

class Users {
  init( resources ) {
    this.resources = resources;
  }
  getUserFromItsId( id ) {
    const { client } = this.resources;    
    const theGuild = client.guilds.cache.get( _Guild.G_ID.id );

    return theGuild.members.cache
      .filter( ( m ) => {
        if ( m.id == id ) {
          return true;
        }
      } )
      .get( id );
  }

  getTitleOfLang( id ) {
    
    return Object.keys( this.resources.roles ).map( k => {
      return this.resources.roles[ k ];
    } )
      .filter( item => item.id == id )
      .map( item => item.title )[ 0 ];
  }

  getLanguagesOfMember( member , outputOption = {} ) {

    const {

      // options : name (default) ; id ; detailed
      output = "name"

    } = outputOption;

    // all role names
    return member.roles.cache.map( ( { name , id } ) => {
      return { name , id };
    } )

      // all only roles with lang part
      .filter( ( { name } ) => {
        return /^M-[a-z]{0,3}$/.test( name );
      } )

      // choose if we want the name, the id or an { name , id, titled } object as a result;
      .map( ( { name , id } ) => {
        return output === "name" ?
          `${name}` : output === "id" ?
            `${id}` : output === "detailed" ?
              { name , id , title : this.getTitleOfLang( id ) } : null;
      } );
  }
}

module.exports = new Users();