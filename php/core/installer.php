<?php namespace vilyon\gallery_factory\core;

final class Installer {
	private $config;
	
	/**
	 * @var Database
	 */
	private $database;
	
	function __construct($config) {
		$this->config = $config;
		$plugin_dir = $config['plugin_dir'];
		
		require_once($plugin_dir . 'php/core/database.php');
		$this->database = new Database($config);
		
		// activation & deactivation hooks
		register_activation_hook('gallery-factory-lite/gallery-factory.php', array($this, 'activate'));
		register_deactivation_hook('gallery-factory-lite/gallery-factory.php', array($this, 'deactivate'));
		
		
		add_action('admin_notices', array($this, 'admin_notice_upgraded'));
	}
	
	/**
	 * Activation routine. Attached to activation hook;
	 */
	public function activate($is_network_activation) {
		if (!current_user_can('activate_plugins')) {
			wp_die();
		}
		
		if (is_multisite()) {
			wp_die('Lite version can\'t be used in multisite installation');
		}
		
		// Check the WP version
		$version = $this->config['version'];
		$min_wp_version = $this->config['minimum_wp_version'];
		$textdomain = $this->config['textdomain'];
		if (version_compare($GLOBALS['wp_version'], $min_wp_version, '<')) {
			$message = sprintf(esc_html__('Gallery Factory version %1$s requires WordPress %2$s or higher.', $textdomain), $version, $min_wp_version);
			wp_die($message);
		}
		
		$this->blog_activate();
	}
	
	
	/**
	 * Deactivation routine. Attached to deactivation hook;
	 */
	public function deactivate() {
		if (!current_user_can('activate_plugins')) {
			wp_die();
		}
		
		$this->reset_tutorial();
		
		flush_rewrite_rules();
	}
	
	public function admin_notice_upgraded() {
		if (get_option('vls_gf_upgrade_notice_v2')) {
			delete_option('vls_gf_upgrade_notice_v2');
			$html = '<div class="notice notice-warning is-dismissible">';
			$html .= '<h2>' . __('Congratulations, you are almost ready to go with the new Gallery Factory version 2!', $this->config['textdomain']) . '</h2>';
			$html .= '<p style="font-size: 1.2em;">' . __('Please <a href="/wp-admin/admin.php?page=vls_gallery_factory#tools">regenerate thumbnails</a> now to finish with upgrading.', $this->config['textdomain']) . '</p>';
			$html .= '</div>';
			echo $html;
		}
	}
	
	/**
	 * Activation routines for the current blog
	 */
	private function blog_activate() {
		ob_start();
		
		$this->database->prepare_database();
		$this->create_options();
		$this->reset_tutorial();
		$this->purgeCache();
		
		flush_rewrite_rules();
		
		$echo = ob_get_clean();
		if (strlen($echo) > 0) {
			file_put_contents($this->config['plugin_dir'] . 'activation_error.log', $echo);
		}
	}
	
	/**
	 * Sets up the default options used on the settings page
	 */
	private function create_options() {
		// updating option to overwrite existing value
		update_option('vls_gf_version', $this->config['version']);
		
		// adding option to write value only on the first installation
		add_option('vls_gf_db_version', $this->config['db_version']);
		
		// reset checks
		update_option('vls_gf_check_ok', 0);
		
		//array of the posts that need special route handling
		add_option('vls_gf_extended_routing_posts', array());
		
		// adding other options
		add_option('vls_gf_thumbnail_dimensions', array('width' => 800, 'height' => 800));
		add_option('vls_gf_lightbox', 'imagelightbox');
		add_option('vls_gf_display_image_info_on_hover', 'all');
	}
	
	/**
	 * Reset tutorial for all users
	 */
	private function reset_tutorial() {
		$users = get_users(array('fields' => array('ID')));
		if ($users) {
			foreach ($users as $user) {
				delete_user_option($user->ID, 'vls_gf_no_tour', true); // deprecated
				delete_user_option($user->ID, 'vls_gf_tutorial_status', true);
			}
		}
	}
	
	/**
	 * Purge all view cache
	 */
	private function purgeCache() {
		global $wpdb;
		$album_transient_prefix = 'vls_gf_album_';
		$table_nodes = $wpdb->prefix . 'vls_gf_nodes';
		
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