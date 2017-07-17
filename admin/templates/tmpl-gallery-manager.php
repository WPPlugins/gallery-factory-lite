<div class="wrap">
	<h2 class="vls-gf-gallery-manager-header"><?php _e( 'Gallery Factory Manager', VLS_GF_TEXTDOMAIN ) ?></h2>

	<div
		class="vls-gf-lite-notice"><?php _e( 'You are using the Lite version of the Gallery Factory plugin, offering just basic features.<br>The full-featured premium version is available at <a href="http://codecanyon.net/item/gallery-factory/11219294">CodeCanyon</a>.', VLS_GF_TEXTDOMAIN ) ?></div>
	<div class="clear"></div>
	<div class="vls-gf-gallery-manager-container">

		<div class="vls-gf-navigation-panel">
			<div class="vls-gf-header">
				<span><?php _e( 'Albums', VLS_GF_TEXTDOMAIN ) ?></span>
			</div>

			<ul class="vls-gf-fixed-items">
				<li class="vls-gf-all"><a href="#all_images"><span class="vls-gf-icon"></span><span
							class="vls-gf-label"><?php _ex( 'All images', 'reduced', VLS_GF_TEXTDOMAIN ) ?></span></a></span>
				</li>
				<li class="vls-gf-unsorted"><a href="#unsorted_images"><span class="vls-gf-icon"></span><span
							class="vls-gf-label"><?php _ex( 'Unsorted images', 'reduced', VLS_GF_TEXTDOMAIN ) ?></span></a><span
						class="wp-ui-highlight"></li>
			</ul>

			<ul id="vls-gf-gallery-tree">
				<div class="vls-gf-loading-overlay"><span></span></div>
			</ul>

			<a id="vls-gf-btn-edit-gallery-tree" href="#"><span
					class="vls-gf-icon"></span><?php _e( 'Edit list', VLS_GF_TEXTDOMAIN ) ?></a>

			<div id="vls-gf-panel-edit-gallery-tree">
				<button id="vls-gf-btn-add-new-folder" href="#"><span
						class="vls-gf-icon"></span><?php _e( 'Add folder', VLS_GF_TEXTDOMAIN ) ?></button>
				<button id="vls-gf-btn-add-new-album" href="#"><span
						class="vls-gf-icon"></span><?php _e( 'Add album', VLS_GF_TEXTDOMAIN ) ?></button>
				<button id="vls-gf-btn-gallery-tree-commit" class="button-primary"
				        href="#"><?php _e( 'Save changes', VLS_GF_TEXTDOMAIN ) ?></button>
				<button id="vls-gf-btn-gallery-tree-cancel"
				        href="#"><?php _e( 'Cancel', VLS_GF_TEXTDOMAIN ) ?></button>
			</div>

		</div>

		<div class="vls-gf-right-panel">
			<div class="vls-gf-window-title">
				<span><?php _ex( 'Unsorted images', 'full', VLS_GF_TEXTDOMAIN ) ?></span>
                <span class="vls-gf-shortcode"><?php _e( 'shortcode', VLS_GF_TEXTDOMAIN ) ?>:&nbsp;<input type="text"
                                                                                                          readonly=""
                                                                                                          value=""/>
                </span>
			</div>
			<div id="vls-gf-tab-panel">
				<ul>
					<li>
						<a href="#album_overview"><?php _ex( 'Overview', 'tab', VLS_GF_TEXTDOMAIN ) ?></a>
						<span class="wp-ui-highlight"></span>
					</li>
					<li>
						<a href="#album_layout"><?php _ex( 'Layout', 'tab', VLS_GF_TEXTDOMAIN ) ?></a>
						<span class="wp-ui-highlight"></span>
					</li>
					<li>
						<a href="#album_edit"><?php _ex( 'Edit', 'tab', VLS_GF_TEXTDOMAIN ) ?></a>
						<span class="wp-ui-highlight"></span>
					</li>
				</ul>
			</div>
			<div class="vls-gf-tab-view">

			</div>
		</div>

	</div>
</div>