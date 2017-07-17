<?php

// Expose global functions
namespace {
	function vls_gf_gallery($id, $echo = true) {
		global $vls_gallery_factory;
		
		$id = absint($id);
		$vls_gallery_factory->load_scripts();
		$html = $vls_gallery_factory->get_gallery($id);
		
		if ($echo) {
			echo $html;
			return true;
		}
		else {
			return $html;
		}
	}
}

namespace vilyon\gallery_factory\front {
	class Main {
		private $config;
		private $logic;
		private $scripts_done = false;
		
		
		/**
		 * Constructor of the class.
		 * @param $config array
		 */
		function __construct($config) {
			$this->config = $config;
			
			$this->require_php();
			
			// Instantiate logic classes
			$this->logic = new \vilyon\gallery_factory\logic\Logic($config);
			
			// attach init action
			add_action('init', array($this, 'init'), 10, 0);
			
			// enqueue_scripts hook
			add_action('wp_enqueue_scripts', array($this, 'load_stylesheets'));
			
		}
		
		private function require_php() {
			$plugin_dir = $this->config['plugin_dir'];
			
			// Base classes
			require_once($plugin_dir . 'php/core/entity-base.php');
			require_once($plugin_dir . 'php/core/logic-base.php');
			
			// Entities
			require_once($plugin_dir . 'php/entities/node.php');
			require_once($plugin_dir . 'php/entities/folder.php');
			require_once($plugin_dir . 'php/entities/image.php');
			
			// Logic
			require_once($plugin_dir . 'php/logic/user.php');
			require_once($plugin_dir . 'php/logic/node.php');
			require_once($plugin_dir . 'php/logic/folder.php');
			require_once($plugin_dir . 'php/logic/image.php');
			
			require_once($plugin_dir . 'php/logic/_logic.php');
			
			// Include content processing classes
			require_once($plugin_dir . 'php/front/gallery.php');
		}
		
		/**
		 * Function is attached to 'init' hook
		 */
		public function init() {
			$this->register_rewrite_tags();
			
			add_shortcode('vls_gf_album', array($this, 'shortcode_album'));
			add_shortcode('vls_gf_viewer', array($this, 'shortcode_viewer'));
		}
		
		
		/**
		 * Loads front-end scripts, only when a shortcode is on the page
		 */
		public function load_scripts() {
			$version = $this->config['version'];
			$plugin_url = $this->config['plugin_url'];
			$textdomain = $this->config['textdomain'];
			
			if (!$this->scripts_done) { //avoid multiple including
				$this->scripts_done = true;
				
				// attaching lightboxes according to the setup
				$lightbox = get_option('vls_gf_lightbox');
				
				if ($lightbox == 'imagelightbox') {
					wp_register_script('vls-gf-imagelightbox', $plugin_url . 'modules/lightboxes/imagelightbox/imagelightbox.min.js', array('jquery'), $version, true);
					wp_enqueue_script('vls-gf-imagelightbox-init', $plugin_url . 'modules/lightboxes/imagelightbox/imagelightbox-init.min.js', array(
						'jquery',
						'vls-gf-imagelightbox'
					), $version, true);
					wp_enqueue_style('vls-gf-imagelightbox-style', $plugin_url . 'modules/lightboxes/imagelightbox/imagelightbox.css', $version);
				}

				wp_enqueue_script(
					'vls-gf-frontend-script',
					$plugin_url . 'js/front/bundle.min.js',
					array('jquery'),
					$version, true);
				
				// Localize the script
				$localization_array = array(
					'ajaxurl' => admin_url('admin-ajax.php'),
					'btnTextLoadMore' => __('Load more', $textdomain)
				);
				wp_localize_script('vls-gf-frontend-script', 'vls_gf_script_l10n', $localization_array);
				
			}
		}
		
