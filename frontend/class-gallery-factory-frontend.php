<?php
/**
 * @package   Gallery_Factory_Lite
 * @author    Vilyon Studio <vilyonstudio@gmail.com>
 * @link      http://galleryfactory.vilyon.net
 * @copyright 2015 Vilyon Studio
 *
 * Class contains frontend-related functionality.
 */

if (!class_exists("VLS_Gallery_Factory_Frontend")) {
    /**
     * Class VLS_Gallery_Factory_Frontend
     */
    class VLS_Gallery_Factory_Frontend
    {

        private static $_instance = null;

        /**
         * Constructor of the class. Registering hooks here.
         */
        private function __construct()
        {

            // register shortcodes
            add_shortcode('vls_gf_album', array($this, 'shortcode_handler_vls_gf_album'));

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
         * Static method for getting class instance
         * @return null|VLS_Gallery_Factory_Frontend
         */
        public static function instance()
        {
            if (self::$_instance == null) {
                self::$_instance = new self();
            }

            return self::$_instance;
        }

        /**
         * Loads stylesheets
         */
        public function load_stylesheets()
        {
            wp_register_style('vls-gf-imagelightbox-style', VLS_GF_PLUGIN_URL . 'frontend/css/imagelightbox.css');
            wp_register_style('vls-gf-style', VLS_GF_PLUGIN_URL . 'frontend/css/style.css', array('vls-gf-imagelightbox-style'));
            wp_enqueue_style('vls-gf-style');
        }

        /**
         * Loads front-end scripts
         */
        public function load_scripts()
        {
            wp_register_script('vls-gf-imagelightbox', VLS_GF_PLUGIN_URL . 'frontend/js/imagelightbox' . (WP_DEBUG ? '' : '.min') . '.js', array('jquery'), VLS_GF_VERSION, true);
            wp_register_script('vls-gf-frontend-script', VLS_GF_PLUGIN_URL . 'frontend/js/script' . (WP_DEBUG ? '' : '.min') . '.js', array('jquery', 'vls-gf-imagelightbox'), VLS_GF_VERSION, true);
            wp_enqueue_script('vls-gf-frontend-script');
        }

        ###############################################################
        ## shortcode handlers ##
        ###############################################################

        /**
         * Processes [vls_gf_album] shortcode
         * @param $atts : attributes specified in the shortcode
         * @return string
         */
        public function shortcode_handler_vls_gf_album($atts)
        {

            //getting and sanitizing shortcode attributes
            $atts = shortcode_atts(
                array(
                    'id' => 0
                ),
                $atts
            );
            $album_id = intval($atts['id']);

            $this->load_stylesheets();
            $this->load_scripts();

            return $this->get_album_html($album_id);

        }

        /**
         *  Returns album html
         */
        public function get_album_html($album_id)
        {

            if ($album_id <= 0) {
                return '';
            }

            $view = $this->get_album_view($album_id);
            return $view['container_open'] . $view['pages'][0] . $view['container_close'];

        }


        /**
         * The function first tries to get html from cached value, if failed calls html generation
         * @param $album_id
         * @return array
         */
        function get_album_view($album_id)
        {

            // trying to retrieve the pre-generated view
            $view = get_post_meta($album_id, '_vls_gf_album_view', true);

            // if no view found, then render it and save to the meta
            if (empty($view)) {
                $view = $this->render_album($album_id);

                if ($view) {
                    add_post_meta($album_id, '_vls_gf_album_view', $view, true);
                }

            }

            return $view;

        }


        /**
         * Renders album html
         */

        public function render_album($album_id)
        {

            global $wpdb;

            if ($album_id <= 0) {
                return '<p><strong>Gallery Factory Error: album ID is not set</strong></p>';
            }

            $album = get_post($album_id);

            //if an album is not found, display the error message
            if ($album === null) {
                return '<p><strong>Gallery Factory Error: album with ID "' . $album_id . '" not found</strong></p>';
            }

            $album_layout_meta = get_post_meta($album_id, '_vls_gf_layout_meta', true);

            $album_item_meta = get_post_meta($album_id, '_vls_gf_item_meta', true);

            //getting display options, globals with album-specific overrides if provided
            $album->display_image_info_on_hover = (
                empty($album_item_meta) || !array_key_exists('display_image_info_on_hover', $album_item_meta) || (
                    array_key_exists('display_image_info_on_hover', $album_item_meta)
                    && $album_item_meta['display_image_info_on_hover'] == 'global'
                )) ? get_option('vls_gf_display_image_info_on_hover') : $album_item_meta['display_image_info_on_hover'];


            // Class for info display
            $album->info_display_class = 'vls-gf-album-info-none';
            if ($album->display_image_info_on_hover == 'caption') {
                $album->info_display_class = 'vls-gf-album-info-caption';
            } else if ($album->display_image_info_on_hover == 'all') {
                $album->info_display_class = 'vls-gf-album-info-all';
            }


            //getting album images
            $images = $wpdb->get_results(
                $wpdb->prepare("
                    SELECT
                      link.ID as link_id, link.post_name as image_id, link.guid as url,
                      image.post_excerpt as caption, image.post_content as description
                    FROM $wpdb->posts link
                    INNER JOIN $wpdb->posts image
                    ON
                      link.post_type=%s
                      AND image.post_type=%s
                      AND CAST(link.post_name AS UNSIGNED) = image.id
                      AND link.post_parent = %d
                    ORDER BY link.menu_order ASC",
                    VLS_GF_POST_TYPE_ALBUM_IMAGE,
                    VLS_GF_POST_TYPE_IMAGE,
                    $album_id
                )
            );

            //preparing image data
            foreach ($images as $image) {

                $image->url_preview_m = VLS_Gallery_Factory::_get_image_url($image->url, 'preview-m');

                $image->alt_text = get_post_meta($image->image_id, '_vls_gf_image_alt_text', true);

                $image_post_meta = get_post_meta($image->image_id, '_vls_gf_image_meta', true);

	            $image->width  = isset( $image_post_meta['preview_width'] ) ? $image_post_meta['preview_width'] : $image_post_meta['width'];
	            $image->height = isset( $image_post_meta['preview_height'] ) ? $image_post_meta['preview_height'] : $image_post_meta['height'];

                $image_layout_meta = get_post_meta($image->link_id, '_vls_gf_layout_meta', true);
                $image->col = isset($image_layout_meta['col']) ? $image_layout_meta['col'] : 0;
                $image->row = isset($image_layout_meta['row']) ? $image_layout_meta['row'] : 0;
                $image->metro_w = isset($image_layout_meta['metro_w']) ? $image_layout_meta['metro_w'] : 1;
                $image->metro_h = isset($image_layout_meta['metro_h']) ? $image_layout_meta['metro_h'] : 1;


	            //replace [url] BB code for url link with the <a> tag
	            $image->lightbox_caption     = preg_replace( '@\[url=([^]]*)\]([^[]*)\[/url\]@', '<a href=&quot;$1\&quot;>$2</a>', $image->caption );
	            $image->lightbox_description = preg_replace( '@\[url=([^]]*)\]([^[]*)\[/url\]@', '<a href=&quot;$1\&quot;>$2</a>', $image->description );

                //replace [link_open] BB code for url link with the <a> tag
                $image->lightbox_caption     = preg_replace( '@\[link_open=([^]]*)\]([^[]*)\[/link_open\]@', '<a href=&quot;$1\&quot; onclick=&quot;window.open(this.href); return false;&quot;>$2</a>', $image->lightbox_caption );
                $image->lightbox_description = preg_replace( '@\[link_open=([^]]*)\]([^[]*)\[/link_open\]@', '<a href=&quot;$1\&quot; onclick=&quot;window.open(this.href); return false;&quot;>$2</a>', $image->lightbox_description );


	            //strip bb-code from the caption
	            $image->caption     = preg_replace( '@\[url=([^]]*)\]([^[]*)\[/url\]@', '$2', $image->caption );
	            $image->description = preg_replace( '@\[url=([^]]*)\]([^[]*)\[/url\]@', '$2', $image->description );
                $image->caption     = preg_replace( '@\[link_open=([^]]*)\]([^[]*)\[/link_open\]@', '$2', $image->caption );
                $image->description = preg_replace( '@\[link_open=([^]]*)\]([^[]*)\[/link_open\]@', '$2', $image->description );

            }

	        if ( empty( $album_layout_meta ) ) {
		        return "<p><strong>Gallery Factory Error: no layout data found, update the album's layout</strong></p>";
	        }

            if ($album_layout_meta['layout_type'] === 'grid') {
                return $this->render_album_grid($album, $album_layout_meta, $images);
            } else if ($album_layout_meta['layout_type'] === 'metro') {
                return $this->render_album_metro($album, $album_layout_meta, $images);
            }

            return false;


        }

        ###############################################################
        ## album layouts render functions                            ##
        ###############################################################

        /**
         * Renders Grid-type layout
         * @param $album : album data
         * @param $album_layout_meta : layout meta
         * @param $images : image data
         * @return string
         */
        private function render_album_grid($album, $album_layout_meta, $images)
        {

            //prepare data structure for the template
            $view_pages = array();
            $data = array();
            $page_data = array();
            $row_data = array();
            $row = 1;
            $col = 0;
            $col_count = intval($album_layout_meta['column_count']);
            $aspect = $album_layout_meta['aspect_ratio'];
            $vertical_spacing = $album_layout_meta['vertical_spacing'];
            $horizontal_spacing = $album_layout_meta['horizontal_spacing'];

            foreach ($images as $image) {

                $col += 1;

                if ($col > $col_count) {
                    array_push($page_data, $row_data);
                    $row_data = array();
                    $col = 1;
                    $row += 1;
                }

                $image->a_style = 'padding-top:' . strval(round(100 / $aspect, 4)) . '%';
                $image->spacings_style = '';

                //spacings
                if ($horizontal_spacing > 0) {
                    $image->spacings_style .= 'margin-right:' . $horizontal_spacing . 'px; ';
                }
                if ($vertical_spacing > 0) {
                    $image->spacings_style .= 'margin-bottom:' . $vertical_spacing . 'px; ';
                }

                //determining class for proper image sizing
                $image_aspect = $image->width / $image->height;
                $image->img_class = ($aspect > $image_aspect) ? 'vls-gf-tall' : 'vls-gf-wide';

                array_push($row_data, $image);

            }

            //insert last row data
            array_push($page_data, $row_data);

            //insert last page data
            array_push($data, $page_data);

            //rendering
            $page = 0;
            foreach ($data as $page_data) {
                $page++;
                ob_start();
                require(VLS_GF_PLUGIN_DIR . 'frontend/templates/tmpl-album-grid.php');
                array_push($view_pages, ob_get_clean());
            }

            $total_pages = 1;

            $view['container_open'] = '<div class="vls-gf-album vls-gf-album-grid '
                . $album->info_display_class
                . '" data-vls-gf-album-id="' . $album->ID
                . '" style="margin-right:-' . $horizontal_spacing . 'px;"><div class="vls-gf-thumbnail-container">';

            $view['total_page_count'] = $total_pages;

            $view['pages'] = $view_pages;

            $view['container_close'] = '</div><div class="vls-gf-clear"></div></div>';

            return $view;

        }

        /**
         * Renders Metro-type layout
         * @param $album : album data
         * @param $album_layout_meta : layout meta
         * @param $images : image data
         * @return string
         */
        private function render_album_metro($album, $album_layout_meta, $images)
        {

            $view_pages = array();
            $view = array();
            $data = array();
            $page_data = array();

            //preparing album data
            $album->aspect_ratio = $album_layout_meta['aspect_ratio'];
            $album->horizontal_spacing = $album_layout_meta['horizontal_spacing'];
            $album->vertical_spacing = $album_layout_meta['vertical_spacing'];
            $album->column_count = $album_layout_meta['column_count'];


            //preparing image data
            foreach ($images as $image) {

                //item aspect will be more precisely recalculated on the client
                $item_aspect = $album->aspect_ratio * $image->metro_w / $image->metro_h;
                $image->image_aspect = $image->width / $image->height;
                $image->img_class = ($item_aspect > $image->image_aspect) ? 'vls-gf-tall' : 'vls-gf-wide';

                array_push($page_data, $image);

            }

            //insert last page data
            array_push($data, $page_data);

            //rendering
            $page = 0;
            foreach ($data as $page_data) {
                $page++;
                ob_start();
                require(VLS_GF_PLUGIN_DIR . 'frontend/templates/tmpl-album-metro.php');
                array_push($view_pages, ob_get_clean());
            }


            $total_pages = 1;

            $view['container_open'] = '<div class="vls-gf-album vls-gf-album-metro no-js '
                . $album->info_display_class
                . '" data-vls-gf-album-id="' . $album->ID
                . '" data-vls-gf-aspect-ratio="' . $album->aspect_ratio
                . '" data-vls-gf-horizontal-spacing="' . $album->horizontal_spacing
                . '" data-vls-gf-vertical-spacing="' . $album->vertical_spacing
                . '" data-vls-gf-column-count="' . $album->column_count
                . '"><div class="vls-gf-thumbnail-container">';


            $view['total_page_count'] = $total_pages;

            $view['pages'] = $view_pages;

            $view['container_close'] = '</div></div>';

            return $view;

        }
    }
}

return VLS_Gallery_Factory_Frontend::instance();
