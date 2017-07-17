<?php namespace vilyon\gallery_factory\core;

abstract class Logic_Base {
	
	/** @var  \vilyon\gallery_factory\core\Database */
	protected $db;
	
	/**
	 * Repo_Base constructor.
	 * @param string $config
	 * @param \vilyon\gallery_factory\logic\Logic $logic
	 */
	function __construct($config, $logic) {
		$this->config = $config;
		$this->logic = $logic;
	}
	
}