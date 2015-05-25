(function($){
    var menuHead = '.menu';
    var Top = function(el){
        $(el).on('click',menuHead,this.show);
    };
    Top.VERSION = '1.0.0';
    Top.TRANSITION_DURATION = 150;

    Top.prototype.show = function(e){
        var $this = $(this);
        $this.parents("ul").children("li").removeClass("active");
        $this.toggleClass("active");
        e.stopPropagation();
    };
    Top.prototype.close = function(e){
        $(menuHead).removeClass("active");

    };

    // TOP PLUGIN DEFINITION
    // =======================
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data  = $this.data('bs.top')

            if (!data) $this.data('bs.top', (data = new Top(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }
    var old = $.fn.top;
    $.fn.top = Plugin;
    $.fn.top.Constructor = Top;

    // HEADER NO CONFLICT
    // =================

    $.fn.top.noConflict = function () {
        $.fn.top = old;
        return this;
    }
    // TOP DATA-API
    // ==============

    $(document).on('click.bs.top.data-api', menuHead, Top.prototype.show);
    $(document).on('click.bs.top.data-api',Top.prototype.close);

})(jQuery);