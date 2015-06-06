/**
 * @file search-bar.js
 * @author Vincent<yukuangji@bignox.com>
 * @date 20150515
 * @description search box with suggestion list
 */
(function($, window, undefined) {
    'use strict';

    /**
     * @class SearchBar
     * @param {object} config configuration object
     */
    function SearchBar(config) {

        this.init(config);
        console.log(this);
        // return this;
    }
    SearchBar.prototype.config = {
        $container: $(document),
        defaultSugList: [],
        maxSug: 5,
        sugDelay: 150,
        defaultQuery: ''
    };
    SearchBar.prototype.init = function(config) {
        if (!config) {
            config = {};
        }
        var that = this;
        var now = (new Date()).valueOf();
        // build basic config
        this.config = $.extend(this.config, config);
        this.$box = $('<div class="nox-search-box" data-ts="' + now + '"></div>');
        // console.log(this.config.$container);
        this.config.$container.after(this.$box);
        // build dom
        if (this.config.$container[0].tagName == 'input') {
            // $container is an input(it should be)
            this.$searchInput = this.config.$container.detach().appendTo(this.$box);
        } else {
            // $container is not an input
            var $oldContainer = this.config.$container.detach();
            this.$searchInput = $('<input type="text" class="search-input border-radius">').appendTo(this.$box)
            this.$searchBtn = $('<button class="btn btn-xs btn-primary"><i class="nox-search"></i></button>').appendTo(this.$box);
        }
        this.$searchBtn.on('click', function(e) {
            that.onEnter(e);
        });
        // if sug functionality is disabled, bind enter key and jump out
        if (config.disableSug) {
            this.$searchInput.on('keydown', function(e) {
                // ENTER
                if (e.keyCode == 13) {
                    that.onEnter(e.target.value);
                }
            });
            return;
        }
        // sug dom and event handlers
        this.$sugList = $('<ul class="search-sug"></ul>');
        this.$box.append(this.$sugList);
        // bind event handlers
        this.$searchInput.on('keydown', function(e) {
            that.onKeydown(e);
        });
        this.$searchInput.on('input', function(e) {
            that.onInput(e);
        });
        this.$searchInput.on('focus', function(e) {
            that.onFocus(e);
        });

        this.$sugList.on('mouseenter', '.sug-item', function(e) {
            that.onSugHover(e);
        });
        this.$sugList.on('click', '.sug-item', function(e) {
            console.log('onclick', this);
            that.onEnter(that.$searchInput.val());
        });

        $(document).on('click', function(e) {
            if (that.$sugList.is('.expanded') && $(e.target).parents('.nox-search-box').length > 0 && $(e.target).parents('.nox-search-box').attr('data-ts') === that.$box.attr('data-ts')) {
                return;
            }
            that.onBlur(e);
        });
    };

    SearchBar.prototype.onSugHover = function(e) {
        this.changeActiveSug($(e.target));
    };
    SearchBar.prototype.onInput = function(e) {
        var query = e.target.value;
        var that = this;
        var callback = function(sug) {
            that._fillSug(sug);
        };
        if (this.st) {
            clearTimeout(this.st);
        }
        this.st = setTimeout(function() {
            that.config.sugGetter(query, callback, that.config.defaultSugList);
        }, this.config.sugDelay);

    };
    SearchBar.prototype.onKeydown = function(e) {
        // UP or DOWN
        if (e.keyCode == 38 || e.keyCode == 40) {
            this.onUpOrDown(e.keyCode == 40, this.$searchInput, this.$sugList);
        }
        // ESC
        if (e.keyCode == 27) {
            this.onEscape();
            this.$searchInput.blur();
        }
        // ENTER
        if (e.keyCode == 13) {
            this.onEnter(e.target.value);
        }
    };
    SearchBar.prototype.onFocus = function(e) {
        this.$sugList.addClass('expanded');
        this.onInput(e);
    };
    SearchBar.prototype.onBlur = function(e) {
        this._closeSug();
    };
    SearchBar.prototype.onClickSug = function(e) {};
    SearchBar.prototype.onUpOrDown = function(isDownward, $searchInput, $sugList) {
        // var $sugListItems = $('.sug>ul>.sug-item[data-sug-content]');
        var $sugListItems = $sugList.find('.sug-item[data-sug-content]');
        if (!$sugListItems.length) {
            return false;
        }
        var length = $sugListItems.size();
        if (length == 0) {
            return false;
        }
        var currentSugIndex = (function() {
            for (var i = 0; i < length; i++) {
                if ($sugListItems.eq(i).is('.active')) {
                    return i;
                }
            }
            return -1;
        })();
        var nextSugIndex = currentSugIndex + 1,
            previousSugIndex = currentSugIndex - 1,
            supposedSugIndex = 0;
        if (nextSugIndex >= length) {
            nextSugIndex = 0;
        }
        if (previousSugIndex < 0) {
            previousSugIndex = length - 1;
        }
        if (isDownward) {
            supposedSugIndex = nextSugIndex;
        } else {
            supposedSugIndex = previousSugIndex;
        }
        this.changeActiveSug($sugListItems.eq(supposedSugIndex));
    };
    SearchBar.prototype.changeActiveSug = function($item) {
        var $sugListItems = this.$sugList.find('.sug-item[data-sug-content]');
        $sugListItems.removeClass('active');
        this.$searchInput.val($item.addClass('active').attr('data-sug-content') || '');
    };
    SearchBar.prototype.onEnter = function(query) {
        if (query) {
            this.config.queryAction(query);
            this._closeSug();
        }
    };
    SearchBar.prototype.onEscape = function() {
        this._closeSug();
    };
    SearchBar.prototype._fillSug = function(sugData) {
        this.$sugList.addClass('expanded');

        if (!sugData || sugData.length == 0) {
            this._emptySug().append($('<li class="sug-item" data-sug-content=""><span></span></li>'));
            return;
        }
        var lis = '';
        var threshold = sugData.length > this.config.maxSug ? this.config.maxSug : sugData.length;
        for (var i = 0; i < threshold; i++) {
            var item = sugData[i].name,
                address = sugData[i].link;
            var li = '<li class="sug-item" data-sug-content="' + item + '"><span>' + item + '</span></li>';
            lis += li;
        }
        this._emptySug().append($(lis));
    };
    SearchBar.prototype._closeSug = function() {
        if (this.$sugList) {
            this.$sugList.removeClass('expanded');
        }
    };
    SearchBar.prototype._emptySug = function() {
        console.log(this);
        var $container = this.$sugList;
        return $container.empty();
    };


    /**
     * init plugin
     */
    window.$searchBars = [];
    $.fn.searchBar = function initSearchBar(config) {
        // jquery object
        // DOM i.g. <div data-role="search-bar" data-max-sug="5" data-default-query="$!{queryInfo.defaultQuery}"></div>
        var $this = $(this);
        window.$searchBars.push($this);
        if (!$this || typeof $this.sbInstance != 'undefined') {
            return $this;
        }
        var sugUrl = $this.attr('data-sug-url'),
            sugMethod = $this.attr('data-sug-method') || 'GET',
            queryUrl = $this.attr('data-target'),
            queryMethod = $this.attr('data-action') || 'GET',
            maxSug = parseInt($this.attr('data-max-sug'), 10) || 5,
            sugDelay = parseInt($this.attr('data-sug-delay'), 10) || 150,
            defaultQuery = $this.attr('data-default-query') || '',
            defaultSugList = $this.attr('data-default-sug-list') ? $this.attr('data-default-sug').split(',') : [];
        // init config > dom attribute > default
        config = $.extend({
            $container: $this,
            sugUrl: sugUrl,
            sugMethod: sugMethod,
            queryUrl: queryUrl,
            queryMethod: queryMethod,
            maxSug: maxSug,
            sugDelay: sugDelay,
            defaultQuery: defaultQuery,
            defaultSugList: defaultSugList,
        }, config);

        var sb = new SearchBar(config);
        $this.sbInstance = sb;
        return $this;
    };
})(jQuery, window);
