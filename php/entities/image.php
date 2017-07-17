<?php namespace vilyon\gallery_factory\entities;

class Image extends \vilyon\gallery_factory\core\Entity_Base {
	
	/** @var int */
	public $node_id;
	
	/** @var string */
	public $created;
	
	/** @var string */
	public $modified;
	
	/** @var int */
	public $created_by;
	
	/** @var string */
	public $filename;
	
	/** @var string */
	public $path;
	
	/** @var string */
	public $url;
	
	/** @var string */
	public $thumbnail_url;
	
	/** @var string */
	public $cover_url;
	
	/** @var string */
	public $preview_url;
	
	/** @var string */
	public $slug;
	
	/** @var string */
	public $name;
	
	/** @var string */
	public $caption;
	
	/** @var string */
	public $description;
	
	/** @var string */
	public $alt_text;
	
	/** @var string */
	public $mime_type;
	
	/** @var int */
	public $file_size;
	
	/** @var int */
	public $width;
	
	/** @var int */
	public $height;
	
	/** @var array */
	public $image_meta;
	
	/** @var int */
	public $timestamp;
	
	protected static function _get_entity_meta() {
		return array(
			'attributes' => array(
				'node_id' => array(
					'type' => 'unsigned_int'
				),
				'created' => array(
					'type' => 'datetime'
				),
				'created_by' => array(
					'type' => 'user'
				),
				'path' => array(
					'type' => 'string'
				),
				'url' => array(
					'type' => 'string'
				),
				'icon_url' => array(
					'type' => 'string'
				),
				'cover_url' => array(
					'type' => 'string'
				),
				'aux_image_url' => array(
					'type' => 'string'
				),
				'slug' => array(
					'type' => 'string'
				),
				'name' => array(
					'type' => 'string'
				),
				'caption' => array(
					'type' => 'string'
				),
				'description' => array(
					'type' => 'string'
				),
				'alt_text' => array(
					'type' => 'string'
				),
				'filename' => array(
					'type' => 'string'
				),
				'mime_type' => array(
					'type' => 'string'
				),
				'file_size' => array(
					'type' => 'unsigned_int'
				),
				'width' => array(
					'type' => 'unsigned_int'
				),
				'height' => array(
					'type' => 'unsigned_int'
				),
				'image_meta' => array(
					'type' => 'array_object'
				),
				'timestamp' => array(
					'type' => 'unsigned_int'
				)
			),
			'views' => array(
				// used in the main panel list
				'list_item' => array(
					'created',
					'name',
					'caption',
					'description',
					'filename',
					'file_size',
					'icon_url'
				),
				// Cover selection dialog list
				'cover_list_item' => array(
					'icon_url',
					'cover_url'
				),
				// used in the side panel
				'summary' => array(
					'created',
					'slug',
					'name',
					'caption',
					'description',
					'alt_text',
					'filename',
					'file_size',
					'width',
					'height',
					'cover_url',
					'image_meta'
				),
				'editor' => array(
					'created',
					'created_by',
					'slug',
					'name',
					'caption',
					'description',
					'alt_text',
					'filename',
					'file_size',
					'width',
					'height',
					'image_meta',
					'url',
					'cover_url'
				)
			),
		);
	}
	
	/**
	 * Image constructor
	 *
	 * @param array $data
	 * @param string $view
	 */
	public function __construct($data, $view = '') {
		parent::__construct($data, $view);
	}
	
	public function get_path($size_name) {
		$path_array = explode('/', $this->path);
		array_splice($path_array, count($path_array) - 1, 0, $size_name);
		return implode('/', $path_array);
	}
	
	public function get_url($size_name) {
		$path_array = explode('/', $this->url);
		array_splice($path_array, count($path_array) - 1, 0, $size_name);
		return implode('/', $path_array);
	}
}
