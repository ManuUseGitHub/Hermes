const constructUrlLink = ( infinitive , preterits , particip ) => {

    // construction of the text to speak link
    const lang = "en";
    const text = `${infinitive},${preterits},${particip}`;
    const url =
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q="${text}"`.replace(
            " " ,
            "%20"
        );

    return url;
};

const getCommonLines = ( result ) => {
    const {
        verb_id ,
        infinitive ,
        preterits ,
        particip ,
        translate ,
        u_id ,
        usage ,
        f_id ,
        form ,
    } = result;

    const url = constructUrlLink( infinitive , preterits , particip );

    const line = { verb_id , u_id , f_id , form , inf : infinitive , pret : preterits , part : particip , tran : translate , usage , url , };
    return line;
};

const getRareLines = ( result ) => {
    const {
        verb_id ,
        infinitive ,
        preterits ,
        particip ,
        translate ,
        f_id ,
        form ,
        alt_of
    } = result;

    const url = constructUrlLink( infinitive , preterits , particip );

    const line = { verb_id , f_id , form , inf : infinitive , pret : preterits , part : particip , tran : translate  , url , alt_of };
    return line;
};

const getVerbsAndForms = ( result ) => {
    const {
        verb_id ,
        infinitive ,
        preterits ,
        particip ,
        translate ,
        u_id ,
        usage ,
        f_id ,
        form ,
        alt_of ,
    } = result;

    const url = constructUrlLink( infinitive , preterits , particip );

    const line = { verb_id , u_id , f_id , form , inf : infinitive , pret : preterits , part : particip , tran : translate , usage , url , alt_of : alt_of?true:false };
    return line;
};

module.exports = { getCommonLines , getRareLines , getVerbsAndForms };