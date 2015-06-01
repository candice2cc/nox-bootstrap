+function ($) {
    var FULL_SCORE = 5;

    var Score = function (el,option) {
        this.score(el,option);

    };
    Score.VERSION = '1.0.0';

    Score.prototype.score = function (el,option) {
        $(el).addClass("starbox");
        var scoreValue = 5;


        if(option.color != undefined){
            $(el).css("color",option.color);
        }
        if(option.score != undefined){
            scoreValue = option.score;
        }

        //设置分值
        var fullCount = Math.floor(scoreValue);
        var emptyCount = FULL_SCORE - fullCount;

        var html = "";
        for(var i = 0;i<fullCount;i++){
            html += '<i class="nox-star-full"></i>';
        }
        if(scoreValue > fullCount){
            html += '<i class="nox-star-full-half"></i>';
            emptyCount -= 1;
        }
        for(var i = 0;i<emptyCount;i++){
            html += '<i class="nox-star-empty"></i>';
        }

        $(el).html(html);
    };


    // TOP PLUGIN DEFINITION
    // =======================
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this)
            var data = $this.data('bs.score');

            if (!data) $this.data('bs.score', (data = new Score(this,option)));
            if (typeof option == 'string') data[option].call($this);
        })
    }

    var old = $.fn.score;
    $.fn.score = Plugin;
    $.fn.score.Constructor = Score;

    // TOP NO CONFLICT
    // =================

    $.fn.score.noConflict = function () {
        $.fn.score = old;
        return this;
    }
    // TOP DATA-API
    // ==============



}(jQuery);