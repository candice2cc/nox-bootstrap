+function ($) {
    var weiXinPub = '#weiXinPub';
    var modalWeiXin = '.modal-weixin';
    var Footer = function (el) {
        $(el).on('click', weiXinPub, this.show);
    };
    Footer.VERSION = '1.0.0';
    Footer.TRANSITION_DURATION = 150;

    Footer.prototype.show = function (e) {
        $(modalWeiXin).toggleClass("active");
    };
    Footer.prototype.hide = function (e) {
        $(modalWeiXin).toggleClass("active");

    };

    // FOOTER PLUGIN DEFINITION
    // =======================
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.footer')

            if (!data) $this.data('bs.footer', (data = new Footer(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }

    var old = $.fn.footer;
    $.fn.footer = Plugin;
    $.fn.footer.Constructor = Footer;

    // FOOTER NO CONFLICT
    // =================

    $.fn.footer.noConflict = function () {
        $.fn.footer = old;
        return this;
    }
    // FOOTER DATA-API
    // ==============

    $(document).on('click.bs.footer.data-api', weiXinPub, Footer.prototype.show);
    $(document).on('click.bs.footer.data-api', modalWeiXin, Footer.prototype.hide);

}(jQuery);