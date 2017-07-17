<?php namespace vilyon\gallery_factory\logic;

class Node_Logic extends \vilyon\gallery_factory\core\Logic_Base {
	
	/** @var string */
	private $table_nodes;
	
	/** @var string */
	private $table_folders;
	
	/** @var string */
	private $table_images;
	
	/** @var string */
	private $table_aux_images;
	
	function __construct($config, $logic) {
		parent::__construct($config, $logic);
		
		$this->table_nodes = $config['tables']['nodes'];
		$this->table_folders = $config['tables']['folders'];
		$this->table_images = $config['tables']['images'];
		$this->table_aux_images = $config['tables']['aux_images'];
	}
	
	/**
	 * Returns a single node
	 * @param int $id
	 * @param string $view
	 * @return \vilyon\gallery_factory\entities\Node|\WP_Error
	 */
	public function get($id, $view) {
		global $wpdb;
		
		if ($view === '_essential') {
			$query = $wpdb->prepare("
                    SELECT
                    	n.ID,
                    	n.type
                    FROM $this->table_nodes n
                    WHERE n.ID = %d",
				$id
			);
		}
		else {
			return new \WP_Error('vls_gf_logic_error', 'Invalid view type "' . $view . '"');
		}
		
		$row = $wpdb->get_row($query, ARRAY_A);
		
		return new \vilyon\gallery_factory\entities\Node($row, $view);
	}
	
	/**
	 * Only for internal use within other logic. A node can't be created as a standalone entity.
	 * @param array $data
	 * @param string $add_at
	 * @return int|\WP_Error
	 */
	public function create($data, $add_at = 'end') {
		global $wpdb;
		
		// Sanitize and validate
		$parent_id = absint($data['parent_id']);
		$image_id = absint($data['image_id']);
		$details_id = absint($data['details_id']);
		$type = $data['type'];
		$name = $data['name'];
		
		if ($type !== 'folder' && $type !== 'album' && $type !== 'image') {
			return new \WP_Error('vls_gf_logic_error', 'Invalid node type');
		}
		
		if (array_key_exists('order_no', $data)) {
			$order_no = intval($data['order_no']);
		}
		else {
			$order_no = ($type === 'image' ? 0 : 2147483647); // max int
		}
		
		$layout_order_no = 0;
		// If inserting an image node, get its layout order no
		if ($type === 'image') {
			if ($add_at === 'start') {
				$no = $wpdb->get_var(
					$wpdb->prepare("
						SELECT MIN(layout_order_no)
						FROM $this->table_nodes
						WHERE parent_id = %d
					",
						$parent_id
					)
				);
				$layout_order_no = $no - 1;
			}
			else {
				$no = $wpdb->get_var(
					$wpdb->prepare("
						SELECT MAX(layout_order_no)
						FROM $this->table_nodes
						WHERE parent_id = %d
					",
						$parent_id
					)
				);
				$layout_order_no = $no + 1;
			}
		}
		
		$result = $wpdb->insert(
			$this->table_nodes,
			array(
				'type' => $type,
				'parent_id' => $parent_id,
				'order_no' => $order_no,
				'layout_order_no' => $layout_order_no,
				'image_id' => $image_id,
				'details_id' => $details_id,
				'name' => $name
			)
		);
		
		if ($result === false) {
			return new \WP_Error('vls_gf_sql_error', $wpdb->last_error);
		}
		
		return $wpdb->insert_id;
	}
	
