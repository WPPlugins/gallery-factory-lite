<?php namespace vilyon\gallery_factory\logic;

class Logic {
	/** @var User_Logic */
	public $user;
	
	/** @var Node_Logic */
	public $node;
	
	/** @var Folder_Logic */
	public $folder;
	
	/** @var Image_Logic */
	public $image;
	
	function __construct($config) {
		$this->user = new User_Logic($config, $this);
		$this->folder = new Folder_Logic($config, $this);
		$this->node = new Node_Logic($config, $this);
		$this->image = new Image_Logic($config, $this);
	}
	
	public function get($logic_name) {
		return $this->{$logic_name};
	}
}