<?php namespace vilyon\gallery_factory\logic;

class User_Logic extends \vilyon\gallery_factory\core\Logic_Base {
	
	function __construct($config, $logic) {
		parent::__construct($config, $logic);
	}
	
	public function save_onboarding($data) {
		$user_id = get_current_user_id();
		$status = get_user_option('vls_gf_tutorial_status');
		
		if (!$status) {
			$status = array(
				'manager' => false,
				'folder' => false,
				'album' => false,
				'image' => false
			);
		}
		
		$status = array_merge($status, $data);
		
		update_user_option($user_id, 'vls_gf_tutorial_status', $status, true);
		
		return true;
	}
}