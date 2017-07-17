<?php namespace vilyon\gallery_factory\logic;

class Folder_Logic extends \vilyon\gallery_factory\core\Logic_Base {
	/** @var string */
	private $table_nodes;
	
	/** @var string */
	private $table_folders;
	
	/** @var string */
	private $table_images;
	
	/**
	 * Folder_Repo constructor.
	 * @param array $config
	 * @param \vilyon\gallery_factory\logic\Logic $logic
	 */
	function __construct($config, $logic) {
		parent::__construct($config, $logic);
		$this->table_nodes = $config['tables']['nodes'];
		$this->table_folders = $config['tables']['folders'];
		$this->table_images = $config['tables']['images'];
	}
	
	/**
	 * @param int $id
	 * @param string $view
	 * @return \vilyon\gallery_factory\entities\Folder|\WP_Error
	 */
	public function get($id, $view) {
		global $wpdb;
		
		if ($view === 'summary') {
			$query = $wpdb->prepare("
                    SELECT 
                    	node.ID,
                    	folder.name,
                    	folder.caption,
                    	folder.description,
                    	IFNULL(image.cover_url, '') as cover_url
                    FROM $this->table_nodes node  
                    INNER JOIN $this->table_folders folder
                    ON node.details_id = folder.ID
                    LEFT OUTER JOIN $this->table_images image
					ON 
						node.image_id = image.ID  
                    WHERE node.ID = %d",
				$id
			);
		}
		else if ($view === 'editor') {
			$query = $wpdb->prepare("
                    SELECT 
                    	node.ID,
                    	node.type,
                    	folder.slug,
                    	folder.name,
                    	folder.caption,
                    	folder.description,
                    	folder.view_meta,
                    	folder.add_items_at,
                    	folder.layout_meta,
                    	folder.style_meta,
                    	IFNULL(image.cover_url, '') as cover_url
                    FROM $this->table_nodes node
                    INNER JOIN $this->table_folders folder
                    ON 
                    	node.details_id = folder.ID    
                    LEFT OUTER JOIN $this->table_images image
					ON node.image_id = image.ID                                 	
                    WHERE 
                    	node.ID = %d",
				$id
			);
		}
		else if ($view === '_link_image_data') {
			$query = $wpdb->prepare("
                    SELECT 
                    	node.ID,
                    	folder.add_items_at
                    FROM $this->table_nodes node  
                    INNER JOIN $this->table_folders folder
                    ON node.details_id = folder.ID
                    WHERE node.ID = %d",
				$id
			);
		}
		else if ($view === '_front_output') {
			$query = $wpdb->prepare("
                    SELECT 
                    	node.ID,
                    	folder.caption,
                    	folder.description,
                    	folder.view_meta,
                    	folder.layout_meta,
                    	folder.style_meta
                    FROM $this->table_nodes node
                    INNER JOIN $this->table_folders folder
                    ON 
                    	node.details_id = folder.ID                             	
                    WHERE 
                    	node.ID = %d",
				$id
			);
		}
		else {
			return new \WP_Error('vls_gf_logic_error', 'Invalid view type "' . $view . '"');
		}
		
		$row = $wpdb->get_row($query, ARRAY_A);
		
		if ($wpdb->last_error) {
			return new \WP_Error('vls_gf_sql_error', $wpdb->last_error);
		}
		else if ($row === null) {
			return new \WP_Error('vls_gf_logic_error', 'The folder/album with ID ' . $id . ' was not found.');
		}
		
		$folder = new \vilyon\gallery_factory\entities\Folder($row, $view);
		
		if ($view === 'editor') {
			/** @var \vilyon\gallery_factory\logic\Node_Logic $node_logic */
			$node_logic = $this->logic->get('node');
			$items = $node_logic->get_collection('', $id, 'editor_item');
			$folder->items = $items;
		}
		else if ($view === '_front_output') {
			/** @var \vilyon\gallery_factory\logic\Node_Logic $node_logic */
			$node_logic = $this->logic->get('node');
			$items = $node_logic->get_collection('', $id, '_front_output_item');
			$folder->items = $items;
		}
		
		return $folder;
	}
	
	public function get_child_by_slug($parent_id, $slug) {
		global $wpdb;
		
		$query = $wpdb->prepare("
				SELECT 
					node.ID,
					folder.name,
					folder.caption,
					folder.description
				FROM $this->table_nodes node  
				INNER JOIN $this->table_folders folder
				ON 
					node.details_id = folder.ID    
				WHERE node.parent_id = %d AND folder.slug = %s",
			$parent_id, $slug
		);
		
		$row = $wpdb->get_row($query, ARRAY_A);
		
		if ($wpdb->last_error) {
			return new \WP_Error('vls_gf_sql_error', $wpdb->last_error);
		}
		else if ($row === null) {
			return new \WP_Error('vls_gf_logic_error', 'The folder/album with ID ' . $id . ' was not found.');
		}
		
		$folder = new \vilyon\gallery_factory\entities\Folder($row, '_essential');
		
		return $folder;
	}
	
