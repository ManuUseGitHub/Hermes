const poolPagination = { };

const { poolActionForId } = require( "./ZiQuatorze/Semaphored" );

const setPagination = ( embed , page , count ) => {
    embed.setFooter( `page ${page+1}/${count}` );
};

const manageOnCollect = ( collecte , reaction , user ) => {

    const { embeds , navigation , message } = collecte;
                    
    const count = embeds.length;

    // pooling the event to prevent the code to be run multiple times
    poolActionForId( poolPagination , user.id , () => {
        
        // once done remove the last reaction made by the user so he can react once more etc.
        reaction.users.remove( user.id );

        function selectEmbed( emoji ) {
            switch ( emoji ) {
                case "⏮️" :
                    navigation.page = 0;
                    return embeds[ navigation.page ];
                case "◀️" :
                    return embeds[ --navigation.page ] || embeds[ ++navigation.page ];
                case "▶️" :
                    return embeds[ ++navigation.page ] || embeds[ --navigation.page ];
                case "⏭️" :
                    navigation.page = count - 1;
                    return embeds[ navigation.page ];
            }
        }
        const displayed = selectEmbed( reaction.emoji.name );
        
        // update the page number
        setPagination( displayed , navigation.page , count );

        return message.edit( displayed );
    } );
    
};

module.exports = {
    name : "page" ,
    main : function ( parameters ) {
        const Discord = require( "discord.js" ) ,
            embeds = parameters.embeds || [] ,
            emojis = [ "⏮️" , "◀️" , "▶️" , "⏭️" ];

        return parameters.message.reply( embeds[ 0 ] ).then( async message => {
            for ( const emoji of emojis ) {
                await message.react( emoji );

                const collector = message.createReactionCollector( ( reaction , user ) => 
                    emojis.includes( reaction.emoji.name ) && 
                    user.id == parameters.message.author.id
                );

                let navigation = { page : 0 } ;
                
                setPagination( embeds[ navigation.page ] , navigation.page , embeds.length );
                message.edit( embeds[ navigation.page ] );

                collector.on( "collect" , ( reaction , user ) => {
                    
                    const collecte = { embeds , navigation , message };

                    manageOnCollect( collecte , reaction , user );
                } );
            }
        } );
    }
};