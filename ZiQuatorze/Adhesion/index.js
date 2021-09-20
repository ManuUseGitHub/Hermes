const Discord = require( "discord.js" );
const { Roles , _Guild } = require( "../Resources" );
const Users = require( "../Users" );
const { posponeTimeout } = require( "../../utilities" );

class Adhesion {

  init( ressources ) {
    this.ressources = ressources;
    Users.init( ressources );
  }

  signEmbeded( embed , userId ) {
    const member = Users.getUserFromItsId( userId );
    const user = member.user;
    const icon = user.avatarURL();

    if ( icon === null ) {
      embed.setAuthor( `${user.username}` );
    } else {
      embed.setAuthor( `${user.username}` , `${icon}` );
    }
  }

  updatePendingList( targetRole = Roles.PENDING_R ) {
    
    const { client } = this.ressources;
    

    // Get the Guild and store it under the variable "guild"
    const theGuild = client.guilds.cache.get( _Guild.G_ID.id );

    const pendingDetails = [];

    // Iterate through the collection of GuildMembers from the Guild getting the username property of each member
    const matching = theGuild.members.cache
      .map( ( m ) => {

        const outputOption = { output : "detailed" };
        const language = Users.getLanguagesOfMember( m , outputOption )[ 0 ];
        return {
          roles : { list : m._roles , manager : m.roles } ,
          user : m.user ,
          member : m ,
          language
        };
      } )
      .filter( ( ur ) => {
        let found = false;
        ur.roles.list.forEach( ( r ) => {

          if ( r == targetRole.id ) {
            const hasLanguageOrNothing = ur.language ? `has the language [<@&${ur.language.id}> :: ${ur.language.title}]` : "";
            const text = `• **${ur.user.username}** ${hasLanguageOrNothing}`;
            pendingDetails.push( text );

            found = true;
            return;
          }

        } );
        return found;
      } );

    let embed = new Discord.MessageEmbed(); //For discord v11 Change to new Discord.RichEmbed( )

    const count = matching.length;
    const areOrIs = count > 1 ? `are ${count} ` : "is ";
    const onlyOrNoOne = count ? `only ${count}` : "no-one";
    const memberCountOrNotiong = count > 1 ? "members" : count ? "member" : "";

    const intro =
      `There ${( areOrIs + ( count > 1? "" : onlyOrNoOne ) )} ${memberCountOrNotiong}`;

    embed.description = `${intro} in <@&${targetRole.id}> role/state : \n${pendingDetails.join( "\n" )}`;
    embed.setTimestamp();

    this.signEmbeded( embed , _Guild.U_MY_BOT.id );

    this.tryWritePendingList( { targetRole , theGuild , embed , matching } );
  }

  tryWritePendingList( countObject , messageId = null ) {

    const { targetRole , theGuild , embed , matching } = countObject;

    const components = [];

    let channel = theGuild.channels.cache.get( _Guild.C_NEW_COMMERS.id );

    const definitiveMsgId = messageId != null ? messageId : _Guild.M_PENDING_COUNT.id;

    channel.messages.fetch( definitiveMsgId ).then( ( msg ) => {
      if ( targetRole.id == Roles.PENDING_R.id ) {

        matching.forEach( ( u ) => {
          components.push( this.createMembershipManagedButtons( u ) );
        } );
      };

      if ( messageId ) {
        embed.description = `[P-REQ-${messageId}]\n*:warning: Please update env variables soon*\n\n` + embed.description;
      }
      msg.edit( embed , { components : components } );

    } ).catch( ex => {
      if ( ex.httpStatus == 404 ) {

        // if there is a match, retry but with a retrieved message containing the id withing its embeds
        channel.messages.fetch().then( async messages => {

          // we search for the messages aving embeds
          const message = messages.filter( m => {
            return m.embeds.length;

            // the containing embed should have a good format (P-REQ-ID)
          } ).filter( m => {
            const candidateID = /^\[P-REQ-([\d]+)\].*/.test( m.embeds[ 0 ].description )[ 1 ];
            return candidateID == messageId;
          } ).map( m => m );

          if ( message.length ) {

            this.tryWritePendingList( countObject , message[ 0 ].id );
            
          } else {
            channel.send( embed , { components : components } ).then( m => {
  
              this.tryWritePendingList( countObject , m.id );
            } );
          }
        } );

      // all kind of exception will be rejected
      } else {
        throw ex;
      }
    } );
  }

  createMembershipManagedButtons( userAndRole ) {
    return {
      type : 1 ,

      // action row
      components : [
        {
          type : 2 ,
          label : "✗" ,
          style : 4 ,
          custom_id : `discard-user-${userAndRole.user.id}` ,
        } ,
        {
          type : 2 ,
          label : `✓ ${userAndRole.user.username}` ,
          style : 3 ,
          custom_id : `add-role-[V_R,]-to-${userAndRole.user.id}` ,
        } ,
      ] ,
    };
  }
}

module.exports = new Adhesion();