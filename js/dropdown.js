/* ========================================================================
 * nox-bootstrap: dropdown.js v1.0.0
 * http://www.bignox.com
 * ========================================================================
 * Copyright 2011-2015 bignox, Inc.
 * Licensed under MIT
 * ======================================================================== */


+function ($) {
    'use strict';

    // DROPDOWN CLASS DEFINITION
    // =========================

    var backdrop = '.dropdown-backdrop';
    var toggle   = '[data-toggle="dropdown"]';
    var Dropdown = function (element) {
        $(element).on('click.nox.dropdown', this.toggle);
    };

    Dropdown.VERSION = '1.0.0';

    Dropdown.prototype.toggle = function (e) {
        var $this = $(this);

        if ($this.is('.disabled, :disabled')) return;

        var $parent  = getParent($this);
        var isActive = $parent.hasClass('open');

        clearMenus();

        if (!isActive) {
            // 如果是移动设备,则使用dropdown-backdrop样式, 因为移动设备不支持click单击委托
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = { relatedTarget: this };
            $parent.trigger(e = $.Event('show.nox.dropdown', relatedTarget));

            if (e.isDefaultPrevented()) return;

            $this
                .trigger('focus')
                .attr('aria-expanded', 'true');

            $parent
                .toggleClass('open')
                .trigger('shown.nox.dropdown', relatedTarget);
        }

        return false;
    };

    /**
     * 对按键事件的处理
     * @param e
     * @returns {*}
     */
    Dropdown.prototype.keydown = function (e) {
        // 只响应这4个键up|down|esc|space
        // 且toggle非input textarea, 但需要注意的是input在focus时在点击spacechrome会自动触发click事件, 所以虽然这里屏蔽了,但是仍然能弹出下拉框
        if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) {
            return;
        }

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) return;

        var $parent  = getParent($this);
        var isActive = $parent.hasClass('open');

        if ((!isActive && e.which != 27) || (isActive && e.which == 27)) {
            if (e.which == 27) $parent.find(toggle).trigger('focus');
            return $this.trigger('click');
        }

        var desc = ' li:not(.disabled):visible a';
        var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc);

        if (!$items.length) return;

        var index = $items.index(e.target);

        if (e.which == 38 && index > 0)                 index--;                      // up
        if (e.which == 40 && index < $items.length - 1) index++;                      // down
        if (!~index)                                    index = 0;

        $items.eq(index).trigger('focus');
    };

    /**
     * 页面中只能有一个下拉菜单是展示状态
     * @param e
     */
    function clearMenus(e) {
        // which===3是点击了鼠标右键
        if (e && e.which === 3)
            return;
        var clickTarget = e && $(e.target);
        $(backdrop).remove();
        $(toggle).each(function () {
            var $this         = $(this);
            var $parent       = getParent($this);
            var relatedTarget = { relatedTarget: this };

            if (!$parent.hasClass('open'))
                return;

            $parent.trigger(e = $.Event('hide.nox.dropdown', relatedTarget));

            // 如果已经阻止了默认行为, 就不再处理了
            if (e.isDefaultPrevented())
                return;

            $this.attr('aria-expanded', 'false');
            // 此处稍作修改, 只有展开状态才进行隐藏; 并且处理选择的数据
            if ($parent.hasClass('open')) {
                relatedTarget.clickTarget = clickTarget;
                $parent.removeClass('open').trigger('hidden.nox.dropdown', relatedTarget);
            }
        })
    }

    /**
     * 可能是父节点或者data-target里面的值
     * @param $this
     * @returns {*|HTMLElement}
     */
    function getParent($this) {
        var selector = $this.attr('data-target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
        }

        var $parent = selector && $(selector);

        return $parent && $parent.length ? $parent : $this.parent();
    }


    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data  = $this.data('nox.dropdown');

            if (!data) $this.data('nox.dropdown', (data = new Dropdown(this)));
            if (typeof option == 'string') data[option].call($this);
        })
    }

    var old = $.fn.dropdown;

    $.fn.dropdown             = Plugin;
    $.fn.dropdown.Constructor = Dropdown;


    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.dropdown.noConflict = function () {
        $.fn.dropdown = old;
        return this;
    };


    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.nox.dropdown.data-api', clearMenus)
        //==
        .on('click.nox.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.nox.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.nox.dropdown.data-api', toggle, Dropdown.prototype.keydown)
        .on('keydown.nox.dropdown.data-api', '[role="menu"]', Dropdown.prototype.keydown)
        .on('keydown.nox.dropdown.data-api', '[role="listbox"]', Dropdown.prototype.keydown);

}(jQuery);
