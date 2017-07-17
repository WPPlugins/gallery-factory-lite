<div class="wrap">
	<h2>Gallery Factory Tools</h2>

	<?php if ( isset( $_GET['status'] ) && $_GET['status'] == 'done' ) { ?>
		<div id="vls-gf-notice-imported" class="updated notice is-dismissible">
			<p><strong><?php _e( 'Images are successfully imported', VLS_GF_TEXTDOMAIN ); ?></strong></p>
		</div>
	<?php } ?>
	<?php if ( isset( $_GET['status'] ) && $_GET['status'] == 'nonextgen' ) { ?>
		<div id="vls-gf-notice-no-nextgen" class="error notice is-dismissible">
			<p><strong><?php _e( 'No installed NextGen Gallery found', VLS_GF_TEXTDOMAIN ); ?></strong></p>
		</div>
	<?php } ?>

	<h3>Import from Wordpress Media</h3>

	<form id="vls-gf-form-import-wpmedia" action="admin-post.php" method="post">

		<input type="hidden" name="action" value="vls_gf_import_wp_media"/>

		<p><?php _e( "This feature imports all your Wordpress Media images to the Gallery Factory. All other attachment file types are ignored. The imported images are added to the \"Unsorted images\" folder within Gallery Factory. The WP Media content is just copied during the import and remains untouched.", VLS_GF_TEXTDOMAIN ); ?></p>

		<p><?php _e( "Please note, that Gallery Factory uses its own uploads folder on server, so physical image files will be copied there from the original WP location. Make sure that you have enough disk space before proceeding with the import. The import procedure may take time, depending on your WP Media content size. Import can't be canceled once started, and the result is not undoable.", VLS_GF_TEXTDOMAIN ); ?></p>

		<p class="submit">
			<input type="submit" name="submit" id="submit_import_wp" class="button button-primary"
			       value="<?php _e( "Import images from WP Media", VLS_GF_TEXTDOMAIN ); ?>">
		</p>
		<p id="vls-gf-wp-media-import-info" style="display: none;"></p>

	</form>

	<h3>Import from NextGen Gallery</h3>

	<form id="vls-gf-form-import-nextgen" action="admin-post.php" method="post">

		<input type="hidden" name="action" value="vls_gf_import_nextgen"/>

		<p><?php _e( "This feature imports all your NextGen Gallery albums, galleries and images to the Gallery Factory. The NextGen content is just copied during the import and remains untouched.", VLS_GF_TEXTDOMAIN ); ?></p>

		<p><?php _e( "Please note, that Gallery Factory uses its own uploads folder on server, so physical image files will be copied there from the original NextGen uploads folder. Make sure that you have enough disk space before proceeding with the import. The import procedure may take time, depending on your NextGen Gallery content size. Import can't be canceled once started, and the result is not undoable.", VLS_GF_TEXTDOMAIN ); ?></p>

		<fieldset>
			<label for="vls_gf_create_folder">
				<input name="vls_gf_create_folder" type="checkbox" id="vls_gf_create_folder"
				       value="true">
				<?php _e( 'Create "NextGen" folder and put all imported items there', VLS_GF_TEXTDOMAIN ); ?>
			</label>
		</fieldset>

		<p class="submit">
			<input type="submit" name="submit" id="submit_import_ngg" class="button button-primary"
			       value="<?php _e( "Import images from NextGen Gallery", VLS_GF_TEXTDOMAIN ); ?>">
		</p>

	</form>

	<script type="application/javascript">
		jQuery(function () {

			jQuery('#vls-gf-form-import-wpmedia input.button-primary, #vls-gf-form-import-nextgen input.button-primary').on('click', function () {
				var $this = jQuery(this);
				if ($this.hasClass('button-disabled')) {
					return false;
				} else {
					jQuery('#submit_import_wp, #submit_import_ngg').addClass('button-disabled');
					$this.val('<?php _e('Importing... Please do not reload this page until import is finished.', VLS_GF_TEXTDOMAIN) ?>');
					$this.closest('form').submit();
				}
			});
		});
	</script>
</div>