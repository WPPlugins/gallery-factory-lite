/* global vls_gf_script_l10n.ajaxurl */

(function ($, window, document) {

    "use strict";

    $.fn.vlsGfAlbum = function (options) {

        var albums = this;

        /**
         * Initializes the GF jQuery plugin
         */
        function init() {

            //binding layout update on window resize
            $(window).on('resize.vls-gf', function () {
                albums.each(function () {
                    $(this).data('vlsGfAlbum').updateLayout();
                });
            });


            //initializing album object
            albums.each(function () {
                $.data(this, 'vlsGfAlbum', new Album(this));
            });

        }


        function Album(element) {


            var album = $(element),
                albumId = album.data('vlsGfAlbumId'),
                layoutType = '';

            function init() {

                album.removeClass('no-js');

                if (album.hasClass('vls-gf-album-metro')) {
                    layoutType = 'metro';
                    $(window).on('resize.vls-gf-' + albumId, updateLayout);
                }

                updateLayout();
            }

            /**
             * Updates layout for the albums
             */
            function updateLayout() {
                if (layoutType == 'metro') {
                    updateLayoutMetro(true);
                }
            }

            /**
             * Updates Metro layout
             * @param firstPass
             */
            function updateLayoutMetro(firstPass) {

                if ($(window).width() <= 640) {
                    album.find('.vls-gf-thumbnail-container').css('height', '');
                    return true;
                }

                var aspectRatio = album.data('vlsGfAspectRatio'),
                    hSpacing = album.data('vlsGfHorizontalSpacing'),
                    vSpacing = album.data('vlsGfVerticalSpacing'),
                    columnCount = album.data('vlsGfColumnCount'),
                    containerWidth = Math.floor(album[0].getBoundingClientRect().width), //manually rounding actual size down to be on the safe side
                    colWidths = [],
                    rowHeight = 0,
                    containerHeight,
                    firstRowOffset = -1,
                    lastRow = 0;

                //calculating row widths
                var totWidth = containerWidth - hSpacing * (columnCount - 1);  //total width of row items without spacings
                var baseWidth = Math.floor(totWidth / columnCount);
                var extraPixels = totWidth - baseWidth * columnCount;

                for (var a = 0; a < columnCount; a++) {
                    colWidths[a] = baseWidth;
                    if (extraPixels > 0) {
                        colWidths[a]++;
                        extraPixels--;
                    }

                }

                //calculating row height
                rowHeight = Math.round(baseWidth / aspectRatio);

                //processing items
                album.find('.vls-gf-page:not(".vls-gf-hidden") .vls-gf-item').each(function () {

                    var item = $(this),
                        imageAspect = item.data('vlsGfImageAspect'),
                        metroWidth = item.data('vlsGfWidth'),
                        metroHeight = item.data('vlsGfHeight'),
                        col = item.data('vlsGfCol'),
                        row = item.data('vlsGfRow'),
                        width = 0,
                        height = 0,
                        left = 0,
                        top = 0;

                    //if first pages are not visible, set the starting offset
                    if (firstRowOffset < 0) {
                        firstRowOffset = row;
                    }

                    var visibleRow = row - firstRowOffset;

                    //calculating width
                    for (a = col; a < col + metroWidth; a++) {
                        width += colWidths[a];
                    }
                    width += hSpacing * (metroWidth - 1);

                    //calculating height
                    height = rowHeight * metroHeight + vSpacing * (metroHeight - 1);

                    for (a = 0; a < col; a++) {
                        left += colWidths[a];
                    }
                    left += hSpacing * col;

                    top = rowHeight * visibleRow + vSpacing * visibleRow;

                    //positioning item
                    item.css({
                        width: width,
                        height: height,
                        left: left,
                        top: top
                    });

                    //calculating aspect-related class (for proper image scaling)
                    if (width / height > imageAspect) {
                        item.find('img').removeClass('vls-gf-wide').addClass('vls-gf-tall');
                    } else {
                        item.find('img').removeClass('vls-gf-tall').addClass('vls-gf-wide');
                    }

                    if (lastRow < visibleRow + metroHeight - 1) {
                        lastRow = visibleRow + metroHeight - 1;
                    }

                });

                containerHeight = rowHeight * (lastRow + 1) + vSpacing * lastRow;

                album.find('.vls-gf-thumbnail-container').css('height', containerHeight + 'px');

                //if update affects container width (due to scroll bar show/hide), then update again. Restricted to one update to avoid endless cycle in certain situations.
                if (firstPass && containerWidth != parseInt(album.width())) {
                    updateLayoutMetro(false);
                }

            }

            init();

            return {
                updateLayout: updateLayout
            }

        }

        init();

        return this;

    };

    //activating on document ready
    $(document).ready(function () {
        $('.vls-gf-album').vlsGfAlbum();
    });

})(jQuery, window, document);



   