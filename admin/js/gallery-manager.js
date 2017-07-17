/* global ajaxurl, vls_plupload_setup_object, vlsGfGalleryAdminData */

"use strict";

var VLS_GF = VLS_GF || {};

VLS_GF.GalleryManager = (function ($) {

    var tabBar,
        tabView,

    // Current state of the gallery manager (by default the initial position is set)
        state = {
            itemType: 'unsorted_images',
            albumId: 0,
            tab: 'album_overview'
        };

    /**
     * Initializes Gallery Manager
     */
    function init() {

        tabBar = $('#vls-gf-tab-panel');
        tabView = $('.vls-gf-tab-view');

        //adding tab switching behaviour
        tabBar.find('ul > li > a').on('click.vls-gf', function (e) {
            switchTab($(this).attr('href'));
            e.preventDefault();
        });

        VLS_GF.NavigationPanelModule.init();


        //switch once to display unsorted images in the Main Panel
        switchAlbum(state.itemType, state.albumId);

    }

    /**
     * Switches main panel view to selected album or predefined folder
     */
    function switchAlbum(itemType, albumId, albumName, shortcode) {

        if (itemType == 'all_images' || itemType == 'unsorted_images') {

            albumId = 0;
            $('#vls-gf-tab-panel').slideUp();

            if (itemType == 'all_images') {
                albumName = vlsGfGalleryAdminData.l10n.strAllImages;
            } else if (itemType == 'unsorted_images') {
                albumName = vlsGfGalleryAdminData.l10n.strUnsortedImages;
            }

            $('.vls-gf-window-title > .vls-gf-shortcode').css('display', 'none').find('input').val('');

        } else {

            $('#vls-gf-tab-panel').slideDown();
            $('.vls-gf-window-title .vls-gf-shortcode').css('display', '').find('input').val(shortcode);

        }

        $('.vls-gf-window-title > span').first().text(albumName);

        // setting new state
        state.itemType = itemType;
        state.albumId = albumId;
        state.tab = 'album_overview';

        //switching to the Overview Tab.
        switchTab(state.tab);

        return false;
    }

    /**
     * Switches gallery manager tab
     */
    function switchTab(tabName) {

        tabName = tabName.replace('#', '');

        //indicating activity
        tabView.append('<div class="vls-gf-loading-overlay"><span></span></div>');

        //switching the tab visual
        tabBar.find('li').removeClass('active');
        tabBar.find('a[href="#' + tabName + '"]:first').parent().addClass('active');

        switch (tabName) {
            case 'album_overview':
                VLS_GF.AlbumOverviewPanelModule.loadContent(state.itemType, state.albumId);
                break;
            case 'album_layout':
                VLS_GF.AlbumLayoutPanelModule.loadContent(state.albumId);
                break;
            case 'album_edit':
                VLS_GF.ItemEditPanelModule.loadContent('album', state.albumId);
                break;
            default:
                return false;
        }

        return false;

    }

    /**
     * Reloads current tab
     */
    function reloadTab() {
        switchTab(state.tab);
    }

    /**
     * Returns popup dialog as jQuery object
     */
    function dialogPopupView() {
        return $('<div class="vls-gf-modal"><div class="vls-gf-backdrop"></div><div class="vls-gf-window"></div></div>');
    }

    /**
     * Closes popup dialog
     */
    function closePopup() {
        $('.vls-gf-modal').remove();
    }

    /**
     * Shows confirm dialog with given message, action text and action function
     */
    function showConfirmDialog(header, message, actionText, actionFunction) {

        var $dialog = dialogPopupView();
        var $window = $dialog.find('.vls-gf-window');

        //header panel
        $window.append('<div class="vls-gf-title"><span>' + header + '</span></div>');

        var $content = $('<div class="vls-gf-content"></div>');
        $window.append($content);

        //label
        $content.append('<span class="vls-gf-message">' + message + '</span>');

        var $buttonsPanel = $('<div class="vls-gf-buttons-panel"></div>');
        $window.append($buttonsPanel);

        //cancel button
        var $cancelButton = $('<a class="button" href="#">Cancel</a>');
        $cancelButton.on('click.vls-gf', closePopup);
        $buttonsPanel.append($cancelButton);

        //action button
        var $actionButton = $('<a class="button-primary" href="#"></a>').text(actionText);
        $actionButton.on('click.vls-gf', actionFunction);
        $buttonsPanel.append($actionButton);

        $('#wpwrap').append($dialog);

        $window.css('margin-top', 0 - $window.height() / 2);


    }

    /**
     * Shows rename dialog
     */
    function showNameDialog(action, actionFunction) {

        var title = '';
        var actionButtonText = '';
        var inputLabel = '';

        if (action === 'rename') {
            title = vlsGfGalleryAdminData.l10n.strRenameHeader;
            actionButtonText = vlsGfGalleryAdminData.l10n.strRenameAction;
            inputLabel = vlsGfGalleryAdminData.l10n.strRenameLabel;
        } else if (action === 'createFolder') {
            title = vlsGfGalleryAdminData.l10n.strCreateFolderHeader;
            actionButtonText = vlsGfGalleryAdminData.l10n.strCreateFolderAction;
            inputLabel = vlsGfGalleryAdminData.l10n.strCreateFolderLabel;
        } else if (action === 'createAlbum') {
            title = vlsGfGalleryAdminData.l10n.strCreateAlbumHeader;
            actionButtonText = vlsGfGalleryAdminData.l10n.strCreateAlbumAction;
            inputLabel = vlsGfGalleryAdminData.l10n.strCreateAlbumLabel;
        }

        var $dialog = dialogPopupView();
        var $window = $dialog.find('.vls-gf-window');

        //header panel
        $window.append('<div class="vls-gf-title"><span>' + title + '</span></div>');

        //content
        var $content = $('<div class="vls-gf-content"></div>');
        $window.append($content);

        //input field
        $content.append('<label class="vls-gf-form-element"><span>' + inputLabel + '</span><input type="text" value="" /></label>');
        var $input = $content.find('input');
        $input.on('keyup.vls-gf', function (event) {
            if (event.keyCode == 13) {
                actionFunction();
            }
        });

        var $buttonsPanel = $('<div class="vls-gf-buttons-panel"></div>');
        $window.append($buttonsPanel);

        //cancel button
        var $cancelButton = $('<a class="button" href="#">Cancel</a>');
        $cancelButton.on('click.vls-gf', closePopup);
        $buttonsPanel.append($cancelButton);

        //action button
        var $actionButton = $('<a class="button-primary" href="#"></a>').text(actionButtonText);
        $actionButton.on('click.vls-gf', actionFunction);
        $buttonsPanel.append($actionButton);


        $('#wpwrap').append($dialog);

        $window.css('margin-top', 0 - $window.height() / 2);

        $input.focus();

    }


    //returning public methods
    return {
        init: init,
        switchAlbum: switchAlbum,
        reloadTab: reloadTab,
        showConfirmDialog: showConfirmDialog,
        showNameDialog: showNameDialog,
        closePopup: closePopup
    };

})(jQuery);

