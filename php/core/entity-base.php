<?php namespace vilyon\gallery_factory\core;

abstract class Entity_Base implements \JsonSerializable {
	protected $_view;
	public $ID;
	
	/**
	 * Should be overridden in the derived class
	 * @return array
	 */
	protected static function _get_entity_meta() {
		return array();
	}
	
	/**
	 * Entity_Base constructor
	 *
	 * Processes passed entity data, sets all available attributes for the created entity.
	 *
	 * @param $data
	 * @param string $view
	 */
	public function __construct($data, $view = '') {
		$meta = static::_get_entity_meta();
		
		if (empty($view)) {
			$this->_view = 'full';
		}
		else {
			$this->_view = $view;
		}
		
		// Key
		if (isset($data['ID'])) {
			$this->ID = absint($data['ID']);
		}
		
		// Process attribute values
		foreach ($meta['attributes'] as $attr => $attr_meta) {
			if (isset($data[$attr])) {
				$value = $data[$attr];
				
				if ($attr_meta['type'] === 'int') {
					$value = intval($value);
				}
				else if ($attr_meta['type'] === 'unsigned_int') {
					$value = absint($value);
				}
//				else if ($attr_meta['type'] === 'datetime') {
//					no special handling yet
//				}
				else if (($attr_meta['type'] === 'array_object' || $attr_meta['type'] === 'array_list') && !is_array($value)) {
					$value = unserialize($value);
					if (!is_array($value)) {
						$value = array();
					}
				}
				
				$this->{$attr} = $value;
			}
		}
	}
	
	/**
	 * Returns data array for the entity for serialization to json
	 *
	 * Includes only the attributes specified by the current entity view.
	 *
	 * @return array
	 */
	public function jsonSerialize() {
		$meta = static::_get_entity_meta();
		$data = array();
		
		$data['id'] = absint($this->ID);
		
		if ($this->_view === 'full') {
			$attrs = array_keys($meta['attributes']);
		}
		else {
			$attrs = $meta['views'][$this->_view];
		}
		
		foreach ($attrs as $attr) {
			$attr_config = $meta['attributes'][$attr];
			$value = $this->{$attr};
			
			// Format datetime
			if ($attr_config['type'] === 'datetime') {
				$value = date_i18n(get_option('date_format'), strtotime($value)) . ' ' . date_i18n(get_option('time_format'), strtotime($value));
			}
			// Special handling for arrays
			else if ($attr_config['type'] === 'array_object') {
				if (!is_array($value) || count($value) === 0) {
					$value = new \stdClass();  // need object here to be serialized as "{}"
				}
			}
			else if ($attr_config['type'] === 'user') {
				$value = get_the_author_meta('nicename', $value);
			}
			
			$data[$attr] = $value;
		}
		
		return $data;
	}
}