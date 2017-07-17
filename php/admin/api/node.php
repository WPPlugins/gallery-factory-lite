<?php namespace vilyon\gallery_factory\admin\api;

class Node_API extends \vilyon\gallery_factory\core\API_Base {
	
	/** @var \vilyon\gallery_factory\logic\Node_Logic */
	private $node_logic;
	
	/**
	 * Node_API constructor.
	 * @param array $config
	 * @param \vilyon\gallery_factory\logic\Logic $logic
	 */
	function __construct($config, $logic) {
		parent::__construct($config, $logic);
		$this->node_logic = $logic->node;
	}
	
	//region Endpoints
	/**
	 * Single node endpoint
	 */
	public function node() {
		$this->ajax_security_check();
		
		if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['_method'] === 'PATCH') {
			$this->update_node();
		}
		else if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['_method'] === 'DELETE') {
			$this->delete_node();
		}
		$this->send_error('Request method not supported');
	}
	
	public function collection() {
		$this->ajax_security_check();
		
		if ($_SERVER['REQUEST_METHOD'] === 'GET') {
			$this->get_collection();
		}
		else if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['_method'] === 'DELETE') {
			$this->delete_collection();
		}
		
		$this->send_error('Request method not supported');
	}
	
	//endregion
	
	//region Private methods
	
	private function update_node() {
		$model = $this->get_model(array('id'));
		$result = $this->node_logic->update($model);
		$this->send_data($result);
	}
	
	private function delete_node() {
		$id = $_POST['id'];
		
		$result = $this->node_logic->delete($id);
		
		$this->send_data($result);
	}
	
	private function get_collection() {
		//get and sanitize input values
		$parent_type = $_GET['parent_type'];
		$parent_id = intval($_GET['parent_id']);
		$view = $_GET['view'];
		
		$data = $this->node_logic->get_collection($parent_type, $parent_id, $view);
		
		$this->send_data($data);
	}
	
	/**
	 * Used for removing images from a folder only (not for deleting folders)
	 */
	private function delete_collection() {
		$collection = json_decode($_POST['collection']);
		
		$result = $this->node_logic->delete_collection($collection);
		
		$this->send_data($result);
	}
	//endregion
}