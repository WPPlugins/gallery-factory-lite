/*
 By Osvaldas Valutis, www.osvaldas.info
 Available for use under the MIT License
 */

(function ($, window, document, undefined) {
    'use strict';

    var cssTransitionSupport = function () {
            var s = document.body || document.documentElement, s = s.style;
            if (s.WebkitTransition == '') return '-webkit-';
            if (s.MozTransition == '') return '-moz-';
            if (s.OTransition == '') return '-o-';
            if (s.transition == '') return '';
            return false;
        },

        isCssTransitionSupport = cssTransitionSupport() === false ? false : true,

        cssTransitionTranslateX = function (element, positionX, speed) {
            var options = {}, prefix = cssTransitionSupport();
            options[prefix + 'transform'] = 'translateX(' + positionX + ')';
            options[prefix + 'transition'] = prefix + 'transform ' + speed + 's linear';
            element.css(options);
        },

        hasTouch = ( 'ontouchstart' in window ),
        hasPointers = window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
        wasTouched = function (event) {
            if (hasTouch)
                return true;

            if (!hasPointers || typeof event === 'undefined' || typeof event.pointerType === 'undefined')
                return false;

            if (typeof event.MSPOINTER_TYPE_MOUSE !== 'undefined') {
                if (event.MSPOINTER_TYPE_MOUSE != event.pointerType)
                    return true;
            }
            else if (event.pointerType != 'mouse')
                return true;

            return false;
        };

    $.fn.imageLightbox = function (options) {
        var options = $.extend(
                {
                    selector: 'id="imagelightbox"',
                    allowedTypes: 'png|jpg|jpeg|gif',
                    animationSpeed: 250,
                    preloadNext: true,
                    enableKeyboard: true,
                    quitOnEnd: false,
                    quitOnImgClick: false,
                    quitOnDocClick: true,
                    onStart: false,
                    onEnd: false,
                    onLoadStart: false,
                    onLoadEnd: false,
                    bottomShift: 68,
                    container: $()
                },
                options),

            targets = $([]),
            target = $(),
            image = $(),
            imageWidth = 0,
            imageHeight = 0,
            swipeDiff = 0,
            inProgress = false,

            isTargetValid = function (element) {
                return $(element).prop('tagName').toLowerCase() == 'a' && ( new RegExp('\.(' + options.allowedTypes + ')$', 'i') ).test($(element).attr('href'));
            },

            setImage = function () {
                if (!image.length) return true;

                var screenWidth = $(window).width() * 0.9,
                    screenHeight = ($(window).height() - options.bottomShift) * 0.94,
                    tmpImage = new Image();

                tmpImage.src = image.attr('src');
                tmpImage.onload = function () {
                    imageWidth = tmpImage.width;
                    imageHeight = tmpImage.height;

                    if (imageWidth > screenWidth || imageHeight > screenHeight) {
                        var ratio = imageWidth / imageHeight > screenWidth / screenHeight ? imageWidth / screenWidth : imageHeight / screenHeight;
                        imageWidth /= ratio;
                        imageHeight /= ratio;
                    }

                    image.css(
                        {
                            'width': imageWidth + 'px',
                            'height': imageHeight + 'px',
                            'top': ( $(window).height() - imageHeight - options.bottomShift ) / 2 + 'px',
                            'left': ( $(window).width() - imageWidth ) / 2 + 'px'
                        });
                };
            },

            loadImage = function (direction) {
                if (inProgress) return false;

                direction = typeof direction === 'undefined' ? false : direction == 'left' ? 1 : -1;

                if (image.length) {
                    if (direction !== false && ( targets.length < 2 || ( options.quitOnEnd === true && ( ( direction === -1 && targets.index(target) == 0 ) || ( direction === 1 && targets.index(target) == targets.length - 1 ) ) ) )) {
                        quitLightbox();
                        return false;
                    }
                    var params = {'opacity': 0};
                    if (isCssTransitionSupport) cssTransitionTranslateX(image, ( 100 * direction ) - swipeDiff + 'px', options.animationSpeed / 1000);
                    else params.left = parseInt(image.css('left')) + 100 * direction + 'px';
                    image.animate(params, options.animationSpeed, function () {
                        removeImage();
                    });
                    swipeDiff = 0;
                }

                inProgress = true;
                if (options.onLoadStart !== false) options.onLoadStart();

                setTimeout(function () {
                    image = $('<img ' + options.selector + ' />')
                        .attr('src', target.attr('href'))
                        .load(function () {

                            image.appendTo('body');
                            setImage();

                            var params = {'opacity': 1};

                            image.css('opacity', 0);
                            if (isCssTransitionSupport) {
                                cssTransitionTranslateX(image, -100 * direction + 'px', 0);
                                setTimeout(function () {
                                    cssTransitionTranslateX(image, 0 + 'px', options.animationSpeed / 1000)
                                }, 50);
                            }
                            else {
                                var imagePosLeft = parseInt(image.css('left'));
                                params.left = imagePosLeft + 'px';
                                image.css('left', imagePosLeft - 100 * direction + 'px');
                            }

                            image.animate(params, options.animationSpeed, function () {
                                inProgress = false;
                                if (options.onLoadEnd !== false) options.onLoadEnd();
                            });
                            if (options.preloadNext) {
                                var nextTarget = targets.eq(targets.index(target) + 1);
                                if (!nextTarget.length) nextTarget = targets.eq(0);
                                $('<img />').attr('src', nextTarget.attr('href')).load();
                            }
                        })
                        .error(function () {
                            if (options.onLoadEnd !== false) options.onLoadEnd();
                        });

                    var swipeStart = 0,
                        swipeEnd = 0,
                        imagePosLeft = 0;

                    image.on(hasPointers ? 'pointerup MSPointerUp' : 'click', function (e) {
                        e.preventDefault();
                        if (options.quitOnImgClick) {
                            quitLightbox();
                            return false;
                        }
                        if (wasTouched(e.originalEvent)) return true;
                        var posX = ( e.pageX || e.originalEvent.pageX ) - e.target.offsetLeft;
                        target = targets.eq(targets.index(target) - ( imageWidth / 2 > posX ? 1 : -1 ));
                        if (!target.length) target = targets.eq(imageWidth / 2 > posX ? targets.length : 0);
                        loadImage(imageWidth / 2 > posX ? 'left' : 'right');
                    })
                        .on('touchstart pointerdown MSPointerDown', function (e) {
                            if (!wasTouched(e.originalEvent) || options.quitOnImgClick) return true;
                            if (isCssTransitionSupport) imagePosLeft = parseInt(image.css('left'));
                            swipeStart = e.originalEvent.pageX || e.originalEvent.touches[0].pageX;
                        })
                        .on('touchmove pointermove MSPointerMove', function (e) {
                            if (!wasTouched(e.originalEvent) || options.quitOnImgClick) return true;
                            e.preventDefault();
                            swipeEnd = e.originalEvent.pageX || e.originalEvent.touches[0].pageX;
                            swipeDiff = swipeStart - swipeEnd;
                            if (isCssTransitionSupport) cssTransitionTranslateX(image, -swipeDiff + 'px', 0);
                            else image.css('left', imagePosLeft - swipeDiff + 'px');
                        })
                        .on('touchend touchcancel pointerup pointercancel MSPointerUp MSPointerCancel', function (e) {
                            if (!wasTouched(e.originalEvent) || options.quitOnImgClick) return true;
                            if (Math.abs(swipeDiff) > 50) {
                                target = targets.eq(targets.index(target) - ( swipeDiff < 0 ? 1 : -1 ));
                                if (!target.length) target = targets.eq(swipeDiff < 0 ? targets.length : 0);
                                loadImage(swipeDiff > 0 ? 'right' : 'left');
                            }
                            else {
                                if (isCssTransitionSupport) cssTransitionTranslateX(image, 0 + 'px', options.animationSpeed / 1000);
                                else image.animate({'left': imagePosLeft + 'px'}, options.animationSpeed / 2);
                            }
                        });

                }, options.animationSpeed + 100);
            },

            removeImage = function () {
                if (!image.length) return false;
                image.remove();
                image = $();
            },

            quitLightbox = function () {
                if (!image.length) return false;
                image.animate({'opacity': 0}, options.animationSpeed, function () {
                    removeImage();
                    inProgress = false;
                    if (options.onEnd !== false) options.onEnd();
                });
            };

        $(window).on('resize', setImage);

        if (options.quitOnDocClick) {
            $(document).on(hasTouch ? 'touchend' : 'click', function (e) {
                if (image.length && !$(e.target).is(image)) quitLightbox();
            })
        }

        if (options.enableKeyboard) {
            $(document).on('keyup', function (e) {
                if (!image.length) return true;
                e.preventDefault();
                if (e.keyCode == 27) quitLightbox();
                if (e.keyCode == 37 || e.keyCode == 39) {
                    target = targets.eq(targets.index(target) - ( e.keyCode == 37 ? 1 : -1 ));
                    if (!target.length) target = targets.eq(e.keyCode == 37 ? targets.length : 0);
                    loadImage(e.keyCode == 37 ? 'left' : 'right');
                }
            });
        }

        this.switchImageLightbox = function (index) {
            var tmpTarget = targets.eq(index);
            if (tmpTarget.length) {
                var currentIndex = targets.index(target);
                target = tmpTarget;
                loadImage(index < currentIndex ? 'left' : 'right');
            }
            return this;
        };

        this.switchNextImage = function () {
            target = targets.eq(targets.index(target) + 1);
            if (!target.length) target = targets.eq(0);
            loadImage('right');
        };

        this.switchPrevImage = function () {
            target = targets.eq(targets.index(target) - 1);
            if (!target.length) target = targets.eq(targets.length - 1);
            loadImage('left');
        };

        this.quitImageLightbox = function () {
            quitLightbox();
            return this;
        };

        /**
         * Updates the targets for the lightbox
         * @param container - Container with images (a page)
         * @param append - boolean, true if should append new images to existing targets, false if should replace targets with new ones
         */
        this.updateTargets = function (container, append) {


            if (!append) {
                targets.each(function () {
                    $(this).off('click.imagelightbox')
                });

                targets = $([]);
            }

            container.find('.vls-gf-item a').each(function () {
                if (isTargetValid(this)) {
                    targets = targets.add($(this));
                }
            });

            targets.on('click.imagelightbox', function (e) {
                if (!isTargetValid(this)) return true;
                e.preventDefault();
                if (inProgress) return false;
                inProgress = false;
                if (options.onStart !== false) options.onStart();
                target = $(this);
                loadImage();
            });

        };

        //activating
        this.updateTargets(options.container, false);

        return this;
    };
})(jQuery, window, document);