	public function update($model) {
		global $wpdb;
		
		// Sanitize and validate
		$id = absint($model['id']);
		
		$node_data = array();
		
		if (array_key_exists('parent_id', $model)) {
			$node_data['parent_id'] = absint($model['parent_id']);
		}
		if (array_key_exists('order_no', $model)) {
			$node_data['order_no'] = absint($model['order_no']);
		}
		if (array_key_exists('name', $model)) {
			$node_data['name'] = sanitize_text_field($model['name']);
		}
		
		$extended_data = array();
		
		if (array_key_exists('name', $model)) {
			$extended_data['name'] = sanitize_text_field($model['name']);
		}
		if (array_key_exists('caption', $model)) {
			$extended_data['caption'] = sanitize_text_field($model['caption']);
		}
		if (array_key_exists('description', $model)) {
			$extended_data['description'] = sanitize_text_field($model['description']);
		}
		
		// Get current node values
		$node_current = $wpdb->get_row(
			$wpdb->prepare("
						SELECT type, parent_id, image_id, details_id
						FROM $this->table_nodes
						WHERE ID = %d",
				$id
			), ARRAY_A
		);
		
		// Update node table
		if (count($node_data) > 0) {
			$wpdb->update(
				$this->table_nodes,
				$node_data,
				array(
					'ID' => $id
				)
			);
			
			// If the node was moved to another parent, update the original parent's ordering
			if ($node_current['parent_id'] != $node_data['parent_id']) {
				$wpdb->query(
					$wpdb->prepare("
						UPDATE $this->table_nodes as node
						JOIN (
						  SELECT
							node.ID,
							@rank := @rank + 1 AS rank
						  FROM $this->table_nodes node
						  CROSS JOIN (SELECT @rank := -1) AS rank
						  WHERE node.parent_id = %d
						  ORDER BY
							node.order_no ASC
						) upd
						ON node.ID = upd.ID
						SET node.order_no = upd.rank;",
						$node_current['parent_id']
					)
				);
			}
			
			// If the node was moved to another parent or reordered, update the current parent's ordering
			if (array_key_exists('parent_id', $node_data) && array_key_exists('order_no', $node_data)) {
				$wpdb->query(
					$wpdb->prepare("
						UPDATE $this->table_nodes as node
						JOIN (
						  SELECT
							node.ID,
							@rank := @rank + 1 AS rank
						  FROM $this->table_nodes node
						  CROSS JOIN (SELECT @rank := -1) AS rank
						  WHERE node.parent_id = %d
						  ORDER BY
							node.order_no ASC,
							IF(node.ID = %d, 0, 1) ASC
						) upd
						ON node.ID = upd.ID
						SET node.order_no = upd.rank;",
						$node_data['parent_id'], $id
					)
				);
			}
		}
		
		// Update folder or image table
		if (count($extended_data) > 0) {
			if ($node_current['type'] === 'folder' || $node_current['type'] === 'album') {
				$wpdb->update(
					$this->table_folders,
					$extended_data,
					array(
						'ID' => $node_current['details_id']
					)
				);
			}
			else if ($node_current['type'] === 'image') {
				$wpdb->update(
					$this->table_images,
					$extended_data,
					array(
						'ID' => $node_current['image_id']
					)
				);
			}
			else {
				return new \WP_Error('vls_gf_logic_error', 'Invalid node type "' . $node_current['type'] . '"');
			}
		}
		
		// Purge cache
		$this->_purge_cache($id);
		$this->_purge_cache($node_current['parent_id']);
		if (array_key_exists('parent_id', $node_data)) {
			$this->_purge_cache($node_data['parent_id']);
		}
		
		return true;
	}
	
	public function delete($id) {
		$node = $this->get($id, '_essential');
		
		if (is_wp_error($node)) {
			return $node;
		}
		else {
			/** @var \vilyon\gallery_factory\logic\Folder_Logic $folder_logic */
			$folder_logic = $this->logic->get('folder');
			
			if ($node->type === 'album' || $node->type === 'folder') {
				$result = $folder_logic->delete($id);
				if (is_wp_error($result)) {
					return $result;
				}
			}
			else if ($node->type === 'image') {
				$result = $folder_logic->unlink_image($id, 0, 0);
				if (is_wp_error($result)) {
					return $result;
				}
			}
			else {
				return new \WP_Error('vls_gf_logic_error', 'Node id "' . $id . '" not found');
			}
		}
		
		return true;
	}
	
