/* globals vlsGfTinymceL10n */

(function ($) {
    tinymce.create('tinymce.plugins.VlsGfButtons', {
        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} editor Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init: function (editor, url) {
            editor.addButton('vls_gf_album', {
                title: vlsGfTinymceL10n.btnInsertGFAlbum,
                cmd: 'albumShortcode'
            });

            editor.addCommand('albumShortcode', this.showAlbumSelectionDialog, {
                self: this,
                editor: editor
            });

        },

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @return {Object} Name/value array containing information about the plugin.
         */
        getInfo: function () {
            return {
                longname: 'Gallery Factory Buttons',
                author: 'Vilyon',
                authorurl: 'http://galleryfactory.vilyon.net',
                infourl: 'http://galleryfactory.vilyon.net',
                version: "1.1"
            };
        },

        showAlbumSelectionDialog: function () {

            var self = this.self,
                editor = this.editor;

            //open the dialog
            editor.windowManager.open({
                id: 'vls-gf-album-shortcode-dialog',
                html: '<div class="vls-gf-loading-overlay"><span></span></div>',
                width: 500,
                height: ($(window).height() - 36 - 50) * 0.7,
                title: vlsGfTinymceL10n.strSelectAlbum,
                buttons: [
                    {
                        text: vlsGfTinymceL10n.btnCancel,
                        onclick: 'close'
                    }
                ]
            });

            //load dialog contents
            $.get(
                ajaxurl,
                {
                    action: 'vls_gf_view_tinymce_album_selection_dialog'
                },
                function (data) {
                    console.log('modal loaded');
                    self.initModalContent(data, editor);
                },
                'html'
            );


        },

        initModalContent: function (data, editor) {
            console.log('modal loaded 2');
            var body = $('#vls-gf-album-shortcode-dialog-body');
            body.empty().append(data);

            body.find('li.vls-gf-folder').on('click', function () {

                //toggle folders
                var $this = $(this);
                if ($this.hasClass('vls-gf-opened')) {
                    $this.children('ul').slideUp(300);
                } else {
                    $this.children('ul').slideDown(300);
                }
                $(this).toggleClass('vls-gf-opened');

                return false;
            });

            body.find('li.vls-gf-album').on('click', function () {
                //select the album and insert its shortcode in the editor
                var id = $(this).data('id');
                editor.insertContent('[vls_gf_album id="' + id + '"]');
                editor.windowManager.close();

                return false;
            })




        }


    });

    // Register plugin
    tinymce.PluginManager.add('vls_gf_buttons', tinymce.plugins.VlsGfButtons);
})(jQuery);