/**
 * Initializing function for Imagelightbox
 */
jQuery(function ($) {

    var activityIndicatorOn = function () {
            $('<div id="imagelightbox-loading"><div></div></div>').appendTo('body');
        },

        activityIndicatorOff = function () {
            $('#imagelightbox-loading').remove();
        },

        overlayOn = function () {
            $('<div id="imagelightbox-overlay"></div>').appendTo('body');
        },

        overlayOff = function () {
            $('#imagelightbox-overlay').remove();
        },

        closeButtonOn = function (instance) {
            $('<a href="#" id="imagelightbox-close">Close</a>').appendTo('body').on('click touchend', function () {
                instance.quitImageLightbox();
                return false;
            });
        },

        closeButtonOff = function () {
            $('#imagelightbox-close').remove();
        },

        arrowsOn = function (instance) {
            var $arrows = $('<button type="button" class="imagelightbox-arrow imagelightbox-arrow-left"></button><button type="button" class="imagelightbox-arrow imagelightbox-arrow-right"></button>');

            $arrows.appendTo('body');

            $arrows.on('click touchend', function (e) {
                e.preventDefault();

                if ($(this).hasClass('imagelightbox-arrow-left')) {
                    instance.switchPrevImage();
                }
                else {
                    instance.switchNextImage();
                }
                return false;
            });
        },

        arrowsOff = function () {
            $('.imagelightbox-arrow').remove();
        },

        infoOn = function () {

            var ilb = $('#imagelightbox');

            var info = $('<div id="imagelightbox-info"/>'),
                a = $('a[href="' + $('#imagelightbox').attr('src') + '"]');


            var caption = a.find('.vls-gf-info-caption');
            if (caption)
                info.append('<h2 id="imagelightbox-info-caption">' + caption.text() + '</h2>');

            var description = a.find('.vls-gf-info-description');
            if (description)
                info.append('<div id="imagelightbox-info-description">' + description.text() + '</div>');


            info.appendTo('body');
        },

        infoOff = function () {
            $('#imagelightbox-info').remove();
        },

        navigationOn = function (instance, selector) {
            var images = $(selector);
            if (images.length) {
                var nav = $('<div id="imagelightbox-nav"></div>');
                for (var i = 0; i < images.length; i++)
                    nav.append('<a href="#"></a>');

                nav.appendTo('body');
                nav.on('click touchend', function () {
                    return false;
                });

                var navItems = nav.find('a');
                navItems.on('click touchend', function () {
                    var $this = $(this);
                    if (images.eq($this.index()).attr('href') != $('#imagelightbox').attr('src'))
                        instance.switchImageLightbox($this.index());

                    navItems.removeClass('active');
                    navItems.eq($this.index()).addClass('active');

                    return false;
                })
                    .on('touchend', function () {
                        return false;
                    });
            }
        },

        navigationUpdate = function (selector) {
            var items = $('#imagelightbox-nav a');
            items.removeClass('active');
            items.eq($(selector).filter('[href="' + $('#imagelightbox').attr('src') + '"]').index(selector)).addClass('active');
        },

        navigationOff = function () {
            $('#imagelightbox-nav').remove();
        };


    $('.vls-gf-album').each(function () {

        var $this = $(this);

        var vlsGfImageLightbox = $this.imageLightbox(
            {
                container: $this.find('.vls-gf-page:first-child'),
                onStart: function () {
                    overlayOn();
                    closeButtonOn(vlsGfImageLightbox);
                    arrowsOn(vlsGfImageLightbox);
                },
                onEnd: function () {
                    arrowsOff();
                    infoOff();
                    closeButtonOff();
                    overlayOff();
                    activityIndicatorOff();
                },
                onLoadStart: function () {
                    infoOff();
                    activityIndicatorOn();
                },
                onLoadEnd: function () {
                    $('.imagelightbox-arrow').css('display', 'block');
                    infoOn();
                    activityIndicatorOff();
                }
            });

        $this.data('vlsGfLightbox', vlsGfImageLightbox);

    });

});