VLS_GF.NavigationPanelModule = (function ($) {

    var navigationPanel,
        albumTree,
        albumTreeDraggingState = {
            $draggedItem: null,
            $draggingGhost: $('<div class="dragging-ghost"><div></div></div>'),
            itemTreeOffset: {top: 0, bottom: 0},
            currentArea: {top: 0, bottom: 0, left: 0, right: 0},
            initialLevel: 0,
            nextItemOrder: 99999,
            hoverTimeout: {},
            ghostPosition: -1,
            ghostLevel: 0
        },
        albumTreeItemSizes = {height: 28, middle: 14, topPart: 11, bottomPart: 18},
        levelCalcStep = 10;

    /**
     * Initializes Albums Panel module
     */
    function init() {

        navigationPanel = $('.vls-gf-gallery-manager-container .vls-gf-navigation-panel');
        albumTree = $('#vls-gf-gallery-tree');

        navigationPanel.find('ul.vls-gf-fixed-items a').on('click.vls-gf touchend.vls-gf', function (e) {

            var $this = $(this);


            navigationPanel.find('ul>li>span.wp-ui-highlight').remove();
            $this.parent().append('<span class="wp-ui-highlight">');

            var item_type = $this.attr('href').replace('#', '');
            VLS_GF.GalleryManager.switchAlbum(item_type, 0);

            e.preventDefault();
            return false;
        });

        // "Edit gallery tree" button
        $('#vls-gf-btn-edit-gallery-tree').on('click.vls-gf touchend.vls-gf', beginGalleryTreeEdit);

        // "Save changes" and "Cancel" buttons
        $('#vls-gf-btn-gallery-tree-commit, #vls-gf-btn-gallery-tree-cancel').on('click.vls-gf touchend.vls-gf', endGalleryTreeEdit);

        //add new folder button
        $('#vls-gf-btn-add-new-folder, #vls-gf-btn-add-new-album').on('click.vls-gf touchend.vls-gf', galleryTreeAddItem);

        loadGalleryTree();
    }

    /**
     * Initializes gallery tree
     */
    function initGalleryTree() {

        albumTree.find('li').on('click.vls-gf touchend.vls-gf', galleryTreeItemClick);

        updateGalleryTreeLayout();

        // add droppable to the albums
        albumTree.parent().find('li.unsorted, li.album').droppable({
            accept: '.dragging-image',
            hoverClass: 'drop-ready',
            drop: imageToAlbumDrop
        });

    }

    /**
     * Loads gallery tree
     */
    function loadGalleryTree() {

        $.get(
            ajaxurl,
            {
                action: 'vls_gf_view_gallery_tree',
                //passing this parameter to back-end to fetch mockup data for the tour demonstration
                tour: (VLS_GF.TourModule && VLS_GF.TourModule.isActive())
            },
            function (data) {
                albumTree.empty().append(data);
                initGalleryTree();
            },
            'html'
        );
    }

    /**
     * Updates gallery tree layout during tree edit (drag&drop, adding/deleting items etc.)
     */
    function updateGalleryTreeLayout() {

        albumTreeDraggingState.nextItemOrder = 99999;

        var position = 0;
        var hideLevel = 100;
        var prevItemIsFolder = false;
        var prevItemLevel = 1;
        var nextItemLevel = 1;
        var totalItemCount = 0;

        var items = albumTree.find('li').not('.vls-gf-deleted');

        // sorting items by their order
        items.sort(function (a, b) {
            return (parseInt($(a).data('vlsGfOrder')) - parseInt($(b).data('vlsGfOrder')));
        });

        for (var i = 0; i < items.length; ++i) {

            var $item = $(items[i]);

            var level = parseInt($item.data('vlsGfLevel'));

            //hidden items are skipped and positioned to the visible parent
            if (level > hideLevel) {

                $item.addClass('vls-hidden');
                $item.css({
                    'position': 'absolute',
                    'top': ((position - 1) * albumTreeItemSizes.height) + 'px'
                });
                $item.data('vlsGfPosition', position - 1).attr('data-vls-gf-position', position - 1);

            } else {

                ++totalItemCount;

                hideLevel = 100;

                $item.removeClass('vls-hidden');

                if ($item.hasClass('folder') && !$item.hasClass('opened')) {
                    hideLevel = parseInt($item.data('vlsGfLevel'));
                }

                if (albumTreeDraggingState.ghostPosition == position) {
                    ++position;
                }

                if (!$item.hasClass('ui-draggable-dragging')) {
                    $item.css({
                        'top': (position * albumTreeItemSizes.height) + 'px'
                    });

                    $item.data('vlsGfPosition', position).attr('data-vls-gf-position', position);

                    //storing levels of previous and next visible items
                    if (position == albumTreeDraggingState.ghostPosition - 1) {
                        prevItemIsFolder = $item.hasClass('folder');
                        prevItemLevel = level;
                    } else if (position == albumTreeDraggingState.ghostPosition + 1) {
                        nextItemLevel = level;
                        albumTreeDraggingState.nextItemOrder = parseInt($item.data('vlsGfOrder'));
                    }

                    ++position;
                }
            }
        }

        //calculating drop level (if dragging item)
        if (albumTreeDraggingState.$draggedItem) {

            albumTreeDraggingState.ghostLevel = albumTreeDraggingState.ghostLevel + albumTreeDraggingState.initialLevel;

            if (nextItemLevel <= prevItemLevel) {
                if (prevItemIsFolder) {
                    //if dragging under the folder, allow one level up to drop inside folder
                    prevItemLevel = prevItemLevel + (prevItemLevel < (albumTreeDraggingState.$draggedItem.hasClass('folder') ? 2 : 3) ? 1 : 0);

                }
                if (albumTreeDraggingState.ghostLevel > prevItemLevel) {
                    albumTreeDraggingState.ghostLevel = prevItemLevel;
                } else if (albumTreeDraggingState.ghostLevel < nextItemLevel) {
                    albumTreeDraggingState.ghostLevel = nextItemLevel;
                }
            } else {
                albumTreeDraggingState.ghostLevel = nextItemLevel;
            }

            if (albumTreeDraggingState.ghostPosition >= totalItemCount) {
                albumTreeDraggingState.ghostPosition = totalItemCount - 1;
            }

            albumTreeDraggingState.$draggingGhost.css('top', (albumTreeDraggingState.ghostPosition * albumTreeItemSizes.height) + 'px');
            albumTreeDraggingState.$draggingGhost.attr('class', 'dragging-ghost');
            albumTreeDraggingState.$draggingGhost.addClass('level-' + albumTreeDraggingState.ghostLevel);
        }

        albumTree.css('height', (totalItemCount * 28) + 'px');

    }

    /**
     * Toggles open state for the folder
     */
    function toggleGalleryFolder($this, action) {

        //closing folder
        if ($this.hasClass('opened') && action != 'open') {
            $this.removeClass('opened');
            updateGalleryTreeLayout();
        }
        //opening folder
        else if (!$this.hasClass('opened') && action != 'close') {
            $this.addClass('opened');
            updateGalleryTreeLayout();
        }

    }

    /**
     * Fired on gallery item drag start
     */
    function galleryItemDragStart(event, ui) {

        var $this = $(this);

        albumTreeDraggingState.itemTreeOffset = {
            top: albumTree.offset().top,
            left: albumTree.offset().left
        };

        // closing the folder being dragged
        $this.removeClass('opened');

        //disable draggable behaviour for other items
        albumTree.find('li').draggable('disable');

        albumTreeDraggingState.$draggedItem = $this;

        albumTreeDraggingState.ghostPosition = Math.floor(($this.offset().top - albumTreeDraggingState.itemTreeOffset.top + albumTreeItemSizes.middle) / albumTreeItemSizes.height);

        albumTreeDraggingState.initialLevel = parseInt($this.data('vlsGfLevel'));

        // marking the dragged items' children
        var items = albumTree.find('li');

        items.sort(function (a, b) {
            return (parseInt($(a).data('vlsGfOrder')) - parseInt($(b).data('vlsGfOrder')));
        });

        var markStart = false;
        var markEnd = false;

        for (var i = 0; i < items.length; ++i) {

            var $item = $(items[i]);
            var itemId = parseInt($item.data('vlsGfId'));
            var itemOrder = parseInt($item.data('vlsGfOrder'));
            var itemLevel = parseInt($item.data('vlsGfLevel'));
            var draggedId = parseInt($this.data('vlsGfId'));
            var draggedOrder = parseInt($this.data('vlsGfOrder'));

            if ($item.is($this)) { // if dragged item
                markStart = true;
            } else if (itemOrder > draggedOrder && itemLevel <= albumTreeDraggingState.initialLevel && !markEnd) {
                markEnd = true;
            } else if (itemOrder > draggedOrder && itemLevel > albumTreeDraggingState.initialLevel && !markEnd) {
                $item.addClass('vls-gf-dragging-child');
            }
        }

        // showing the dragging ghost
        albumTree.append(albumTreeDraggingState.$draggingGhost);

        // redrawing layout once for the ghost to be displayed
        updateGalleryTreeLayout();

    }

    /**
     * Fired continuously while dragging gallery item
     */
    function galleryItemDrag(event, ui) {

        var dragOffset = parseInt(ui.offset.top) + albumTreeItemSizes.middle;

        // if still dragging within current area, do nothing
        if (
            dragOffset >= albumTreeDraggingState.currentArea.top
            && dragOffset <= albumTreeDraggingState.currentArea.bottom
            && ui.offset.left >= albumTreeDraggingState.currentArea.left
            && ui.offset.left <= albumTreeDraggingState.currentArea.right
        ) {
            return;
        }

        clearTimeout(albumTreeDraggingState.hoverTimeout);

        var currentPosition = Math.floor((dragOffset - albumTreeDraggingState.itemTreeOffset.top) / albumTreeItemSizes.height);
        if (currentPosition < 0) {
            currentPosition = 0;
        }

        // Calculating ghost level. Level will be adjusted in updateTreeLayout
        albumTreeDraggingState.ghostLevel = Math.floor((parseInt(ui.offset.left) - albumTreeDraggingState.itemTreeOffset.left) / levelCalcStep);
        albumTreeDraggingState.currentArea.left = albumTreeDraggingState.itemTreeOffset.left + albumTreeDraggingState.ghostLevel * levelCalcStep;
        albumTreeDraggingState.currentArea.right = albumTreeDraggingState.itemTreeOffset.left + (albumTreeDraggingState.ghostLevel + 1) * levelCalcStep - 1;

        var itemOffset = albumTreeDraggingState.itemTreeOffset.top + albumTreeItemSizes.height * currentPosition;
        var localOffset = dragOffset - itemOffset + 1;


        //check if we are dragging to the folder
        var hoveredItem = albumTree.find('li').filter(function (i, e) {
            var $e = $(e);
            return ($e.data('vlsGfPosition') == currentPosition && !$e.hasClass('vls-hidden') && !$e.hasClass('ui-draggable-dragging'));
        });


        if (hoveredItem && hoveredItem.hasClass('folder') && !hoveredItem.hasClass('opened')) {

            //if the ghost is above hovered item, use top third for for displacing it; else use bottom
            if (currentPosition > albumTreeDraggingState.ghostPosition && localOffset > albumTreeItemSizes.bottomPart) {
                albumTreeDraggingState.ghostPosition = currentPosition;
                albumTreeDraggingState.currentArea.top = itemOffset;
                albumTreeDraggingState.currentArea.bottom = itemOffset + albumTreeItemSizes.height - 1;
            } else if (currentPosition < albumTreeDraggingState.ghostPosition && localOffset <= albumTreeItemSizes.topPart) {
                albumTreeDraggingState.ghostPosition = currentPosition;
                albumTreeDraggingState.currentArea.top = itemOffset;
                albumTreeDraggingState.currentArea.bottom = itemOffset + albumTreeItemSizes.height - 1;
            } else { //if hovering above middle part of the album, wait a little then open it

                if (currentPosition > albumTreeDraggingState.ghostPosition) {
                    albumTreeDraggingState.currentArea.top = itemOffset;
                    albumTreeDraggingState.currentArea.bottom = itemOffset + albumTreeItemSizes.bottomPart;
                } else {
                    albumTreeDraggingState.currentArea.top = itemOffset + albumTreeItemSizes.topPart;
                    albumTreeDraggingState.currentArea.bottom = itemOffset + albumTreeItemSizes.height - 1;
                }

                albumTreeDraggingState.hoverTimeout = setTimeout(function () {
                    toggleGalleryFolder(hoveredItem, 'open');
                }, 500);
            }

        } else {
            albumTreeDraggingState.ghostPosition = currentPosition;
            albumTreeDraggingState.currentArea.top = itemOffset;
            albumTreeDraggingState.currentArea.bottom = itemOffset + albumTreeItemSizes.height - 1;
        }

        //updating tree layout
        updateGalleryTreeLayout();

    }

    /**
     * Fired on releasing gallery item without placing to the allowed position
     */
    function galleryItemDragRevert() {

        //updating dragged item visual
        var $this = $(this);
        $this.addClass('ui-draggable-placing');

        setTimeout(function () {
            $this.removeClass('ui-draggable-placing');
        }, 550);

        return false;
    }

    /**
     * Fired on dropping gallery item to the allowed position
     */
    function galleryItemDragStop(event, ui) {

        var isPlaced = false;
        var $this = $(this);

        //recalculating order numbers for the items
        var items = albumTree.find('li').not('.vls-gf-dragging-child, .ui-draggable-dragging');

        // sorting items by their position and order (which results in new order for all items, including hidden)
        items.sort(function (a, b) {
            var $a = $(a), $b = $(b);
            return (parseInt($a.data('vlsGfPosition')) * 100000 + parseInt($a.data('vlsGfOrder')) - parseInt($b.data('vlsGfPosition')) * 100000 - parseInt($b.data('vlsGfOrder')));
        });

        var draggingChildItems = albumTree.find('li.vls-gf-dragging-child');

        // sorting items by their order
        draggingChildItems.sort(function (a, b) {
            return (parseInt($(a).data('vlsGfOrder')) - parseInt($(b).data('vlsGfOrder')));
        });

        var order = 0;
        for (var i = 0; i <= items.length; ++i) { // used "<=" to allow insertion at last position

            if (i < items.length) {
                var $item = $(items[i]);
            }

            ++order;

            //inserting moved element and all his children before next element, before deleted items or at the end of list
            if (!isPlaced && (
                    (i == items.length && albumTreeDraggingState.nextItemOrder == 99999)
                    || ($item.hasClass('vls-gf-deleted'))
                    || (i < items.length && albumTreeDraggingState.nextItemOrder == parseInt($item.data('vlsGfOrder')))
                )) {

                // updating order of the dropped item

                isPlaced = true;

                $this.data('vlsGfOrder', order).attr('data-vls-gf-order', order);
                ++order;

                for (var j = 0; j < draggingChildItems.length; ++j) {

                    var $childItem = $(draggingChildItems[j]);
                    var newLevel = parseInt($childItem.data('vlsGfLevel')) + albumTreeDraggingState.ghostLevel - albumTreeDraggingState.initialLevel;
                    newLevel = newLevel > 3 ? 3 : newLevel;

                    $childItem.data('vlsGfOrder', order).attr('data-vls-gf-order', order)
                        .data('vlsGfLevel', newLevel).attr('data-vls-gf-level', newLevel)
                        .data('vlsGfPosition', newLevel).attr('data-vls-gf-position', albumTreeDraggingState.ghostPosition)
                        .removeClass('level-1 level-2 level-3 level-4 level-5 level-6 level-7')
                        .addClass('level-' + newLevel)
                        .css('top', albumTreeDraggingState.$draggingGhost.css('top'));
                    ++order;

                }
            }

            if (i < items.length) $item.data('vlsGfOrder', order).attr('data-vls-gf-order', order);
        }

        $this
            .css({
                'left': '0px',
                'top': albumTreeDraggingState.$draggingGhost.css('top')
            })
            .removeClass('ui-draggable-dragging level-1 level-2 level-3 level-4 level-5 level-6 level-7')
            .addClass('level-' + albumTreeDraggingState.ghostLevel)
            .data('vlsGfPosition', albumTreeDraggingState.ghostPosition).attr('data-vls-gf-position', albumTreeDraggingState.ghostPosition)
            .data('vlsGfLevel', albumTreeDraggingState.ghostLevel).attr('data-vls-gf-level', albumTreeDraggingState.ghostLevel);

        albumTree.find('li').removeClass('vls-gf-dragging-child').draggable('enable');

        //resetting dragging state
        albumTreeDraggingState.$draggedItem = null;
        albumTreeDraggingState.ghostPosition = -1;
        albumTreeDraggingState.items = [];

        albumTreeDraggingState.$draggingGhost.remove();

        updateGalleryTreeLayout();

    }

    /**
     * Fired on clicking gallery item
     */
    function galleryTreeItemClick() {

        var $this = $(this);
        if (!$this.hasClass('ui-draggable-dragging') && !$this.hasClass('ui-draggable-placing')) {
            if ($this.hasClass('folder')) {
                toggleGalleryFolder($this);
            } else if ($this.hasClass('album')) {
                if ($this.data('vlsGfId') > 0) {
                    navigationPanel.find('.wp-ui-highlight').remove();
                    $this.append('<span class="wp-ui-highlight">');
                    VLS_GF.GalleryManager.switchAlbum('album', $this.data('vlsGfId'), $this.find('.vls-gf-label').text(), $this.data('vlsGfShortcode'));
                }
            }
        }
        return false;
    }

    /**
     * Renames gallery item
     */
    function galleryTreeRenameItem(event) {

        var renameCaller = $(this).closest('li');

        VLS_GF.GalleryManager.showNameDialog('rename', function () {

            var itemName = $('.vls-gf-modal').first().find('input').val();

            if (!itemName || itemName == '') {
                alert('Name must be entered');
            } else {

                renameCaller.find('.vls-gf-label').text(itemName);
                renameCaller.data('vlsGfIsRenamed', 'true').attr('data-vls-gf-is-renamed', 'true');

                VLS_GF.GalleryManager.closePopup();
            }

        });

        return false;

    }

    /**
     * Adds gallery item
     */
    function galleryTreeAddItem(event) {

        var itemType = '';
        var messageText = '';
        var action = '';
        if (event.target.id == 'vls-gf-btn-add-new-folder') {
            itemType = 'folder';
            action = 'createFolder';
        } else {
            itemType = 'album';
            action = 'createAlbum';
        }

        VLS_GF.GalleryManager.showNameDialog(action, function () {

            var itemName = $('.vls-gf-modal').first().find('input').val();

            if (!itemName || itemName == '') {
                alert('Name must be entered');
            } else {

                var items = albumTree.find('li');
                var lastOrder = 0;
                if (items.length > 0) {
                    lastOrder = parseInt(
                        items.sort(function (a, b) {
                            return (parseInt($(a).data('vlsGfOrder')) - parseInt($(b).data('vlsGfOrder')));
                        })
                            .last().data('vlsGfOrder')
                    );
                }

                var $newItem = $('<li class="' + itemType + ' level-1"><a href="#"><span class="vls-gf-icon"></span><span class="vls-gf-label">' + itemName + '</span></a><span class="btn btn-delete"></span><span class="btn btn-rename"></span></li>');

                $newItem
                    .data('vlsGfId', 0).attr('data-vls-gf-id', 0)
                    .data('vlsGfLevel', 1).attr('data-vls-gf-level', 1)
                    .data('vlsGfOrder', lastOrder + 1).attr('data-vls-gf-order', lastOrder + 1)
                    .data('vlsGfPosition', 99999).attr('data-vls-gf-position', 99999)
                    .data('vlsGfIsAdded', 'true').attr('data-vls-gf-is-added', 'true')
                    .css('top', (albumTree.height() - 28) + 'px'); //first display item below list boundary to create slide-in effect

                albumTree.append($newItem);
                $newItem.bind('click.vls-gf', galleryTreeItemClick);
                $newItem.find('.btn-rename').on('click.vls-gf touchend.vls-gf', galleryTreeRenameItem);
                $newItem.find('.btn-delete').on('click.vls-gf touchend.vls-gf', galleryTreeDeleteItem);

                initGalleryTreeDraggable();

                updateGalleryTreeLayout();

                VLS_GF.GalleryManager.closePopup();

            }
        });
    }

    /**
     * Deletes gallery item
     */
    function galleryTreeDeleteItem() {

        var messageText = '';

        var $item = $(this).closest('li');

        if ($item.hasClass('album')) {
            messageText = vlsGfGalleryAdminData.l10n.strConfirmDeleteAlbumMessage.replace('%1$s', $item.find('.vls-gf-label').text());
        } else {
            messageText = vlsGfGalleryAdminData.l10n.strConfirmDeleteFolderMessage.replace('%1$s', $item.find('.vls-gf-label').text());
        }

        VLS_GF.GalleryManager.showConfirmDialog(
            vlsGfGalleryAdminData.l10n.strConfirmDeleteHeader,
            messageText,
            vlsGfGalleryAdminData.l10n.strDeleteFolderAction,
            function () {

                var deletedLevel = 0;

                albumTree.find('li').not('.vls-gf-deleted')
                    .sort(function (a, b) {
                        return (parseInt($(a).data('vlsGfOrder')) - parseInt($(b).data('vlsGfOrder')));
                    }).each(function () {
                        var $this = $(this);
                        if ($this.is($item)) {
                            deletedLevel = parseInt($this.data('vlsGfLevel'));
                        } else if (deletedLevel > 0) {
                            var level = parseInt($this.data('vlsGfLevel'));
                            if (level > deletedLevel) {
                                $this.addClass('vls-gf-deleted')
                                    .data('vlsGfLevel', level - deletedLevel + 1).attr('data-vls-gf-level', level - deletedLevel + 1)
                                    .data('vlsGfPosition', 99999).attr('data-vls-gf-position', 99999);
                            } else {
                                return false;
                            }
                        }
                    });

                $item.addClass('vls-gf-deleted')
                    .data('vlsGfLevel', 1).attr('data-vls-gf-level', 1)
                    .data('vlsGfIsDeleted', 'true').attr('data-vls-gf-is-deleted', 'true')
                    .data('vlsGfPosition', 99999).attr('data-vls-gf-position', 99999);

                updateGalleryTreeLayout();

                VLS_GF.GalleryManager.closePopup();

                return false;

            }
        );

        return false;
    }

    /**
     * Switches Albums panel to the edit mode
     */
    function beginGalleryTreeEdit(e) {

        // wait until gallery tree is loaded
        if (albumTree.find('.vls-gf-loading-overlay').length > 0) {
            return false;
        }

        //Showing edit buttons, hiding edit list button
        navigationPanel.addClass('vls-gf-edit-mode');
        $(this).css('display', 'none');
        $('#vls-gf-panel-edit-gallery-tree').css('display', 'block');

        //TODO: disable Main panel here

        var $item = albumTree.find('li');
        $item.append('<span class="btn btn-delete"></span><span class="btn btn-rename"></span>');
        $item.find('.btn-rename').on('click.vls-gf touchend.vls-gf', galleryTreeRenameItem);
        $item.find('.btn-delete').on('click.vls-gf touchend.vls-gf', galleryTreeDeleteItem);

        initGalleryTreeDraggable();

        e.preventDefault();

    }

    /**
     * Processing the exiting of Album panel edit mode, both by save and cancel buttons
     */
    function endGalleryTreeEdit(e) {

        albumTree.find('li')
            .draggable('destroy')
            .find('.btn').remove();

        $('#vls-gf-panel-edit-gallery-tree').css('display', 'none');
        $('#vls-gf-btn-edit-gallery-tree').css('display', 'block');

        albumTree.append('<div class="vls-gf-loading-overlay"><span></span></div>');

        navigationPanel.removeClass('vls-gf-edit-mode');

        //committing changes to server
        if (e.target.id == 'vls-gf-btn-gallery-tree-commit') {

            //preparing request data
            var itemData = [];

            albumTree.find('li').each(function () {
                var $item = $(this);
                var name = '';
                var type = '';
                var isAdded = '';
                var isRenamed = '';
                var isDeleted = '';

                if ($item.data('vlsGfIsAdded')) {
                    isAdded = $item.data('vlsGfIsAdded');
                }
                if ($item.data('vlsGfIsRenamed')) {
                    isRenamed = $item.data('vlsGfIsRenamed');
                }
                if ($item.data('vlsGfIsDeleted')) {
                    isDeleted = $item.data('vlsGfIsDeleted');
                }

                if (isAdded) {
                    if ($item.hasClass('album')) {
                        type = 'album';
                    } else {
                        type = 'folder';
                    }
                }

                if (isAdded || isRenamed) {
                    name = $item.find('.vls-gf-label').text();
                }

                itemData.push({
                    id: parseInt($item.data('vlsGfId')),
                    type: type,
                    order: parseInt($item.data('vlsGfOrder')),
                    level: parseInt($item.data('vlsGfLevel')),
                    name: name,
                    is_added: isAdded,
                    is_renamed: isRenamed,
                    is_deleted: isDeleted
                });

            });

            $.post(
                ajaxurl,
                {
                    action: 'vls_gf_commit_gallery_tree_changes',
                    security: vlsGfGalleryAdminData.nonce,
                    itemData: JSON.stringify(itemData)
                },
                function (json) {
                    loadGalleryTree();
                },
                'json'
            );


        } else { //cancelling
            loadGalleryTree();
        }

        return false;

    }

    /**
     * Initializing gallery item draggable behaviour
     */
    function initGalleryTreeDraggable() {

        // adding draggable to the list elements
        albumTree.find('li').draggable({
            distance: 2,
            addClasses: false,
            cursor: 'move',
            cancel: '.btn',
            start: galleryItemDragStart,
            drag: galleryItemDrag,
            revert: galleryItemDragRevert,
            stop: galleryItemDragStop
        });

    }

    /**
     * Fired on dropping an image to an album
     */
    function imageToAlbumDrop(e, ui) {


        var sourceAlbum = ui.helper.data('sourceAlbum');
        var targetAlbum;
        if ($(e.target).hasClass('unsorted')) {
            targetAlbum = 0;
        } else {
            targetAlbum = parseInt($(e.target).data('vlsGfId'));
        }
        var draggedImages = ui.helper.data('draggedImages');

        if (sourceAlbum !== targetAlbum) {

            //sending move request to the server
            $.post(
                ajaxurl,
                {
                    action: 'vls_gf_move_images_to_album',
                    security: vlsGfGalleryAdminData.nonce,
                    images: JSON.stringify(draggedImages),
                    source_album: sourceAlbum,
                    target_album: targetAlbum
                },
                VLS_GF.GalleryManager.reloadTab
            );

        }
    }

    return {
        init: init,
        loadGalleryTree: loadGalleryTree
    }

})(jQuery);

