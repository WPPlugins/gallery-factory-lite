<?php namespace vilyon\gallery_factory\core;

abstract class API_Base {
	/** @var  array */
	protected $config;
	
	/** @var  \vilyon\gallery_factory\logic\Logic */
	protected $logic;
	
	function __construct($config, $logic) {
		$this->config = $config;
		$this->logic = $logic;
	}
	
	protected function ajax_security_check() {
		//check we're in ajax mode
		if (!defined('DOING_AJAX') || !DOING_AJAX) {
			$this->send_error('Bad idea');
		}
		$nonce = $_REQUEST['_nonce'];
		if (wp_verify_nonce($nonce, 'vls_gf_api') === false) {
			$this->send_error('Invalid nonce provided');
		}
	}
	
	// Returns endpoint's output data or an error response
	protected function send_data($data) {
		if ($data === true) {
			wp_send_json_success();
		}
		if (is_wp_error($data)) {
			$this->send_error($data);
		}
		else {
			wp_send_json($data);
		}
	}
	
	protected function send_error($error) {
		if (is_wp_error($error)) {
			$message = implode("; ", $error->get_error_messages());
		}
		else {
			$message = $error;
		}
		
		wp_send_json_error($message);
	}
	
	protected function get_model($requiredParams) {
		
		if (!isset($_REQUEST['model'])) {
			$this->send_error('No data passed to the endpoint');
		}
		
		$model = json_decode(wp_unslash($_REQUEST['model']), true);
		
		foreach ($requiredParams as $param) {
			if (!isset($model[$param])) {
				$this->send_error('Required attribute missing (' . $param . ')');
			}
		}
		
		return $model;
		
	}
	
}