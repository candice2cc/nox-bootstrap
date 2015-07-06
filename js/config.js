/**
 * Created by candice on 15/7/6.
 */

CONFIG = {};
CONFIG.host = {
    passport:"sj.bignox.com:9443",
};
CONFIG.url = {
  getMessage:"https://" + CONFIG.host.passport + "/usercenter/rest/thirdparty/message"
};