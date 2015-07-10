/**
 * Created by candice on 15/7/6.
 */

CONFIG = {};
CONFIG.host = {
    //passport: "sj.bignox.com:9443",
    passport: "passport.bignox.com",
};
CONFIG.url = {
    getMessage: "https://" + CONFIG.host.passport + "/usercenter/rest/thirdparty/message",
    getTicket:"https://" + CONFIG.host.passport + "/sso/login" ,
};