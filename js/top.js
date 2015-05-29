+function ($) {
    var menuHead = '.menu > .menu-hd';
    var menuBody = '.menu > .menu-bd';
    var Top = function (el) {
        $(el).on('click', menuHead, this.show);
    };
    Top.VERSION = '1.0.0';
    Top.TRANSITION_DURATION = 150;

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

}(jQuery);