	/**
	 * @param array $data
	 * @return int|\WP_Error
	 */
	public function create($data) {
		global $wpdb;
		
		/** @var \vilyon\gallery_factory\logic\Node_Logic $node_logic */
		$node_logic = $this->logic->get('node');
		
		$type = $data['type'];
		$name = $data['name'];
		
		if (isset($data['caption'])) {
			$caption = $data['caption'];
		}
		else {
			$caption = $name;
		}
		
		if (isset($data['description'])) {
			$description = $data['description'];
		}
		else {
			$description = '';
		}
		
		$defaults = \vilyon\gallery_factory\entities\Folder::_get_defaults();
		
		$default_add_items_at = $defaults['add_items_at'];
		if ($type === 'folder') {
			$default_add_items_at = 'end';
		}
		$default_view_meta = $defaults['view_meta'];
		$default_layout_meta = $defaults['layout_meta'];
		$default_style_meta = $defaults['style_meta'];
		
		$wpdb->insert(
			$this->table_folders,
			array(
				'slug' => sanitize_title($name),
				'name' => $name,
				'caption' => $caption,
				'description' => $description,
				'add_items_at' => $default_add_items_at,
				'view_meta' => serialize($default_view_meta),
				'layout_meta' => serialize($default_layout_meta),
				'style_meta' => serialize($default_style_meta)
			)
		);
		
		if ($wpdb->last_error) {
			return new \WP_Error('vls_gf_sql_error', $wpdb->last_error);
		}
		
		$data['details_id'] = $wpdb->insert_id;
		$data['image_id'] = 0;
		
		return $node_logic->create($data, $default_add_items_at);
	}
	
	/**
	 * Updates folder editor
	 * @param $model
	 * @return bool
	 */
	public function update($model) {
		// Sanitize and validate
		$model['id'] = absint($model['id']);
		
		$this->_update_node_data($model);
		$this->_update_folder_data($model);
		
		if (array_key_exists('items', $model)) {
			$this->_update_folder_items_data($model['items']);
		}
		
		// Reset parent's cache, as the cover may be changed here
		$this->purge_cache($model['id'], true);
		
		return true;
	}
	
	public function delete($id) {
		global $wpdb;
		
		$this->purge_cache($id, true);
		
		// Delete all child nodes
		$child_nodes = $wpdb->get_col(
			$wpdb->prepare("
                    SELECT ID
                    FROM $this->table_nodes
                    WHERE
                      parent_id = %d
                      AND type IN ('folder', 'album')",
				$id
			)
		);
		foreach ($child_nodes as $child_node_id) {
			$this->delete($child_node_id);
		}
		
		// Unlink images
		$image_nodes = $wpdb->get_results(
			$wpdb->prepare("
                    SELECT ID, image_id
                    FROM $this->table_nodes
                    WHERE
                      parent_id = %d
                      AND type = 'image'",
				$id
			), ARRAY_A
		);
		foreach ($image_nodes as $node) {
			$this->unlink_image(absint($node['ID']), absint($node['image_id']), $id);
		}
		
		// Delete folder details
		$wpdb->query(
			$wpdb->prepare("
				DELETE folder
				FROM $this->table_folders folder
				INNER JOIN $this->table_nodes node
				ON
					folder.ID = node.details_id
					AND node.ID = %d",
				$id
			)
		);
		
		// Delete node
		$wpdb->delete(
			$this->table_nodes,
			array('ID' => $id)
		);
		
		return true;
	}
	
	public function link_image($image, $parent) {
		global $wpdb;
		
		/** @var \vilyon\gallery_factory\logic\Node_Logic $node_logic */
		$node_logic = $this->logic->get('node');
		
		// Check if the image is already linked to the node
		$count = $wpdb->get_var(
			$wpdb->prepare("
				SELECT count(ID)
				FROM $this->table_nodes
				WHERE 
					type = 'image'
					AND parent_id = %d
					AND image_id = %d",
				$parent->ID,
				$image->ID
			)
		);
		
		if ($count > 0) {
			return;
		}
		
		$data = array(
			'parent_id' => $parent->ID,
			'image_id' => $image->ID,
			'details_id' => 0,
			'type' => 'image',
			'name' => $image->name
		);
		
		$node_logic->create($data, $parent->add_items_at);
		
		$this->purge_cache($parent->ID);
		
		return true;
	}
	
