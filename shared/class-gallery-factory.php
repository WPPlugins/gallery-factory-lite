<?php
/**
 * @package   Gallery_Factory_Lite
 * @author    Vilyon Studio <vilyonstudio@gmail.com>
 * @link      http://galleryfactory.vilyon.net
 * @copyright 2015 Vilyon Studio
 *
 * Gallery Factory main class.
 * Contains plugin initialization, activation, update etc.
 */

if (!class_exists('VLS_Gallery_Factory')) {
    final class VLS_Gallery_Factory
    {

        private static $_instance = null;

        /**
         * Constructor of the class. Registering hooks here.
         */
        private function __construct()
        {

            // activation & deactivation hooks
            add_action('activate_gallery-factory/gallery-factory.php', array($this, 'activate'));
            add_action('deactivate_gallery-factory/gallery-factory.php', array($this, 'deactivate'));

            // init hook
            add_action('init', array($this, 'init'));

	        // hook loading plugin's textdomain
	        add_action( 'plugins_loaded', array( $this, 'load_textdomain' ) );


        }

        /**
         * Cloning instances of this class is forbidden.
         */
        private function __clone()
        {
        }

        /**
         * Deserialisation of this class is forbidden.
         */
        private function __wakeup()
        {
        }

        /**
         * Static method for class instantiation
         * @return VLS_Gallery_Factory|null
         */
        public static function instance()
        {
            if (self::$_instance == null) {
                self::$_instance = new self();
            }

            return self::$_instance;
        }


        ######################################################
        ## Public functions (attached to hooks and filters) ##
        ######################################################

        /**
         * Activation routine. Attached to activation hook;
         */
        public function activate()
        {

            if (!current_user_can('activate_plugins'))
	            wp_die();

            if (version_compare($GLOBALS['wp_version'], VLS_GF_MINIMUM_WP_VERSION, '<')) {
	            $message = sprintf( esc_html__( 'Gallery Factory version %1$s requires WordPress %2$s or higher.', VLS_GF_TEXTDOMAIN ), VLS_GF_VERSION, VLS_GF_MINIMUM_WP_VERSION );
                wp_die($message);
            }

            $this->update_database();

            $this->create_options();

            $this->register_post_types();


            //clearing album view cache
            global $wpdb;

            $albums = $wpdb->get_results(
                $wpdb->prepare("
                    SELECT album.ID as ID
                    FROM $wpdb->posts album
                    WHERE album.post_type=%s",
	                VLS_GF_POST_TYPE_ALBUM
                )
            );

            foreach ($albums as $album) {
                VLS_Gallery_Factory_Admin_Utils::clear_view_cache_by_album($album->ID);
            }

            flush_rewrite_rules();

        }

        /**
         * Deactivation routine. Attached to deactivation hook;
         */
        public function deactivate()
        {

            if (!current_user_can('activate_plugins'))
                return;

            // Unregister post type
            global $wp_post_types;

            if (isset($wp_post_types[VLS_GF_POST_TYPE_FOLDER])) {
                unset($wp_post_types[VLS_GF_POST_TYPE_FOLDER]);
            }
            if (isset($wp_post_types[VLS_GF_POST_TYPE_ALBUM])) {
                unset($wp_post_types[VLS_GF_POST_TYPE_ALBUM]);
            }
            if (isset($wp_post_types[VLS_GF_POST_TYPE_IMAGE])) {
                unset($wp_post_types[VLS_GF_POST_TYPE_IMAGE]);
            }
            if (isset($wp_post_types[VLS_GF_POST_TYPE_ALBUM_IMAGE])) {
                unset($wp_post_types[VLS_GF_POST_TYPE_ALBUM_IMAGE]);
            }

            //Reset tour for all users
            $users = get_users(array('fields' => array('ID')));
            if ($users) {
                foreach ($users as $user) {
                    delete_user_option($user->ID, 'vls_gf_no_tour', true);
                }
            }

            flush_rewrite_rules();

        }

        /**
         * Initialization of the plugin. Attached to 'init' hook;
         */
        public function init()
        {
            $this->register_post_types();
        }


        ######################################################
        ## Utils                                            ##
        ######################################################
        /**
         * Returns the url of a downsized image based on the original url.
         * @param $url : URL of the original image
         * @param $type : image type to return
         * @return string
         */
        public static function _get_image_url($url, $type)
        {
            $path_array = explode('/', $url);
            array_splice($path_array, count($path_array) - 1, 0, $type);
            return implode('/', $path_array);
        }


        ######################################################
        ## Private functions (for internal use)             ##
        ######################################################

        /**
         * Sets up the default options used on the settings page
         */
        private function create_options()
        {

            // updating option to overwrite existing value
            update_option('vls_gf_version', VLS_GF_VERSION);

            // adding option to write value only on the first installation
            add_option('vls_gf_db_version', VLS_GF_DB_VERSION);

            // reset checks
            update_option('vls_gf_check_ok', 0);

            // adding other options
            add_option('vls_gf_display_image_info_on_hover', 'disabled');
        }

        /**
         * Registers post types and taxonomies
         */
        private function register_post_types()
        {
            //album post type
            if (!post_type_exists(VLS_GF_POST_TYPE_FOLDER)) {
                register_post_type(VLS_GF_POST_TYPE_FOLDER,
                    array(
                        'labels' => array(
                            'name' => __('Folders', VLS_GF_TEXTDOMAIN),
                            'singular_name' => __('Folder', VLS_GF_TEXTDOMAIN),
                            'add_new_item' => __('Add New Folder', VLS_GF_TEXTDOMAIN),
                            'edit_item' => __('Edit Folder', VLS_GF_TEXTDOMAIN),
                            'new_item' => __('New Folder', VLS_GF_TEXTDOMAIN),
                            'view_item' => __('View Folder', VLS_GF_TEXTDOMAIN),
                            'search_items' => __('Search Folders', VLS_GF_TEXTDOMAIN),
                            'not_found' => __('No folders found', VLS_GF_TEXTDOMAIN),
                            'not_found_in_trash' => __('No folders found in Trash', VLS_GF_TEXTDOMAIN),
                            'parent_item_colon' => __('All Folders', VLS_GF_TEXTDOMAIN)
                        ),
                        'description' => __('Gallery Factory folder', VLS_GF_TEXTDOMAIN),
                        'public' => true,
                        'show_in_menu' => false,
                        'hierarchical' => true,
                        'supports' => array(
                            'title',
                            'author',
                            'editor',
                            'excerpt',
                            'page-attributes'
                        ),
                        'menu-icon' => 'dashicons-format-gallery',
                        'has_archive' => true,
                        'rewrite' => array(
                            'with_front' => false,
                            'slug' => 'folder',
                        )
                    )
                );
            }

            if (!post_type_exists(VLS_GF_POST_TYPE_ALBUM)) {
                register_post_type(VLS_GF_POST_TYPE_ALBUM,
                    array(
                        'labels' => array(
                            'name' => __('Albums', VLS_GF_TEXTDOMAIN),
                            'singular_name' => __('Album', VLS_GF_TEXTDOMAIN),
                            'add_new_item' => __('Add New Album', VLS_GF_TEXTDOMAIN),
                            'edit_item' => __('Edit Album', VLS_GF_TEXTDOMAIN),
                            'new_item' => __('New Album', VLS_GF_TEXTDOMAIN),
                            'view_item' => __('View Album', VLS_GF_TEXTDOMAIN),
                            'search_items' => __('Search Albums', VLS_GF_TEXTDOMAIN),
                            'not_found' => __('No albums found', VLS_GF_TEXTDOMAIN),
                            'not_found_in_trash' => __('No albums found in Trash', VLS_GF_TEXTDOMAIN),
                            'parent_item_colon' => __('All Albums', VLS_GF_TEXTDOMAIN)
                        ),
                        'description' => __('Gallery Factory "gallery" post type', VLS_GF_TEXTDOMAIN),
                        'public' => true,
                        'show_in_menu' => false,
                        'hierarchical' => true,
                        'supports' => array(
                            'title',
                            'author',
                            'editor',
                            'excerpt',
                            'page-attributes'
                        ),
                        'menu-icon' => 'dashicons-format-gallery',
                        'has_archive' => true,
                        'rewrite' => array(
                            'with_front' => false,
                            'slug' => 'album',
                        )
                    )
                );
            }

            //image post type (stores info regarding image file)
            if (!post_type_exists(VLS_GF_POST_TYPE_IMAGE)) {
                register_post_type(VLS_GF_POST_TYPE_IMAGE,
                    array(
                        'labels' => array(
                            'name' => __('Images', VLS_GF_TEXTDOMAIN),
                            'singular_name' => __('Image', VLS_GF_TEXTDOMAIN),
                            'all_items' => __('All Images', VLS_GF_TEXTDOMAIN),
                            'add_new' => __('Add New Image', VLS_GF_TEXTDOMAIN),
                            'add_new_item' => __('Add New Image', VLS_GF_TEXTDOMAIN),
                            'edit_item' => __('Edit Image', VLS_GF_TEXTDOMAIN),
                            'new_item' => __('New Image', VLS_GF_TEXTDOMAIN),
                            'view_item' => __('View Image', VLS_GF_TEXTDOMAIN),
                            'search_items' => __('Search Images', VLS_GF_TEXTDOMAIN),
                            'not_found' => __('No images found', VLS_GF_TEXTDOMAIN),
                            'not_found_in_trash' => __('No images found in Trash', VLS_GF_TEXTDOMAIN),
                            'parent_item_colon' => __('All Images', VLS_GF_TEXTDOMAIN)
                        ),
                        'description' => __('Gallery Factory "image" post type', VLS_GF_TEXTDOMAIN),
                        'public' => true,
                        'show_in_menu' => false,
                        'hierarchical' => false,
                        'supports' => array(
                            'title',
                            'author',
                            'excerpt',
                            'comments',
                            'page-attributes'
                        ),
                        'menu-icon' => 'dashicons-format-gallery',
                        'has_archive' => true,
                        'rewrite' => array(
                            'with_front' => false,
                            'slug' => 'image',
                        )
                    )
                );
            }

            //gallery-image link post type (used for linking images to galleries and storing gallery-related image data)
            if (!post_type_exists(VLS_GF_POST_TYPE_ALBUM_IMAGE)) {
                register_post_type(VLS_GF_POST_TYPE_ALBUM_IMAGE,
                    array(
                        'description' => __('Gallery Factory "gallery image link" post type', VLS_GF_TEXTDOMAIN),
                        'public' => false,
                        'hierarchical' => true,
                        'supports' => array(
                            'title'
                        )
                    )
                );
            }
        }


	    /**
	     * Loads plugin textdomain.
	     */
	    function load_textdomain() {
		    $result = load_plugin_textdomain( VLS_GF_TEXTDOMAIN, false, 'gallery-factory/languages' );
	    }

        /**
         * Updates database to the current version
         */
        private function update_database()
        {
            //Disabling PHP timeout for the updating process
            set_time_limit(0);

            $current_db_ver = get_option('vls_gf_db_version');

            //if no previous version found (fresh install), just write the current version to the option
            if (!$current_db_ver) {
                update_option('vls_gf_db_version', VLS_GF_DB_VERSION);
            } else { // else updating database
                $current_db_ver = intval($current_db_ver);

                // run update routines until the current version number reaches the target version number
                while ($current_db_ver < VLS_GF_DB_VERSION) {

                    // increment the current db_ver by one
                    $current_db_ver++;

                    // run update function for each version increment
                    $func = "update_database_to_ver_{$current_db_ver}";
                    if (method_exists($this, $func)) {
                        call_user_func(array($this, $func));
                    }

                    // update the option in the database, so that this process can always
                    // pick up where it left off
                    update_option('vls_gf_db_version', $current_db_ver);
                }
            }
        }

    }
}

return VLS_Gallery_Factory::instance();
