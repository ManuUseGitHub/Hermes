const POOL_TIME = process.env.POOL_TIME;

const { posponeTimeout } = require( "../../utilities" );

const poolActionForId = ( pool , id , cb ) => {

    // if a pool exists for the id , pospone it
    if ( pool[ id ] != null ) {
        postponeReactionClosure( id , pool );

    // otherwize, create new a pool for the desired id
    } else {
        pool[ id ] = {
            timer : setTimeout( () => {
                delete pool[ id ];
            } , Number.parseInt( POOL_TIME ) ) ,
        };

        // run the action
        cb();
    }
};

const postponeReactionClosure = ( id , pool ) => {
    const itimer = pool[ id ];
    const cbObject = {
        cb : () => {
            delete pool[ id ];
        } ,
        params : [] ,
    };
    posponeTimeout( itimer , POOL_TIME , cbObject );
};

module.exports = { poolActionForId };