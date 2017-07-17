<?php
/**
 * @package   Gallery_Factory_Lite
 * @author    Vilyon Studio <vilyonstudio@gmail.com>
 * @link      http://galleryfactory.vilyon.net
 * @copyright 2015 Vilyon Studio
 *
 * Class contains admin-related functionality.
 */

if ( ! class_exists( "VLS_Gallery_Factory_Admin" ) ) {
	class VLS_Gallery_Factory_Admin {

		private static $_instance = null;

		/**
		 * Constructor of the class. Registering hooks here.
		 */
		private function __construct() {

			// admin_init hook
			add_action( 'admin_init', array( $this, 'init' ) );

			// admin_menu hook
			add_action( 'admin_menu', array( $this, 'create_menu' ) );

			// admin_enqueue_scripts hook
			add_action( 'admin_enqueue_scripts', array( $this, 'load_scripts' ) );
			add_action( 'admin_enqueue_scripts', array( $this, 'load_stylesheets' ) );

			// admin_footer hook
			add_action( 'admin_footer', array( $this, 'print_admin_footer' ) );
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

		public static function instance() {
			if ( self::$_instance == null ) {
				self::$_instance = new self();
			}

			return self::$_instance;
		}

		/**
		 * Function is attached to 'init' hook
		 */
		public function init() {

			add_filter( 'upload_dir', array( $this, 'filter_upload_dir' ) );
			register_setting( 'vls-gallery-factory', 'vls_gf_display_image_info_on_hover' );


			//adding hooks on update of some global options, with require album view cache reset
			//TODO: find a way to fire cache clear just once if multiple options are changed
			add_action( "update_option_vls_gf_display_image_info_on_hover", array(
				$this,
				'clear_all_albums_view_cache'
			) );

			add_action( 'admin_notices', array( $this, 'system_check_admin_notice' ) );
			add_action( 'admin_post_vls_gf_import_nextgen', array( $this, 'do_import_nextgen' ) );

			//register filters for adding TinyMCE button
			add_action( 'before_wp_tiny_mce', array( $this, 'tinymce_output_l10n' ) );
			add_filter( 'mce_external_plugins', array( $this, 'tinymce_register_plugin' ) );
			add_filter( 'mce_buttons', array( $this, 'tinymce_register_buttons' ) );

		}

		/**
		 * Creates main menu item and settings menu item
		 */
		public function create_menu() {
			$minimumCapability = 'edit_pages'; //'read'

			// Top level menu item
			add_menu_page( 'Gallery Manager', 'Gallery Factory', $minimumCapability, 'vls_gf_gallery_manager', array(
				$this,
				'display_page_gallery_manager'
			), 'dashicons-format-gallery', '21.84' );

			add_options_page( 'Gallery Factory Options', 'Gallery Factory', 'manage_options', 'vls_gf_options', array(
				$this,
				'display_page_settings'
			) );

			add_management_page( 'Gallery Factory Tools', 'Gallery Factory', 'import', 'vls_gf_tools', array(
				$this,
				'display_page_tools'
			) );

		}

		/**
		 * Loads admin scripts
		 */
		public function load_scripts() {

			$screen = get_current_screen();

			//registering scripts only for Gallery Manager page
			if ( 'toplevel_page_vls_gf_gallery_manager' == $screen->id ) {

				wp_register_script(
					'jquery-ui-plupload',
					VLS_GF_PLUGIN_URL . 'lib/jquery-ui-plupload/jquery.ui.plupload' . ( WP_DEBUG ? '' : '.min' ) . '.js',
					array(
						'jquery',
						'plupload',
						'jquery-ui-widget',
						'jquery-ui-button',
						'jquery-ui-progressbar',
						'jquery-ui-sortable'
					),
					false, true );

				wp_register_script(
					'vls-gf-gallery-manager',
					VLS_GF_PLUGIN_URL . 'admin/js/gallery-manager' . ( WP_DEBUG ? '' : '.min' ) . '.js',
					array(
						'jquery',
						'jquery-touch-punch',
						'jquery-ui-draggable',
						'jquery-ui-droppable',
						'jquery-ui-resizable',
						'jquery-ui-plupload',
						'post'
					),
					VLS_GF_VERSION, true );

				$data = array(
					'nonce'        => wp_create_nonce( "vls-gf-nonce" ),
					'l10n'         => array(
						'strAllImages'                  => _x( 'All images', 'full', VLS_GF_TEXTDOMAIN ),
						'strUnsortedImages'             => _x( 'Unsorted images', 'full', VLS_GF_TEXTDOMAIN ),
						'btnSave'                       => __( 'Save', VLS_GF_TEXTDOMAIN ),
						'btnCancel'                     => __( 'Cancel', VLS_GF_TEXTDOMAIN ),
						'strImageDetails'               => __( 'Image Details', VLS_GF_TEXTDOMAIN ),
						'strRenameHeader'               => __( 'Rename item', VLS_GF_TEXTDOMAIN ),
						'strRenameAction'               => __( 'Rename', VLS_GF_TEXTDOMAIN ),
						'strRenameLabel'                => __( 'New name', VLS_GF_TEXTDOMAIN ),
						'strCreateAlbumHeader'          => __( 'New album', VLS_GF_TEXTDOMAIN ),
						'strCreateAlbumAction'          => __( 'Create', VLS_GF_TEXTDOMAIN ),
						'strCreateAlbumLabel'           => __( 'Album name', VLS_GF_TEXTDOMAIN ),
						'strCreateFolderHeader'         => __( 'New folder', VLS_GF_TEXTDOMAIN ),
						'strCreateFolderAction'         => __( 'Create', VLS_GF_TEXTDOMAIN ),
						'strCreateFolderLabel'          => __( 'Folder name', VLS_GF_TEXTDOMAIN ),
						'strConfirmDeleteHeader'        => __( 'Confirm delete', VLS_GF_TEXTDOMAIN ),
						'strDeleteFolderAction'         => __( 'Delete', VLS_GF_TEXTDOMAIN ),
						'strConfirmDeleteAlbumMessage'  => __( 'Delete album %1$s? ', VLS_GF_TEXTDOMAIN ),
						'strConfirmDeleteFolderMessage' => __( 'Delete folder %1$s and all its descendants?', VLS_GF_TEXTDOMAIN )
					),
					'pluploadL10n' => array(
						'Drag files here'                                                                => _x( 'Drag files here', 'plupload', VLS_GF_TEXTDOMAIN ),
						'Add Files'                                                                      => _x( 'Add Files', 'plupload', VLS_GF_TEXTDOMAIN ),
						'Start Upload'                                                                   => _x( 'Start Upload', 'plupload', VLS_GF_TEXTDOMAIN ),
						'Stop Upload'                                                                    => _x( 'Stop Upload', 'plupload', VLS_GF_TEXTDOMAIN ),
						'Cancel'                                                                         => _x( 'Cancel', 'plupload', VLS_GF_TEXTDOMAIN ),
						'File: %1$s'                                                                     => _x( 'File: %1$s', 'plupload', VLS_GF_TEXTDOMAIN ),
						'File: %1$s, size: %2$d, max file size: %3$d'                                    => _x( 'File: %1$s, size: %2$d, max file size: %3$d', 'plupload', VLS_GF_TEXTDOMAIN ),
						'%1$s already present in the queue.'                                             => _x( '%1$s already present in the queue.', 'plupload', VLS_GF_TEXTDOMAIN ),
						'Upload element accepts only %1$d file(s) at a time. Extra files were stripped.' => _x( 'Upload element accepts only %1$d file(s) at a time. Extra files were stripped.', 'plupload', VLS_GF_TEXTDOMAIN ),
						'Image format either wrong or not supported.'                                    => _x( 'Image format either wrong or not supported.', 'plupload', VLS_GF_TEXTDOMAIN ),
						'Close'                                                                          => _x( 'Close', 'plupload', VLS_GF_TEXTDOMAIN ),
						'Uploaded %d/%d files'                                                           => _x( 'Uploaded %d/%d files', 'plupload', VLS_GF_TEXTDOMAIN ),
						'kb'                                                                             => _x( 'kb', VLS_GF_TEXTDOMAIN ),
						'mb'                                                                             => _x( 'mb', VLS_GF_TEXTDOMAIN ),
						'gb'                                                                             => _x( 'gb', VLS_GF_TEXTDOMAIN )
					)
				);
				wp_localize_script( 'vls-gf-gallery-manager', 'vlsGfGalleryAdminData', $data );

				wp_enqueue_script( 'vls-gf-gallery-manager' );

				//activating quick tour if not disabled
				if ( ! get_user_option( 'vls_gf_no_tour' ) ) {
					wp_enqueue_script(
						'vls-gf-gallery-manager-tour',
						VLS_GF_PLUGIN_URL . 'admin/js/gallery-manager-tour' . ( WP_DEBUG ? '' : '.min' ) . '.js',
						array( 'jquery', 'vls-gf-gallery-manager' ),
						VLS_GF_VERSION, true );
				}

			}
			else if ( 'tools_page_vls_gf_tools' == $screen->id ) {

				wp_register_script(
					'vls-gf-tools-page',
					VLS_GF_PLUGIN_URL . 'admin/js/tools-page' . ( WP_DEBUG ? '' : '.min' ) . '.js',
					array(
						'jquery'
					),
					VLS_GF_VERSION, true );

				$data = array(
					'nonce' => wp_create_nonce( "vls-gf-nonce" ),
					'l10n'  => array()
				);
				wp_localize_script( 'vls-gf-tools-page', 'vlsGfScriptData', $data );

				wp_enqueue_script( 'vls-gf-tools-page' );

			}

		}

		/**
		 * Loads admin stylesheets
		 */
		public function load_stylesheets() {

			$screen = get_current_screen();

			//loading GF stylesheets for Gallery Manager page only
			if ( 'toplevel_page_vls_gf_gallery_manager' == $screen->id ) {

				wp_enqueue_style( 'vls-gf-plupload-style', VLS_GF_PLUGIN_URL . 'admin/css/plupload.css' );

				wp_enqueue_style( 'vls-gf-admin-style', VLS_GF_PLUGIN_URL . 'admin/css/style.css' );

				//activating quick tour style if not disabled
				if ( ! get_user_option( 'vls_gf_no_tour' ) ) {
					wp_enqueue_style( 'vls-gf-admin-style-tour', VLS_GF_PLUGIN_URL . 'admin/css/style-tour.css' );
				}

				//here we rely on wp function to guess touch-enabled device and attach css with touch optimizations //TODO: consider using custom function
				if ( wp_is_mobile() ) {
					wp_enqueue_style( 'vls-gf-admin-style-touch', VLS_GF_PLUGIN_URL . 'admin/css/style-touch.css', array( 'vls-gf-admin-style' ) );
				}

			}
		}

		/**
		 * Prints admin footer
		 */
		public function print_admin_footer() {
		}

		/**
		 * Adds a plugin to the TinyMCE editor
		 *
		 * @param $plugin_array
		 *
		 * @return mixed
		 */
		function tinymce_register_plugin( $plugin_array ) {
			$plugin_array['vls_gf_buttons'] = VLS_GF_PLUGIN_URL . 'admin/js/tinymce-plugin.js';

			//add GF stylesheet for the pages with TinyMCE editor
			wp_enqueue_style( 'vls-gf-admin-style', VLS_GF_PLUGIN_URL . 'admin/css/style.css' );

			return $plugin_array;
		}

		/**
		 * Registers a button for a TinyMCE editor
		 *
		 * @param $buttons
		 *
		 * @return mixed
		 */
		function tinymce_register_buttons( $buttons ) {
			array_push( $buttons, 'vls_gf_album' );

			return $buttons;
		}

		function tinymce_output_l10n() {
			echo "<script type=\"text/javascript\">";
			echo "var vlsGfTinymceL10n = { ";
			echo "btnInsertGFAlbum: '" . __( 'Insert Gallery Factory Album', VLS_GF_TEXTDOMAIN ) . "', ";
			echo "btnCancel: '" . __( 'Cancel', VLS_GF_TEXTDOMAIN ) . "', ";
			echo "strSelectAlbum: '" . __( 'Select an album to insert', VLS_GF_TEXTDOMAIN ) . "' ";
			echo "};</script>";
		}

		/**
		 * Performs system checks and notifies the admin if any problem is found
		 */
		public function system_check_admin_notice() {

			//display notice only in Gallery Manager
			$screen = get_current_screen();
			if ( 'toplevel_page_vls_gf_gallery_manager' != $screen->id ) {
				return;
			}

			//if check is already done, bail out
			if ( get_option( 'vls_gf_check_ok' ) ) {
				return;
			}

			$check_ok = false;

			//check if WP has the right to create all needed folders
			$path = WP_CONTENT_DIR . VLS_GF_UPLOADS_DIR;

			if ( ! is_dir( $path ) ) {
				if ( is_writable( WP_CONTENT_DIR ) ) {
					mkdir( $path, 0777, true );
				}
			}

			if ( is_dir( $path ) && is_writable( $path ) ) {
				if ( mkdir( $path . '/test', 0777, true ) ) {
					if ( is_dir( $path . '/test' ) ) {
						rmdir( $path . '/test' );
						$check_ok = true;
					}
				}
			}


			if ( $check_ok ) {
				update_option( 'vls_gf_check_ok', 1 );
			}
			else {
				//display the notice
				$class   = "error";
				$message = 'Gallery Factory could not create the folder "gf-uploads" in the "wp-content" folder or create its subfolders. Please check the permissions and reload this page to check if the notice remains.';
				echo "<div class=\"$class\"> <p>$message</p></div>";
			}


		}

		###############################################################
		## Pages (functions for rendering and processing admin pages ##
		###############################################################


		/**
		 * Displays settings page
		 */
		public function display_page_settings() {

			ob_start();
			require( VLS_GF_PLUGIN_DIR . 'admin/templates/tmpl-settings.php' );
			echo ob_get_clean();

		}

		/**
		 * Displays tools page
		 */
		public function display_page_tools() {

			wp_enqueue_script( 'jquery' );

			ob_start();
			require( VLS_GF_PLUGIN_DIR . 'admin/templates/tmpl-tools.php' );
			echo ob_get_clean();

		}


		/**
		 * Displays gallery manager page
		 */
		public function display_page_gallery_manager() {

			require( VLS_GF_PLUGIN_DIR . 'admin/templates/tmpl-gallery-manager.php' );

		}

		###############################################################
		## Filters                                                   ##
		###############################################################

		/**
		 * Attached to 'upload_dir' filter. Sets upload directory for GF uploads.
		 *
		 * @param $dir_options
		 *
		 * @return mixed
		 */
		public function filter_upload_dir( $dir_options ) {

			//TODO: consider adding user-defined option here instead of hardcoded path
			if ( isset( $_REQUEST['action'] ) && 'vls_gf_async_upload' == $_REQUEST['action'] ) {
				$subdir                 = $dir_options['subdir'];
				$dir_options['subdir']  = $subdir;
				$dir_options['basedir'] = WP_CONTENT_DIR . VLS_GF_UPLOADS_DIR;
				$dir_options['path']    = $dir_options['basedir'] . $subdir;
				$dir_options['baseurl'] = WP_CONTENT_URL . VLS_GF_UPLOADS_DIR;
				$dir_options['url']     = $dir_options['baseurl'] . $subdir;
			}

			return $dir_options;

		}

		###############################################################
		## Other                                                     ##
		###############################################################


		/**
		 * Clears the album view cache. Attached to the update_option_ hook.
		 */
		public function clear_all_albums_view_cache() {

			global $wpdb;

			$albums = $wpdb->get_results(
				$wpdb->prepare( "
                    SELECT album.ID as ID
                    FROM $wpdb->posts album
                    WHERE album.post_type=%s",
					VLS_GF_POST_TYPE_ALBUM
				)
			);

			foreach ( $albums as $album ) {
				VLS_Gallery_Factory_Admin_Utils::clear_view_cache_by_album( $album->ID );
			}
		}

		public function do_import_nextgen() {

			//remove time limit so this long-running script won't be interrupted by timeout
			set_time_limit( 0 );

			global $wpdb;

			$create_ngg_root_folder = false;
			if ( isset( $_POST['vls_gf_create_folder'] ) && $_POST['vls_gf_create_folder'] == 'true' ) {
				$create_ngg_root_folder = true;
			}


			//check if the NGG table exist
			if ( $wpdb->get_var( "SHOW TABLES LIKE 'wp_ngg_album'" ) != 'wp_ngg_album' ) {
				wp_redirect( 'tools.php?page=vls_gf_tools&status=nonextgen' );
				exit;
			}

			$gf_items       = array();
			$tmp_id         = 0;
			$current_tmp_id = 0;

			$time       = current_time( 'mysql' );
			$upload_dir = wp_upload_dir( $time );
			$upload_dir = VLS_GF_UPLOADS_DIR . $upload_dir['subdir'];


			//region Map NGG albums to GF folders

			$ngg_albums = $wpdb->get_results(
				"
                    SELECT *
                    FROM wp_ngg_album
                    "
			);

			foreach ( $ngg_albums as $ngg_album ) {
				$ngg_id            = intval( $ngg_album->id );
				$ngg_name          = $ngg_album->name;
				$ngg_description   = $ngg_album->albumdesc;
				$sortorder         = $ngg_album->sortorder;
				$sortorder_decoded = str_replace( "[", "", str_replace( "]", "", base64_decode( $sortorder ) ) );
				$sortorder_array   = explode( ",", $sortorder_decoded );

				//if folder is already added to GF array (probably multiple instances), then update its properties
				$is_found = false;
				foreach ( $gf_items as $key => $value ) {
					if ( $value['type'] == 'folder' && $value['ngg_id'] == $ngg_id ) {
						$gf_items[ $key ]['title']       = $ngg_name;
						$gf_items[ $key ]['description'] = $ngg_description;
						$gf_items[ $key ]['loaded']      = 1;
						$is_found                        = true;
					}
				}

				//if not found, create a new folder
				if ( ! $is_found ) {
					$tmp_id ++;
					$new_item                  = array();
					$new_item['type']          = 'folder';
					$new_item['tmp_id']        = $tmp_id;
					$new_item['ngg_id']        = $ngg_id;
					$new_item['title']         = $ngg_name;
					$new_item['description']   = $ngg_description;
					$new_item['parent_tmp_id'] = 0;
					$new_item['parents']       = array();
					$new_item['loaded']        = 1;
					array_push( $gf_items, $new_item );
				}

				//loop through GF instances of the current folder and add child items to each
				if ( ! empty( $sortorder_decoded ) ) {
					foreach ( $gf_items as $key => $value ) {

						if ( $value['type'] == 'folder' && $value['ngg_id'] == $ngg_id ) {

							$current_tmp_id = $value['tmp_id'];

							//add current level parent to the parents array
							$parents = $value['parents'];
							array_push( $parents, $ngg_id );

							// loop through NGG child items
							foreach ( $sortorder_array as $sort ) {

								$sort = str_replace( "\"", "", $sort );


								//child item is an NGG album
								if ( substr( $sort, 0, 1 ) == "a" ) {
									$ngg_child_id = intval( substr( $sort, 1 ) );
									$item_type    = 'folder';
								}
								else {
									$ngg_child_id = intval( $sort );
									$item_type    = 'album';
								}

								//if the current item is a folder and is found in parent graph, ignore it
								if ( $item_type == 'folder' ) {
									$is_found = false;
									foreach ( $parents as $key => $value ) {
										if ( $value == $ngg_child_id ) {
											$is_found = true;
										}
									}
									if ( $is_found ) {
										continue;
									}
								}

								//lookup this item in GF array
								//if found and it doesn't already has a parent, then set a parent
								$is_found = false;
								foreach ( $gf_items as $key => $value ) {
									if ( $value['type'] == $item_type && $value['ngg_id'] == $ngg_child_id && $value['parent_tmp_id'] == 0 ) {
										$is_found                          = true;
										$gf_items[ $key ]['parent_tmp_id'] = $current_tmp_id;
										$gf_items[ $key ]['parents']       = $parents;
									}
								}

								//else create a new folder
								if ( ! $is_found ) {
									$tmp_id ++;

									$new_item                  = array();
									$new_item['type']          = $item_type;
									$new_item['tmp_id']        = $tmp_id;
									$new_item['ngg_id']        = $ngg_child_id;
									$new_item['title']         = '';
									$new_item['description']   = '';
									$new_item['parent_tmp_id'] = $current_tmp_id;
									$new_item['parents']       = $parents;
									$new_item['loaded']        = 0;

									//if already have loaded this folder, get its attributes
									foreach ( $gf_items as $key => $value ) {
										if ( $value['type'] == $item_type && $value['ngg_id'] == $ngg_child_id && $value['loaded'] == 1 ) {
											$new_item['title']       = $value['title'];
											$new_item['description'] = $value['description'];
											$new_item['loaded']      = 1;
											break;
										}
									}

									array_push( $gf_items, $new_item );

								}


							} //end loop through NGG child items
						}

					} // end loop by GF instances of the current folder
				}
			}

			//endregion

			//region Map NGG galleries to GF albums

			$ngg_galleries = $wpdb->get_results(
				"
                    SELECT *
                    FROM wp_ngg_gallery
                    "
			);


			foreach ( $ngg_galleries as $ngg_gallery ) {

				$ngg_id          = intval( $ngg_gallery->gid );
				$ngg_name        = $ngg_gallery->name;
				$ngg_description = $ngg_gallery->galdesc;

				//if album is already added to GF array (probably multiple instances), then update its properties
				$is_found = false;
				foreach ( $gf_items as $key => $value ) {
					if ( $value['type'] == 'album' && $value['ngg_id'] == $ngg_id ) {
						$gf_items[ $key ]['title']       = $ngg_name;
						$gf_items[ $key ]['description'] = $ngg_description;
						$gf_items[ $key ]['loaded']      = 1;
						$is_found                        = true;
					}
				}

				//if not found, create a new album
				if ( ! $is_found ) {

					$tmp_id ++;
					$new_item                  = array();
					$new_item['type']          = 'album';
					$new_item['tmp_id']        = $tmp_id;
					$new_item['ngg_id']        = $ngg_id;
					$new_item['title']         = $ngg_name;
					$new_item['description']   = $ngg_description;
					$new_item['parent_tmp_id'] = 0;
					$new_item['parents']       = array();
					$new_item['loaded']        = 1;
					array_push( $gf_items, $new_item );

				}

			}

			//endregion

			//region Calculate sort order

			$sort_order = ( $create_ngg_root_folder == true ) ? 1 : 0;

			$this->import_nextgen_calculate_sort_order( $sort_order, $gf_items, 0 );

			//endregion

			//region Write GF folders to database

			// sorting by order
			$order_array = array();
			foreach ( $gf_items as $key => $item ) {
				$order_array[ $key ] = $item['gf_sort_order'];
			}
			array_multisort( $order_array, SORT_ASC, $gf_items );

			//get last order
			$last_order = $wpdb->get_var(
				$wpdb->prepare( "
                            SELECT MAX(link.menu_order)
                            FROM $wpdb->posts link
                            WHERE link.post_type IN (%s, %s)",
					VLS_GF_POST_TYPE_FOLDER,
					VLS_GF_POST_TYPE_ALBUM
				)
			);
			if ( $last_order == null ) {
				$last_order = 0;
			}

			//create root folder if needed
			$root_id = 0;
			if ( $create_ngg_root_folder == true ) {
				$post_data = array(
					'post_title'  => 'NextGen',
					'post_type'   => VLS_GF_POST_TYPE_FOLDER,
					'post_parent' => 0,
					'post_status' => 'draft',
					'menu_order'  => $last_order + 1
				);

				$root_id = wp_insert_post( $post_data );
			}

			//create items
			foreach ( $gf_items as $key => $value ) {

				$post_data = array(
					'post_title'       => $value['title'],
					'post_description' => $value['description'],
					'post_type'        => $value['type'] == 'folder' ? VLS_GF_POST_TYPE_FOLDER : VLS_GF_POST_TYPE_ALBUM,
					'post_parent'      => $root_id,
					'post_status'      => 'draft',
					'menu_order'       => $last_order + $value['gf_sort_order']
				);

				$id = wp_insert_post( $post_data );

				$gf_items[ $key ]['gf_id'] = $id;

			}

			//update folder parents
			foreach ( $gf_items as $key => $value ) {
				foreach ( $gf_items as $parent_key => $parent_value ) {
					if ( $parent_value['tmp_id'] == $value['parent_tmp_id'] ) {
						$post_data = array(
							'ID'          => $value['gf_id'],
							'post_parent' => $parent_value['gf_id']
						);
						wp_update_post( $post_data );
					}
				}
			}

			//endregion

			//region Import images
			$ngg_pictures = $wpdb->get_results( "
				SELECT p.*, g.path AS path
				FROM " . $wpdb->prefix . "ngg_pictures p
				INNER JOIN " . $wpdb->prefix . "ngg_gallery g
				ON p.galleryid = g.gid
				ORDER BY galleryid ASC, sortorder ASC
			" );


			foreach ( $ngg_pictures as $ngg_picture ) {

				$ngg_id          = intval( $ngg_picture->pid );
				$ngg_gallery_id  = intval( $ngg_picture->galleryid );
				$ngg_alttext     = $ngg_picture->alttext;
				$ngg_description = $ngg_picture->description;
				$ngg_filename    = $ngg_picture->filename;
				$ngg_path        = ABSPATH . $ngg_picture->path . '/' . $ngg_filename;

				//skipping the image if the file doesn't exist
				if ( ! file_exists( $ngg_path ) ) {
					continue;
				}

				//get mime type
				$ngg_path_mime = wp_check_filetype( $ngg_path );

				//get the unique filename for the GF location
				$gf_filename = wp_unique_filename( WP_CONTENT_DIR . $upload_dir, $ngg_filename );
				$gf_path     = WP_CONTENT_DIR . $upload_dir . '/' . $gf_filename;

				//copy the original image
				$r = copy( $ngg_path, $gf_path );

				//
				$gf_image_id = 0;
				foreach ( $gf_items as $gf_item ) {

					if ( $gf_item['type'] == 'album' && $gf_item['ngg_id'] == $ngg_gallery_id ) {

						if ( $gf_image_id == 0 ) {

							$file = array(
								'url'         => content_url( $upload_dir . '/' . $gf_filename ),
								'file'        => $gf_path,
								'type'        => $ngg_path_mime['type'],
								'title'       => $ngg_alttext,
								'caption'     => $ngg_alttext,
								'description' => $ngg_description,
								'alt_text'    => $ngg_alttext
							);

							//attaching the file to GF
							$gf_image_id = VLS_Gallery_Factory_Admin_Utils::add_image_file( $file, $gf_item['gf_id'] );

						}
						else {

							$images = array( $gf_image_id );

							VLS_Gallery_Factory_Admin_Utils::move_images_to_album( 0, $gf_item['gf_id'], $images );

						}
					}
				}


			}


			//endregion

			wp_redirect( 'tools.php?page=vls_gf_tools&status=done' );
			exit;

		}

		private function import_nextgen_calculate_sort_order(
			& $sort_order, & $gf_items, $parent_id
		) {

			foreach ( $gf_items as $key => $value ) {
				if ( $value['parent_tmp_id'] == $parent_id ) {

					$sort_order ++;
					$gf_items[ $key ]['gf_sort_order'] = $sort_order;

					$this->import_nextgen_calculate_sort_order( $sort_order, $gf_items, $value['tmp_id'] );
				}

			}

			return;
		}

	}
}

return VLS_Gallery_Factory_Admin::instance();