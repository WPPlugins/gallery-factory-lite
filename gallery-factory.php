<?php
/**
 * @package   Gallery_Factory_Lite
 * @author    Vilyon Studio <vilyonstudio@gmail.com>
 * @link      http://galleryfactory.vilyon.net
 * @copyright 2015 Vilyon Studio
 *
 * @wordpress-plugin
 * Plugin Name:       Gallery Factory Lite
 * Plugin URI:        https://wordpress.org/plugins/gallery-factory-lite/
 * Description:       Efficient and easy way to handle your image collection in WordPress. Organize your albums with folders, create stunning layouts with visual editor, take your website to a new level with modern, fast & responsive galleries.
 * Version:           2.0.0
 * Author:            Vilyon Studio
 * Author URI:        http://vilyon.net/
 * Text Domain:       gallery-factory
 * Domain Path:       /languages
 */

if (!function_exists('add_action')) {
	header('Status: 403 Forbidden');
	header('HTTP/1.1 403 Forbidden');
	exit;
}

global $wpdb;

// Define config settings
$vls_gf_config = array(
	'version' => '2.0.0',
	'db_version' => 6,
	'minimum_wp_version' => '4.2',
	'plugin_url' => plugin_dir_url(__FILE__),
	'plugin_dir' => plugin_dir_path(__FILE__),
	'textdomain' => 'gallery-factory',
	'uploads_dir_name' => 'gf-uploads',
	'tables' => array(
		'nodes' => $wpdb->prefix . 'vls_gf_nodes',
		'folders' => $wpdb->prefix . 'vls_gf_folders',
		'albums' => $wpdb->prefix . 'vls_gf_albums',
		'images' => $wpdb->prefix . 'vls_gf_images',
		'aux_images' => $wpdb->prefix . 'vls_gf_aux_images',
		'album_images' => $wpdb->prefix . 'vls_gf_album_images'
	)
);

//include the main GF class
require_once($vls_gf_config['plugin_dir'] . 'php/bootstrap.php');

new vilyon\gallery_factory\Bootstrap($vls_gf_config);

unset($vls_gf_config);