<div class="vls-gf-toolbar">
	<ul class="vls-gf-button-group">
		<span><?php _e( 'Zoom', VLS_GF_TEXTDOMAIN ); ?></span>
		<li>
			<a class="vls-gf-button-small vls-gf-x-1-1 vls-gf-active" href="#"><span></span></a>
		</li>
		<li>
			<a class="vls-gf-button-small vls-gf-x-1-2" href="#"><span></span></a>
		</li>
		<li>
			<a class="vls-gf-button-small vls-gf-x-1-4" href="#"><span></span></a>
		</li>
	</ul>

	<button class="vls-gf-btn-save-layout button-primary"><?php _e( 'Update layout', VLS_GF_TEXTDOMAIN ) ?></button>
	<span class="vls-gf-update-feedback"><?php _e( 'updated', VLS_GF_TEXTDOMAIN ); ?></span>
</div>

<div class="vls-gf-tab-container">
	<div class="vls-gf-tab-container-layout">
		<div>
			<?php require( VLS_GF_PLUGIN_DIR . 'admin/templates/tmpl-album-layout-images.php' ); ?>
		</div>
	</div>
	<div class="vls-gf-tab-container-side">
		<form>

			<label class="vls-gf-form-element">
				<span><?php _e( 'Layout type', VLS_GF_TEXTDOMAIN ); ?></span>
				<select id="vls-gf-param-layout-type">
					<option <?php echo ( "grid" == $album->layout_type ) ? 'selected' : ''; ?> value="grid">Grid
					</option>
					<option <?php echo ( "metro" == $album->layout_type ) ? 'selected' : ''; ?> value="metro">Metro
					</option>
				</select>
			</label>

			<div id="vls-gf-parameters-metro" class="vls-gf-parameter-group">

				<label class="vls-gf-form-element">
					<span><?php _e( 'Column count', VLS_GF_TEXTDOMAIN ); ?></span>
					<select id="vls-gf-param-metro-column-count">
						<?php for ( $i = 1; $i <= 12; $i ++ ) { ?>
							<option <?php echo ( $i == $album->column_count ) ? 'selected' : ''; ?>
								value="<?php echo $i; ?>">
								<?php echo $i; ?>
							</option>
						<?php } ?>
					</select>
				</label>

				<label class="vls-gf-form-element">
					<span><?php _e( 'Aspect ratio', VLS_GF_TEXTDOMAIN ); ?></span>
					<input id="vls-gf-param-metro-aspect-ratio" type="text"
					       value="<?php echo $album->aspect_ratio; ?>"/>
				</label>

				<label class="vls-gf-form-element">
					<span><?php _e( 'Horizontal spacing', VLS_GF_TEXTDOMAIN ); ?></span>
					<input id="vls-gf-param-metro-horizontal-spacing" type="text"
					       value="<?php echo $album->horizontal_spacing; ?>"/>
				</label>

				<label class="vls-gf-form-element">
					<span><?php _e( 'Vertical spacing', VLS_GF_TEXTDOMAIN ); ?></span>
					<input id="vls-gf-param-metro-vertical-spacing" type="text"
					       value="<?php echo $album->vertical_spacing; ?>"/>
				</label>

			</div>

			<div id="vls-gf-parameters-grid" class="vls-gf-parameter-group">

				<label class="vls-gf-form-element">
					<span><?php _e( 'Column count', VLS_GF_TEXTDOMAIN ); ?></span>
					<select id="vls-gf-param-grid-column-count">
						<?php for ( $i = 1; $i <= 12; $i ++ ) { ?>
							<option <?php echo ( $i == $album->column_count ) ? 'selected' : ''; ?>
								value="<?php echo $i; ?>">
								<?php echo $i; ?>
							</option>
						<?php } ?>
					</select>
				</label>

				<label class="vls-gf-form-element">
					<span><?php _e( 'Aspect ratio', VLS_GF_TEXTDOMAIN ); ?></span>
					<input id="vls-gf-param-grid-aspect-ratio" type="text" value="<?php echo $album->aspect_ratio; ?>"/>
				</label>

				<label class="vls-gf-form-element">
					<span><?php _e( 'Horizontal spacing', VLS_GF_TEXTDOMAIN ); ?></span>
					<input id="vls-gf-param-grid-horizontal-spacing" type="text"
					       value="<?php echo $album->horizontal_spacing; ?>"/>
				</label>

				<label class="vls-gf-form-element">
					<span><?php _e( 'Vertical spacing', VLS_GF_TEXTDOMAIN ); ?></span>
					<input id="vls-gf-param-grid-vertical-spacing" type="text"
					       value="<?php echo $album->vertical_spacing; ?>"/>
				</label>

			</div>

		</form>
	</div>
	<div class="clear"></div>
</div>