VLS_GF.AlbumOverviewPanelModule = (function ($) {

    var currentAlbumId,
        imagePanel,
        lastClickedImage;

    /**
     * Loads contents of the album overview tab
     */
    function loadContent(itemType, albumId) {

        currentAlbumId = albumId;

        //getting tab contents
        $.get(
            ajaxurl,
            {
                action: 'vls_gf_view_album_overview',
                item_type: itemType,
                album_id: albumId,
                tour: (VLS_GF.TourModule && VLS_GF.TourModule.isActive())
            },
            initContent,
            'html'
        );
    }

    /**
     * Initializes content
     */
    function initContent(data) {

        $('.vls-gf-tab-view').empty().append(data);

        imagePanel = $('.vls-gf-tab-view .vls-gf-image-panel');

        // Initiating upload panel

        // Settings
        var settings = {
            thumb_width: 140,
            thumb_height: 140,
            //rename: true,
            sortable: true,
            dragdrop: true,
            views: {
                list: false,
                thumbs: true,
                active: 'thumbs'
            },
            multipart_params: {
                action: 'vls_gf_async_upload',
                album_id: currentAlbumId
            },
            flash_swf_url: '/plupload/js/Moxie.swf',
            silverlight_xap_url: '/plupload/js/Moxie.xap',
            stop: function () {
                VLS_GF.GalleryManager.reloadTab();
            },
            complete: function () {
                VLS_GF.GalleryManager.reloadTab();
            }
        };

        var multipart_params = {
            action: 'vls_gf_async_upload',
            album_id: currentAlbumId
        };

        $.extend(multipart_params, vls_plupload_setup_object.multipart_params);

        // adding settings declared on server side
        $.extend(settings, vls_plupload_setup_object);
        settings.multipart_params = multipart_params;

        $("#vls-gf-upload-panel").plupload(settings);

        // opening the upload panel
        $('#vls-gf-upload-image-button').on('click.vls-gf', function (e) {
            $('.vls-gf-toolbar').slideUp();
            $('#vls-gf-upload-panel').slideDown();
            e.preventDefault();
        });

        //cancel upload
        $('#vls-gf-upload-panel .plupload_cancel').on('click.vls-gf', function (e) {
            $('#vls-gf-upload-panel').slideUp();
            $('.vls-gf-toolbar').slideDown();
        });

        //region Bulk selection

        //selection mode activation
        $('#vls-gf-bulk-select-start-button').on('click.vls-gf', function (e) {

            imagePanel.addClass('select-mode');

            $('#vls-gf-toolbar-image-overview').fadeOut();
            $('#vls-gf-toolbar-bulk-select-left').fadeIn();
            $('#vls-gf-toolbar-bulk-select-right').fadeIn();

            e.preventDefault();
        });

        //selection mode deactivation
        $('#vls-gf-bulk-select-cancel-button').on('click.vls-gf', function (e) {

            imagePanel.removeClass('select-mode');

            imagePanel.find('li').removeClass('selected')
                .find('.image-icon').remove();

            $('#vls-gf-toolbar-image-overview').fadeIn();
            $('#vls-gf-toolbar-bulk-select-left').fadeOut();
            $('#vls-gf-toolbar-bulk-select-right').fadeOut();

            lastClickedImage = null;

            e.preventDefault();

        });

        // delete action
        $('#vls-gf-bulk-select-delete-button').on('click.vls-gf', function (e) {

            // collect selected images
            var selectedImages = [];
            imagePanel.find('li.selected').each(function () {
                selectedImages.push(parseInt($(this).data("vlsGfImageId")));
            });

            //sending request to the server
            $.post(
                ajaxurl,
                {
                    action: 'vls_gf_delete_images',
                    images: selectedImages,
                    album: currentAlbumId
                },
                VLS_GF.GalleryManager.reloadTab
            );

            lastClickedImage = null;

            e.preventDefault();
        });

        // select all action
        $('#vls-gf-bulk-select-all-button').on('click.vls-gf', function (e) {
            $('.vls-gf-tab-view .vls-gf-image-panel li').not('.selected').addClass('selected').append('<div class="image-icon"><span></span></div>');
            lastClickedImage = null;
            e.preventDefault();
        });

        // select none action
        $('#vls-gf-bulk-select-none-button').on('click.vls-gf', function (e) {
            $('.vls-gf-tab-view .vls-gf-image-panel li.selected').removeClass('selected').find('.image-icon').remove();
            lastClickedImage = null;
            e.preventDefault();
        });

        // invert selected action
        $('#vls-gf-bulk-select-invert-button').on('click.vls-gf', function (e) {
            $('.vls-gf-tab-view .vls-gf-image-panel li').each(function () {
                var $this = $(this);
                if ($this.hasClass('selected')) {
                    $this.removeClass('selected').find('.image-icon').remove();
                } else {
                    $this.addClass('selected').append('<div class="image-icon"><span></span></div>');
                }
            });
            lastClickedImage = null;
            e.preventDefault();
        });


        //endregion

        //adding click action to the images
        imagePanel.find('li').on('click.vls-gf', function (e) {

            var $this = $(this);
            var imageId = $this.data('vlsGfImageId');
            var linkId = $this.data('vlsGfLinkId');
            linkId = linkId ? linkId : 0;


            if (imagePanel.hasClass('select-mode')) {

                //if shift is pressed, select/deselect the item range
                if (e.shiftKey && lastClickedImage) {

                    var lastClickedImageIndex = imagePanel.find('li').index(lastClickedImage);
                    var rangeFrom = lastClickedImageIndex;
                    var rangeTo = imagePanel.find('li').index($this);
                    if (rangeTo < rangeFrom) {
                        rangeFrom = rangeTo;
                        rangeTo = lastClickedImageIndex;
                    }
                    var rangeAction = lastClickedImage.hasClass('selected') ? 'select' : 'deselect';


                    imagePanel.find('li').each(function () {

                        var $li = $(this);
                        var ind = imagePanel.find('li').index($li);

                        if (ind >= rangeFrom && ind <= rangeTo) {
                            if (rangeAction === 'select') {
                                $li.addClass('selected').append('<div class="image-icon"><span></span></div>');
                            } else if (rangeAction === 'deselect') {
                                $li.removeClass('selected').find('.image-icon').remove();
                            }
                        }

                    });

                } else { //else simply toggle the selection state
                    if ($this.hasClass('selected')) {
                        $this.removeClass('selected').find('.image-icon').remove();
                    } else {
                        $this.addClass('selected').append('<div class="image-icon"><span></span></div>');
                    }
                }

                lastClickedImage = $this;

            } else {
                var images = [];
                var links = [];
                imagePanel.find('li').each(function () {
                    images.push(parseInt($(this).data('vlsGfImageId')));

                    var linkId = $(this).data('vlsGfLinkId');
                    links.push(parseInt(linkId == undefined ? 0 : linkId));
                });
                VLS_GF.ImageDetailsModule.showImageDetailsDialog(imageId, linkId, images, links);
            }

            e.preventDefault();

        });

        // dragging behaviour for image(s)
        imagePanel.find('li').draggable({
            delay: 100,
            cursor: 'none',
            helper: imagesToAlbumDragHelper,
            cursorAt: {top: 20, left: 20},
            appendTo: 'body',
            addClasses: false,
            start: imagesToAlbumDragStart,
            stop: imagesToAlbumDragStop
        });


    }

    /**
     * Returns drag helper for dragging images to albums
     */
    function imagesToAlbumDragHelper() {

        //if not in bulk select mode, mark dragged image as selected
        if (!imagePanel.hasClass('select-mode')) {
            $(this).addClass('selected');
        }

        //store the list of images being dragged
        var draggedImages = [];
        imagePanel.find('li.selected').each(function () {
            draggedImages.push(parseInt($(this).data("vlsGfImageId")));
        });

        var $helper = $('<div id="vls-gf-image-drag-helper">' + draggedImages.length + '</div>');
        $helper.data('draggedImages', draggedImages);
        $helper.data('sourceAlbum', currentAlbumId);
        return $helper;
    }

    /**
     * Fires on start dragging an image
     */
    function imagesToAlbumDragStart() {
        $('.vls-gf-gallery-manager-container .vls-gf-navigation-panel').addClass('drop-ready');
        $(this).addClass('dragging-image');
    }

    /**
     * Fires on dropping an image
     */
    function imagesToAlbumDragStop() {

        $('.vls-gf-gallery-manager-container .vls-gf-navigation-panel').removeClass('drop-ready');
        $(this).removeClass('dragging-image');

        //if not in bulk select mode, remove 'selected' class from dragged image
        if (!imagePanel.hasClass('select-mode')) {
            $(this).removeClass('selected');
        }
    }

    //returning public methods
    return {
        loadContent: loadContent
    };

})(jQuery);

