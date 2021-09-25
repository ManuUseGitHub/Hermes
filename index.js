const env = require( "dotenv" ).config();

const Discord = require( "discord.js" );

const disbut = require( "discord-buttons" );

const Internalize = require( "./internalization" );

const { MessageButton , MessageActionRow } = disbut;
const { Roles , _Guild } = require( "./ZiQuatorze/Resources" );

const { arr_diff , posponeTimeout , packetClosure } = require( "./utilities.js" );
const { getHelloLocalizedDescription , getHelloLocalizedAcceptation } = require( "./greetings.js" );

const Adhesion = require( "./ZiQuatorze/Adhesion" );
const Users = require( "./ZiQuatorze/Users" );
const internalize = new Internalize( Users );

console.log( `Environment : ${process.env.NODE_ENV}` );

const client = new Discord.Client();
disbut( client );
client.login( process.env.BOT_TOKEN );
const Resources = { client , roles : Roles , guild : _Guild };

Adhesion.init( Resources );
Users.init( Resources );
internalize.init( Resources );

const POOL_TIME = process.env.POOL_TIME;

const activity = {
  userPool : {} ,
  buttonPool : {} ,
};

client.on( "ready" , () => {
  console.log( "Bot is ready" );
} );

const buildRoleIDList = ( member , isIds = true ) => {
  const roles = [];
  member.roles.cache.each( ( { id , name } ) => {
    if ( isIds ) {
      roles.push( id );
    } else {
      roles.push( name );
    }
  } );
  return roles;
};

function getLanguageMember( oldMember , newMember ) {

  // - - - - Getting member + lang list only - - - -

  const oldLangRoles = Users.getLanguagesOfMember( oldMember );

  const newLangRoles = Users.getLanguagesOfMember( newMember );

  return { oldLangRoles , newLangRoles };
}

function removeValidRoles( newMember ) {
  newMember.roles.set( [] , "Is not a valid member anymore" );
}

const discardUser = ( id ) => {

  const user = Users.getUserFromItsId( id );

  user.roles.set( [] );

  setTimeout( () => {
    Adhesion.updatePendingList();
  } , 1000 );
};

