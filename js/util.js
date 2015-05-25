/**
 * 工具方法
 * Created by nox fe on 15/5/22.
 */


(function (util,$) {
    /**
     * 登陆url
     */
    var PASSPORTURL = "https://passport.bignox.com/sso/login?service=";

    /**
     * 多行文本ellipsis
     * @param text 原字符串
     * @param maxLength 截取后长度
     * @returns string
     */
    function shorten(text, maxLength) {
        var ret = text;
        if (ret.length > maxLength) {
            ret = ret.substr(0,maxLength-3) + "...";
        }
        return ret;
    }
    util.shorten = shorten;

    /**
     * 修复高度
     * @param initBodyHeight 原高度
     * @returns number
     */
    function getHeightFix(initBodyHeight) {
        var fix = $(window).height() - initBodyHeight;
        return fix;
    }
    util.getHeightFix = getHeightFix;


    /**
     * 获取浏览器
     * @returns object
     */
    function getBrowser() {
        //判断访问终端
        var browser = {
            versions: function () {
                var u = navigator.userAgent, app = navigator.appVersion;
                return {
                    trident: u.indexOf('Trident') > -1, //IE内核
                    presto: u.indexOf('Presto') > -1, //opera内核
                    webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                    gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
                    mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                    android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                    iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                    iPad: u.indexOf('iPad') > -1, //是否iPad
                    webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
                    weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
                    qq: u.match(/\sQQ/i) == " qq" //是否QQ
                };
            }(),
            language: (navigator.browserLanguage || navigator.language).toLowerCase()
        };
        return browser;
    }
    util.getBrowser = getBrowser;

    /**
     * 基本的表单验证组件
     * 功能说明：自动对表单项验证，目前支持input、textarea、select,支持参数required,email,url,tel，
     * Param: target jQuery对象 需要验证的target
     * Return: json  json里面还有两个属性：errNo:0,msg:success说明验证成功；errNo:1,msg:错误详细信息
     * 示例：
     * html: <textarea id ="textContent" class="reply-content" data-validate-params="required email"></textarea>
     * JS: replyValidate = Util.basicValidateEvent($('#textContent'));
     * if(replyValidate.errNo === 0){ //如果验证通过进行XXXX处理 }
     */
    function basicValidateEvent (target) {
        function is_tel(tel){
            if(!/^1((3\d)|(4[57])|(5\d)|(7\d)|(8\d))\d{8}$/.test(tel)){
                return false;
            }
            return true;
        }
        function is_email(email){
            var pattern_email = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*(\.[a-zA-Z]+)$/;
            if(!pattern_email.test(email)){
                return false;
            }
            return true;
        }
        function is_url(url){
            var pattern_url = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;
            if(!pattern_url.test(url)){
                return false;
            }
            return true;
        }
        function is_idcard(idcard) {
            var pattern_idcard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            if (!pattern_idcard.test(idcard)) {
                return false;
            }
            return true;
        }
        var tagName = target[0].tagName.toLowerCase(),
            tagType = target.eq(0).attr('type'),
            validateParamStore = target.attr('data-validate-params'),
            validateReasonObject = {
                'required': '必填项不能为空',
                'email': '请输入正确的Email',
                'url': '请输入合法的（带协议的）URL',
                'tel': '请输入正确的手机号码',
                'idcard': '请输入正确的身份证号码'
            },
            retData = {};
        if(!validateParamStore){
            return;
        }
        validateParamStore = validateParamStore.split(' ');//required ,email
        switch(tagName){
            case 'input':
                switch(tagType){
                    case 'radio':
                    case 'checkbox':
                        validateChangeEvent();
                        break;
                    default:
                        validateBlurEvent();
                }
                break;
            case 'textarea':
                validateBlurEvent();
                break;
            case 'select':
                validateChangeEvent();
                break;
            default:
                //Do nothing
        }
        /**
         * 根据正则表达式生成验证函数
         *
         * @param {RegExp} reg 正则表达式
         * @return {Function} 验证函数
         */
        function _makeValidatorFunc(reg) {
            return function (str) {
                return !!str && reg.test(str);
            };
        }

        function validateBlurEvent(){
            target.on('blur', function(){
                validateDetail();
            });
        }
        function validateChangeEvent(){
            target.on('change', function(){
                validateDetail();
            });
        }

        function validateDetail(){
            var failType = '',
                //获取传入对象的value值
                value = $.trim(target.val()) || '';
            if(tagType === 'radio' || tagType === 'checkbox'){
                value = target.filter(':checked').val() || '';
            }

            for(var i = 0, len = validateParamStore.length; i < len; i++){
                switch(validateParamStore[i]){
                    case 'required':
                        if(!value.length){
                            failType = validateReasonObject['required'];
                        }
                        break;
                    case 'email':
                        if(!is_email(value) && value !== ''){
                            failType = validateReasonObject['email'];
                        }
                        break;
                    case 'tel':
                        if(value !== '' && !is_tel(value)){
                            failType = validateReasonObject['tel'];
                        }
                        break;
                    case 'url':
                        if(value !== '' && !is_url(value)){
                            failType = validateReasonObject['url'];
                        }
                        break;
                    case 'idcard':
                        if(value !== '' && !is_url(value)){
                            failType = validateReasonObject['idcard'];
                        }
                        break;
                }
                if(failType !== ''){
                    retData.errNo = 1;
                    retData.errType = validateParamStore[i];
                    retData.errMsg = failType;
                    return retData;
                }
            }
            retData.errNo = 0;
            retData.errMsg = 'success';
            return retData;
        }
        return validateDetail();
    }
    util.basicValidateEvent = basicValidateEvent;

    /**
     * 基本的下拉表单设定
     * 功能说明：支持点击下拉取值，设定下拉menu的值后续加上，对应样式在form.css里面
     * @param {object} obj  根元素，jquery的元素对象
     */
    function dropDownEvent (obj, dropdownCallBack) {
        if (!obj || !obj instanceof Object) {
            throw 'error: 请输入下拉列表button的目标元素';
        }
    	obj.click(function (e) {
            $('div.drop-menu').removeClass('drop-menu-active');
	        // body...
            var dropMenu = $(this).find('+div.drop-menu');
            var that = $(this);
	        dropMenu.toggleClass('drop-menu-active');
            dropMenu.unbind('click').on('click','li',function (e) {
                var value = $(this).find('a').html();
                that.find('span:nth-child(1)').html(value);
                $(this).parents('.drop-menu').toggleClass('drop-menu-active');
                if(isFunction(dropdownCallBack)) {
                    dropdownCallBack(that);
                }
                e.stopPropagation();
                return false;
            });
	        e.stopPropagation();
	       	return false;
	    });
	    $(document).click(function () {
	    	$('div.drop-menu').removeClass('drop-menu-active');
	    });
    }
    util.dropDownEvent = dropDownEvent;

    /**
     * 判断对象是否是函数
     * @param obj
     * @returns {boolean}
     */
    function isFunction(obj){
        return Object.prototype.toString.call(obj) === "[object Function]";
    }
    util.isFunction = isFunction;

    /**
     * put提交数据
     * @param url
     * @param data
     * @param successCallBack
     * @param errorCallback
     * @param failCallBack
     * @param alwaysCallback
     * @param params
     */
    function ajaxPut(url, data, successCallBack, errorCallback, failCallBack, alwaysCallback, params) {
        $.ajax({
            type: "PUT",
            dataType: "json",
            data: JSON.stringify(data),
            contentType: "text/plain",
            url: url,
            success: function(res) {
                if (res && res.errNum === 100) { // 100
                    if (isFunction(successCallBack)) {
                        successCallBack(res.retData);
                    }
                } else {
                    if (isFunction(errorCallback)) {
                        errorCallback(res.retMsg);
                    } else {
                        window.alert(res.retMsg);
                    }
                }
            },
            error: function() {
                if (isFunction(failCallBack)) {
                    failCallBack();
                }
            },
            complete: function() {
                if (isFunction(alwaysCallback)) {
                    alwaysCallback();
                }
            }
        });
    }

    /**
     * post提交数据
     * @param url
     * @param data
     * @param successCallBack
     * @param errorCallback
     * @param failCallBack
     * @param alwaysCallback
     * @param params
     */
    function ajaxPost (url, data, successCallBack, errorCallback, failCallBack, alwaysCallback, params) {
        // 统一增加token
        data.token = $('#js-header').attr('data-token');
        $.post(url, data, '', 'json')
        .done(function (res) {
            if(res.user && !res.user.loginState){
                //滚去登录
                if (params && params.isRedirect) {
                     window.location = PASSPORTURL + window.location.href;
                }
                //else if (PASSPORT_INSTANCE) {
                //     PASSPORT_INSTANCE.show();
                //     return;
                //}
            }
            // 重新设置token
            if (res.token) {
                 $('#js-header').attr('data-token', res.token);
            }

            if(res.errNo === 0) {
                if(isFunction(successCallBack)) {
                    successCallBack(res.retData);
                }
            }else {
                if(isFunction(errorCallback)) {
                    errorCallback(res.retMsg);
                }else{
                    window.alert(res.retMsg);
                }
            }
        })
        .fail(function () {
            if(isFunction(failCallBack)) {
                failCallBack();
            }
        })
        .always(function() {
            if(isFunction(alwaysCallback)) {
                alwaysCallback();
            }
        });
    }

    /**
     * get数据
     * @param url
     * @param data
     * @param successCallBack
     * @param errorCallback
     * @param failCallBack
     * @param alwaysCallback
     * @param params
     */
    function ajaxGet (url, data, successCallBack, errorCallback, failCallBack, alwaysCallback, params) {
        params = $.extend({},{
                type: "GET",
                url: url,
                data: data,
                dataType: "json",
                cache: false // 防止IE缓存
            }, params);
        $.ajax(params)
        .done(function (res) {
            if(res.user && !res.user.loginState){
                //同样滚去登录
                if (params && params.isRedirect) {
                    window.location = PASSPORTURL + window.location.href;
                }
                //else if (PASSPORT_INSTANCE) {
                //     PASSPORT_INSTANCE.show();
                //     return;
                //}
            }
            // 重新设置token
            if (res.token) {
                 $('#js-header').attr('data-token', res.token);
            }
            if(res.errNo === 0) {
                if(isFunction(successCallBack)) {
                    successCallBack(res.retData);
                }
            }else {
                if(isFunction(errorCallback)) {
                    errorCallback(res.retMsg);
                }else{
                    window.alert(res.retMsg);
                }
            }
        })
        .fail(function () {
            if(isFunction(failCallBack)) {
                failCallBack();
            }
        })
        .always(function() {
            if(isFunction(alwaysCallback)) {
                alwaysCallback();
            }
        });
    }
    util.ajaxPut = ajaxPut;
    util.ajaxGet = ajaxGet;
    util.ajaxPost = ajaxPost;

    /**
     * 获取url参数
     * @param str 参数名
     * @param url url,如果不传默认当前url
     * @returns {string} 参数值
     */
    function getUrlParameter(str, url) {
        var target = '';
        if (!str) {
            return target;
        }
        url = (typeof url !== 'undefined') ? url : window.location.href;
        var parameters = url.split('?');
        if (parameters.length > 1) {
            var buffers = parameters[1].split('&');
            for (var i = buffers.length - 1; i >= 0; i--) {
                var temps = buffers[i].split('=');
                if (temps[0] === str) {
                    target = temps[1];
                    break;
                }
            }
        }
        return target;
    }
    util.getUrlParameter = getUrlParameter;

    /**
     * 获取URL参数列表
     * @param url
     * @returns object 参数列表
     */
    function getUrlParameters(url) {
        var target = (typeof url !== 'undefined') ? url : window.location.href;
        var rawParams = target.split('?');
        var params = {};
        if (rawParams.length > 1) {
            var buffers = rawParams[1].split('&');
            for (var i = buffers.length - 1; i >= 0; --i) {
                var buf = buffers[i].split('=');
                if (buf.length > 1) {
                    params[buf[0]] = decodeURIComponent(buf[1]);
                } else if (buf.length == 1 && buf[0].length > 0) {
                    params[buf[0]] = true;
                }
            }
        }
        return params;
    }
    util.getUrlParameters = getUrlParameters;

    /**
     * 格式化URL参数
     * @param params
     * @returns {string}
     */
    function formatUrlParameters(params) {
        if (typeof params !== 'object') {
            return '';
        }
        var query = '';
        for (var key in params) {
            if (typeof params[key] == 'string' || typeof params[key] == 'number' || typeof params[key] == 'boolean') {
                query += key;
                if (typeof params[key] != 'boolean') {
                    query += ('=' + encodeURIComponent(params[key]));
                }
                query += '&';
            }
        }
        return query.substring(0, query.length - 1);
    }
    util.formatUrlParameters = formatUrlParameters;

    /**
     * 获取无参数URL
     * @param str
     * @returns {*}
     */
    function getBaseUrl(str) {
        str = (typeof str !== 'undefined') ? str : window.location.href;
        return (str.split('?'))[0] || str;
    }
    util.getBaseUrl = getBaseUrl;

    /**
     * 时间戳转化成日期
     * @param datetime 时间戳
     * @param type 'date'|''
     * @returns {string} 'YYYY-mm-dd'|'YYYY-mm-dd H:i:s'
     */
    function formatDate(datetime, type)
    {
        var timeobj = new Date(parseInt(datetime) * 1000);
        function pad(number) {
            var r = String(number);
            if ( r.length === 1 ) {
                r = '0' + r;
            }
            return r;
        }
        var year = timeobj.getFullYear();
        var month = pad(timeobj.getMonth() + 1);
        var day = pad(timeobj.getDate());
        var hours = pad(timeobj.getHours());
        var minutes = pad(timeobj.getMinutes());
        var secondes = pad(timeobj.getSeconds());
        var datetime = year + '-' + month + '-' + day;
        if (type !== 'date') {
            datetime += ' ' + hours + ':' + minutes + ':' + secondes;
        }
        return datetime;
    }
    util.formatDate = formatDate;

    /**
     * 日期转化成时间戳
     * @param str
     * @returns {number}
     */
    function strtotime(str)
    {
        var timestamp = 0;
        str = $.trim(str);
        // 获取当前时间戳(以s为单位)
        if (typeof arguments[0] === 'undefined') {
            timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;
        }
        else {
            // 获取某个时间格式的时间戳
            if (str.split(' ').length === 1) {
                str = str + ' 00:00:00';
            }
            timestamp = Date.parse(new Date(str));
            timestamp = timestamp / 1000;
        }
        return timestamp;
    }
    util.strtotime = strtotime;

    /**
     * 滚动到obj的位置
     * @param obj
     */
    function scrollTo (obj) {
        $('html body').animate({
            scrollTop: obj.offset().top
        },100);
    }
    util.scrollTo = scrollTo;

    /**
     * 上传控件封装
     * @param params
     */
    function addUploadEvent (params) {
        params = $.extend({},{
            element: '',
            url: '/api/fileupload',////文件上传地址，当然也可以直接写在input的data-url属性内
            regexp: /(\.|\/)(png)$/i,
            autoUpload: true,
            paramName: 'resources',
            filesBlock: '',//选择器 上传、删除等所在的区域
            progresser: '',
            formData: {}//数组  额外参数
        }, params);
        function formDataFunc(){
            var customFormData = [{name: 'token', value: $('#js-header').attr('data-token')}];
            $('#js-header').attr('data-token', getToken());
            $.each(params.formData, function (name, value) {
                customFormData.push({name: name, value: value});
            });
            return customFormData;
        }
        $(''+ params.target).fileupload({
            url: params.url,//文件上传地址，当然也可以直接写在input的data-url属性内
            dataType: 'json',
            autoUpload: params.autoUpload,
            acceptFileTypes: params.regexp,
            maxFileSize: params.maxFileSize, // 5 MB
            minFileSize: 10,
            dropZone: null,
            pasteZone: null,
            paramName: params.paramName,
            formData: formDataFunc,//如果需要额外添加参数可以在这里添加
            //formAcceptCharset: 'utf-8',
            maxNumberOfFiles: 1,
            // maxChunkSize: 2e6, //请求了多次
            progressInterval: 20,
            bitrateInterval: 500
        }).on('fileuploadadd', function (e, data) {
            var file = data.originalFiles && data.originalFiles[0];
            //判定file的类型，防止进入
            if(util.isFunction(params.setElement)) {
                params.lid = params.setElement($(this),data,params);
            }
            if (!params.regexp.test(file.name)) {
                params.fileUploadError($(this),params);  
            };
            
        }).on('fileuploadsubmit', function (e, data){
        }).on('fileuploadprocessalways', function (e, data) {
        }).on('fileuploadprogressall', function (e, data) {
            //进度条推进
            if (util.isFunction(params.setProcess,params)) {
                params.setProcess($(this),data,params);
            };
        }).on('fileuploaddone', function (e, data) {
            // 重新设置token
            if (data.result.token) {
                $('#js-header').attr('data-token', data.result.token);
            }
            //上传成功处理逻辑代码
            if (util.isFunction(params.fileUploadSucess)) {
                params.fileUploadSucess($(this),data,params);
            };
       }).on('fileuploadfail', function (e, data) {
            if (data.jqXHR.responseText && data.jqXHR.responseText.errNo !== 0) {
                params.fileUploadError($(this),params);
            }
       });
    }
    util.addUploadEvent = addUploadEvent;

    /**
     * 获取token
     * @returns {*}
     */
    function getToken () {
        // 获取token
        util.ajaxGet(
            '/api/gettoken',
            {},
            function (retData) {
                // successCallBack
                token = $('#js-header').attr('data-token');
            },
            '',
            '',
            '',
            {async: false}
        );
        return token;
    }
    util.getToken = getToken;

    /**
     * 手机发送验证码
     * @param phone
     * @param number
     * @param cb
     */
    function sendCode(phone, number, cb) {
        phone.html('( ' + (number--) + ' )重新发送');
        phone.attr('disabled', 'disabled').addClass('btn-disable');
        clearInterval(NOX.user.index.time);
        NOX.user.index.time = setInterval(
            function() {
                if (number === 0) {
                    if (isFunction(cb)) {
                        cb();
                    }
                    clearInterval(NOX.user.index.time);
                } else {
                    phone.html('( ' + (number--) + ' )重新发送');
                }
            },
            1000
        );
    }
    util.sendCode = sendCode;

    /**
     * 站长统计代码
     */
    function trackEvent (params) {
        params = $.extend({},{
            category: "开放平台",
            action: '',
            label: '',
            value: '',
            nodeid: ''
        }, params);
        _czc.push(['_trackEvent', params.category, params.action, params.label, params.value, params.nodeid]);
    }
    util.trackEvent = trackEvent;

})(window.util=window.util||{}, jQuery);
