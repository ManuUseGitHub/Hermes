const isOption = ( str ) => {
    return /^((?:--[a-zA-Z]\w+)|(?:-[a-zA-Z]))$/.test( str );
};

const trimedParameters = ( result ) => {
    const entries = Object.keys( result ).map( k => {
        obj = {};
        obj[ k.replace( /-/gm , "" ) ] = result[ k ];
        return obj;
    } );

    return Object.assign( ...entries );
};

/**
 * get an object representation of the arguments passed to the process environment
 * @param {any} result resulting object at step i
 * @param {*} envargv process env with only arguments
 * @param {*} i step
 * @returns {any} result object
 */
const constructArgv = ( result = {} , envargv = [] , i = 0 ) => {
    if ( i != 0 && envargv.length === i )
        return trimedParameters( result );

    // setup the arguments to work on. removing the two first values
    let args = i === 0 ? process.argv.slice( 2 ) : envargv;

    // Whenever we have an option
    if ( isOption( args[ i ] ) )
        result[ args[ i ] ] = undefined;

    // when ever it is not an option then
    else {
        let value = args[ i ];

        // try to get the real value of the string
        try { value = JSON.parse( args[ i ] ); }

        // do not do anything on faillure
        catch ( err ) { };

        // assign the value to the key : the previous value
        if ( isOption( args[ i - 1 ] ) ) {
            result[ args[ i - 1 ] ] = value;
        }
    }

    // recall the function to continue constructing the rest of the result
    return constructArgv( result , args , ++i );
};

module.exports = constructArgv;