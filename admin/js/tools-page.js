"use strict";


var VLS_GF = VLS_GF || {};

VLS_GF.ToolsPage = (function ($) {

    var $wpmiButton = {},
        $wpmiInfo = {},
        $wpmiTotalCount = 0;

    function init() {

        $wpmiButton = $('#vls-gf-form-import-wpmedia input.button-primary');
        $wpmiInfo = $('#vls-gf-wp-media-import-info');

        //Import from WP Media
        $wpmiButton.on('click', function (e) {
            e.preventDefault();
            var $this = $(this);
            if ($this.hasClass('button-disabled')) {
                return false;
            } else {
                $('#submit_import_wp, #submit_import_ngg').addClass('button-disabled');
                $wpmiInfo.show().html('importing...');
                importBatch(1);
            }
            return false;
        });

        //Import from NextGen
        $('#vls-gf-form-import-nextgen input.button-primary').on('click', function (e) {
            e.preventDefault();
            var $this = $(this);
            if ($this.hasClass('button-disabled')) {
                return false;
            } else {
                $('#submit_import_wp, #submit_import_ngg').addClass('button-disabled');
                $this.val('Importing...');
                $this.closest('form').submit();
            }
            return false;
        });

    }

    function importBatch(batchNo) {

        $.post(
            ajaxurl,
            {
                action: 'vls_gf_import_wp_media_batch',
                security: vlsGfScriptData.nonce,
                batch_no: batchNo
            },
            function (response) {
                if (batchNo == 1) {
                    $wpmiTotalCount = response.totalCount;
                }
                if (response.haveNextBatch) {
                    $wpmiInfo.html('importing... ' + (batchNo * 10) + '/' + $wpmiTotalCount + ' ready');
                    importBatch(batchNo + 1)
                } else {
                    $wpmiInfo.html('import complete');
                }
            },
            'json'
        );

    }

    return {
        init: init
    };

})(jQuery);


jQuery(document).ready(function() {
    VLS_GF.ToolsPage.init();
});



