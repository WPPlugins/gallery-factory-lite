<?php namespace vilyon\gallery_factory\admin\api;

class Settings_API extends \vilyon\gallery_factory\core\API_Base {
	
	function __construct($config, $logic) {
		parent::__construct($config, $logic);
	}
	
	public function settings() {
		$this->ajax_security_check();
		
		if ($_SERVER['REQUEST_METHOD'] === 'GET') {
			$this->get_settings();
		}
		else if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['_method'] === 'PATCH') {
			$this->update_settings();
		}
		$this->send_error('Request method not supported');
	}
	
	private function get_settings() {
		$thumbnail_dimensions = get_option('vls_gf_thumbnail_dimensions');
		
		$response = array(
			'general' => array(
				'lightbox' => get_option('vls_gf_lightbox'),
				'display_image_info_on_hover' => get_option('vls_gf_display_image_info_on_hover'),
				'thumbnail_width' => absint($thumbnail_dimensions['width']),
				'thumbnail_height' => absint($thumbnail_dimensions['height'])
			)
		);
		
		wp_send_json($response);
	}
	
	private function update_settings() {
		if (!current_user_can('manage_options')) {
			$this->send_error('You are not allowed to manage these items.');
		}
		
		$model = $this->get_model(array());
		
		if (array_key_exists('general', $model)) {
			$general = $model['general'];
			
			update_option('vls_gf_lightbox', $general['lightbox']);
			update_option('vls_gf_display_image_info_on_hover', $general['display_image_info_on_hover']);
			
			$thumbnail_width = intval($general['thumbnail_width']);
			if ($thumbnail_width < 40) {
				$thumbnail_width = 40;
			}
			else if ($thumbnail_width > 4000) {
				$thumbnail_width = 4000;
			}
			
			$thumbnail_height = intval($general['thumbnail_height']);
			if ($thumbnail_height < 40) {
				$thumbnail_height = 40;
			}
			else if ($thumbnail_height > 4000) {
				$thumbnail_height = 4000;
			}
			
			$thumbnail_dimensions = array(
				'width' => $thumbnail_width,
				'height' => $thumbnail_height
			);
			update_option('vls_gf_thumbnail_dimensions', $thumbnail_dimensions);
			
		}
		
		// Purge front view cache
		$this->purgeCache();
		
		
		$this->send_data(true);
	}
	
	/**
	 * Purge all view cache
	 */
	private function purgeCache() {
		global $wpdb;
		$album_transient_prefix = 'vls_gf_album_';
		$table_nodes = $this->config['tables']['nodes'];
		
		$nodes = $wpdb->get_col("
			SELECT id
			FROM $table_nodes
			WHERE type IN ('folder', 'album')"
		);
		
		foreach ($nodes as $node_id) {
			delete_transient($album_transient_prefix . $node_id);
		}
	}
}