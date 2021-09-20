
require( "dotenv" ).config();
const { R_M_FR , R_M_EN , R_M_JP , R_M_ID , R_V_JP , R_V_FR , R_V_EN , R_V_ID , 
    R_PENDING , R_MEMBER , R_V , R_DENDELION , R_SAKURA , R_MARGUERITE , R_COMPUTER , 
    R_GAME , R_TEST , U_MR_TRANSLATE , U_MY_BOT , G_ID , C_TESTS , C_NEW_COMMERS , 
    M_PENDING_COUNT } = process.env;

const Roles = {

    // customer + lang member role
    M_FR_R : { id : R_M_FR , description : "Le français est une langue officielle dans 13 pays" , title : "français :flag_fr:" } ,
    M_EN_R : { id : R_M_EN , description : "English is an official language in 54 countries" , title : "English :england: / :flag_us:" } ,
    M_JP_R : { id : R_M_JP , description : "伊藤なつみが言った2020年5月31日日曜日日本語は世界で5番目に難しい言語です ||| Itō Natsumi ga itta 2020-nen 5 tsuki 31-nichi nichiyōbi nihongo wa sekai de 5-banme ni muzukashī gengodesu" , title : "日本語 :flag_jp:" } ,
    M_ID_R : { id : R_M_ID , description : "Ada 7 alasan bagus untuk belajar bahasa Indonesia, bahasa resmi Indonesia" , title : "Indo :flag_id:" } ,

    V_JP_R : { id : R_V_JP , description : "" , title : "" } ,
    V_FR_R : { id : R_V_FR , description : "" , title : "" } ,
    V_EN_R : { id : R_V_EN , description : "" , title : "" } ,

    V_ID_R : { id : R_V_ID , description : "" , title : "" } ,

    // member and validation roles
    PENDING_R : { id : R_PENDING , description : "" , title : "" } ,
    MEMBER_R : { id : R_MEMBER , description : "" , title : "" } ,
    V_R : { id : R_V , description : "" , title : "" } ,

    // customer roles :
    DENDELION_R : { id : R_DENDELION , description : "" , title : "" } ,
    SAKURA_R : { id : R_SAKURA , description : "" , title : "" } ,
    MARGUERITE_R : { id : R_MARGUERITE , description : "" , title : "" } ,
    COMPUTE_R : { id : R_COMPUTER , description : "" , title : "" } ,
    GAME_R : { id : R_GAME , description : "" , title : "" } ,

    TEST_R : { id : R_TEST , description : "" , title : "" } ,
};

const _Guild = {
    U_MR_TRANSLATE : { id : U_MR_TRANSLATE , description : "" , title : "" } ,
    U_MY_BOT : { id : U_MY_BOT , description : "" , title : "" } ,
    G_ID : { id : G_ID , description : "" , title : "" } ,
    C_TESTS : { id : C_TESTS , description : "" , title : "" } ,
    C_NEW_COMMERS : { id : C_NEW_COMMERS , description : "" , title : "" } ,

    M_PENDING_COUNT : { id : M_PENDING_COUNT , description : "" , title : "" }

};

module.exports = { Roles , _Guild };