const onListedRolesDo = ( button , cb ) => {
  const roles = /^.*-(\[(?:.+[,])*,?\])-to-\d+/.exec( button.id );
  let m = null;
  const re = /([^\\[,]+),/g;
  while ( ( m = re.exec( roles[ 1 ] ) ) ) {
    if ( m.index === re.lastIndex ) re.lastIndex++;

    const roleID = Roles[ m[ 1 ] ].id;
    cb( roleID );
  }
};

const addRole = ( id , button ) => {
  const user = Users.getUserFromItsId( id );

  onListedRolesDo( button , ( roleID ) => {
    user.roles.add( roleID );
  } );

  setTimeout( () => {
    Adhesion.updatePendingList();
  } , 2000 );
};

const removeRoles = ( id , button ) => {
  const user = Users.getUserFromItsId( id );

  onListedRolesDo( button , ( roleID ) => {
    user.roles.remove( roleID );
  } );
};

const poolActionForId = ( pool , id , cb ) => {
  if ( pool[ id ] != null ) {
    postponeReactionClosure( id , pool );
  } else {
    pool[ id ] = {
      timer : setTimeout( () => {
        delete pool[ id ];
      } , Number.parseInt( POOL_TIME ) ) ,
    };

    cb();
  }
};

client.on( "clickButton" , async ( button ) => {
  const actionAndUserId = /^((?:-?[a-zA-Z\d])+).*-(\d+)/.exec( button.id );
  const action = actionAndUserId[ 1 ];
  const id = actionAndUserId[ 2 ];

  // use the pooling to make sure we execute the action once because
  // some event are fired more than once
  poolActionForId( activity.buttonPool , id , () => {
    switch ( action.toLowerCase() ) {
      case "add-role" :
        addRole( id , button );

        break;
      case "remove-role" :
        removeRoles( id , button );
        break;
      case "discard-user" :
        discardUser( id );

        break;
      default :
        break;
    }

    /* 
    The folowing instruction has to be called only once because it will remove 
    the interaction after the first call leading to a 
    > (node:5204) UnhandledPromiseRejectionWarning: DiscordAPIError: Unknown interaction*/

    // mark the button action as completed
    button.reply.defer();
  } );
} );
const getDiffRoles = ( oldMember , newMember , useID = true ) => {
  return arr_diff(
    oldMember.roles.cache.map( ( { name , id } ) => {
      return `${useID ? id : name}`;
    } ) ,
    newMember.roles.cache.map( ( { name , id } ) => {
      return `${useID ? id : name}`;
    } ) ,
  );
};

const postponeReactionClosure = ( id , pool ) => {
  const itimer = pool[ id ];
  posponeTimeout( itimer , POOL_TIME , {
    cb : () => {
      delete pool[ id ];
    } ,
    params : [] ,
  } );
};

const validateNewUser = ( roleChanges ) => {
  const { diff , newRIds , oldRIDs , newLangRoles , member } = roleChanges;

  if ( diff[ 0 ] === Roles.V_R.id && newRIds.length > oldRIDs.length ) {

    // we add the validation lang
    const lang = /^M-([a-z]{0,3})$/.exec( newLangRoles[ 0 ] );
    if ( lang ) {

      const validatedLanguage = ( {
        fr : Roles.V_FR_R.id ,
        jp : Roles.V_JP_R.id ,
        id : Roles.V_ID_R.id ,
        en : Roles.V_EN_R.id
      } )[ lang[ 1 ] ];

      member._new.roles.add(
        validatedLanguage ,
        "language validation defined" ,
      );

      // MESSAGING THE USER
      const translatedMessage = internalize.tu( "accepted_adhesion" , member._new );

      const user = client.users.cache.get( member._new.user.id );

      const embedMessage = new Discord.MessageEmbed().setDescription(
        translatedMessage ,
      );

      user.send( embedMessage );
    }
  }
};

client.on( "messageReactionAdd" , ( reaction , user ) => {

  // if the reaction is from MR. translate
  if ( user.id === _Guild.U_MR_TRANSLATE.id ) {
    reaction.users.remove( user.id );
  }
} );

client.on( "raw" , ( packet ) => {

  // We don't want this to run on unrelated packets
  if ( ![ "MESSAGE_REACTION_ADD" , "MESSAGE_REACTION_REMOVE" ].includes( packet.t ) )
    return;

  // Grab the channel to check the message from
  const channel = client.channels.cache.get( packet.d.channel_id );

  // There's no need to emit if the message is cached, because the event will fire anyway for that
  if ( channel.messages.cache.has( packet.d.message_id ) ) return;

  // Since we have confirmed the message is not cached, let's fetch it
  channel.messages.fetch( packet.d.message_id ).then( ( message ) => {

    // Emojis can have identifiers of name:id format, so we have to account for that case as well
    const emoji = packet.d.emoji.id
      ? `${packet.d.emoji.name}:${packet.d.emoji.id}`
      : packet.d.emoji.name;

    // This gives us the reaction we need to emit the event properly, in top of the message object
    const reaction = message.reactions.cache.get( emoji );

    // Adds the currently reacting user to the reaction's users collection.
    if ( reaction )
      reaction.users.cache.set(
        packet.d.user_id ,
        client.users.cache.get( packet.d.user_id ) ,
      );

    // Check which type of event it is before emitting
    if ( packet.t === "MESSAGE_REACTION_ADD" ) {
      client.emit(
        "messageReactionAdd" ,
        reaction ,
        client.users.cache.get( packet.d.user_id ) ,
      );
    }
    if ( packet.t === "MESSAGE_REACTION_REMOVE" ) {
      client.emit(
        "messageReactionRemove" ,
        reaction ,
        client.users.cache.get( packet.d.user_id ) ,
      );
    }
  } );
} );

client.on( "guildMemberUpdate" , ( oldMember , newMember ) => {
  let diffRoles = getDiffRoles( oldMember , newMember , true );

  poolActionForId( activity.userPool , oldMember.id , () => {
    let oldRoleIDs = buildRoleIDList( oldMember );
    let newRoleIDs = buildRoleIDList( newMember );

    let rolesArr = newMember.roles.cache.map( ( { name , id } ) => {
      return `${id}`;
    } );

    const { oldLangRoles , newLangRoles } = getLanguageMember(
      oldMember ,
      newMember ,
    );

    if ( newLangRoles.length > 1 ) {
      const newestLangRole = arr_diff( oldLangRoles , newLangRoles );

      const newestId = newMember.roles.cache
        .filter( ( { name } ) => {
          return name == newestLangRole;
        } )
        .map( ( r ) => r.id );

      if ( newestId ) {
        newMember.roles.remove( newestId );
      }
    }

    // - - - - If a change within the member role list has occured - - - -
    // if we have removed a member with lang role
    if (
      newLangRoles.length == 0 &&
      oldLangRoles.length > newLangRoles.length
    ) {
      newMember.roles.remove(
        [ Roles.PENDING_R.id , Roles.MEMBER_R.id ] ,
        "Is not a member anymore" ,
      );

      // remove all language roles
      removeValidRoles( newMember );
    }

    // if we have added a member with lang role
    else if ( oldLangRoles.length < newLangRoles.length ) {
      newMember.roles.add( Roles.MEMBER_R.id , "Is a member" );
      rolesArr.push( Roles.MEMBER_R.id );
    }

    const isNotAMemberAnymore =
      newRoleIDs.length < oldRoleIDs.length &&
      !rolesArr.includes( Roles.MEMBER_R.id );

    const shouldLostPendingRole =
      rolesArr.includes( Roles.V_R.id ) || isNotAMemberAnymore;

    if ( shouldLostPendingRole ) {

      // The member has lost it's Member role
      newMember.roles.remove( Roles.PENDING_R.id , "Has not the pending role" );
      if ( isNotAMemberAnymore ) {
        newMember.roles.set( [] , "is not a member anymore" );

        removeValidRoles( newMember );
      }
    }

    //check if the newRoleIDs had one more role, which means it added a new role
    else if ( newRoleIDs.length > oldRoleIDs.length ) {

      // refresh the roles array
      let newrolesArr = newMember.roles.cache.map( ( { name , id } ) => {
        return `${name}`;
      } );

      // The member has gain it's Member role
      if (
        rolesArr.includes( Roles.MEMBER_R.id ) &&
        !rolesArr.includes( Roles.V_R.id ) &&
        newLangRoles.length < 2
      ) {



        const translatedMessage = internalize.tu( "greetings" , newMember );

        if ( translatedMessage ) {
          newMember.roles.add(
            Roles.PENDING_R.id ,
            "Has the pending role" ,
          );

          const user = client.users.cache.get( newMember.user.id );

          const embedMessage =
            new Discord.MessageEmbed().setDescription(
              translatedMessage ,
            );

          user.send( embedMessage );

          setTimeout( () => { Adhesion.updatePendingList(); } , 1000 );

        }
      }
    }

    if (
      diffRoles[ 0 ] === Roles.V_R.id &&
      newRoleIDs.length > oldRoleIDs.length
    ) {
      validateNewUser( {
        diff : diffRoles ,
        newRIds : newRoleIDs ,
        oldRIDs : oldRoleIDs ,
        newLangRoles ,
        member : { _new : newMember , old : oldMember } ,
      } );
    }
  } );
} );

client.on( "message" , ( message ) => {
  if ( message.content == "!help" ) {
    return;
  }
  if ( message.content == "z14 all" ) {
    if ( message.channel.id != _Guild.C_NEW_COMMERS.id ) {
      const response = internalize.tuid( "wrong_channel_for_command" , message.author.id , [ message.author.id , _Guild.C_NEW_COMMERS.id ] );

      message.channel.send( response );

    }
    Adhesion.updatePendingList();
    message.delete();
  } else if ( /^z14 all .*/.test( message.content ) ) {
    const role = /^z14 all[^\d]*([0-9]+)[^\d]*/.exec( message );

    // Get the Guild and store it under the variable "guild"
    const theGuild = client.guilds.cache.get( _Guild.G_ID.id );
    const targetRole = theGuild.roles.cache.get( role[ 1 ] );

    Adhesion.updatePendingList( targetRole );
    message.delete();
  }
} );
