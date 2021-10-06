const poolPagination = {};

const { poolActionForId } = require( "./ZiQuatorze/Semaphored" );

const setPagination = ( embed , page , count ) => {
    embed.setFooter( `page ${page + 1}/${count}` );
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


        const act = async message => {
            for ( const emoji of emojis ) {
                let collector = undefined;
                
                let navigation = { page : 0 };

                if ( embeds.length > 1 ) {
                    await message.react( emoji );
                    collector = message.createReactionCollector( ( reaction , user ) =>
                        emojis.includes( reaction.emoji.name ) &&
                        user.id == parameters.message.author.id
                    );
                    setPagination( embeds[ navigation.page ] , navigation.page , embeds.length );
                }

                message.edit( embeds[ navigation.page ] );

                if ( embeds.length > 1 ) {
                    collector.on( "collect" , ( reaction , user ) => {

                        const collecte = { embeds , navigation , message };

                        manageOnCollect( collecte , reaction , user );
                    } );
                }
            }
        };


        return parameters.message.reply( embeds[ 0 ] ).then( act );



    }
};