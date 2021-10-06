const page = require( "../../../../page" );
const { MessageEmbed } = require( "discord.js" );
const { _Guild } = require( "../../../Resources" );

module.exports = class VUtils {
    constructor( internalize ) {
        this.internalize = internalize;
    }

    pushPronunciationUrlToArray( base , resultObj ) {
        const url = `\n${base}${resultObj.pronunciationBank
            .join( "" )
            .replace( / /g , "%20" )}`;
        resultObj.descriptionLines.push( `[Pronunciation](${url})\n` );
    };

    pushVerbLines( iterationObj , resultObj , lang ) {
        let { cv , base , iLimit , i } = iterationObj;

        let step = 1;
        for ( ; i < iLimit; ++i ) {
            let first = cv[ i ];

            if ( first === undefined ) break;

            const match = /^[^"]+.([^"]*).$/g.exec( first.url );

            const pronunciationLink = match[ 1 ]
                .replace( /[()]/g , "" )
                .replace( / /g , "%20" );

            const translation = this.internalize.tr( first.inf , lang );

            resultObj.descriptionLines.push(
                `**${step}) ${first.inf}** - ${first.pret} - ${first.part
                }`+( translation?`\ \ 👉\ \ ${translation}`:"" )
            );

            resultObj.pronunciationBank.push( `${step}:${pronunciationLink}. ` );

            if ( step % 5 == 0 ) {
                this.pushPronunciationUrlToArray( base , resultObj );
                resultObj.pronunciationBank = [];
            }
            step++;
        }
    };

    addFields( cv , offset , i , embeds , newEmbed , lang ) {
        const iLimit = i + offset;

        let descriptionLines = [];

        let pronunciationBank = [];
        const base =
            "https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=";


        const iterationObj = { cv , base , iLimit , i };
        const resultObj = { pronunciationBank , descriptionLines };

        this.pushVerbLines( iterationObj , resultObj , lang );


        if ( resultObj.pronunciationBank.length ) {
            this.pushPronunciationUrlToArray( base , resultObj );
        }

        newEmbed.setDescription( resultObj.descriptionLines.join( "\n" ) );

        embeds.push( newEmbed );
    };

    addFieldsToEmbed( cv , embedInitCB , lang , offset = 16 , embeds = [] , p = 0 ) {
        let i = p;
        let t = offset;
        const length = cv.length;

        if ( i + offset > length ) {
            t = length % offset;
        }
        if ( !cv[ i ] ) {
            return embeds;
        }
        let j;

        const newEmbed = new MessageEmbed();

        this.addFields( cv , offset , i , embeds , newEmbed , lang );

        // set Title, description and footer etc.
        embedInitCB( newEmbed );

        return this.addFieldsToEmbed( cv , embedInitCB , lang , t , embeds , p + offset );
    };

    onEmbedInit( embed , argument , Resources , lang ) {

        const intro = argument === "commons" ?
            "Here are the common " : argument === "rare" ?
                "Here are kind of rarely used " : argument === "all" ?
                    "Here are all the " : `Here are formated [${argument}] `;

        const theGuild = Resources.client.guilds.cache.get( _Guild.G_ID.id );

        // inside a command, event listener, etc.
        embed
            .setColor( "#0099ff" )
            .setTitle( intro + " irregular verbs" )
            .setDescription( `Some title \n\n${embed.description}` )
            .setFooter(
                "With ❤️ by ziQuatorze" ,
                theGuild.iconURL()
            )
            .setTimestamp();
    };
    doSomethingWithTheFirstEmbedTitled( message , title , callback , x = 5 ) {
        message.channel.messages.fetch( { limit : x } ).then( ( lasts ) => {

            const found = lasts
                .filter( m => m.embeds.length )
                .map( ( m ) => {

                    if ( m.embeds.length ) {
                        const pattern = new RegExp( `^.+\\s(${title})` );
                        if ( pattern.test( m.embeds[ 0 ].title ) ) {
                            return m;
                        }
                    }
                } );

            callback( found.length ? found[ 0 ] : undefined );
        } );
    };
    deleteFoundMessage( m ) {
        if ( m ) {
            m.delete();
        }
    };
    displayeVerbs( message , argument , Resources , lang ) {

        let arg = argument;
        arg = arg.replace( /x3|3x|xxx/i , "x-x-x" );
        arg = arg.replace( /xxed2/i , "x-xed-xed" );
        arg = arg.replace( /xyx/i , "x-y-x" );
        arg = arg.replace( /xyxen/i , "x-y-xen" );
        arg = arg.replace( /xy2|x2y/i , "x-y-y" );
        arg = arg.replace( /xyyen/i , "x-y-yen" );
        arg = arg.replace( /xyz/i , "x-y-z" );

        const cv = require( `../../../assets/Verbs/${arg}.json` ).verbs;

        const athis = this;
        const embeds = this.addFieldsToEmbed( cv , ( embed ) => { athis.onEmbedInit( embed , arg , Resources ); } , lang , 25 );

        const x = 5;

        this.doSomethingWithTheFirstEmbedTitled( message , "irregular verbs" , ( m ) => {
            this.deleteFoundMessage( m );
            page.main( { embeds , message } );
        } , x );
    };
};