<?php namespace vilyon\gallery_factory\admin\api;

class API {
	private $config;
	
	function __construct($config, $logic) {
		$this->config = $config;
		$this->logic = $logic;
		
		// Hook to actions
		add_action('admin_init', array($this, 'init'));
	}
	
	/**
	 * Function is attached to 'admin_init' hook. Registering AJAX endpoints here.
	 */
	public function init() {
		// User
		$user_api = new User_API($this->config, $this->logic);
		add_action('wp_ajax_vls_gf_api_user_onboarding', array($user_api, 'onboarding'));
		
		// Node
		$node_api = new Node_API($this->config, $this->logic);
		add_action('wp_ajax_vls_gf_api_node', array($node_api, 'node'));
		add_action('wp_ajax_vls_gf_api_node_collection', array($node_api, 'collection'));
		
		// Folder
		$folder_api = new Folder($this->config, $this->logic);
		add_action('wp_ajax_vls_gf_api_folder', array($folder_api, 'folder'));
		
		// Image
		$image_api = new Image_API($this->config, $this->logic);
		add_action('wp_ajax_vls_gf_api_image', array($image_api, 'image'));
		add_action('wp_ajax_vls_gf_api_image_collection', array($image_api, 'collection'));
		add_action('wp_ajax_vls_gf_api_image_collection_descendant', array($image_api, 'collection_descendant'));
		add_action('wp_ajax_vls_gf_api_image_collection_move', array($image_api, 'collection_move'));
		
		add_action('wp_ajax_vls_gf_api_image_upload', array($image_api, 'upload'));
//		add_action('wp_ajax_vls_gf_api_image_summary', array($image_api, 'api_image_summary'));
//		add_action('wp_ajax_vls_gf_api_image_editor', array($image_api, 'api_image_editor'));
//		add_action('wp_ajax_vls_gf_api_descendant_images', array($this, 'api_descendant_images'));
		
		// Settings
		$settings_api = new Settings_API($this->config, $this->logic);
		add_action('wp_ajax_vls_gf_api_settings', array($settings_api, 'settings'));
		
		// Tools and other
		$other_api = new Other_API($this->config, $this->logic);
		add_action('wp_ajax_vls_gf_view_tinymce_album_selection_dialog', array($other_api, 'view_tinymce_album_selection_dialog'));
		add_action('wp_ajax_vls_gf_regenerate_thumbnails_batch', array($other_api, 'regenerate_thumbnails_batch'));
		add_action('wp_ajax_vls_gf_import_wp_media_batch', array($other_api, 'import_wp_media_batch'));
		add_action('wp_ajax_vls_gf_import_nextgen', array($other_api, 'import_nextgen'));
	}
}