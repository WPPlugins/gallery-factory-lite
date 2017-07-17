<?php namespace vilyon\gallery_factory\admin\api;

class Image_API extends \vilyon\gallery_factory\core\API_Base {
	
	/**
	 * @var \vilyon\gallery_factory\logic\Image_Logic
	 */
	private $image_logic;
	
	function __construct($config, $logic) {
		parent::__construct($config, $logic);
		
		$this->image_logic = $logic->image;
	}
	
	public function image() {
		$this->ajax_security_check();
		
		if ($_SERVER['REQUEST_METHOD'] === 'GET') {
			$this->get_image();
		}
		else if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['_method'] === 'PATCH') {
			$this->update_image();
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
	
	public function collection_descendant() {
		$this->ajax_security_check();
		
		if ($_SERVER['REQUEST_METHOD'] === 'GET') {
			$this->get_collection_descendant();
		}
		
		$this->send_error('Request method not supported');
	}
	
	public function collection_move() {
		$this->ajax_security_check();
		
		if ($_SERVER['REQUEST_METHOD'] === 'POST') {
			$this->move_collection();
		}
		
		$this->send_error('Request method not supported');
	}
	
	
	/**
	 * Accepts file uploads from uploader panel
	 *
	 * Code is derived from WP core async-upload.php
	 */
	public function upload() {
		
		$this->ajax_security_check();
		
		// Flash often fails to send cookies with the POST or upload, so we need to pass it in GET or POST instead
		if (is_ssl() && empty($_COOKIE[SECURE_AUTH_COOKIE]) && !empty($_REQUEST['auth_cookie'])) {
			$_COOKIE[SECURE_AUTH_COOKIE] = $_REQUEST['auth_cookie'];
		}
		elseif (empty($_COOKIE[AUTH_COOKIE]) && !empty($_REQUEST['auth_cookie'])) {
			$_COOKIE[AUTH_COOKIE] = $_REQUEST['auth_cookie'];
		}
		if (empty($_COOKIE[LOGGED_IN_COOKIE]) && !empty($_REQUEST['logged_in_cookie'])) {
			$_COOKIE[LOGGED_IN_COOKIE] = $_REQUEST['logged_in_cookie'];
		}
		unset($current_user);
		
		header('Content-Type: text/html; charset=' . get_option('blog_charset'));
		
		if (!current_user_can('upload_files')) {
			wp_send_json_error(array('message' => 'You don\'t have a permission to upload files'));
		}
		
		if (isset($_REQUEST['album_id']) && $_REQUEST['album_id'] != "0") {
			$album_id = intval($_REQUEST['album_id']);
		}
		else {
			$album_id = 0;
		}
		
		$wp_filetype = wp_check_filetype_and_ext($_FILES['async-upload']['tmp_name'], $_FILES['async-upload']['name']);
		if (!wp_match_mime_types('image', $wp_filetype['type'])) {
			wp_send_json_error(
				array(
					'message' => __('The uploaded file is not a valid image. Please try again.', $this->config['textdomain']),
					'filename' => $_FILES['async-upload']['name'],
				)
			);
		}
		
		$time = current_time('mysql');
		
		$overrides = array('test_form' => false);
		
		$uploaded_file = $_FILES['async-upload'];
		$uploaded_file['name'] = str_replace('%', '', $uploaded_file['name']); //percent character causes error on displaying an image
		$file = wp_handle_upload($uploaded_file, $overrides, $time);
		
		if (isset($file['error'])) {
			wp_send_json_error(
				array(
					'message' => $file['error'],
					'filename' => $_FILES['async-upload']['name'],
				)
			);
		}
		
		$image = $this->image_logic->import_file($file, $album_id);
		$this->send_data($image);
	}
	
	// region Private methods
	
	private function get_image() {
		$id = intval($_GET['id']);
		$view = $_GET['view'];
		
		$node_id = 0;
		if (array_key_exists('node_id', $_GET)) {
			$node_id = intval($_GET['node_id']);
		}
		
		$image = $this->image_logic->get($id, $view, $node_id);
		$this->send_data($image);
	}
	
	private function update_image() {
		$model = $this->get_model(array('id'));
		
		$result = $this->image_logic->update($model);
		
		$this->send_data($result);
	}
	
	private function get_collection() {
		$collection_type = $_GET['collection_type'];
		$view = $_GET['view'];
		
		$images = $this->image_logic->get_collection($collection_type, $view);
		$this->send_data($images);
	}
	
	private function get_collection_descendant() {
		$parent_id = $_GET['parent_id'];
		$view = 'cover_list_item';
		
		$images = $this->image_logic->get_collection_descendant($parent_id, $view);
		$this->send_data($images);
	}
	
	private function delete_collection() {
		$collection = json_decode($_POST['collection']);
		
		$result = $this->image_logic->delete_collection($collection);
		
		$this->send_data($result);
	}
	
	/**
	 * Moves images from one folder to the other. Also can be moved to unsorted.
	 */
	private function move_collection() {
		$collection = json_decode($_POST['collection']);
		$from_folder = absint($_POST['from_folder']);
		$to_folder = absint($_POST['to_folder']);
		
		$result = $this->image_logic->move_collection($collection, $from_folder, $to_folder);
		
		$this->send_data($result);
	}
	
	// endregion
}