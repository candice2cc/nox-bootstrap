/**
 * Created by candice on 15/6/10.
 */
+function ($) {
    var Pages = function (el, option) {
        this.pages(el, option);
    };
    Pages.VERSION = '1.0.0';

    Pages.prototype.pages = function (el, option) {
        var totalPage = option.totalPage || 1;
        var currentPage = option.currentPage || 1;
        var step = option.step || 7;
        var baseUrl = option.baseUrl || "/";
        if (totalPage <= 1){
            $(el).html("");
            return false;
        }

        var pageNumberList = calcPageNumberList(currentPage, totalPage, step);
        var html = '<div class="pages-container"><div class="pages">';
        for (var i = 0; i < pageNumberList.length; i++) {
           if (pageNumberList[i] == 0) {
                html += "<span>...</span>";
            } else if (pageNumberList[i] == -1) {
                html = html + '<a href="' + baseUrl + (currentPage - 1) + '" ><i class="nox-sort-left"></i></a>';
            } else if (pageNumberList[i] == -2) {
                html = html + '<a href="' + baseUrl + (currentPage + 1) + '" ><i class="nox-sort-right"></i></a>';
            } else if (currentPage == pageNumberList[i]) {
                html = html + '<a class="active" href="' + baseUrl + pageNumberList[i] + '">' + pageNumberList[i] + '</a>';
            }else {
                html = html + '<a href="' + baseUrl + pageNumberList[i] + '">' + pageNumberList[i] + '</a>';
            }
        }
        html = html + "</div</div>";
        $(el).html(html);
    };
    function r(a, b) {
        return a > b ? [] : [a].concat(r(++a, b))
    }


    function calcPageNumberList(currentPage, totalPage, step) {
        var pageNumberList = [];
        if (totalPage <= step) {
            pageNumberList = r(1, totalPage);
        } else {
            if (currentPage <= step) {
                if(currentPage > 1){
                    pageNumberList = [-1, 1, 2, 3, 4, 5, 6, 7, 0, -2];
                }else{
                    pageNumberList = [1, 2, 3, 4, 5, 6, 7, 0, -2];
                }

            } else if (currentPage + 2 >= totalPage) {
                pageNumberList = [-1, 1, 2, 0].concat(r(totalPage - 4, totalPage));
                if (currentPage < totalPage) {
                    pageNumberList.append(-2);
                }

            } else {
                pageNumberList = [-1, 1, 2, 0].concat(r(currentPage - 2, currentPage + 2)).concat([0, -2]);
            }
        }
        return pageNumberList;
    }


    // Pages PLUGIN DEFINITION
    // =======================
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.pages');

            if (!data) {
                $this.data('bs.pages', (data = new Pages(this, option)));
            }else{
                data.pages(this,option);
            }
            if (typeof option == 'string') data[option].call($this);
        })
    }

    var old = $.fn.pages;
    $.fn.pages = Plugin;
    $.fn.pages.Constructor = Pages;

    // Pages NO CONFLICT
    // =================

    $.fn.pages.noConflict = function () {
        $.fn.pages = old;
        return this;
    }
    // Pages DATA-API
    // ==============


}(jQuery);