	public function get_collection($parent_type, $parent_id, $view) {
		global $wpdb;
		
		if ($view === 'nav_item') {
			$query = $wpdb->prepare("
  					SELECT 
                    	node.ID,
                    	node.type,
                    	node.order_no,
                    	node.name
                    FROM $this->table_nodes node              
                    WHERE
                    	node.type IN ('folder', 'album')
                    	AND node.parent_id = %d
                    ORDER BY node.order_no ASC",
				$parent_id
			);
		}
		else if ($view === 'list_item') {
			if ($parent_type === 'folder') {
				$query = $wpdb->prepare("
  					SELECT 
                    	node.ID,
                    	node.image_id,
                    	node.type,
                    	node.order_no,
                    	node.name,
		              	folder.caption,
                    	folder.description,
                    	'' as created,
                    	'' as filename,
                    	0 as file_size,
                    	IFNULL(image.icon_url, '') as icon_url
                    FROM $this->table_nodes node
                    INNER JOIN $this->table_folders folder
                    ON folder.ID = node.details_id
                    LEFT OUTER JOIN $this->table_images image
                    ON node.image_id = image.ID
                    WHERE
                    	node.type IN ('folder', 'album')
                    	AND node.parent_id = %d                     
                    ORDER BY order_no ASC",
					$parent_id
				);
			}
			else if ($parent_type === 'album') {
				$query = $wpdb->prepare("
                    SELECT 
                    	node.ID,
                    	node.image_id,
                    	node.type,
                    	node.order_no,
                    	node.name,
		              	image.caption,
                    	image.description,
                    	image.created,
                    	image.filename,
                    	image.file_size,
                    	image.icon_url as icon_url
                    FROM $this->table_nodes node
                    INNER JOIN $this->table_images image
                    ON image.ID = node.image_id
                    WHERE
                    	node.type = 'image' 
                    	AND node.parent_id = %d
                    ORDER BY order_no ASC",
					$parent_id
				);
			}
			else {
				return new \WP_Error('vls_gf_logic_error', 'Invalid parent type "' . $parent_type . '"');
			}
		}
		else if ($view === 'editor_item') {
			
			$query = $wpdb->prepare("
  					SELECT 
                    	node.ID,
                    	node.type,
                    	node.layout_order_no,
                    	node.name,
                    	IFNULL(folder.caption, image.caption) as caption,
                    	IFNULL(image.url, '') as url,
                    	IFNULL(IFNULL(node_thumbnail.url, generic_thumbnail.url), '') as thumbnail_url,                    	
                    	node.crop_meta,
						node.layout_meta,
						IFNULL(image.width, 0) as image_width,
						IFNULL(image.height, 0) as image_height,
						generic_thumbnail.width as thumbnail_width,
						generic_thumbnail.height as thumbnail_height
                    FROM $this->table_nodes node  
                    LEFT OUTER JOIN $this->table_images image
                    ON node.image_id = image.ID
                    LEFT OUTER JOIN $this->table_folders folder
                    ON node.type IN ('folder', 'album') AND node.details_id = folder.ID
                    LEFT OUTER JOIN $this->table_aux_images node_thumbnail
                    ON 
                    	node_thumbnail.image_id = node.image_id 
                    	AND node_thumbnail.node_id = node.ID
                    	AND node_thumbnail.size_id = 'preview-m'
                    LEFT OUTER JOIN $this->table_aux_images generic_thumbnail
                    ON 
                    	generic_thumbnail.image_id = node.image_id 
                    	AND generic_thumbnail.node_id = 0
                    	AND generic_thumbnail.size_id = 'preview-m'	
                    WHERE
                      node.parent_id = %d
                    ORDER BY node.layout_order_no ASC, node.ID ASC",
				$parent_id
			);
		}
		else if ($view === '_front_output_item') {
			$query = $wpdb->prepare("
  					SELECT 
                    	node.ID,
                    	node.type,
                    	IFNULL(folder.slug, '') as slug,
                    	IFNULL(folder.caption, image.caption) as caption,    
                    	IFNULL(folder.description, image.description) as description,    
						node.layout_meta,
						IFNULL(image.url, '') as url,
						IFNULL(node_thumbnail.url, IFNULL(generic_thumbnail.url, '')) as thumbnail_url,     
						IFNULL(node_thumbnail.timestamp, IFNULL(generic_thumbnail.timestamp, '')) as thumbnail_timestamp,
						IFNULL(node_thumbnail.width, IFNULL(generic_thumbnail.width, '')) as thumbnail_width,
						IFNULL(node_thumbnail.height, IFNULL(generic_thumbnail.height, '')) as thumbnail_height
                    FROM $this->table_nodes node  
                    LEFT OUTER JOIN $this->table_images image
                    ON node.image_id = image.ID
                    LEFT OUTER JOIN $this->table_folders folder
                    ON node.type IN ('folder', 'album') AND node.details_id = folder.ID
                    LEFT OUTER JOIN $this->table_aux_images node_thumbnail
                    ON 
                    	node_thumbnail.image_id = node.image_id 
                    	AND node_thumbnail.node_id = node.ID
                    	AND node_thumbnail.size_id = 'preview-m'	
                    LEFT OUTER JOIN $this->table_aux_images generic_thumbnail
                    ON 
                    	generic_thumbnail.image_id = node.image_id 
                    	AND generic_thumbnail.node_id = 0
                    	AND generic_thumbnail.size_id = 'preview-m'	
                    WHERE
                      node.parent_id = %d
                    ORDER BY node.layout_order_no ASC, node.ID ASC",
				$parent_id
			);
		}
		else {
			return new \WP_Error('vls_gf_logic_error', 'Invalid view type "' . $view . '"');
		}
		
		$results = $wpdb->get_results($query, ARRAY_A);
		
		if ($wpdb->last_error) {
			return new \WP_Error('vls_gf_sql_error', $wpdb->last_error);
		}
		
		$collection = array();
		foreach ($results as $row) {
			$node = new \vilyon\gallery_factory\entities\Node($row, $view);
			array_push($collection, $node);
		}
		
		return $collection;
	}
	
