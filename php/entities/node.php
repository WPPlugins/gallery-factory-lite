<?php namespace vilyon\gallery_factory\entities;

class Node extends \vilyon\gallery_factory\core\Entity_Base {
	public $type;
	public $parent_id;
	public $order_no;
	public $details_id;
	public $created;
	public $slug;
	public $name;
	public $caption;
	public $description;
	public $icon_url;
	public $filename;
	public $file_size;
	public $image_id;
	public $crop_meta;
	public $layout_meta;
	public $thumbnail_url;
	public $thumbnail_width;
	public $thumbnail_height;
	
	protected static function _get_entity_meta() {
		return array(
			'attributes' => array(
				'type' => array(
					'type' => 'string'
				),
				'order_no' => array(
					'type' => 'int'
				),
				'layout_order_no' => array(
					'type' => 'int'
				),
				'created' => array(
					'type' => 'datetime'
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
				'icon_url' => array(
					'type' => 'string'
				),
				'filename' => array(
					'type' => 'string'
				),
				'file_size' => array(
					'type' => 'unsigned_int'
				),
				'image_id' => array(
					'type' => 'unsigned_int'
				),
				'crop_meta' => array(
					'type' => 'array_object'
				),
				'layout_meta' => array(
					'type' => 'array_object'
				),
				'url' => array(
					'type' => 'string'
				),
				'thumbnail_url' => array(
					'type' => 'string'
				),
				'thumbnail_timestamp' => array(
					'type' => 'unsigned_int'
				),
				'image_width' => array(
					'type' => 'unsigned_int'
				),
				'image_height' => array(
					'type' => 'unsigned_int'
				),
				'thumbnail_width' => array(
					'type' => 'unsigned_int'
				),
				'thumbnail_height' => array(
					'type' => 'unsigned_int'
				),
			),
			'views' => array(
				'_essential' => array(
					'type',
					'parent_id',
					'image_id',
					'details_id'
				),
				// navigation panel collection item
				'nav_item' => array(
					'type',
					'order_no',
					'name'
				),
				// used in the main panel list
				'list_item' => array(
					'type',
					'order_no',
					'created',
					'name',
					'caption',
					'description',
					'filename',
					'file_size',
					'image_id',
					'icon_url'
				),
				'editor_item' => array(
					'type',
					'layout_order_no',
					'name',
					'caption',
					'url',
					'thumbnail_url',
					'crop_meta',
					'layout_meta',
					'image_width',
					'image_height',
					'thumbnail_width',
					'thumbnail_height'
				),
				'_front_output_item' => array(
					'type',
					'slug',
					'caption',
					'description',
					'layout_meta',
					'url',
					'thumbnail_url',
					'thumbnail_width',
					'thumbnail_height'
				)
			),
		);
	}
	
	public static function _get_defaults() {
		return array(
			'crop_meta' => array(),
			'layout_meta' => array()
		);
	}
	
	/**
	 * Node constructor.
	 * @param array $data
	 * @param string $view
	 */
	function __construct($data, $view = '') {
		parent::__construct($data, $view);
	}
}
