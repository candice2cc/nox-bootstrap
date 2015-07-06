+function ($) {
    var menuHead = '.menu > .menu-hd';
    var menuBody = '.menu > .menu-bd';
    var Top = function (el) {
        $(el).on('click', menuHead, this.toggle);
    };
    Top.VERSION = '1.0.0';

    Top.prototype.toggle = function (e) {
        var $this = $(this);
        var toggleItem = $this.parents(".menu");
        if(toggleItem.hasClass("active")){
            toggleItem.toggleClass("active");
        }else{
            toggleItem.parents("ul").children("li").removeClass("active");
            toggleItem.toggleClass("active");
        }
        e.stopPropagation();
    };
    Top.prototype.close = function (e) {
        $(menuHead).parents(".menu").removeClass("active");
    };
    Top.prototype.updateMsg = function(){
        if($(".site-top").find(".login").hasClass("hide")){
            return;
        }

        var updateMsgDom = function(result){

            if(result.errNum == 100){
                var data = result.retSingleData;
                $(".site-top").find(".user-msg").find("a").text("消息（" + data.unReadCount + "）");
            }else{
                $(".site-top").find(".user-msg").find("a").text("消息");
                console.log("获取消息中心异常，错误码："+ result.errNum);
                //alert('服务器错误,请稍后再试');
            }
        };

        $.getJSON(CONFIG.url.getMessage+"?callback=?",{}).done(updateMsgDom).fail(function(){
            $(".site-top").find(".user-msg").find("a").text("消息");
            console.log("获取消息中心失败");
            //alert('服务器错误,请稍后再试');
        });

    };

    // TOP PLUGIN DEFINITION
    // =======================
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.top')

            if (!data) $this.data('bs.top', (data = new Top(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }

    var old = $.fn.top;
    $.fn.top = Plugin;
    $.fn.top.Constructor = Top;

    // TOP NO CONFLICT
    // =================

    $.fn.top.noConflict = function () {
        $.fn.top = old;
        return this;
    }
    // TOP DATA-API
    // ==============

    $(document).on('click.bs.top.data-api', menuHead, Top.prototype.toggle);
    $(document).on('click.bs.top.data-api', menuBody, function(e){e.stopPropagation();});

    $(document).on('click.bs.top.data-api', Top.prototype.close);
    $(document).ready(Top.prototype.updateMsg);

}(jQuery);