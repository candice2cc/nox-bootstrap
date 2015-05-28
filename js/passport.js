function Passport(authFlag) {
    if (typeof authFlag != 'boolean') {
        authFlag = false;
    }
    console.log('authFlag', authFlag);
    // 常量
    // 主要标志调用的执行是否正常，不包含业务逻辑
    var STATUS_SUCCESS = 1;
    var STATUS_FAIL = 0;
    var LOGIN_STATUS_LOGIN = 1;
    var LOGIN_STATUS_NOT_LOGIN = 0;
    var PASSPORT_HOST = "https://passport.bignox.com";
    var PASSPORT_PATH_LOGIN = "/sso/login";
    var LOCALAPP_URL = encodeURIComponent(window.location.href); //这个改成获取当前页面URL

    // var PASSPORT_HOST = "https://passport.bignox.com";
    // var PASSPORT_PATH_LOGIN = "/sso/login";
    // var LOCALAPP_URL = "http://10.8.1.201:9222/welcome/test";   //这个改成获取当前页面URL
    var LOGIN_URL = PASSPORT_HOST + PASSPORT_PATH_LOGIN + "?service=" + LOCALAPP_URL;
    var REMOTE_CHECK_URL = LOGIN_URL;

    // 私有静态变量
    var _localLoginStatus = authFlag;
    var _remoteLoginStatus = authFlag;
    var _userAttributes = {};
    // 以上禁止直接修改，否则会内分泌失调

    var objPassport = {
        _localLoginStatus: _localLoginStatus,
        _remoteLoginStatus: _remoteLoginStatus,
        getLocalLoginStatus: function() {
            return this._localLoginStatus;
        },
        getRemoteLoginStatus: function() {
            return this._remoteLoginStatus;
        },
        //在不forceAuthenticated的时候最好能手动保证调用此函数时已经是登录状态
        getAttributes: function(callback, forceAuthenticated) {
            var that = this;
            // default不需要强制登录
            forceAuthenticated = forceAuthenticated === true ? true : false;
            if (forceAuthenticated) {
                forceAuthentication();
            };
            // 如果本地状态不正确则不请求，未登录时请求服务器端可能会给302
            // 状态必须local和remote都是登录状态
            if (that._localLoginStatus != LOGIN_STATUS_LOGIN || that._remoteLoginStatus != LOGIN_STATUS_LOGIN) {
                // 状态异常时尝试check一次
                that.checkAuthentication(function(status, data) {
                    // check不通过时就不请求了
                    if (STATUS_FAIL == status || that._localLoginStatus != LOGIN_STATUS_LOGIN || that._remoteLoginStatus != LOGIN_STATUS_LOGIN) {
                        callback ? callback(status, data) : 1;
                        return;
                    };
                    that._getAttributesRequest(function(status, data) {
                        callback ? callback(status, data) : 1;
                    });
                });
                return;
            };
            that._getAttributesRequest(function(status, data) {
                callback ? callback(status, data) : 1;
            });
        },
        forceAuthentication: function(callback, needSetLocal) {
            // 已经是登录状态
            if (this._localLoginStatus && this._remoteLoginStatus) {
                return true;
            };
            // 跳转到登录页面
            // 这里可以加本页打开登录窗口
            window.location.href = LOGIN_URL;
        },
        checkAuthentication: function(callback, needSetLocal) {
            var that = this;
            // 已经是登录状态
            if (LOGIN_STATUS_LOGIN == that._localLoginStatus && LOGIN_STATUS_LOGIN == that._remoteLoginStatus) {
                callback ? callback(STATUS_SUCCESS, LOGIN_STATUS_LOGIN) : 1;
                return true;
            };
            // 默认需要同步本地登录状态
            needSetLocal = typeof needSetLocal == 'boolean' ? needSetLocal : true;
            needSetLocal = typeof needSetLocal != 'boolean' || needSetLocal;
            that.isRemoteAuthenticated(function(status, data) {
                // CAS端校验完成后回调
                // CAS校验通信失败
                if (status === STATUS_FAIL) {
                    callback ? callback(STATUS_FAIL, data) : 1;
                    return;
                };
                // 不需要set本地的登录状态时，直接执行回调并返回
                if (!needSetLocal) {
                    callback ? callback(STATUS_SUCCESS, data) : 1;
                    return;
                };
                // 处理CAS返回的数据，默认是需要set本地的登录状态
                if (data && data['remoteLoginState'] == LOGIN_STATUS_LOGIN && data['st']) {
                    that.setLocalAuthenticated(data['st'], callback);
                } else {
                    callback ? callback(STATUS_FAIL, data) : 1;
                };
            });
        },
        isLocalAuthenticated: function(callback) {
            var that = this;
            $.ajax({
                type: "GET",
                url: "/user/isauth",
                dataType: "json",
                success: function(data) {
                    if (data && data['errNum'] == 100 && data['retData']) {
                        that._localLoginStatus = data['retData']['localLoginState'] == LOGIN_STATUS_LOGIN ? LOGIN_STATUS_LOGIN : LOGIN_STATUS_NOT_LOGIN;
                        callback ? callback(STATUS_SUCCESS, that._localLoginStatus) : 1;
                    } else {
                        callback ? callback(STATUS_FAIL, LOGIN_STATUS_NOT_LOGIN) : 1;
                    };
                }
            });
        },
        isRemoteAuthenticated: function(callback) {
            var that = this;
            $.ajax({
                type: "GET",
                url: REMOTE_CHECK_URL,
                data: {
                    gateway: true,
                    rt: 1
                },
                dataType: "jsonp",
                success: function(data) {
                    if (data && data['errNum'] == 100 && data['retData']) {
                        that._remoteLoginStatus = data['retData']['remoteLoginState'] == LOGIN_STATUS_LOGIN ? LOGIN_STATUS_LOGIN : LOGIN_STATUS_NOT_LOGIN;
                        callback ? callback(STATUS_SUCCESS, data['retData']) : 1;
                    } else {
                        callback ? callback(STATUS_FAIL, LOGIN_STATUS_NOT_LOGIN) : 1;
                    };
                }
            });
        },
        setLocalAuthenticated: function(ticket, callback) {
            var that = this;
            $.ajax({
                type: "GET",
                url: "/user/isauth",
                data: {
                    ticket: ticket
                },
                dataType: "json",
                success: function(data) {
                    if (data && data['errNum'] == 100 && data['retData']) {
                        that._localLoginStatus = data['retData']['localLoginState'] == LOGIN_STATUS_LOGIN ? LOGIN_STATUS_LOGIN : LOGIN_STATUS_NOT_LOGIN;
                        callback ? callback(STATUS_SUCCESS, that._localLoginStatus) : 1;
                    } else {
                        callback ? callback(STATUS_FAIL, LOGIN_STATUS_NOT_LOGIN) : 1;
                    };
                }
            });
        },
        _getAttributesRequest: function(callback) {
            var that = this;
            $.ajax({
                type: "GET",
                url: "/user",
                dataType: "json",
                success: function(data) {
                    if (data && data['errNum'] == 100 && data['retData']) {
                        that._userAttributes = data['retData']['userAttributes'] ? data['retData']['userAttributes'] : {};
                        callback ? callback(STATUS_SUCCESS, that._userAttributes) : 1;
                    } else {
                        callback ? callback(STATUS_FAIL, {}) : 1;
                    };
                }
            });
        }
    };
    return objPassport;
}
