<?php namespace vilyon\gallery_factory;

final class Bootstrap {
	
	private $config;
	
	/**
	 * Bootstrap constructor.
	 *
	 * @param $config
	 */
	function __construct($config) {
		$this->config = $config;
		$plugin_dir = $config['plugin_dir'];
		
		// init hook
		add_action('init', array($this, 'init'));
		
		// hook loading plugin's textdomain
		add_action('plugins_loaded', array($this, 'load_textdomain'));
		
		// Load core classes
		require_once($plugin_dir . 'php/core/installer.php');
		
		// Instantiate core classes
		new \vilyon\gallery_factory\core\Installer($config);
		
		// Load admin or client functionality
		if (is_admin()) {
			require_once($plugin_dir . 'php/admin/main.php');
			new \vilyon\gallery_factory\admin\Main($config);
		}
		else {
			require_once($plugin_dir . 'php/front/main.php');
			global $vls_gallery_factory;
			$vls_gallery_factory = new \vilyon\gallery_factory\front\Main($config);
		}
		
		// Load routing manager
		require_once($plugin_dir . 'php/core/routing-manager.php');
		new \vilyon\gallery_factory\core\Routing_Manager();
	}
	
	/**
	 * Initialization of the plugin. Attached to 'init' hook;
	 */
	public function init() {
		
	}
	
	/**
	 * Loads plugin textdomain.
	 */
	function load_textdomain() {
		load_plugin_textdomain($this->config['textdomain'], false, 'gallery-factory-lite/languages');
	}
	
}