	public function unlink_image($node_id, $image_id, $parent_id) {
		global $wpdb;
		
		/** @var \vilyon\gallery_factory\logic\Image_Logic $image_logic */
		$image_logic = $this->logic->get('image');
		
		// Get the node ID
		if ($node_id === 0) {
			$node_id = $wpdb->get_var(
				$wpdb->prepare("
				SELECT ID
				FROM $this->table_nodes
				WHERE image_id = %d AND parent_id = %d AND type = 'image'",
					$image_id, $parent_id
				)
			);
		}
		else if ($image_id === 0) {
			$row = $wpdb->get_row(
				$wpdb->prepare("
				SELECT image_id, parent_id
				FROM $this->table_nodes
				WHERE ID = %d",
					$node_id
				), ARRAY_A
			);
			$image_id = $row['image_id'];
			$parent_id = $row['parent_id'];
		}
		
		// Delete auxiliary images for the node
		$image_logic->clear_aux_images($image_id, $node_id);
		
		// Delete node
		$wpdb->delete(
			$this->table_nodes,
			array('ID' => $node_id)
		);
		
		$this->purge_cache($parent_id);
		
		return true;
	}
	
	private function _update_node_data($model) {
		global $wpdb;
		$id = $model['id'];
		$data = array();
		
		if (array_key_exists('name', $model)) {
			$data['name'] = sanitize_text_field($model['name']);
		}
		
		if (array_key_exists('image_id', $model)) {
			$data['image_id'] = sanitize_text_field($model['image_id']);
		}
		
		if (count($data) > 0) {
			$wpdb->update(
				$this->table_nodes,
				$data,
				array(
					'ID' => $id
				)
			);
		}
	}
	
	private function _update_folder_data($model) {
		global $wpdb;
		$id = $model['id'];
		
		$data = array();
		
		if (array_key_exists('slug', $model)) {
			$data['slug'] = sanitize_title($model['slug']);
		}
		if (array_key_exists('name', $model)) {
			$data['name'] = sanitize_text_field($model['name']);
		}
		if (array_key_exists('caption', $model)) {
			$data['caption'] = sanitize_text_field($model['caption']);
		}
		if (array_key_exists('description', $model)) {
			$data['description'] = sanitize_text_field($model['description']);
		}
		if (array_key_exists('add_items_at', $model)) {
			$data['add_items_at'] = sanitize_text_field($model['add_items_at']);
		}
		
		if (array_key_exists('view_meta', $model)) {
			$data['view_meta'] = serialize($model['view_meta']);
		}
		if (array_key_exists('layout_meta', $model)) {
			$data['layout_meta'] = serialize($model['layout_meta']);
		}
		if (array_key_exists('style_meta', $model)) {
			$data['style_meta'] = serialize($model['style_meta']);
		}
		
		if (count($data) > 0) {
			$folder_id = $wpdb->get_var(
				$wpdb->prepare("SELECT details_id FROM $this->table_nodes WHERE ID = %d", $id)
			);
			
			$wpdb->update(
				$this->table_folders,
				$data,
				array(
					'ID' => $folder_id
				)
			);
		}
	}
	
	private function _update_folder_items_data($items) {
		global $wpdb;
		
		/** @var \vilyon\gallery_factory\logic\Node_Logic $node_logic */
		$node_logic = $this->logic->get('node');
		
		foreach ($items as $item) {
			$id = $item['id'];
			
			$data = array();
			
			if (isset($item['layout_order_no'])) {
				$data['layout_order_no'] = intval($item['layout_order_no']);
			}
			if (isset($item['crop_meta'])) {
				$data['crop_meta'] = serialize($item['crop_meta']);;
				$node_logic->update_crop($id, $item['crop_meta']);
			}
			if (isset($item['layout_meta'])) {
				$data['layout_meta'] = serialize($item['layout_meta']);
			}
			
			$wpdb->update(
				$this->table_nodes,
				$data,
				array(
					'ID' => $id
				)
			);
		}
	}
	
	public function purge_cache($folder_id, $with_parent = false) {
		global $wpdb;
		$album_transient_prefix = 'vls_gf_album_';
		
		// Purge cache for the folder itself
		delete_transient($album_transient_prefix . $folder_id);
		
		// Purge cache for the folder parent
		if ($with_parent) {
			$parent_id = $wpdb->get_var(
				$wpdb->prepare("
				SELECT parent_id
				FROM $this->table_nodes
				WHERE ID = %d",
					$folder_id
				)
			);
			
			if ($parent_id > 0) {
				delete_transient($album_transient_prefix . $parent_id);
			}
		}
	}
	
}