VLS_GF.AlbumLayoutPanelModule = (function ($) {

    var albumId,
        layoutEditState = {
            editedItem: null,
            metroSize: {width: 1, height: 1},
            centerShift: {x: 0, y: 0},
            originalState: {width: 1, height: 1, col: 0, row: 0},
            position: {x: 0, y: 0}, // position of the edited item's center (top left cell)
            currentArea: {col: 0, row: 0, left: 0, right: 0, top: 0, bottom: 0}, //boundaries of the current area (image area + spacing)
            itemsList: []
        },
        tabView,
        layoutPanel,
        setupForm,
        layoutViewSetup = {
            viewportWidth: 0,
            zoom: 1,
            cellWidth: 0,
            cellHeight: 0,
            horizontalSpacing: 0,
            verticalSpacing: 0
        },
        layoutSetup = {
            layoutType: '',
            columnCount: 0,
            aspectRatio: 1,
            horizontalSpacing: 0,
            verticalSpacing: 0
        },
        imageDraggingPlaceholder = $('<div class="vls-gf-dragging-placeholder"></div>');

    /**
     * Loads layout tab contents
     */
    function loadContent(id) {

        albumId = id;

        //getting tab contents
        $.getJSON(
            ajaxurl,
            {
                action: 'vls_gf_view_album_layout',
                album_id: albumId,
                tour: (VLS_GF.TourModule && VLS_GF.TourModule.isActive())
            },
            initContent
        );

    }

    /**
     * Initializes album layout tab
     */
    function initContent(data) {

        //resetting setup
        layoutSetup.layoutType = '';

        tabView = $('.vls-gf-tab-view').first();
        tabView.empty().append(data.view);

        layoutPanel = tabView.find('.vls-gf-tab-container-layout > div');

        setupForm = tabView.find('.vls-gf-tab-container-side form');

        tabView.find('.vls-gf-x-1-1').on('click.vls-gf', function (e) {
            setZoom(1);
            e.preventDefault();
        });
        tabView.find('.vls-gf-x-1-2').on('click.vls-gf', function (e) {
            setZoom(0.5);
            e.preventDefault();
        });
        tabView.find('.vls-gf-x-1-4').on('click.vls-gf', function (e) {
            setZoom(0.25);
            e.preventDefault();
        });
        tabView.find('.vls-gf-btn-save-layout').on('click.vls-gf', function (e) {
            saveLayout();
            e.preventDefault();
        });

        // calling update layout on options change
        setupForm.find('input, select').on('change.vls-gf', function () {
            readLayoutSetup();
            setZoom(0); //Not just update, because column count could change
        });


        readLayoutSetup();
        setZoom(1); //setting full-width viewport by default

        // draggable behaviour for the images
        layoutPanel.find('li').draggable({
            containment: layoutPanel,
            scroll: true,
            cursor: 'move',
            addClasses: false,
            start: imageItemDragStart,
            drag: imageItemDrag,
            stop: function (event, ui) {
                imageDraggingPlaceholder.fadeOut(500, function () {
                    $(this).detach()
                });
                layoutEditState.editedItem = null;

                populateItemList();
                updateLayout();

            }
        })

    }


    /**
     * Sets zoom factor for the layout view panel
     */
    function setZoom(zoom) {

        //zoom 0 means we just need to refresh cells and spacing values
        if (zoom > 0) {
            layoutViewSetup.zoom = zoom;
        }

        tabView.find('.vls-gf-x-1-1').removeClass('vls-gf-active');
        tabView.find('.vls-gf-x-1-2').removeClass('vls-gf-active');
        tabView.find('.vls-gf-x-1-4').removeClass('vls-gf-active');

        layoutViewSetup.viewportWidth = Math.round(layoutPanel.parent().width() * layoutViewSetup.zoom);
        if (layoutViewSetup.zoom <= 0.25) {
            layoutPanel.css('width', '25%');
            tabView.find('.vls-gf-x-1-4').addClass('vls-gf-active');
        } else if (layoutViewSetup.zoom <= 0.5) {
            layoutPanel.css('width', '50%');
            tabView.find('.vls-gf-x-1-2').addClass('vls-gf-active');
        } else {
            layoutPanel.css('width', '100%');
            tabView.find('.vls-gf-x-1-1').addClass('vls-gf-active');
        }

        //calculating cell dimensions and spacing for display
        layoutViewSetup.horizontalSpacing = Math.floor(layoutSetup.horizontalSpacing * layoutViewSetup.zoom);
        layoutViewSetup.verticalSpacing = Math.floor(layoutSetup.verticalSpacing * layoutViewSetup.zoom);
        layoutViewSetup.cellWidth = Math.floor((layoutViewSetup.viewportWidth - layoutViewSetup.horizontalSpacing * (layoutSetup.columnCount - 1)) / layoutSetup.columnCount);
        layoutViewSetup.cellHeight = Math.floor(layoutViewSetup.cellWidth / layoutSetup.aspectRatio);

        populateItemList();
        updateLayout();

    }

    /**
     * Reads layout setup from the form, processes options and updates the form with changed data
     */
    function readLayoutSetup() {

        var prevLayoutType = layoutSetup.layoutType;

        layoutSetup.layoutType = setupForm.find('#vls-gf-param-layout-type').val();

        var aspectRatioStr = '';
        if (layoutSetup.layoutType == 'metro') {
            layoutSetup.columnCount = parseInt(setupForm.find('#vls-gf-param-metro-column-count').val());
            aspectRatioStr = setupForm.find('#vls-gf-param-metro-aspect-ratio').val();
            layoutSetup.horizontalSpacing = parseInt(setupForm.find('#vls-gf-param-metro-horizontal-spacing').val());
            layoutSetup.verticalSpacing = parseInt(setupForm.find('#vls-gf-param-metro-vertical-spacing').val());
        } else if (layoutSetup.layoutType == 'grid') {
            layoutSetup.columnCount = parseInt(setupForm.find('#vls-gf-param-grid-column-count').val());
            aspectRatioStr = setupForm.find('#vls-gf-param-grid-aspect-ratio').val();
            layoutSetup.horizontalSpacing = parseInt(setupForm.find('#vls-gf-param-grid-horizontal-spacing').val());
            layoutSetup.verticalSpacing = parseInt(setupForm.find('#vls-gf-param-grid-vertical-spacing').val());
        }

        //parsing aspect ratio (allowed formats: "0.5", "1/2", "1:2", "1-2")
        aspectRatioStr = aspectRatioStr.replace(',', '.');
        aspectRatioStr = aspectRatioStr.replace(':', '/');
        aspectRatioStr = aspectRatioStr.replace('-', '/');
        var arr = aspectRatioStr.split('/');
        layoutSetup.aspectRatio = parseFloat(arr[0]);
        if (arr.length > 1) {
            layoutSetup.aspectRatio = Math.round(layoutSetup.aspectRatio / parseFloat(arr[1]) * 1000) / 1000;
        }

        //apply some limits
        if (layoutSetup.aspectRatio < 0.25) layoutSetup.aspectRatio = 0.25;
        if (layoutSetup.aspectRatio > 4) layoutSetup.aspectRatio = 4;

        if (layoutSetup.horizontalSpacing < 0)  layoutSetup.horizontalSpacing = 0;
        if (layoutSetup.horizontalSpacing > 100)  layoutSetup.horizontalSpacing = 100;

        if (layoutSetup.verticalSpacing < 0) layoutSetup.verticalSpacing = 0;
        if (layoutSetup.verticalSpacing > 100) layoutSetup.verticalSpacing = 100;


        //write possibly updated values to UI

        if (layoutSetup.layoutType == 'grid') {
            setupForm.find('#vls-gf-param-grid-horizontal-spacing').val(layoutSetup.horizontalSpacing.toString());
            setupForm.find('#vls-gf-param-grid-vertical-spacing').val(layoutSetup.verticalSpacing.toString());
            setupForm.find('#vls-gf-param-grid-aspect-ratio').val(layoutSetup.aspectRatio.toString());
        }
        else if (layoutSetup.layoutType == 'metro') {
            setupForm.find('#vls-gf-param-metro-horizontal-spacing').val(layoutSetup.horizontalSpacing.toString());
            setupForm.find('#vls-gf-param-metro-vertical-spacing').val(layoutSetup.verticalSpacing.toString());
            setupForm.find('#vls-gf-param-metro-aspect-ratio').val(layoutSetup.aspectRatio.toString());
        }


        if (prevLayoutType != layoutSetup.layoutType) {

            layoutPanel.find('li.ui-resizable').resizable('destroy');

            if (layoutSetup.layoutType == 'metro') {
                setupForm.find('#vls-gf-parameters-metro').css('display', 'block');
                setupForm.find('#vls-gf-parameters-grid').css('display', 'none');

                layoutPanel.find('li').resizable({
                    //containment: layoutSubPanel, //TODO: find a way to set containment (now having a bug with unreachable right side of the container)
                    handles: 'all',
                    autoHide: false,
                    minHeight: 43,
                    minWidth: 43,
                    start: imageItemResizeStart,
                    resize: imageItemResize,
                    stop: imageItemResizeStop
                });

            } else if (layoutSetup.layoutType == 'grid') {

                setupForm.find('#vls-gf-parameters-metro').css('display', 'none');
                setupForm.find('#vls-gf-parameters-grid').css('display', 'block');

            } else {

                setupForm.find('#vls-gf-parameters-metro').css('display', 'none');
                setupForm.find('#vls-gf-parameters-grid').css('display', 'none');

            }
        }

    }

    /**
     * Returns cell ID based on its x and y position
     */
    function cellId(x, y) {
        return ('x' + ('00000' + x).slice(-5) + 'y' + ('00000' + y).slice(-5));
    }

    /**
     * Fires on item drag start
     */
    function imageItemDragStart(event, ui) {

        var $this = $(this);

        imageDraggingPlaceholder.css({
            width: $this.css('width'),
            height: $this.css('height'),
            top: $this.css('top'),
            left: $this.css('left')
        });

        layoutPanel.append(imageDraggingPlaceholder);
        imageDraggingPlaceholder.fadeIn(300);

        if ($this.data('vlsGfMetroW')) {
            layoutEditState.metroSize.width = parseInt($this.data('vlsGfMetroW'));
        } else {
            layoutEditState.metroSize.width = 1;
        }
        if ($this.data('vlsGfMetroH')) {
            layoutEditState.metroSize.height = parseInt($this.data('vlsGfMetroH'));
        } else {
            layoutEditState.metroSize.height = 1;
        }

        layoutEditState.centerShift = {
            x: Math.ceil(layoutViewSetup.cellWidth / 2),
            y: Math.ceil(layoutViewSetup.cellHeight / 2)
        };
        layoutEditState.position = {x: ui.position.left, y: ui.position.top};

        layoutEditState.editedItem = $this;

        populateItemList();

        imageItemDrag(event, ui);

    }

    /**
     * Fires on item dragging
     */
    function imageItemDrag(event, ui) {


        layoutEditState.position = {
            x: ui.position.left + layoutEditState.centerShift.x,
            y: ui.position.top + layoutEditState.centerShift.y
        };

        if (
            (layoutEditState.position.x < layoutEditState.currentArea.left)
            || (layoutEditState.position.x > layoutEditState.currentArea.right)
            || (layoutEditState.position.y < layoutEditState.currentArea.top)
            || (layoutEditState.position.y > layoutEditState.currentArea.bottom)
        ) {

            //updating current area column and row
            layoutEditState.currentArea.col = Math.floor(layoutEditState.position.x / (layoutViewSetup.cellWidth + layoutViewSetup.horizontalSpacing));
            layoutEditState.currentArea.row = Math.floor(layoutEditState.position.y / (layoutViewSetup.cellHeight + layoutViewSetup.verticalSpacing));

            //updating current area boundaries
            layoutEditState.currentArea.left = layoutEditState.currentArea.col * (layoutViewSetup.cellWidth + layoutViewSetup.horizontalSpacing) - layoutViewSetup.horizontalSpacing;
            layoutEditState.currentArea.right = (layoutEditState.currentArea.col + 1) * (layoutViewSetup.cellWidth + layoutViewSetup.horizontalSpacing);
            layoutEditState.currentArea.top = layoutEditState.currentArea.row * (layoutViewSetup.cellHeight + layoutViewSetup.verticalSpacing) - layoutViewSetup.verticalSpacing;
            layoutEditState.currentArea.bottom = (layoutEditState.currentArea.row + 1) * (layoutViewSetup.cellHeight + layoutViewSetup.verticalSpacing);

            updateLayout();
        }

    }

    /**
     * Fires on starting item resize
     */
    function imageItemResizeStart(event, ui) {

        var $this = $(this);

        imageDraggingPlaceholder.css({
            width: $this.css('width'),
            height: $this.css('height'),
            top: $this.css('top'),
            left: $this.css('left')
        });

        $this.closest('div').append(imageDraggingPlaceholder);
        imageDraggingPlaceholder.fadeIn(300);

        if ($this.data('vlsGfMetroW')) {
            layoutEditState.metroSize.width = parseInt($this.data('vlsGfMetroW'));
        } else {
            layoutEditState.metroSize.width = 1;
        }
        layoutEditState.originalState.width = layoutEditState.metroSize.width;

        if ($this.data('vlsGfMetroH')) {
            layoutEditState.metroSize.height = parseInt($this.data('vlsGfMetroH'));
        } else {
            layoutEditState.metroSize.height = 1;
        }
        layoutEditState.originalState.height = layoutEditState.metroSize.height;

        if ($this.data('vlsGfCol')) {
            layoutEditState.originalState.col = parseInt($this.data('vlsGfCol'));
        } else {
            layoutEditState.originalState.col = 0;
        }

        if ($this.data('vlsGfRow')) {
            layoutEditState.originalState.row = parseInt($this.data('vlsGfRow'));
        } else {
            layoutEditState.originalState.row = 0;
        }

        layoutEditState.centerShift = {
            x: Math.ceil(layoutViewSetup.cellWidth / 2),
            y: Math.ceil(layoutViewSetup.cellHeight / 2)
        };
        layoutEditState.position = {x: ui.position.left, y: ui.position.top};

        layoutEditState.editedItem = $this;

        populateItemList();
        imageItemResize(event, ui);

    }

    /**
     * Fires continuously while image resizing
     */
    function imageItemResize(event, ui) {

        var snapAreaWidth = Math.floor(layoutViewSetup.cellWidth * 0.2);
        var snapAreaHeight = Math.floor(layoutViewSetup.cellHeight * 0.2);

        var newWidth = Math.floor((ui.size.width - snapAreaWidth) / (layoutViewSetup.cellWidth + layoutViewSetup.horizontalSpacing)) + 1;
        var newHeight = Math.floor((ui.size.height - snapAreaHeight) / (layoutViewSetup.cellHeight + layoutViewSetup.verticalSpacing)) + 1;

        //if size is changed, updating layout
        if (newWidth !== layoutEditState.metroSize.width || newHeight !== layoutEditState.metroSize.height) {

            //updating current metro size
            layoutEditState.metroSize.width = newWidth;
            layoutEditState.metroSize.height = newHeight;

            //updating current area column and row (based on original state and new calculated size, to involve size calculation logic)
            if (ui.originalPosition.left === ui.position.left) {
                layoutEditState.currentArea.col = layoutEditState.originalState.col;
            } else {
                layoutEditState.currentArea.col = layoutEditState.originalState.col + layoutEditState.originalState.width - newWidth;
            }

            if (ui.originalPosition.top === ui.position.top) {
                layoutEditState.currentArea.row = layoutEditState.originalState.row;
            } else {
                layoutEditState.currentArea.row = layoutEditState.originalState.row + layoutEditState.originalState.height - newHeight;
            }

            updateLayout();
        }

    }

    /**
     * Fires on image resize stop
     */
    function imageItemResizeStop(event, ui) {
        imageDraggingPlaceholder.fadeOut(500, function () {
            $(this).detach()
        });
        layoutEditState.editedItem = null;
        populateItemList();
        updateLayout();
    }

    /**
     * Updates layout using current setup
     */
    function updateLayout() {

        switch (layoutSetup.layoutType) {
            case 'metro':
                updateLayoutMetro(layoutSetup);
                break;
            case 'grid':
                updateLayoutGrid(layoutSetup);
                break;
            default:
                break;
        }
    }

    /**
     * Updates Metro layout
     */
    function updateLayoutMetro() {

        var items = layoutEditState.itemsList;
        var posX = 0, posY = 0;
        var i, a, b, ok;
        var occupiedCells = [], firstFreeCell = {row: 0, col: 0}, currentCell = {row: 0, col: 0};
        var maxRow = 0;


        //if now we are dragging or resizing an item, then calculate its position and reserve correspondent cells
        if (layoutEditState.editedItem) {

            // if the dragged or resized item hangs off the layout, then bail out
            if (layoutEditState.currentArea.col + layoutEditState.metroSize.width > layoutSetup.columnCount) {
                return;
            }

            // adding occupied cells to the array
            for (a = 0; a < layoutEditState.metroSize.width; ++a) {
                for (b = 0; b < layoutEditState.metroSize.height; ++b) {
                    occupiedCells.push(cellId(layoutEditState.currentArea.col + a, layoutEditState.currentArea.row + b));
                }
            }

            // moving to the first suitable cell (the main loop is supposed to start from the free cell)
            ok = false;
            while (!ok) {
                if ($.inArray(cellId(firstFreeCell.col, firstFreeCell.row), occupiedCells) < 0) {
                    ok = true;
                } else {
                    ++firstFreeCell.col;
                    if (firstFreeCell.col >= layoutSetup.columnCount) {
                        firstFreeCell.col = 0;
                        ++firstFreeCell.row;
                    }
                }
            }

            // moving placeholder to the current hover position
            imageDraggingPlaceholder.css({
                width: (layoutEditState.metroSize.width * (layoutViewSetup.cellWidth + layoutViewSetup.horizontalSpacing) - layoutViewSetup.horizontalSpacing) + 'px',
                height: (layoutEditState.metroSize.height * (layoutViewSetup.cellHeight + layoutViewSetup.verticalSpacing) - layoutViewSetup.verticalSpacing) + 'px',
                left: (layoutEditState.currentArea.col * (layoutViewSetup.cellWidth + layoutViewSetup.horizontalSpacing)) + 'px',
                top: (layoutEditState.currentArea.row * (layoutViewSetup.cellHeight + layoutViewSetup.verticalSpacing)) + 'px'
            });

            layoutEditState.editedItem.data('vlsGfCol', layoutEditState.currentArea.col);

            layoutEditState.editedItem.data('vlsGfRow', layoutEditState.currentArea.row);

            layoutEditState.editedItem.data('vlsGfMetroW', layoutEditState.metroSize.width);
            layoutEditState.editedItem.attr('data-vls-gf-metro-w', layoutEditState.metroSize.width);

            layoutEditState.editedItem.data('vlsGfMetroH', layoutEditState.metroSize.height);
            layoutEditState.editedItem.attr('data-vls-gf-metro-h', layoutEditState.metroSize.height);


            //saving the last row number for setting panel height
            if (maxRow < layoutEditState.currentArea.row + layoutEditState.metroSize.height - 1) {
                maxRow = layoutEditState.currentArea.row + layoutEditState.metroSize.height - 1;
            }

        }

        // main loop: calculating and setting positions
        for (i = 0; i < items.length; ++i) {


            var item = items[i];

            //item width can not exceed column count (possible after changing column count to the lesser value)
            if (item.width > layoutSetup.columnCount) {
                item.width = layoutSetup.columnCount;
            }

            // finding the first suitable position
            ok = false;
            currentCell = {col: firstFreeCell.col, row: firstFreeCell.row};

            while (!ok) {

                ok = true;

                for (a = 0; a < item.width; ++a) {
                    for (b = 0; b < item.height; ++b) {
                        if ((currentCell.col + a >= layoutSetup.columnCount)
                            || ($.inArray(cellId(currentCell.col + a, currentCell.row + b), occupiedCells) >= 0)) {
                            ok = false;
                        }
                    }
                }

                if (!ok) {
                    ++currentCell.col;

                    if (currentCell.col >= layoutSetup.columnCount) {
                        currentCell.col = 0;
                        ++currentCell.row;
                    }
                }
            }

            // adding occupied cells
            for (a = 0; a < item.width; ++a) {
                for (b = 0; b < item.height; ++b) {
                    occupiedCells.push(cellId(currentCell.col + a, currentCell.row + b));
                }
            }

            posX = (layoutViewSetup.cellWidth + layoutViewSetup.horizontalSpacing) * currentCell.col;
            posY = (layoutViewSetup.cellHeight + layoutViewSetup.verticalSpacing) * currentCell.row;

            // put current item at the position
            item.element
                .css('width', (item.width * layoutViewSetup.cellWidth + (item.width - 1) * layoutViewSetup.horizontalSpacing) + 'px')
                .css('height', (item.height * layoutViewSetup.cellHeight + (item.height - 1) * layoutViewSetup.verticalSpacing) + 'px')
                .css('top', posY + 'px').css('left', posX + 'px');

            // saving new position
            item.element.data('vlsGfCol', currentCell.col);
            item.element.data('vlsGfRow', currentCell.row);

            //saving the last row number for setting panel height
            if (maxRow < currentCell.row + item.height - 1) {
                maxRow = currentCell.row + item.height - 1;
            }

            // moving to the next free cell
            ok = false;
            while (!ok) {
                if ($.inArray(cellId(firstFreeCell.col, firstFreeCell.row), occupiedCells) < 0) {
                    ok = true;
                } else {
                    ++firstFreeCell.col;
                    if (firstFreeCell.col >= layoutSetup.columnCount) {
                        firstFreeCell.col = 0;
                        ++firstFreeCell.row;
                    }
                }
            }

        }

        // setting the list height to the content
        layoutPanel.find('ul').css('height', (maxRow + 1) * layoutViewSetup.cellHeight + maxRow * layoutViewSetup.verticalSpacing);

    }

    /**
     * Updates Grid layout
     */
    function updateLayoutGrid() {

        var items = [];
        var posX = 0, posY = 0;
        var i;
        var currentCell = {row: 0, col: 0};
        var maxRow = 0;

        // populating items list
        layoutPanel.find('li')
            .css('width', layoutViewSetup.cellWidth + 'px')
            .css('height', layoutViewSetup.cellHeight + 'px')
            .each(function () {
                var $item = $(this);
                var col = 0, row = 0, linkId = 0;

                // skipping currently dragged item from the main loop
                if (!layoutEditState.editedItem || !($item.hasClass('ui-draggable-dragging') || $item.hasClass('ui-resizable-resizing'))) {
                    if ($item.data('vlsGfCol')) {
                        col = parseInt($item.data('vlsGfCol'));
                    }
                    if ($item.data('vlsGfRow')) {
                        row = parseInt($item.data('vlsGfRow'));
                    }
                    if ($item.data('vlsGfLinkId')) {
                        linkId = parseInt($item.data('vlsGfLinkId'));
                    }
                    items.push({element: $item, row: row, col: col, linkId: linkId});
                }
            });

        // sorting items by their position
        items.sort(function (a, b) {
                return (a.row * 100 + a.col - b.row * 100 - b.col);
            }
        );

        //if now we are dragging or resizing an item, then calculate its position
        if (layoutEditState.editedItem) {

            // moving placeholder to the current hover position
            imageDraggingPlaceholder.css({
                left: (layoutEditState.currentArea.col * (layoutViewSetup.cellWidth + layoutViewSetup.horizontalSpacing)) + 'px',
                top: (layoutEditState.currentArea.row * (layoutViewSetup.cellHeight + layoutViewSetup.verticalSpacing)) + 'px'
            });

            layoutEditState.editedItem.data('vlsGfCol', layoutEditState.currentArea.col);
            layoutEditState.editedItem.data('vlsGfRow', layoutEditState.currentArea.row);

            //saving the last row number for setting panel height
            if (maxRow < layoutEditState.currentArea.row) {
                maxRow = layoutEditState.currentArea.row;
            }
        }


        // main loop: calculating and setting positions

        currentCell.row = 0;
        currentCell.col = 0;

        for (i = 0; i < items.length; ++i) {


            var item = items[i];

            if (layoutEditState.editedItem && layoutEditState.currentArea.col == currentCell.col && layoutEditState.currentArea.row == currentCell.row) {
                // moving to the next free cell
                ++currentCell.col;
                if (currentCell.col >= layoutSetup.columnCount) {
                    currentCell.col = 0;
                    ++currentCell.row;
                }
            }

            posX = (layoutViewSetup.cellWidth + layoutViewSetup.horizontalSpacing) * currentCell.col;
            posY = (layoutViewSetup.cellHeight + layoutViewSetup.verticalSpacing) * currentCell.row;

            // put current item at the position
            item.element.css('top', posY + 'px').css('left', posX + 'px');

            // saving new position
            item.element.data('vlsGfCol', currentCell.col).attr('data-vls-gf-col', currentCell.col);
            item.element.data('vlsGfRow', currentCell.row).attr('data-vls-gf-row', currentCell.row);

            //saving the last row number for setting panel height
            if (maxRow < currentCell.row) {
                maxRow = currentCell.row;
            }

            // moving to the next free cell
            ++currentCell.col;
            if (currentCell.col >= layoutSetup.columnCount) {
                currentCell.col = 0;
                ++currentCell.row;
            }

        }

        // setting the list height to the content
        layoutPanel.find('ul').css('height', (maxRow + 1) * layoutViewSetup.cellHeight + maxRow * layoutViewSetup.verticalSpacing);

    }

    /**
     * Saves current layout setup
     */
    function saveLayout() {

        var $btn = $(this);

        if ($btn.hasClass('vls-gf-processing')) {
            return;
        } else {
            $btn.addClass('vls-gf-processing');
        }

        //>>preparing data for saving

        //options
        var options = {
            layout_type: layoutSetup.layoutType,
            column_count: layoutSetup.columnCount,
            aspect_ratio: layoutSetup.aspectRatio,
            horizontal_spacing: layoutSetup.horizontalSpacing,
            vertical_spacing: layoutSetup.verticalSpacing
        };

        //images
        var images = [];

        layoutPanel.find('li').each(function () {
            var img = $(this);
            images.push({
                link_id: img.data('vlsGfLinkId'),
                col: img.data('vlsGfCol'),
                row: img.data('vlsGfRow'),
                metro_w: img.data('vlsGfMetroW'),
                metro_h: img.data('vlsGfMetroH')
            });

        });

        //<<preparing data for saving

        //sending request to the server
        $.post(
            ajaxurl,
            {
                action: 'vls_gf_update_album_layout',
                security: vlsGfGalleryAdminData.nonce,
                album_id: albumId,
                options: JSON.stringify(options),
                images: JSON.stringify(images)
            },
            function (data) {
                $btn.removeClass('vls-gf-processing');
                $('.vls-gf-update-feedback').show().fadeOut(3000);
            }
        );

    }

    function populateItemList() {

        var items = [];

        // populating items list
        layoutPanel.find('li').each(function () {
            var $item = $(this);
            var col = 0, row = 0, width = 1, height = 1;

            // skipping currently dragged item from the main loop
            if (!layoutEditState.editedItem || !($item.hasClass('ui-draggable-dragging') || $item.hasClass('ui-resizable-resizing'))) {
                if ($item.data('vlsGfCol')) {
                    col = parseInt($item.data('vlsGfCol'));
                }
                if ($item.data('vlsGfRow')) {
                    row = parseInt($item.data('vlsGfRow'));
                }
                if ($item.data('vlsGfMetroW')) {
                    width = parseInt($item.data('vlsGfMetroW'));
                }
                if ($item.data('vlsGfMetroH')) {
                    height = parseInt($item.data('vlsGfMetroH'));
                }
                items.push({element: $item, row: row, col: col, width: width, height: height});
            }
        });

        // sorting items by their position
        items.sort(function (a, b) {
            return (a.row * 100 + a.col - b.row * 100 - b.col );
        });

        layoutEditState.itemsList = items;

    }

//returning public methods
    return {
        loadContent: loadContent
    };

})(jQuery);