		/**
		 * Loads stylesheets
		 */
		public function load_stylesheets() {
			$version = $this->config['version'];
			$plugin_dir = $this->config['plugin_dir'];
			$plugin_url = $this->config['plugin_url'];
			wp_enqueue_style('vls-gf-style', $plugin_url . 'css/front/style.css', $version);
			if (file_exists($plugin_dir . 'css/front/custom.css')) {
				wp_enqueue_style('vls-gf-style-custom', $plugin_url . 'css/front/custom.css', $version);
			}
		}
		
		private function register_rewrite_tags() {
			add_rewrite_tag('%vls_gf_path%', '([^&]+)');
			add_rewrite_tag('%vls_gf_page%', '([0-1]+)');
		}
		
		###############################################################
		## shortcode handlers ##
		###############################################################
		
		/**
		 * Processes [vls_gf_album] shortcode
		 *
		 * @param $atts : attributes specified in the shortcode
		 *
		 * @return string
		 */
		public function shortcode_album($atts) {
			$this->load_scripts();
			
			$atts = shortcode_atts(
				array(
					'id' => 0,
				),
				$atts
			);
			$id = absint($atts['id']);
			
			return $this->get_gallery($id);
		}
		
		public function shortcode_viewer($atts) {
			
			$this->load_scripts();
			
			//global $vls_gf_page;
			global $vls_gf_path;
			global $id;
			
			/** @var \vilyon\gallery_factory\logic\Folder_Logic $folder_logic */
			$folder_logic = $this->logic->get('folder');
			
			//get and sanitize shortcode attributes
			$atts = shortcode_atts(
				array(
					'id' => 0,
					'header_tag' => 'h2',
					'header_class' => '',
					'breadcrumbs' => 'true'
				),
				$atts
			);
			
			$current_id = intval($atts['id']);
			$show_breadcrumbs = ($atts['breadcrumbs'] === 'true' || $atts['breadcrumbs'] == '1');
			
			$base_url = get_permalink($id);
			
			$folder = $folder_logic->get($current_id, 'summary');
			
			$ancestors = array(
				array('url' => $base_url, 'caption' => $folder->caption)
			);
			
			$route = explode('/', trim($vls_gf_path, '/'));
			
			
			// Find the folder/album to be displayed based on the requested path
			foreach ($route as $slug) {
				if ($slug == '') {
					continue;
				}
				
				// Try to find the child item with the requested slug
				$folder = $folder_logic->get_child_by_slug($current_id, $slug);
				
				if (is_wp_error($folder)) {
					break;
				};
				
				$base_url .= $slug . '/';
				$current_id = $folder->ID;
				
				array_push($ancestors, array('url' => $base_url, 'caption' => $folder->caption));
				
			}
			
			$html = '';
			
			if (!empty($atts['header_tag'])) {
				$folder = $folder_logic->get($current_id, 'summary');
				
				$classString = '';
				if (!empty($atts['header_class'])) {
					$classString = ' class="' . $atts['header_class'] . '"';
				}
				
				$html .= '<' . $atts['header_tag'] . $classString . '>' . $folder->caption . '</' . $atts['header_tag'] . '>';
				
				// Breadcrumbs
				if ($show_breadcrumbs) {
					$html .= '<div class="vls-gf-breadcrumbs">';
					foreach ($ancestors as $index => $ancestor) {
						if ($index > 0) {
							$html .= '<span>&nbsp;&gt;&nbsp;</span>';
						}
						if ($ancestor['url'] === $base_url) {
							$html .= '<span>' . $ancestor['caption'] . '</span>';
						}
						else {
							$html .= '<a href = "' . $ancestor['url'] . '" >' . $ancestor['caption'] . '</a>';
						}
					}
					$html .= '</div>';
				}
			}
			
			$html .= $this->get_gallery($current_id, $base_url);
			
			return $html;
		}
		
		public function get_gallery($id, $base_url = '') {
			$module = new \vilyon\gallery_factory\front\Gallery($this->config, $this->logic);
			return $module->get_html($id, $base_url);
		}
		
	}
}