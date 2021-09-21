
const gulp = require( "gulp" );

const { series , parallel } = gulp;

const rename = require( "gulp-rename" );

const del = require( "del" );

const wget = require( "node-wget" );

const decompress = require( "gulp-decompress" );

function download ( cb ) {
    wget( {
        url : "https://localise.biz:443/api/export/archive/json.zip?key=iLHvUE8pLGj-NxC4zBkjwxvZM-kHRaSG" ,

        // destination path or path with filenname, default is ./
        dest : "./resources/lang/translations.zip" ,

        // duration to wait for request fulfillment in milliseconds, default is 2 seconds
        timeout : 2000
        } ,

        function ( error , response , body ) {
            if ( error ) {
                console.log( "--- error:" );
                console.log( error );            // error encountered
            } else {
                console.log( "--- headers:" );
                console.log( response.headers ); // response headers
                //console.log('--- body:');
                //console.log(body);             // content of package
            }
        }
    );

    setTimeout( function(){
        cb();
    } , 500 );
}

function unzip ( cb ){
    gulp.src( "./resources/lang/translations.zip" )
        .pipe(
            decompress( {
                strip : 0
            } )
        )
        .pipe( gulp.dest( "./resources/lang" ) );

    setTimeout( function(){
        cb();
    } , 500 );
}

function outoflocals( cb ){
    gulp.src( "./resources/lang/radiosq-json-archive/locales/**/*.json" )
        .pipe( rename( function ( path ) {

            const m = /^radiosq-(.*)/.exec( path.basename );
                path.dirname = "";
            if( m )
                path.basename = m[ 1 ];
        } ) )
        .pipe( gulp.dest( "./resources/lang" ) );

    setTimeout( function(){
        cb();
    } , 1000 );
}

function clear( cb ){
    del( "./resources/lang/**/radiosq-*" );
    del( "./resources/lang/translations.zip" );
    cb();
}

const defaultTask = series ( download , unzip , outoflocals , clear , function( cb ){
    gulp

        // open the index file then write it
        .src( "./resources/views/radio/pages/Home/index.blade.php" )

        // in the same location to trigger the browserSync
        .pipe( gulp.dest( "./resources/views/radio/pages/Home" ) );
    cb();
} );


exports.default = defaultTask;
