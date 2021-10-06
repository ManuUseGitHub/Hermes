const { getCommonLines , getRareLines , getVerbsAndForms } = require( "../ResultMapping" );

const getCommons = ( args , database ) => {
    return {
        sql : `SELECT * FROM ${database}.commonly_used_verbs` ,
        filename : "commons.json" ,
        alias : "common verbs" ,
        writing : args.writeFile || false ,
        resultMappingCB : r => { return getCommonLines( r ); }
    };
};

const getRare = ( args , database ) => {
    return {
        sql : `SELECT * FROM ${database}.only_rare_verbs` ,
        filename : "rare.json" ,
        alias : "rare verbs only" ,
        writing : args.writeFile || false ,
        resultMappingCB : r => { return getRareLines( r ); }
    };
};

const getFromForm = ( args , database , form ) => {
    return {
        sql : `SELECT * FROM ${database}.verbs_and_forms WHERE form like('${form}')` ,
        filename : `${form}.json` ,
        alias : `verbs of (${form}) form` ,
        writing : args.writeFile || false ,
        resultMappingCB : r => { return getVerbsAndForms( r ); }
    };
};

module.exports = { getCommons , getRare , getFromForm };