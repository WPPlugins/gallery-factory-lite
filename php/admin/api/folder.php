<?php namespace vilyon\gallery_factory\admin\api;

class Folder extends \vilyon\gallery_factory\core\API_Base {
	
	/**
	 * @var \vilyon\gallery_factory\logic\Folder_Logic
	 */
	private $folder_logic;
	
	function __construct($config, $logic) {
		parent::__construct($config, $logic);
		$this->folder_logic = $logic->folder;
	}
	
	public function folder() {
		$this->ajax_security_check();
		
		if ($_SERVER['REQUEST_METHOD'] === 'GET') {
			$this->get_folder();
		}
		else if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['_method'])) {
			$this->create_folder();
		}
		else if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['_method'] === 'PATCH') {
			$this->update_folder();
		}
		
		$this->send_error('Request method not supported');
	}
	
	public function children() {
		$this->ajax_security_check();
		
		if ($_SERVER['REQUEST_METHOD'] === 'GET') {
			$this->get_children();
		}
		
		$this->send_error('Request method not supported');
	}
	
	//region Private methods
	
	private function create_folder() {
		$model = $this->get_model(array('parent_id', 'type', 'name'));
		$model['type'] = $model['type'] === 'album' ? 'album' : 'folder';
		
		$result = $this->folder_logic->create($model);
		
		if (is_wp_error($result)) {
			$this->send_error($result);
		}
		else {
			$response = array(
				'id' => $result
			);
			wp_send_json($response);
		}
	}
	
	private function get_folder() {
		$id = intval($_GET['id']);
		$view = $_GET['view'];
		
		$folder = $this->folder_logic->get($id, $view);
		
		$this->send_data($folder);
	}
	
	private function update_folder() {
		$model = $this->get_model(array('id'));
		$result = $this->folder_logic->update($model);
		$this->send_data($result);
	}
	
	private function get_children() {
		//get and sanitize input values
		$id = intval($_GET['folder_id']);
		$view = $_GET['view'];
		
		$data = $this->folder_repo->get_children($id, $view);
		
		$this->send_data($data);
	}
	
	//endregion
}