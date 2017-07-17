<?php namespace vilyon\gallery_factory\entities;

final class Folder extends \vilyon\gallery_factory\core\Entity_Base {
	
	/** @var  string */
	public $slug;
	
	/** @var  string */
	public $name;
	
	/** @var  string */
	public $caption;
	
	/** @var  string */
	public $description;
	
	/** @var  string */
	public $cover_url;
	
	/** @var  array */
	public $view_meta;
	
	/** @var  array */
	public $layout_meta;
	
	/** @var  array */
	public $style_meta;
	
	/** @var  array */
	public $items;
	
	protected static function _get_entity_meta() {
		return array(
			'attributes' => array(
				'slug' => array(
					'type' => 'string'
				),
				'type' => array(
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
				'cover_url' => array(
					'type' => 'string'
				),
				'add_items_at' => array(
					'type' => 'string'
				),
				'view_meta' => array(
					'type' => 'array_object'
				),
				'layout_meta' => array(
					'type' => 'array_object'
				),
				'style_meta' => array(
					'type' => 'array_object'
				),
				'items' => array(
					'type' => 'array_list'
				)
			),
			'views' => array(
				'_essential' => array(
					'type'
				),
				'summary' => array(
					'name',
					'caption',
					'description',
					'cover_url'
				),
				'editor' => array(
					'type',
					'slug',
					'name',
					'caption',
					'description',
					'add_items_at',
					'view_meta',
					'layout_meta',
					'style_meta',
					'cover_url',
					'items'
				),
				'_front_output' => array(
					'name',
					'caption',
					'description',
					'view_meta',
					'layout_meta',
					'style_meta',
					'items'
				)
			)
		);
	}
	
	public static function _get_defaults() {
		return array(
			'add_items_at' => 'end',
			'view_meta' => array(
				'pagination_style' => 'global'
			),
			'style_meta' => array(
				'display_image_info_on_hover' => 'global'
			),
			'layout_meta' => array(
				'layout_type' => 'grid',
				'column_count' => 4,
				'aspect_ratio' => 1,
				'horizontal_spacing' => 4,
				'vertical_spacing' => 4,
				'align_bottom' => false
			)
		);
	}
	
	/**
	 * Folder constructor.
	 * @param array $data
	 * @param string $view
	 */
	function __construct($data, $view = '') {
		parent::__construct($data, $view);
	}
}
