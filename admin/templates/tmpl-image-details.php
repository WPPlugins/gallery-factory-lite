<div class="vls-gf-image-panel">
	<img src="<?php echo $image->guid; ?>" onload="VLS_GF.ImageDetailsModule.updateOverlaySize()"/>

	<div class="vls-gf-image-edit-overlay">
		<div class="vls-gf-crop-mask"
		     data-vls-gf-top="<?php echo $image->crop_top; ?>"
		     data-vls-gf-right="<?php echo $image->crop_right; ?>"
		     data-vls-gf-bottom="<?php echo $image->crop_bottom; ?>"
		     data-vls-gf-left="<?php echo $image->crop_left; ?>">
			<span class="vls-gf-resize-helper"></span>
			<span class="vls-gf-resize-helper"></span>
			<span class="vls-gf-resize-helper"></span>
			<span class="vls-gf-resize-helper"></span>
			<span class="vls-gf-resize-helper"></span>
			<span class="vls-gf-resize-helper"></span>
			<span class="vls-gf-resize-helper"></span>
			<span class="vls-gf-resize-helper"></span>
		</div>
	</div>
</div>
<div class="vls-gf-options-panel">
	<div class="vls-gf-container">

		<div class="vls-gf-update-group">
			<span class="vls-gf-update-feedback"><?php _e( 'updated', VLS_GF_TEXTDOMAIN ); ?></span>
			<input type="button" class="button-primary" value="<?php _e( 'Update', VLS_GF_TEXTDOMAIN ); ?>"/>
		</div>


		<div class="vls-gf-column-2">
			<div class="vls-gf-info-line">
				<strong><?php _e( 'File name', VLS_GF_TEXTDOMAIN ); ?>:</strong><?php echo $image->filename ?>
			</div>
			<div class="vls-gf-info-line">
				<strong><?php _e( 'File type', VLS_GF_TEXTDOMAIN ); ?>:</strong><?php echo $image->post_mime_type; ?>
			</div>
			<div class="vls-gf-info-line">
				<strong><?php _e( 'Uploaded on', VLS_GF_TEXTDOMAIN ); ?>:</strong><?php echo $image->post_date; ?>
			</div>
			<div class="vls-gf-info-line">
				<strong><?php _e( 'File size', VLS_GF_TEXTDOMAIN ); ?>:</strong><?php echo $image->file_size; ?>
			</div>
			<div class="vls-gf-info-line">
				<strong><?php _e( 'Dimensions', VLS_GF_TEXTDOMAIN ); ?>:</strong><?php echo $image->dimensions; ?>
			</div>
			<div class="vls-gf-info-line">
				<strong><?php _e( 'Uploaded by', VLS_GF_TEXTDOMAIN ); ?>
					:</strong><?php echo get_the_author_meta( 'nicename', $image->post_author ); ?>
			</div>
		</div>
		<div class="vls-gf-column-2">
			<?php if ( '' != $image->camera ) { ?>
				<div class="vls-gf-info-line">
					<strong><?php _e( 'Camera', VLS_GF_TEXTDOMAIN ); ?>:</strong><?php echo $image->camera; ?>
				</div>
			<?php }
			if ( '' != $image->lens ) { ?>
				<div class="vls-gf-info-line">
					<strong><?php _e( 'Lens', VLS_GF_TEXTDOMAIN ); ?>:</strong><?php echo $image->lens; ?>
				</div>
			<?php }
			if ( '' != $image->focal_length ) { ?>
				<div class="vls-gf-info-line">
					<strong><?php _e( 'Focal length', VLS_GF_TEXTDOMAIN ); ?>
						:</strong><?php echo $image->focal_length; ?>
				</div>
			<?php }
			if ( '' != $image->shutter_speed ) { ?>
				<div class="vls-gf-info-line">
					<strong><?php _e( 'Shutter speed', VLS_GF_TEXTDOMAIN ); ?>
						:</strong><?php echo $image->shutter_speed; ?>
				</div>
			<?php }
			if ( '' != $image->aperture ) { ?>
				<div class="vls-gf-info-line">
					<strong><?php _e( 'Aperture', VLS_GF_TEXTDOMAIN ); ?>:</strong><?php echo $image->aperture; ?>
				</div>
			<?php }
			if ( '' != $image->iso ) { ?>
				<div class="vls-gf-info-line">
					<strong><?php _e( 'ISO', VLS_GF_TEXTDOMAIN ); ?>:</strong><?php echo $image->iso; ?>
				</div>
			<?php }
			if ( '' != $image->created_date ) { ?>
				<div class="vls-gf-info-line">
					<strong><?php _e( 'Created on', VLS_GF_TEXTDOMAIN ); ?>:</strong><?php echo $image->created_date; ?>
				</div>
			<?php } ?>
		</div>
		<div class="vls-gf-divider"></div>

		<form>
			<?php wp_nonce_field( 'vls-gf-nonce' ); ?>

			<input class="vls-gf-form-primary" type="text" name="title" value="<?php echo $image->post_title; ?>"/>

			<label class="vls-gf-form-element">
				<span><?php _e( 'URL', VLS_GF_TEXTDOMAIN ); ?></span>
				<input type="text" value="<?php echo $image->guid; ?>" readonly/>
			</label>

			<label class="vls-gf-form-element">
				<span><?php _e( 'Caption', VLS_GF_TEXTDOMAIN ); ?></span>
				<textarea name="caption"><?php echo $image->post_excerpt; ?></textarea>
			</label>

			<label class="vls-gf-form-element">
				<span><?php _e( 'Alt text', VLS_GF_TEXTDOMAIN ); ?></span>
				<input type="text" name="alt" value="<?php echo $image->alt_text; ?>"/>
			</label>

			<label class="vls-gf-form-element">
				<span><?php _e( 'Description', VLS_GF_TEXTDOMAIN ); ?></span>
				<textarea name="description"><?php echo $image->post_content; ?></textarea>
			</label>

			<input type="hidden" name="id" value="<?php echo $image->ID; ?>"/>

		</form>
	</div>
</div>

