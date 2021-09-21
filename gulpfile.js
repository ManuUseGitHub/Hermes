
const gulp = require( "gulp" );

const { series , parallel } = gulp;

const rename = require( "gulp-rename" );

const del = require( "del" );

const wget = require( "node-wget" );

const decompress = require( "gulp-decompress" );

function download ( cb ) {
    wget( {
        url : "https://localise.biz/api/export/archive/json.zip?key=zwMNJmbLmYOtSMGaypxkYY6BUg5pLsf3" ,

        // destination path or path with filenname, default is ./
        dest : "./ZiQuatorze/lang/translations.zip" ,

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
    gulp.src( "./ZiQuatorze/lang/translations.zip" )
        .pipe(
            decompress( {
                strip : 0
            } )
        )
        .pipe( gulp.dest( "./ZiQuatorze/lang" ) );

    setTimeout( function(){
        cb();
    } , 500 );
}

function outoflocals( cb ){
    gulp.src( "./ZiQuatorze/lang/ziquatorze-json-archive/locales/**/*.json" )
        .pipe( rename( function ( path ) {

            const m = /^ziquatorze-(.*)/.exec( path.basename );
                path.dirname = "";
            if( m )
                path.basename = m[ 1 ];
        } ) )
        .pipe( gulp.dest( "./ZiQuatorze/lang" ) );

    setTimeout( function(){
        cb();
    } , 1000 );
}

function clear( cb ){
    del( "./ZiQuatorze/lang/**/ziquatorze-*" );
    del( "./ZiQuatorze/lang/translations.zip" );
    cb();
}

const defaultTask = series ( download , unzip , outoflocals , clear );


exports.default = defaultTask;
