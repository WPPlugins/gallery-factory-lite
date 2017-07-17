<?php namespace vilyon\gallery_factory\admin\api;

class User_API extends \vilyon\gallery_factory\core\API_Base {
	private $user_repo;
	
	function __construct($config, $logic) {
		parent::__construct($config, $logic);
		
		$this->user_repo = $logic->user;
	}
	
	public function onboarding() {
		if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['_method'] === 'PATCH') {
			$this->save_onboarding();
		}
		
		$this->send_error('Request method not supported');
	}
	
	//region Private methods
	
	private function save_onboarding() {
		$model = $this->get_model(array());
		
		$result = $this->user_repo->save_onboarding($model);
		
		if (is_wp_error($result)) {
			$this->send_error($result);
		}
		else {
			wp_send_json_success();
		}
	}
	
	//endregion
}