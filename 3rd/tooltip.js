(function($) {
    $.fn.tooltip = function(options) {
        var defaults = {
            cssClass: "",
            delay: 0,
            duration: 500,
            xOffset: 15,
            yOffset: 15,
            opacity: 0,
            fadeDuration: 400,
            eventshow: 'mouseover',
            eventhide: 'mouseleave',
            ajaxSource: 'href',
            closebutton: 'no',
            fixed: false
        };
        var options = $.extend(defaults, options);
        return this.each(function(index) {
            var $this = $(this);

            $tooltip = $("#divTooltip");
            $tooltipC = $("#divTooltipC");
            $tooltipT = $("#divTooltipT");

            if ($tooltip.length == 0) {

                $tooltipStr = '<div id="divTooltip"><div id="divTooltipT"></div><div id="divTooltipC"></div></div>';
                $('body').append($.parseHTML($tooltipStr));
                
                $tooltip = $("#divTooltip");
                $tooltipC = $("#divTooltipC");
                $tooltipT = $("#divTooltipT");
               
            }

            $tooltip.hide();

            function show(e) {
                e = e ? e : window.event;
                // if (options.closebutton == 'yes') {
                //     $tooltipT.html("<div id='close'>Sluiten</div>");
                // }
                //clearTimeout($tooltip.data("hideTimeoutId"));
                $tooltip.removeClass($tooltip.attr("class"));
                $tooltip.css("width", "");
                $tooltip.css("height", "");
                $tooltip.addClass(options.cssClass);
                $tooltip.css("opacity", 1 - options.opacity / 100);
                $tooltip.css("position", "absolute");
                $tooltip.data("ftitle", $this.attr("ftitle"));
                //$this.attr("ftitle", "");
                //$tooltip.data("alt", $this.attr("alt"));
                //$this.attr("alt", "");
                $tooltipC.html($tooltip.data("ftitle"));
                // var el = $this.attr(options.ajaxSource);
                // if (el != undefined && el != "" && el != "#") $tooltipC.html($.ajax({
                //     url: $this.attr(options.ajaxSource),
                //     async: false
                // }).responseText);

                if (options.fixed === false) {
                    winw = $(window).width();
                    w = $tooltip.width();
                    xOffset = options.xOffset;
                    if (w + xOffset + 50 < winw - e.clientX) $tooltip.css("left", $(document).scrollLeft() + e.clientX + xOffset);
                    else if (w + xOffset + 50 < e.clientX) $tooltip.css("left", $(document).scrollLeft() + e.clientX - (w + xOffset));
                    else {
                        if (e.clientX > winw / 2) {
                            $tooltip.width(e.clientX - 50);
                            $tooltip.css("left", $(document).scrollLeft() + 25);
                        } else {
                            $tooltip.width((winw - e.clientX) - 50);
                            $tooltip.css("left", $(document).scrollLeft() + e.clientX + xOffset);
                        }
                    }
                    winh = $(window).height();
                    h = $tooltip.height();
                    yOffset = options.yOffset;
                    if (h + yOffset + 50 < e.clientY) $tooltip.css("top", $(document).scrollTop() + e.clientY - (h + yOffset));
                    else if (h + yOffset + 50 < winh - e.clientY) $tooltip.css("top", $(document).scrollTop() + e.clientY + yOffset);
                    else $tooltip.css("top", $(document).scrollTop() + 10);
                }
                //$tooltip.data("showTimeoutId", setTimeout("$tooltip.fadeIn(" + options.fadeDuration + ")", options.delay));
                $tooltip.show();
            }
            

            function hide(e) {
                //e = e ? e : window.event;
                //$this.attr("ftitle", $tooltip.data("ftitle"));
                //$this.attr("alt", $tooltip.data("alt"));
                //clearTimeout($tooltip.data("showTimeoutId"));
                //$tooltip.data("hideTimeoutId", setTimeout("$tooltip.fadeOut(" + options.fadeDuration + ")", options.duration));
                $tooltip.hide();
            }

            $this.bind("mouseover", function(event) {
                show(event);
            });
            // $tooltip.bind('mouseover', function(event) {
            //     $this.stop();
            //     clearTimeout($tooltip.data("hideTimeoutId"));
            // });
            $tooltip.bind('mouseleave', function(event) {
                hide(event);
            });

            // $this.bind(options.eventhide, function(event) {
            //     hide(event);
            // });
            $this.click(function(e) {
                e.preventDefault();
            });
            $tooltipT.click(function(event) {
                hide(event);
            });
        });
    }
})(jQuery);