	/**
	 * Checks if crop meta is changed and calls aux image regeneration if needed
	 * @param integer $id
	 * @param array $crop_meta
	 */
	public function update_crop($id, $crop_meta) {
		global $wpdb;
		
		/** @var \vilyon\gallery_factory\logic\Image_Logic $image_logic */
		$image_logic = $this->logic->get('image');
		
		// Get the current crop meta
		$row = $wpdb->get_row(
			$wpdb->prepare("
                    SELECT
                    	i.ID as ID,                    	
                    	i.path,
                    	i.url,
                    	n.crop_meta
                    FROM $this->table_nodes n
                    INNER JOIN $this->table_images i 
                    ON i.ID = n.image_id
                    WHERE n.ID = %d",
				$id
			), ARRAY_A);
		
		// Return if the crop wasn't changed
		if ($row['crop_meta'] === serialize($crop_meta)) {
			return;
		}
		
		// Call aux images regeneration
		$image = new \vilyon\gallery_factory\entities\Image($row);
		$image_logic->clear_aux_images($image->ID, $id);
		$image_logic->create_aux_images($image, $id, $crop_meta);
	}
	
	/**
	 * Used by tinymce dialog view (legacy)
	 */
	public function get_all_as_array() {
		global $wpdb;
		
		$results = $wpdb->get_results("
				SELECT 
					node.ID,
					node.parent_id,
					node.type,
					node.order_no,
					node.name
				FROM $this->table_nodes node
				WHERE node.type IN ('album', 'folder')              
				ORDER BY node.order_no ASC",
			ARRAY_A
		);
		
		if ($wpdb->last_error) {
			return new \WP_Error('vls_gf_sql_error', $wpdb->last_error);
		}
		
		return $results;
	}
	
	public function delete_collection($collection) {
		foreach ($collection as $node_id) {
			$this->delete($node_id);
		}
		
		return true;
	}
	
	private function _purge_cache($node_id) {
		$album_transient_prefix = 'vls_gf_album_';
		
		// Purge cache for the folder itself
		if ($node_id > 0) {
			delete_transient($album_transient_prefix . $node_id);
		}
	}
	
}