VLS_GF.ItemEditPanelModule = (function ($) {

    var currentItemId;

    /**
     * Loads Edit tab contents
     */
    function loadContent(itemType, itemId) {

        currentItemId = itemId;

        //getting tab contents
        $.getJSON(
            ajaxurl,
            {
                action: 'vls_gf_view_gallery_item_edit',
                item_type: itemType,
                item_id: itemId,
                tour: (VLS_GF.TourModule && VLS_GF.TourModule.isActive())
            },
            initContent
        );
    }

    /**
     * Initializes content
     */
    function initContent(data) {
        $('.vls-gf-tab-view').empty().append(data.view);
        $('#vls-gf-item-details button.button-primary').on('click.vls-gf', saveAlbumDetails);

    }

    /**
     * Saves album details
     */
    function saveAlbumDetails(e) {

        e.preventDefault();

        var $form = $('#vls-gf-item-details');
        var $button = $form.find('button.button-primary');

        if ($button.hasClass('disabled')) {
            return;
        } else {
            $button.addClass('disabled');
        }
        $form.find('.vls-gf-update-feedback').hide();

        var data = {
            action: 'vls_gf_update_album_details'
        };

        $form.find("input, select, textarea").each(function () {
            data[this.name] = this.value;
        });

        //sending request to the server
        $.post(
            ajaxurl,
            data,
            function () {
                $button.removeClass('disabled');
                $form.find('.vls-gf-update-feedback').show().fadeOut(3000);
            }
        );


    }

    //returning public methods
    return {
        loadContent: loadContent
    };

})(jQuery);

