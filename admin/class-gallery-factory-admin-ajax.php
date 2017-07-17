<?php
/**
 * @package   Gallery_Factory_Lite_Lite
 * @author    Vilyon Studio <vilyonstudio@gmail.com>
 * @link      http://galleryfactory.vilyon.net
 * @copyright 2015 Vilyon Studio
 *
 * Class provides ajax endpoints for admin UI
 */


if ( ! class_exists( "VLS_Gallery_Factory_Admin_AJAX" ) ) {
	class VLS_Gallery_Factory_Admin_AJAX {

		private static $_instance = null;

		/**
		 * Constructor of the class. Registering hooks here.
		 */
		private function __construct() {
			// admin_init hook
			add_action( 'admin_init', array( $this, 'init' ) );

		}

		/**
		 * Cloning instances of this class is forbidden.
		 */
		private function __clone() {
		}

		/**
		 * Deserialisation of this class is forbidden.
		 */
		private function __wakeup() {
		}

		/**
		 * Static method for instantiating the class
		 * @return null|VLS_Gallery_Factory_Admin_AJAX
		 */
		public static function instance() {
			if ( self::$_instance == null ) {
				self::$_instance = new self();
			}

			return self::$_instance;
		}

		/**
		 * Function is attached to 'admin_init' hook. Registering AJAX endpoints here.
		 */
		public function init() {

			//views
			add_action( 'wp_ajax_vls_gf_view_gallery_tree', array( $this, 'view_gallery_tree' ) );
			add_action( 'wp_ajax_vls_gf_view_album_overview', array( $this, 'view_album_overview' ) );
			add_action( 'wp_ajax_vls_gf_view_album_layout', array( $this, 'view_album_layout' ) );
			add_action( 'wp_ajax_vls_gf_view_gallery_item_edit', array( $this, 'view_gallery_item_edit' ) );
			add_action( 'wp_ajax_vls_gf_view_image_details', array( $this, 'view_image_details' ) );

			add_action( 'wp_ajax_vls_gf_view_tinymce_album_selection_dialog', array(
				$this,
				'view_tinymce_album_selection_dialog'
			) );

			//image detail dialog functions
			add_action( 'wp_ajax_vls_gf_update_image_details', array( $this, 'update_image_details' ) );

			//album details edit tab
			add_action( 'wp_ajax_vls_gf_update_album_details', array( $this, 'update_album_details' ) );

			//gallery manager functions
			add_action( 'wp_ajax_vls_gf_commit_gallery_tree_changes', array( $this, 'commit_gallery_tree_changes' ) );
			add_action( 'wp_ajax_vls_gf_move_images_to_album', array( $this, 'move_images_to_album' ) );
			add_action( 'wp_ajax_vls_gf_delete_images', array( $this, 'delete_images' ) );
			add_action( 'wp_ajax_vls_gf_update_album_layout', array( $this, 'update_album_layout' ) );

			add_action( 'wp_ajax_vls_gf_async_upload', array( $this, 'async_upload' ) );

			add_action( 'wp_ajax_vls_gf_disable_tour', array( $this, 'disable_tour' ) );

			//tools
			add_action( 'wp_ajax_vls_gf_import_wp_media_batch', array( $this, 'import_wp_media_batch' ) );

		}

		//TODO: extract view template
		/**
		 * Returns gallery tree for displaying in Albums Panel.
		 */
		public function view_gallery_tree() {

			if ( isset( $_REQUEST["tour"] ) && ( $_REQUEST["tour"] === "true" ) ) {
				$this->output_mockup_folder_items();
			} else {
				$this->output_folder_items( 1, 0 );
				wp_reset_postdata();
			}
			wp_die();
		}


		//TODO: extract view template
		/**
		 * Returns album overview for displaying in Overview Tab of Main Panel.
		 */
		public function view_album_overview() {
			//param $item_type: all_images, unsorted_images, album
			$item_type = $_REQUEST["item_type"];
			//param $album_id: id of the album to load
			$album_id = $_REQUEST["album_id"];


			?>
			<div class="vls-gf-toolbar">
				<ul id="vls-gf-toolbar-image-overview">
					<li>
						<a id="vls-gf-bulk-select-start-button"
						   href="#"><?php _e( 'Bulk select', VLS_GF_TEXTDOMAIN ); ?></a>
					</li>
					<li>
						<a id="vls-gf-upload-image-button"
						   href="#"><?php _e( 'Upload images', VLS_GF_TEXTDOMAIN ); ?></a>
					</li>
				</ul>
				<ul id="vls-gf-toolbar-bulk-select-left" style="display: none;">
					<li>
						<a id="vls-gf-bulk-select-cancel-button"
						   href="#"><?php _e( 'Cancel selection', VLS_GF_TEXTDOMAIN ); ?></a>
					</li>
					<li>
						<a id="vls-gf-bulk-select-delete-button"
						   href="#"><?php _e( 'Delete selected', VLS_GF_TEXTDOMAIN ); ?></a>
					</li>
				</ul>
				<ul id="vls-gf-toolbar-bulk-select-right" class="toolbar-right" style="display: none;">
					<li>
						<a id="vls-gf-bulk-select-all-button"
						   href="#"><?php _e( 'Select all', VLS_GF_TEXTDOMAIN ); ?></a>
					</li>
					<li>
						<a id="vls-gf-bulk-select-none-button"
						   href="#"><?php _e( 'Select none', VLS_GF_TEXTDOMAIN ); ?></a>
					</li>
					<li>
						<a id="vls-gf-bulk-select-invert-button"
						   href="#"><?php _e( 'Invert selected', VLS_GF_TEXTDOMAIN ); ?></a>
					</li>
				</ul>


			</div>

			<?php $this->subview_upload_panel(); ?>
			<?php
			if ( isset( $_REQUEST["tour"] ) && ( $_REQUEST["tour"] === "true" ) ) {
				$this->subview_image_overview_mockup();
			} else {
				$this->subview_image_overview( $item_type, $album_id );
			}
			?>
			<?php

			wp_die();
		}


		/**
		 * Returns album layout for displaying in Layout Tab of Main Panel.
		 */
		public function view_album_layout() {
			//param $album_id: id of the album to load
			$album_id = $_REQUEST["album_id"];

			//render mockup view for the tour
			if ( isset( $_REQUEST["tour"] ) && ( $_REQUEST["tour"] === "true" ) ) {
				$this->view_album_layout_mockup();
			}

			$post_layout_meta = get_post_meta( $album_id, '_vls_gf_layout_meta', true );

			//TODO: extract default values for layout meta to some preset array (maybe user defined)
			//Setting default layout options
			$album                     = new stdClass();
			$album->layout_type        = isset( $post_layout_meta['layout_type'] ) ? $post_layout_meta['layout_type'] : 'grid';
			$album->column_count       = isset( $post_layout_meta['column_count'] ) ? $post_layout_meta['column_count'] : 4;
			$album->aspect_ratio       = isset( $post_layout_meta['aspect_ratio'] ) ? $post_layout_meta['aspect_ratio'] : 1;
			$album->horizontal_spacing = isset( $post_layout_meta['horizontal_spacing'] ) ? $post_layout_meta['horizontal_spacing'] : 4;
			$album->vertical_spacing   = isset( $post_layout_meta['vertical_spacing'] ) ? $post_layout_meta['vertical_spacing'] : 4;

			global $wpdb;

			$images = $wpdb->get_results(
				$wpdb->prepare( "
                    SELECT link.ID as link_id, link.post_name as image_id, IFNULL(url_meta.meta_value, link.guid) as url, link.menu_order
                    FROM $wpdb->posts link
                    LEFT OUTER JOIN $wpdb->postmeta url_meta
                    ON url_meta.post_id = link.post_name AND url_meta.meta_key = %s
                    WHERE link.post_type=%s
                    AND link.post_parent = %d
                    ORDER BY link.menu_order ASC, link.ID ASC",
					'_vls_gf_url',
					VLS_GF_POST_TYPE_ALBUM_IMAGE,
					$album_id
				)
			);

			foreach ( $images as $image ) {

				$image->url = VLS_Gallery_Factory::_get_image_url( $image->url, 'preview-m' );

				$row = floor( floatval( $image->menu_order ) / 100 );
				$col = $image->menu_order - $row * 100;

				$image_layout_meta = get_post_meta( $image->link_id, '_vls_gf_layout_meta', true );

				$image->col     = isset( $image_layout_meta['col'] ) ? $image_layout_meta['col'] : $col;
				$image->row     = isset( $image_layout_meta['row'] ) ? $image_layout_meta['row'] : $row;
				$image->metro_w = isset( $image_layout_meta['metro_w'] ) ? $image_layout_meta['metro_w'] : 1;
				$image->metro_h = isset( $image_layout_meta['metro_h'] ) ? $image_layout_meta['metro_h'] : 1;

			}

			//rendering view
			ob_start();
			require( VLS_GF_PLUGIN_DIR . 'admin/templates/tmpl-album-layout.php' );
			$view = ob_get_clean();

			$response = array(
				'result' => 'ok',
				'view'   => $view,
				'data'   => ''
			);

			echo( json_encode( $response ) );

			wp_die();


		}

		/**
		 * Returns mockup album layout for displaying in Layout Tab of Main Panel in tour mode.
		 */
		public function view_album_layout_mockup() {
			//Setting layout options
			$album                     = new stdClass();
			$album->layout_type        = 'metro';
			$album->column_count       = 6;
			$album->aspect_ratio       = 1.2;
			$album->horizontal_spacing = 4;
			$album->vertical_spacing   = 4;

			$images = array();

			for ( $a = 1; $a < 14; $a ++ ) {
				$image           = new stdClass();
				$image->link_id  = "";
				$image->image_id = "";
				$image->url      = "";
				$image->col      = 0;
				$image->row      = 0;
				$image->metro_w  = rand( 0, 6 ) - 3;
				$image->metro_w  = $image->metro_w > 0 ? $image->metro_w : 1;
				$image->metro_h  = rand( 0, 6 ) - 3;
				$image->metro_h  = $image->metro_h > 0 ? $image->metro_h : 1;

				array_push( $images, $image );

			}

			//rendering view
			ob_start();
			require( VLS_GF_PLUGIN_DIR . 'admin/templates/tmpl-album-layout.php' );
			$view = ob_get_clean();

			$response = array(
				'result' => 'ok',
				'view'   => $view,
				'data'   => ''
			);

			echo( json_encode( $response ) );

			wp_die();


		}


		/**
		 * Returns gallery item view for displaying in Edit tab of Main Panel
		 */
		public function view_gallery_item_edit() {

			//render mockup view for the tour
			if ( isset( $_REQUEST["tour"] ) && ( $_REQUEST["tour"] === "true" ) ) {
				$this->view_gallery_item_edit_mockup();
			}

			$item_id = $_REQUEST['item_id'];

			//prepare data for the view
			$item            = get_post( $item_id );
			$item->edit_link = get_edit_post_link( $item->ID );

			$item_meta = get_post_meta( $item_id, '_vls_gf_item_meta', true );

			if ( empty( $item_meta ) ) {
				$item_meta = array();
			}

			$defaults = array(
				'append_new_images_to'        => 'bottom',
				'display_image_info_on_hover' => 'global',
			);

			$item_meta = array_merge( $defaults, $item_meta );

			$users = get_users( array( 'fields' => array( 'ID', 'user_nicename' ) ) );


			//rendering view
			ob_start();
			require( VLS_GF_PLUGIN_DIR . 'admin/templates/tmpl-album-edit.php' );

			$view = ob_get_clean();

			$response = array(
				'result' => 'ok',
				'view'   => $view
			);

			echo( json_encode( $response ) );

			wp_die();

		}


		/**
		 * Returns mockup gallery item view for displaying in Edit tab of Main Panel
		 */
		public function view_gallery_item_edit_mockup() {

			//prepare data for the view
			$item             = new stdClass();
			$item->ID         = 0;
			$item->post_title = "Example album";

			$item->post_excerpt = "";
			$item->post_content = "";
			$item->post_name    = "";
			$item->post_author  = wp_get_current_user();
			$item->edit_link    = "#";

			$users = get_users( array( 'fields' => array( 'ID', 'user_nicename' ) ) );

			$item_meta = array(
				'append_new_images_to'        => 'bottom',
				'display_image_info_on_hover' => 'global',
			);

			//rendering view
			ob_start();
			require( VLS_GF_PLUGIN_DIR . 'admin/templates/tmpl-album-edit.php' );

			$view = ob_get_clean();

			$response = array(
				'result' => 'ok',
				'view'   => $view
			);

			echo( json_encode( $response ) );

			wp_die();

		}

		/**
		 * Updates album details
		 */
		public function update_album_details() {

			check_ajax_referer( 'vls-gf-nonce' );

			$id          = intval( $_POST['id'] );
			$title       = sanitize_text_field( $_POST['title'] );
			$caption     = sanitize_text_field( $_POST['caption'] );
			$description = sanitize_text_field( $_POST['description'] );
			$slug        = sanitize_text_field( $_POST['slug'] );
			$author      = sanitize_text_field( $_POST['author'] );

			$append_new_images_to        = sanitize_text_field( $_POST['append_new_images_to'] );
			$display_image_info_on_hover = sanitize_text_field( $_POST['display_image_info_on_hover'] );

			$post_data = array(
				'ID'           => $id,
				'post_title'   => $title,
				'post_excerpt' => $caption,
				'post_content' => $description,
				'post_name'    => $slug,
				'post_author'  => $author
			);

			wp_update_post( $post_data );

			$item_meta = array(
				'append_new_images_to'        => $append_new_images_to,
				'display_image_info_on_hover' => $display_image_info_on_hover,
			);

			update_post_meta( $id, '_vls_gf_item_meta', $item_meta );

			//clear view cache
			VLS_Gallery_Factory_Admin_Utils::clear_view_cache_by_album( $id );

			$response = array( 'result' => 'ok' );
			echo( json_encode( $response ) );

			wp_die();

		}


		/**
		 * Returns image details view for displaying in image details popup
		 */
		public function view_image_details() {
			$image_id = $_REQUEST["image_id"];
			$link_id  = $_REQUEST["link_id"];

			$image = get_post( $image_id );

			if (!isset($image)) {
				wp_die('no image found');
			}

			$image_meta = get_post_meta( $image_id, '_vls_gf_image_meta', true );

			$image->post_date = date_i18n( get_option( 'date_format' ), strtotime( $image->post_date ) ) . ' ' . date_i18n( get_option( 'time_format' ), strtotime( $image->post_date ) );

			//extending image properties with metadata
			$image->alt_text = get_post_meta( $image_id, '_vls_gf_image_alt_text', true );
			$image->filename = isset( $image_meta['filename'] ) ? $image_meta['filename'] : '?';

			$image->file_size = '';
			if ( isset( $image_meta['file_size'] ) && $image_meta['file_size'] > 0 ) {
				$image->file_size = strval( round( $image_meta['file_size'] / 1024 / 1024, 2 ) ) . ' MB';
			}
			$image->dimensions   = ( isset( $image_meta['width'] ) ? $image_meta['width'] : '?' ) . '×' . ( isset( $image_meta['height'] ) ? $image_meta['height'] : '?' );
			$image->camera       = isset( $image_meta['camera'] ) ? $image_meta['camera'] : '';
			$image->lens         = isset( $image_meta['lens'] ) ? $image_meta['lens'] : '';
			$image->focal_length = ( isset( $image_meta['focal_length_35mm'] ) && $image_meta['focal_length_35mm'] > 0 ) ? $image_meta['focal_length_35mm'] : '';

			$shutter_speed = '';
			if ( isset( $image_meta['shutter_speed'] ) ) {
				$valueFloat = $image_meta['shutter_speed'];
				if ( $valueFloat > 0 ) {
					if ( $valueFloat >= 1 ) {
						$shutter_speed = strval( round( $valueFloat, 1 ) );
					} else {
						$shutter_speed = '1/' . strval( round( 1 / $valueFloat, 0 ) );
					}
				}
			}
			$image->shutter_speed = $shutter_speed;

			$image->aperture     = ( isset( $image_meta['aperture'] ) && $image_meta['aperture'] > 0 ) ? ( 'f/' . $image_meta['aperture'] ) : '';
			$image->iso          = isset( $image_meta['iso'] ) ? $image_meta['iso'] : '';
			$image->created_date = ( isset( $image_meta['created_timestamp'] ) && $image_meta['created_timestamp'] > 0 ) ?
				date_i18n( get_option( 'date_format' ), $image_meta['created_timestamp'] ) . ' ' . date_i18n( get_option( 'time_format' ), $image_meta['created_timestamp'] ) :
				'';

			//cropping setup
			$image->crop_top    = isset( $image_meta['crop_top'] ) ? $image_meta['crop_top'] : 0;
			$image->crop_right  = isset( $image_meta['crop_right'] ) ? $image_meta['crop_right'] : 0;
			$image->crop_bottom = isset( $image_meta['crop_bottom'] ) ? $image_meta['crop_bottom'] : 0;
			$image->crop_left   = isset( $image_meta['crop_left'] ) ? $image_meta['crop_left'] : 0;


			//album-specific image details
			if ( $link_id > 0 ) {
				$link            = get_post( $link_id );
				$link_image_meta = get_post_meta( $link_id, '_vls_gf_image_meta', true );

				if ( empty( $link_image_meta ) || ! array_key_exists( 'click_action', $link_image_meta ) ) {
					$link->click_action = 'lightbox';
				} else {
					$link->click_action = $link_image_meta['click_action'];
				}

				if ( empty( $link_image_meta ) || ! array_key_exists( 'link_url', $link_image_meta ) ) {
					$link->link_url = '';
				} else {
					$link->link_url = $link_image_meta['link_url'];
				}

				if ( empty( $link_image_meta ) || ! array_key_exists( 'link_target', $link_image_meta ) ) {
					$link->link_target = '_self';
				} else {
					$link->link_target = $link_image_meta['link_target'];
				}

			}


			//rendering view
			ob_start();
			require( VLS_GF_PLUGIN_DIR . 'admin/templates/tmpl-image-details.php' );
			$view = ob_get_clean();

			$response = array(
				'result' => 'ok',
				'view'   => $view
			);
			echo( json_encode( $response ) );

			wp_die();

		}

		/**
		 * Returns folders and albums view for displaying in TinyMCE editor dialog
		 */
		public function view_tinymce_album_selection_dialog() {

			global $wpdb;

			$posts = $wpdb->get_results(
				$wpdb->prepare( "
                    SELECT p.ID, p.post_type, p.post_title, p.menu_order, p.post_parent
                    FROM $wpdb->posts p
                    WHERE
                      p.post_type IN (%s, %s)
                      ORDER BY p.menu_order ASC",
					VLS_GF_POST_TYPE_FOLDER,
					VLS_GF_POST_TYPE_ALBUM
				)
			);

			$html = $this->render_child_items( $posts, 0 );

			echo( '<div class="vls-gf-container"><ul>' . $html . '</ul></div>' );

			die();


		}

		/**
		 * @param $posts
		 * @param $parent_id
		 *
		 * @return string
		 */
		private function render_child_items( $posts, $parent_id ) {

			$html = "";

			foreach ( $posts as $post ) {

				if ( $parent_id == $post->post_parent ) {


					if ( $post->post_type == VLS_GF_POST_TYPE_ALBUM ) {
						$html .= '<li class="vls-gf-album" data-id="' . $post->ID . '"><i></i>' . $post->post_title;
					} else {
						$html .= '<li class="vls-gf-folder" data-id="' . $post->ID . '"><i></i>' . $post->post_title;
					}

					$subHtml = $this->render_child_items( $posts, $post->ID );
					if ( ! empty( $subHtml ) ) {
						$html .= '<ul>' . $subHtml . '</ul>';
					}
//
//					array_push( $items, $item );

					$html .= '</li>';

				}

			}

			return $html;
		}

		/**
		 * Updates image details
		 */
		public function update_image_details() {

			$now = new DateTime();

			check_ajax_referer( 'vls-gf-nonce' );

			$id          = intval( $_POST['id'] );
			$title       = sanitize_text_field( $_POST['title'] );
			$caption     = sanitize_text_field( $_POST['caption'] );
			$description = sanitize_text_field( $_POST['description'] );
			$alt         = sanitize_text_field( $_POST['alt'] );
			$crop_top    = floatval( $_POST['crop_top'] );
			$crop_right  = floatval( $_POST['crop_right'] );
			$crop_bottom = floatval( $_POST['crop_bottom'] );
			$crop_left   = floatval( $_POST['crop_left'] );

			$image = get_post( $id );

			$url = $image->guid . '?' . $now->format( 'U' );

			$post_data = array(
				'ID'           => $id,
				'post_title'   => $title,
				'post_excerpt' => $caption,
				'post_content' => $description
			);
			wp_update_post( $post_data );

			update_post_meta( $id, '_vls_gf_image_alt_text', $alt );
			update_post_meta( $id, '_vls_gf_url', $url );


			//save cropping setup and recreate thumbs only when crop is changed
			$image_meta = get_post_meta( $id, '_vls_gf_image_meta', true );
			if (
				$image_meta["crop_top"] != $crop_top
				|| $image_meta["crop_right"] != $crop_right
				|| $image_meta["crop_bottom"] != $crop_bottom
				|| $image_meta["crop_left"] != $crop_left
			) {
				$image_meta["crop_top"]    = $crop_top;
				$image_meta["crop_right"]  = $crop_right;
				$image_meta["crop_bottom"] = $crop_bottom;
				$image_meta["crop_left"]   = $crop_left;

				//recreate thumbnail and preview with new cropping
				$relative_path = get_post_meta( $id, '_vls_gf_file', true );
				$path          = WP_CONTENT_DIR . VLS_GF_UPLOADS_DIR . '/' . $relative_path;
				$image_meta    = VLS_Gallery_Factory_Admin_Utils::create_small_images( $path, $image_meta );

				update_post_meta( $id, '_vls_gf_image_meta', $image_meta );
			}

			//clear cache
			VLS_Gallery_Factory_Admin_Utils::clear_view_cache_by_image( $id );

			$response = array( 'result' => 'ok' );
			echo( json_encode( $response ) );

			wp_die();

		}

		/**
		 * Updates gallery tree
		 */
		public function commit_gallery_tree_changes() {

			check_ajax_referer( 'vls-gf-nonce', 'security' );

			$items = json_decode( wp_unslash( $_POST['itemData'] ), true );

			// sorting by order
			$order_array = array();
			foreach ( $items as $key => $item ) {
				$order_array[ $key ] = $item['order'];
			}
			array_multisort( $order_array, SORT_ASC, $items );

			$parents = array();

			// saving added, renamed and reordered items
			foreach ( $items as $key => $item ) {

				$id         = intval( $item['id'] );
				$type       = $item['type'];
				$order      = intval( $item['order'] );
				$level      = intval( $item['level'] );
				$name       = $item['name'];
				$is_added   = $item['is_added'];
				$is_renamed = $item['is_renamed'];

				if ( $level > 3 ) {
					$level = 3;
				}

				$parent_id = 0;

				if ( $level > 1 ) {
					$parent_id = $parents[ $level - 1 ];
				}

				//adding item
				if ( $is_added == 'true' ) {

					$post_data = array(
						'post_title'  => $name,
						'post_type'   => 'folder' == $type ? VLS_GF_POST_TYPE_FOLDER : VLS_GF_POST_TYPE_ALBUM,
						'post_parent' => $parent_id,
						'post_status' => 'draft',
						'menu_order'  => $order
					);

					$id = wp_insert_post( $post_data );

					// updating array with new id
					$items[ $key ]['id'] = $id;

				} else {

					$post_data = array(
						'ID'          => $id,
						'post_parent' => $parent_id,
						'menu_order'  => $order
					);

					// if renamed, adding new name to the array
					if ( $is_renamed == 'true' ) {
						$post_data['post_title'] = $name;
					}

					wp_update_post( $post_data );

				}

				//storing as the parent of current level
				$parents[ $level ] = $id;

			}

			// deleting items
			foreach ( $items as $item ) {

				$is_deleted = $item['is_deleted'];
				$id         = intval( $item['id'] );

				if ( $is_deleted == 'true' ) {
					$this->delete_gallery_item( $id );
				}

			}

			$data = array( 'result' => 'ok' );
			echo( json_encode( $data ) );

			wp_die();

		}

		/**
		 * Moves the image to the album
		 */
		public function move_images_to_album() {

			check_ajax_referer( 'vls-gf-nonce', 'security' );

			$source_album = intval( $_POST['source_album'] );
			$target_album = intval( $_POST['target_album'] );
			$images       = json_decode( wp_unslash( $_POST['images'] ), true );

			VLS_Gallery_Factory_Admin_Utils::move_images_to_album( $source_album, $target_album, $images );

			wp_die();

		}

		/**
		 * Deletes image.
		 * If album is set, deletes the image from this album. Otherwise permanently deletes image.
		 */
		public function delete_images() {

			global $wpdb;

			$images = $_REQUEST['images'];

			$album = intval( $_REQUEST['album'] );


			foreach ( $images as $image ) {

				$image = intval( $image );

				if ( $album > 0 ) { //deleting from the album - just remove link to current album

					$wpdb->delete(
						$wpdb->posts,
						array(
							'post_type'   => VLS_GF_POST_TYPE_ALBUM_IMAGE,
							'post_parent' => $album,
							'post_name'   => $image
						)
					);

					VLS_Gallery_Factory_Admin_Utils::clear_view_cache_by_album( $album );


				} else { //deleting from all images or unsorted - delete image and all related data

					//get file path
					$relative_path = get_post_meta( $image, '_vls_gf_file', true );

					//get links to the albums
					$links = $wpdb->get_col(
						$wpdb->prepare( "
                            SELECT ID
                            FROM $wpdb->posts
                            WHERE post_type = %s AND post_name = %d",
							VLS_GF_POST_TYPE_ALBUM_IMAGE,
							$image
						)
					);

					// delete all links to albums
					foreach ( $links as $link ) {
						wp_delete_post( $link, true );

						//TODO: optimize clear cache: need to fire once for an each album, not link.
						VLS_Gallery_Factory_Admin_Utils::clear_view_cache_by_album( $link->parent_id );
					}

					// delete image post entry
					wp_delete_post( $image, true );

					//delete original image and all related images
					if ( null != $relative_path ) {
						$path = WP_CONTENT_DIR . VLS_GF_UPLOADS_DIR . '/' . $relative_path;
						unlink( $path );
						unlink( VLS_Gallery_Factory::_get_image_url( $path, 'thumbnail' ) );
						unlink( VLS_Gallery_Factory::_get_image_url( $path, 'preview-m' ) );
					}
				}
			}

			wp_die();
		}

		/**
		 * Updates album layout settings
		 */
		public function update_album_layout() {

			check_ajax_referer( 'vls-gf-nonce', 'security' );

			global $wpdb;

			$album_id = intval( $_POST['album_id'] );

			$options = json_decode( wp_unslash( $_POST['options'] ), true );
			$images  = json_decode( wp_unslash( $_POST['images'] ), true );

			update_post_meta( $album_id, '_vls_gf_layout_meta', $options );

			foreach ( $images as $key => $image_meta ) {

				$link_id = $image_meta['link_id'];
				unset( $image_meta['link_id'] );

				//updating menu_order for sorting
				$menu_order = intval( $image_meta['row'] ) * 100 + intval( $image_meta['col'] );

				error_log( $menu_order );

				$wpdb->update(
					$wpdb->posts,
					array( 'menu_order' => $menu_order ),
					array( 'ID' => $link_id )
				);

				update_post_meta( $link_id, '_vls_gf_layout_meta', $image_meta );

			}

			VLS_Gallery_Factory_Admin_Utils::clear_view_cache_by_album( $album_id );

		}

		/**
		 * Accepts file uploads from upload panel
		 * Code derived from WP core async-upload.php
		 */
		public function async_upload() {
			// Flash often fails to send cookies with the POST or upload, so we need to pass it in GET or POST instead
			if ( is_ssl() && empty( $_COOKIE[ SECURE_AUTH_COOKIE ] ) && ! empty( $_REQUEST['auth_cookie'] ) ) {
				$_COOKIE[ SECURE_AUTH_COOKIE ] = $_REQUEST['auth_cookie'];
			} elseif ( empty( $_COOKIE[ AUTH_COOKIE ] ) && ! empty( $_REQUEST['auth_cookie'] ) ) {
				$_COOKIE[ AUTH_COOKIE ] = $_REQUEST['auth_cookie'];
			}
			if ( empty( $_COOKIE[ LOGGED_IN_COOKIE ] ) && ! empty( $_REQUEST['logged_in_cookie'] ) ) {
				$_COOKIE[ LOGGED_IN_COOKIE ] = $_REQUEST['logged_in_cookie'];
			}
			unset( $current_user );

			header( 'Content-Type: text/html; charset=' . get_option( 'blog_charset' ) );

			check_admin_referer( 'vls-gf-upload' );

			//TODO: maybe add the dedicated permission
			if ( ! current_user_can( 'upload_files' ) ) {
				wp_die();
			}

			if ( isset( $_REQUEST['album_id'] ) && $_REQUEST['album_id'] != "0" ) {
				$album_id = intval( $_REQUEST['album_id'] );
				if ( ! current_user_can( 'edit_post', $album_id ) ) {
					wp_die();
				}
			} else {
				$album_id = 0;
			}

			//$post_data = isset( $_REQUEST['post_data'] ) ? $_REQUEST['post_data'] : array();

			// Make sure the uploaded file is an image.
			if ( isset( $post_data['context'] ) && in_array( $post_data['context'], array(
					'custom-header',
					'custom-background'
				) )
			) {
				$wp_filetype = wp_check_filetype_and_ext( $_FILES['async-upload']['tmp_name'], $_FILES['async-upload']['name'] );
				if ( ! wp_match_mime_types( 'image', $wp_filetype['type'] ) ) {
					echo json_encode( array(
						'success' => false,
						'data'    => array(
							'message'  => __( 'The uploaded file is not a valid image. Please try again.', VLS_GF_TEXTDOMAIN ),
							'filename' => $_FILES['async-upload']['name'],
						)
					) );
					wp_die();
				}
			}

			$time = current_time( 'mysql' );

			//$name = $_FILES['async-upload']['name'];
			$overrides = array( 'test_form' => false );

			$uploaded_file         = $_FILES['async-upload'];
			$uploaded_file['name'] = str_replace( '%', '', $uploaded_file['name'] ); //percent character causes error on displaying an image
			$file                  = wp_handle_upload( $uploaded_file, $overrides, $time );

			if ( isset( $file['error'] ) ) {
				echo json_encode( array(
					'success' => false,
					'data'    => array(
						'message'  => $file['error'],
						'filename' => $_FILES['async-upload']['name'],
					)
				) );
				wp_die();
			}

			VLS_Gallery_Factory_Admin_Utils::add_image_file( $file, $album_id );

			echo json_encode(
				array(
					'success' => true
				)
			);

			wp_die();

		}

		/**
		 * Disables quick tour for the current user
		 */
		public function disable_tour() {
			update_user_option( get_current_user_id(), 'vls_gf_no_tour', true, true );
			wp_die();
		}

		/**
		 * Imports one batch of WP Media images
		 */
		public function import_wp_media_batch() {

			check_ajax_referer( 'vls-gf-nonce', 'security' );

			set_time_limit(0);

			global $wpdb;

			$batch_no = intval( $_POST['batch_no'] );
			$batch_size = 10;

			$wp_upload_dir = wp_upload_dir();
			$gf_upload_dir = WP_CONTENT_DIR . VLS_GF_UPLOADS_DIR;

			$posts = $wpdb->get_results(
				$wpdb->prepare( "
                        SELECT p.ID, p.post_title as title, p.post_excerpt as caption,
                          p.post_content as description, p.post_mime_type as mime_type,
                          m1.meta_value as attached_file, IFNULL(m2.meta_value, '') as alt_text
                        FROM $wpdb->posts p
                        INNER JOIN $wpdb->postmeta m1
                        ON
                          p.ID = m1.post_id
                          AND p.post_type = %s
                          AND p.post_mime_type IN (%s, %s, %s)
                          AND m1.meta_key = %s
                        LEFT JOIN $wpdb->postmeta m2
                        ON
                          p.ID = m2.post_id
                          AND m2.meta_key = %s
                        ORDER BY p.ID ASC
                        LIMIT %d, %d;",
					'attachment',
					'image/jpeg', 'image/gif', 'image/tiff',
					'_wp_attached_file',
					'_wp_attachment_image_alt',
					($batch_no - 1) * $batch_size,
					$batch_size
				)
			);

			foreach ( $posts as $media_post ) {

				$wp_media_file_location =$wp_upload_dir['basedir'] . '/' . $media_post->attached_file;

				if (!file_exists($wp_media_file_location)) {
					continue;
				}

				//getting WP media file info
				$media_file = VLS_Gallery_Factory_Admin_Utils::pathinfo( $media_post->attached_file );

				//creating the folder if not exists
				$gf_upload_subdir = $gf_upload_dir . '/' . $media_file['dirname'];
				if ( ! file_exists( $gf_upload_subdir ) ) {
					mkdir( $gf_upload_subdir, 0777, true );
				}

				//finding the unoccupied name for the file (incrementing postfix until success)
				$run         = true;
				$a           = 0;
				$gf_filename = '';
				while ( $run ) {
					$gf_filename = $media_file['filename'] . ( $a > 0 ? '_' . $a : '' ) . '.' . $media_file['extension'];
					if ( ! file_exists( $gf_upload_subdir . '/' . $gf_filename ) ) {
						$run = false;
					}
					$a ++;
				}

				//copying the file to GF uploads
				$gf_file_path = $gf_upload_subdir . '/' . $gf_filename;

				copy($wp_media_file_location, $gf_file_path );

				$file = array(
					'url'         => content_url( VLS_GF_UPLOADS_DIR . '/' . $media_file['dirname'] . '/' . $gf_filename ),
					'file'        => $gf_file_path,
					'type'        => $media_post->mime_type,
					'title'       => $media_post->title,
					'caption'     => $media_post->caption,
					'description' => $media_post->description,
					'alt_text'    => $media_post->alt_text
				);

				//attaching the file to GF
				VLS_Gallery_Factory_Admin_Utils::add_image_file( $file );

			}


			$response = array(
				'result' => 'ok',
				'haveNextBatch'   => (count($posts) == $batch_size),
				'data'   => ''
			);


			//counting images on processing the first batch
			if ($batch_no == 1) {
				$response['totalCount'] = $wpdb->get_var(
					$wpdb->prepare( "
                        SELECT COUNT(*)
                        FROM $wpdb->posts p
                        WHERE p.post_type = %s
                          AND p.post_mime_type IN (%s, %s, %s)
                        LIMIT 1;",
						'attachment',
						'image/jpeg', 'image/gif', 'image/tiff'
					)
				);
			}

			echo( json_encode( $response ) );

			wp_die();

		}

		/**
		 * Returns Image Overview subview
		 *
		 * @param $item_type : accepts 'album', 'unsorted_images', ''.
		 * @param $album_id : ID of the album to be displayed.
		 */
		private function subview_image_overview( $item_type, $album_id ) {

			$album_id = intval( $album_id );

			?>
			<div class="vls-gf-image-panel">
				<ul>
					<?php

					global $wpdb;

					if ( $item_type == 'album' ) {
						$query = "SELECT link.ID as link_id, link.post_name as image_id, IFNULL(url_meta.meta_value, link.guid) as url ";
						$query .= "FROM " . $wpdb->posts . " link ";
						$query .= "LEFT OUTER JOIN " . $wpdb->postmeta . " url_meta ";
						$query .= "ON url_meta.post_id = link.post_name AND url_meta.meta_key = '_vls_gf_url' ";
						$query .= "WHERE link.post_type='" . VLS_GF_POST_TYPE_ALBUM_IMAGE . "' ";
						$query .= "AND link.post_parent = " . $album_id . " ";
						$query .= "ORDER BY link.ID DESC";
					} else if ( $item_type == 'unsorted_images' ) {
						$query = "SELECT 0 as link_id, image.ID as image_id, IFNULL(url_meta.meta_value, image.guid) as url ";
						$query .= "FROM " . $wpdb->posts . " image ";
						$query .= "LEFT OUTER JOIN " . $wpdb->postmeta . " url_meta ";
						$query .= "ON url_meta.post_id = image.ID AND url_meta.meta_key = '_vls_gf_url' ";
						$query .= "LEFT OUTER JOIN " . $wpdb->posts . " link ";
						$query .= "ON link.post_type='" . VLS_GF_POST_TYPE_ALBUM_IMAGE . "' AND CAST(link.post_name AS UNSIGNED) = image.id ";
						$query .= "WHERE image.post_type='" . VLS_GF_POST_TYPE_IMAGE . "' AND link.ID IS NULL ";
						$query .= "ORDER BY image.ID DESC";
					} else { //all images
						$query = "SELECT 0 as link_id, image.ID as image_id, IFNULL(url_meta.meta_value, image.guid) as url ";
						$query .= "FROM " . $wpdb->posts . " image ";
						$query .= "LEFT OUTER JOIN " . $wpdb->postmeta . " url_meta ";
						$query .= "ON url_meta.post_id = image.ID AND url_meta.meta_key = '_vls_gf_url' ";
						$query .= "WHERE image.post_type='" . VLS_GF_POST_TYPE_IMAGE . "' ";
						$query .= "ORDER BY image.ID DESC";
					}

					$posts = $wpdb->get_results( $query );

					foreach ( $posts as $link ) {
						echo( '<li data-vls-gf-image-id="' . $link->image_id . '" '
						      . ( $item_type == 'album' ? 'data-vls-gf-link-id="' . $link->link_id . '"' : '' )
						      . '><a><img src="' . VLS_Gallery_Factory::_get_image_url( $link->url, 'thumbnail' ) . '"/></a></li>' );
					}

					?>
				</ul>
				<div class="clear"></div>
			</div>
			<?php
		}

		/**
		 * Returns Image Overview subview (mockup for the tour presentation)
		 */
		private function subview_image_overview_mockup() {
			?>
			<div class="vls-gf-image-panel">
				<ul>
					<?php
					for ( $a = 1; $a <= 20; $a ++ ) {
						echo( '<li><a></a></li>' );
					}
					?>
				</ul>
				<div class="clear"></div>
			</div>
			<?php
		}


		/**
		 * Deletes folder or album
		 *
		 * @param $item_id : ID of the item to delete
		 */
		private function delete_gallery_item( $item_id ) {

			if ( $item_id <= 0 ) { //just to be sure
				return;
			}

			//recursively delete all child folders
			$query = new WP_Query( array(
				'post_type'   => VLS_GF_POST_TYPE_ALBUM,
				'post_parent' => $item_id
			) );
			if ( $query->have_posts() ) {
				while ( $query->have_posts() ) {
					$query->the_post();
					$child = $query->post;
					$this->delete_gallery_item( $child->ID );
				}
			}

			//recursively delete all child albums
			$query = new WP_Query( array(
				'post_type'   => VLS_GF_POST_TYPE_FOLDER,
				'post_parent' => $item_id
			) );
			if ( $query->have_posts() ) {
				while ( $query->have_posts() ) {
					$query->the_post();
					$child = $query->post;
					$this->delete_gallery_item( $child->ID );
				}
			}

			//recursively delete all child image links
			$query = new WP_Query( array(
				'post_type'   => VLS_GF_POST_TYPE_ALBUM_IMAGE,
				'post_parent' => $item_id,
			) );
			if ( $query->have_posts() ) {
				while ( $query->have_posts() ) {
					$query->the_post();
					$image_link = $query->post;
					wp_delete_post( $image_link->ID, true );
				}
			}

			//delete the post itself
			wp_delete_post( $item_id, true );

		}

		/**
		 * Returns folders and albums subview for displaying in Album Panel
		 *
		 * @param $level_no
		 * @param $parent_id
		 */
		private function output_folder_items( $level_no, $parent_id ) {
			//sanitizing input
			$level_no  = intval( $level_no );
			$parent_id = intval( $parent_id );


			//Maximum level count is limited to 7
			if ( $level_no > 7 ) {
				return;
			}

			global $wpdb;

			$posts = $wpdb->get_results(
				$wpdb->prepare( "
                    SELECT p.ID, p.post_type, p.post_title, p.menu_order
                    FROM $wpdb->posts p
                    WHERE
                      p.post_type IN (%s, %s)
                      AND p.post_parent = %d
                      ORDER BY p.menu_order ASC",
					VLS_GF_POST_TYPE_FOLDER,
					VLS_GF_POST_TYPE_ALBUM,
					$parent_id
				)
			);

			foreach ( $posts as $post ) {

				$itemHtml = '<li class="';

				if ( $post->post_type == VLS_GF_POST_TYPE_FOLDER ) {
					$itemHtml .= 'folder '; // opened
				} else {
					$itemHtml .= 'album ';
				}

				$itemHtml .= 'level-' . $level_no . '" ';
				$itemHtml .= 'data-vls-gf-id="' . $post->ID . '" ';
				$itemHtml .= 'data-vls-gf-level="' . $level_no . '" ';
				$itemHtml .= 'data-vls-gf-order="' . $post->menu_order . '" ';
				$itemHtml .= 'data-vls-gf-shortcode="[vls_gf_album id=&quot;' . $post->ID . '&quot;]"';
				$itemHtml .= '><a href="#"><span class="vls-gf-icon"></span><span class="vls-gf-label">' . $post->post_title . '</span></a></li>';

				echo( $itemHtml );

				if ( $post->post_type == VLS_GF_POST_TYPE_FOLDER ) {
					$this->output_folder_items( $level_no + 1, $post->ID );
				}

			}

		}

		/**
		 * Returns mockup folders and albums for the quick tour presentation
		 */
		private function output_mockup_folder_items() {

			?>
			<li class="folder level-1" data-vls-gf-id="1" data-vls-gf-level="1" data-vls-gf-order="00001"><a href="#"><span
						class="vls-gf-icon"></span><span class="vls-gf-label">Example folder #1</span></a></li>
			<li class="folder level-2" data-vls-gf-id="1"  data-vls-gf-level="2" data-vls-gf-order="00002"><a href="#"><span
						class="vls-gf-icon"></span><span class="vls-gf-label">Example subfolder #1</span></a></li>
			<li class="folder level-2" data-vls-gf-id="1"  data-vls-gf-level="2" data-vls-gf-order="00003"><a href="#"><span
						class="vls-gf-icon"></span><span class="vls-gf-label">Example subfolder #2</span></a></li>
			<li class="album level-3" data-vls-gf-id="1"  data-vls-gf-level="3" data-vls-gf-order="00004" data-vls-gf-id="tour_album"
			    data-vls-gf-shortcode="[vls_gf_album id=&quot;42&quot;]"><a href="#"><span class="vls-gf-icon"></span><span
						class="vls-gf-label">Example album #1</span></a></li>
			<li class="album level-3" data-vls-gf-id="1"  data-vls-gf-level="3" data-vls-gf-order="00005" data-vls-gf-id="tour_album"
			    data-vls-gf-shortcode="[vls_gf_album id=&quot;42&quot;]"><a href="#"><span class="vls-gf-icon"></span><span
						class="vls-gf-label">Example album #2</span></a></li>
			<li class="album level-3" data-vls-gf-id="1"  data-vls-gf-level="3" data-vls-gf-order="00006" data-vls-gf-id="tour_album"
			    data-vls-gf-shortcode="[vls_gf_album id=&quot;42&quot;]"><a href="#"><span class="vls-gf-icon"></span><span
						class="vls-gf-label">Example album #3</span></a></li>
			<li class="folder level-1" data-vls-gf-id="1"  data-vls-gf-level="1" data-vls-gf-order="00007"><a href="#"><span
						class="vls-gf-icon"></span><span class="vls-gf-label">Example folder #2</span></a></li>
			<li class="folder level-1" data-vls-gf-id="1"  data-vls-gf-level="1" data-vls-gf-order="00008"><a href="#"><span
						class="vls-gf-icon"></span><span class="vls-gf-label">Example folder #3</span></a></li>
			<?php

		}

		/**
		 * Renders upload panel and inline script with plupload setup object
		 */
		private function subview_upload_panel() {

			$max_upload_size  = wp_max_upload_size();
			$upload_size_unit = $max_upload_size;
			$sizes            = array( 'KB', 'MB', 'GB' );
			for ( $u = - 1; $upload_size_unit > 1024 && $u < count( $sizes ) - 1; $u ++ ) {
				$upload_size_unit /= 1024;
			}

			if ( $u < 0 ) {
				$upload_size_unit = 0;
				$u                = 0;
			} else {
				$upload_size_unit = (int) $upload_size_unit;
			}

			$plupload_setup = array(
				'file_data_name'      => 'async-upload',
				'flash_swf_url'       => includes_url( 'js/plupload/plupload.flash.swf' ),
				'silverlight_xap_url' => includes_url( 'js/plupload/plupload.silverlight.xap' ),
				'filters'             => array(
					'max_file_size' => $max_upload_size . 'b',
					'mime_types'    => array(
						array( 'title' => "Image files", 'extensions' => 'jpg,gif,png' )
					),
				),
				'url'                 => admin_url( 'admin-ajax.php' ),
				'multipart_params'    => array(
					'_wpnonce' => wp_create_nonce( 'vls-gf-upload' )
				)
			);

			// Multi-file uploading doesn't currently work in iOS Safari,
			// single-file allows the built-in camera to be used as source for images
			if ( wp_is_mobile() ) {
				$plupload_setup['multi_selection'] = false;
			}

			//TODO: move plupload setup data to script localization

			?>

			<script type="text/javascript">
				var vls_plupload_setup_object = <?php echo json_encode($plupload_setup); ?>;
			</script>

			<div id="vls-gf-upload-panel">

			</div>


			<?php
		}


	}
}

return VLS_Gallery_Factory_Admin_AJAX::instance();