VLS_GF.ImageDetailsModule = (function ($) {

    var view,
        overlay,
        image = {
            width: 0,
            height: 0
        },
        crop = { // in percents
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        },
        cropChanged = false;

    /**
     * Shows image details dialog
     */
    //TODO: move to overview module
    function showImageDetailsDialog(imageId, linkId, images, links) {

        var dialog = $('<div class="vls-gf-modal"><div class="vls-gf-backdrop"></div><div class="vls-gf-image-details-dialog"></div></div>');
        dialog.data('vlsGfImages', images).data('vlsGfLinks', links).data('vlsGfCurrentImage', imageId);
        $('#wpwrap').append(dialog);

        //creating window view
        view = dialog.find('.vls-gf-image-details-dialog');


        //title
        var title = $('<div />').addClass('vls-gf-title').append($('<span/>').text(vlsGfGalleryAdminData.l10n.strImageDetails));
        view.append(title);

        var windowControls = $('<div />').addClass('vls-gf-window-controls');
        title.append(windowControls);


        //next button
        var prevButton = $('<button/>').addClass('vls-gf-btn-prev').text('<');
        prevButton.on('click.vls-gf', prevImageDetails);
        windowControls.append(prevButton);

        //previous button
        var nextButton = $('<button/>').addClass('vls-gf-btn-next').text('>');
        nextButton.on('click.vls-gf', nextImageDetails);
        windowControls.append(nextButton);

        //close button
        var cancelButton = $('<button/>').addClass('vls-gf-btn-cancel').text('×');
        cancelButton.on('click.vls-gf', closeDialog);
        windowControls.append(cancelButton);

        //container
        view.append('<div class="vls-gf-content"></div>');

        loadImageDetailsView(imageId, linkId);

    }

    function prevImageDetails() {


        var dialog = $(this).closest('.vls-gf-modal');

        if (dialog.hasClass('vls-gf-busy')) {
            return false;
        }

        var images = dialog.data('vlsGfImages');
        var links = dialog.data('vlsGfLinks');
        var currentImage = dialog.data('vlsGfCurrentImage');
        var currentIndex = images.indexOf(currentImage);
        if (currentIndex > 0) {
            currentIndex--;
            dialog.data('vlsGfCurrentImage', images[currentIndex]);
            loadImageDetailsView(images[currentIndex], links[currentIndex]);
        }

    }

    function nextImageDetails() {

        var dialog = $(this).closest('.vls-gf-modal');

        if (dialog.hasClass('vls-gf-busy')) {
            return false;
        }

        var images = dialog.data('vlsGfImages');
        var links = dialog.data('vlsGfLinks');
        var currentImage = dialog.data('vlsGfCurrentImage');
        var currentIndex = images.indexOf(currentImage);
        if (currentIndex < images.length - 1) {
            currentIndex++;
            dialog.data('vlsGfCurrentImage', images[currentIndex]);
            loadImageDetailsView(images[currentIndex], links[currentIndex]);
        }

    }

    function loadImageDetailsView(imageId, linkId) {

        view.addClass('vls-gf-busy');

        //getting dialog contents and appending them to the dialog
        $.getJSON(
            ajaxurl,
            {
                action: 'vls_gf_view_image_details',
                image_id: imageId,
                link_id: linkId
            },
            function (data) {

                initContent(data);

                view.removeClass('vls-gf-busy');

            }
        );
    }

    function initContent(data) {

        view.find('.vls-gf-content').empty().append(data.view);

        overlay = view.find('.vls-gf-image-panel .vls-gf-image-edit-overlay');


        //
        var mask = overlay.find('.vls-gf-crop-mask');

        crop.top = parseFloat(mask.data('vlsGfTop') ? mask.data('vlsGfTop') : 0);
        crop.right = parseFloat(mask.data('vlsGfRight') ? mask.data('vlsGfRight') : 0);
        crop.bottom = parseFloat(mask.data('vlsGfBottom') ? mask.data('vlsGfBottom') : 0);
        crop.left = parseFloat(mask.data('vlsGfLeft') ? mask.data('vlsGfLeft') : 0);


        mask.resizable({
            containment: overlay,
            handles: 'all',
            autoHide: false,
            minHeight: 43,
            minWidth: 43,
            stop: function (event, ui) {
                updateCropData();
            }
        });

        mask.draggable({
            containment: overlay,
            distance: 2,
            addClasses: false,
            cursor: 'move',
            stop: function (event, ui) {
                updateCropData();
            }
        });

        $(window).on('resize.vls-gf-image-details', function (e) {
            if (!$(e.target).hasClass('ui-resizable')) {
                updateOverlaySize();
            }
            return false;
        });

        view.find('.vls-gf-options-panel input.button-primary').on('click.vls-gf', saveImageDetails);

    }

    /**
     * Saves image details
     */
    function saveImageDetails() {

        var $button = view.find('.vls-gf-options-panel input.button-primary');
        if ($button.hasClass('vls-gf-busy')) {
            return;
        } else {
            $button.addClass('vls-gf-busy');
        }

        var data = {
            action: 'vls_gf_update_image_details',
            crop_top: crop.top,
            crop_right: crop.right,
            crop_bottom: crop.bottom,
            crop_left: crop.left
        };

        view.find("form input, form select, form textarea").each(function () {
            if (this.name) {
                data[this.name] = this.value;
            }
        });


        //sending request to the server
        $.post(
            ajaxurl,
            data,
            function (data) {
                $button.removeClass('vls-gf-busy');
                view.find('.vls-gf-update-feedback').show().fadeOut(3000);
            }
        );
    }

    /**
     * Closes popup dialog
     */
    function closeDialog() {

        $(window).off('resize.vls-gf-image-details');

        var modal = $('.vls-gf-modal');
        modal.find('.ui-resizable').resizable('destroy').draggable('destroy');
        modal.remove();

        //refresh the overview panel
        if (cropChanged) {
            VLS_GF.GalleryManager.reloadTab();
        }
    }

    function updateOverlaySize() {

        //position the overlay to the image
        var img = $('.vls-gf-image-details-dialog .vls-gf-image-panel img');
        var overlay = $('.vls-gf-image-details-dialog .vls-gf-image-panel .vls-gf-image-edit-overlay');

        image.width = img.width();
        image.height = img.height();

        overlay.css({
            width: image.width,
            height: image.height
        });

        //set mask size and position
        var mask = overlay.find('.vls-gf-crop-mask');

        mask.css({
            top: Math.round(image.height * crop.top * 0.01) + 'px',
            left: Math.round(image.width * crop.left * 0.01) + 'px',
            width: Math.round(image.width - image.width * crop.left * 0.01 - image.width * crop.right * 0.01) + 'px',
            height: Math.round(image.height - image.height * crop.top * 0.01 - image.height * crop.bottom * 0.01) + 'px'
        });


    }

    function updateCropData() {

        var cropMask = $('.vls-gf-image-details-dialog .vls-gf-image-panel .vls-gf-crop-mask'),
            cropOffset = cropMask.position(),
            cropW = cropMask.width(),
            cropH = cropMask.height();

        crop.top = cropOffset.top / image.height * 100;
        crop.right = (image.width - cropOffset.left - cropW) / image.width * 100;
        crop.bottom = (image.height - cropOffset.top - cropH) / image.height * 100;
        crop.left = cropOffset.left / image.width * 100;

        cropChanged = true;

    }

    //returning public methods
    return {
        showImageDetailsDialog: showImageDetailsDialog,
        updateOverlaySize: updateOverlaySize
    };

})(jQuery);

//init Gallery Manager on page load
jQuery(document).ready(function () {

    //If tour module is included, then start the tour. Some GM functions will consider activated tour.
    if (VLS_GF.TourModule) {
        VLS_GF.TourModule.start();
    }

    VLS_GF.GalleryManager.init();
});

