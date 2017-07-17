<?php namespace vilyon\gallery_factory\core;

final class Database {
	private $config;
	private $table_nodes;
	private $table_folders;
	private $table_images;
	private $table_aux_images;
	
	function __construct($config) {
		$this->config = $config;
		
		$this->set_table_names();
	}
	
	/**
	 * Prepares the database
	 */
	public function prepare_database() {
		// Update table names according to the current blog
		$this->set_table_names();
		
		$new_db_ver = absint($this->config['db_version']);
		$current_db_ver = get_option('vls_gf_db_version');
		
		// Fix for the v1 lite version with no db version stored
		if (!$current_db_ver) {
			// Additionally check if there is another GF option defined
			if (get_option('vls_gf_check_ok')) {
				$current_db_ver = 2;
			}
		}
		
		// Migrate database to the new version
		if ($current_db_ver > 0) {
			$current_db_ver = absint($current_db_ver);
			// Check for the minimum allowed current version
			if ($current_db_ver < 2) {
				$message = __('The current Gallery Factory version can\'t be upgraded to v2.0.0. Please update the plugin to v1.3 first.', $this->config['textdomain']);
				wp_die($message);
			}
			
			$this->update_database($current_db_ver, $new_db_ver);
		}
		
		// Call create_tables anyway to be sure that they're created and updated
		$this->create_tables();
	}
	
	/**
	 * Set table names based on a current blog. Can't rely on the global setup here during the network activation.
	 */
	private function set_table_names() {
		global $wpdb;
		$this->table_nodes = $wpdb->prefix . 'vls_gf_nodes';
		$this->table_folders = $wpdb->prefix . 'vls_gf_folders';
		$this->table_images = $wpdb->prefix . 'vls_gf_images';
		$this->table_aux_images = $wpdb->prefix . 'vls_gf_aux_images';
	}
	
	private function create_tables() {
		global $wpdb;
		$charset_collate = $wpdb->get_charset_collate();
		
		//$max_index_length = 191;
		
		$queries = array(
			// Node
			"CREATE TABLE $this->table_nodes (
					ID bigint(20) unsigned NOT NULL auto_increment,
					type varchar(20) NOT NULL default 'album',
					parent_id bigint(20) unsigned NOT NULL default '0',
					order_no int(11) NOT NULL default '0',
					layout_order_no int(11) NOT NULL default '0',
					image_id bigint(20) unsigned NOT NULL default '0',
					details_id bigint(20) unsigned NOT NULL default '0',
					name varchar(200) NOT NULL default '',
					crop_meta text NOT NULL default '',
					layout_meta text NOT NULL default '',
					PRIMARY KEY  (ID),
					KEY parent_order (parent_id, order_no)
			) $charset_collate;",
			// Folder
			"CREATE TABLE $this->table_folders (
					ID bigint(20) unsigned NOT NULL auto_increment,					
					slug varchar(200) NOT NULL default '',
					name varchar(200) NOT NULL default '',
					caption text NOT NULL default '',
					description text NOT NULL default '',
					add_items_at varchar(20) NOT NULL default 'end',
					view_meta text NOT NULL default '',							
					layout_meta text NOT NULL default '',
					style_meta text NOT NULL default '',
					PRIMARY KEY  (ID)
			) $charset_collate;",
			// Image
			"CREATE TABLE $this->table_images (
					ID bigint(20) unsigned NOT NULL auto_increment,
					created datetime NOT NULL default '0000-00-00 00:00:00',
					modified datetime NOT NULL default '0000-00-00 00:00:00',				 
					created_by bigint(20) unsigned NOT NULL default '0',
					filename varchar(200) NOT NULL default '',
					path varchar(255) NOT NULL default '',
					url varchar(255) NOT NULL default '',
					slug varchar(200) NOT NULL default '',
					name varchar(200) NOT NULL default '',
					caption text NOT NULL default '',
					description text NOT NULL default '',
					alt_text varchar(200) NOT NULL default '',
					mime_type varchar(20) NOT NULL default '',						
					file_size int(11) unsigned NOT NULL default '0',
					width int(11) unsigned NOT NULL default '0',
					height int(11) unsigned NOT NULL default '0',									
					image_meta text NOT NULL default '',
					attachment_id int(11) unsigned NOT NULL default '0',
					icon_url varchar(255) NOT NULL default '', 
					cover_url varchar(255) NOT NULL default '',
					timestamp int(11) unsigned NOT NULL,
					PRIMARY KEY  (ID)
			) $charset_collate;",
			// Aux Image
			"CREATE TABLE $this->table_aux_images (
					node_id bigint(20) unsigned NOT NULL,
					image_id bigint(20) unsigned NOT NULL,
					size_id varchar(20) NOT NULL,
					path varchar(255) NOT NULL default '',
					url varchar(255) NOT NULL default '',
					width int(11) unsigned NOT NULL default '0',
					height int(11) unsigned NOT NULL default '0',
					timestamp int(11) unsigned NOT NULL,
					PRIMARY KEY  (node_id, image_id, size_id)
			) $charset_collate;"
		);
		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		dbDelta($queries);
	}
	
	/**
	 * Updates database to the current version
	 */
	private function update_database($current_db_ver, $new_db_ver) {
		
		// run update routines until the current version number reaches the target version number
		while ($current_db_ver < $new_db_ver) {
			
			// increment the current db_ver by one
			$current_db_ver++;
			
			// run update function for each version increment
			$func = "update_database_to_ver_{$current_db_ver}";
			
			try {
				if (method_exists($this, $func)) {
					call_user_func(array($this, $func));
				}
			} catch (\Exception $e) {
				wp_die('Something went wrong on plugin\'s database update');
			}
			
			// update the option in the database, so that this process can always
			// pick up where it left off
			update_option('vls_gf_db_version', $current_db_ver);
		}
	}
	
	/**
	 * Since v2.0.0
	 */
	private function update_database_to_ver_6() {
		global $wpdb;
		
		$this->create_tables();
		
		//region Migrate folders & albums
		$nodes = $wpdb->get_results("
                    SELECT 
	                    post.ID,
	                    post.post_parent as parent_id,	                    
	                    post.post_type as type,
	                    post.menu_order as order_no,
	                    post.post_name as slug,
	                    post.post_title as name,
	                    post.post_excerpt as caption,
	                    post.post_content as description
                    FROM $wpdb->posts post
                    WHERE post.post_type in ('vls_gf_folder', 'vls_gf_album')"
			, ARRAY_A
		);
		
		// Loop through all items until all of them are migrated.
		$nodes_left = count($nodes);
		
		while ($nodes_left > 0) {
			
			foreach ($nodes as $index => $node) {
				
				// Skip already processed items
				if (isset($node['new_id'])) {
					continue;
				}
				
				// Find the parent. If parent is not inserted to the new table yet, leave it for the next pass
				$parent_id = 0;
				if ($node['parent_id'] > 0) {
					foreach ($nodes as $parent_node) {
						if ($parent_node['ID'] == $node['parent_id'] && isset($parent_node['new_id'])) {
							$parent_id = $parent_node['new_id'];
						}
					}
					if ($parent_id == 0) {
						continue;
					}
				}
				
				$item_meta = get_post_meta($node['ID'], '_vls_gf_item_meta', true);
				$item_meta = is_array($item_meta) ? $item_meta : array();
				
				$item_layout_meta = get_post_meta($node['ID'], '_vls_gf_layout_meta', true);
				$item_layout_meta = is_array($item_layout_meta) ? $item_layout_meta : array();
				
				
				// Folder ========================================
				$folder_add_items_at = (
					is_array($item_meta)
					&& array_key_exists('append_new_images_to', $item_meta)
					&& $item_meta['append_new_images_to'] == 'top'
				) ? 'start' : 'end';
				
				$folder_view_meta = array(
					'pagination_style' => (
						is_array($item_meta)
						&& array_key_exists('pagination_style', $item_meta)
					) ? $item_meta['pagination_style'] : 'global'
				);
				
				$column_count = isset($item_layout_meta['column_count']) ? absint($item_layout_meta['column_count']) : 4;
				
				$folder_layout_meta = array(
					'layout_type' => isset($item_layout_meta['layout_type']) ? $item_layout_meta['layout_type'] : 'grid',
					'column_count' => $column_count,
					'aspect_ratio' => isset($item_layout_meta['aspect_ratio']) ? $item_layout_meta['aspect_ratio'] : 1,
					'horizontal_spacing' => isset($item_layout_meta['horizontal_spacing']) ? $item_layout_meta['horizontal_spacing'] : 4,
					'vertical_spacing' => isset($item_layout_meta['vertical_spacing']) ? $item_layout_meta['vertical_spacing'] : 4,
					'align_bottom' => false
				);
				
				$folder_style_meta = array(
					'display_image_info_on_hover' => (
						is_array($item_meta)
						&& array_key_exists('display_image_info_on_hover', $item_meta)
					) ? $item_meta['display_image_info_on_hover'] : 'global'
				);
				
				$wpdb->insert(
					$this->table_folders,
					array(
						'slug' => sanitize_title(empty($node['slug']) ? $node['name'] : $node['slug']),
						'name' => $node['name'],
						'caption' => $node['caption'],
						'description' => $node['description'],
						'add_items_at' => $folder_add_items_at,
						'view_meta' => serialize($folder_view_meta),
						'layout_meta' => serialize($folder_layout_meta),
						'style_meta' => serialize($folder_style_meta)
					)
				);
				$details_id = $wpdb->insert_id;
				
				
				// Node ==========================================
				$type = $node['type'] == 'vls_gf_folder' ? 'folder' : 'album';
				
				$layout_order_no = 0;
				$image_id = 0; // cover
				
				$wpdb->insert(
					$this->table_nodes,
					array(
						'type' => $type,
						'parent_id' => $parent_id,
						'order_no' => $node['order_no'],
						'layout_order_no' => $layout_order_no,
						'image_id' => $image_id,
						'details_id' => $details_id,
						'name' => $node['name']
					)
				);
				$node_id = $wpdb->insert_id;
				
				
				$nodes[$index]['cover_id'] = absint(get_post_meta($node['ID'], '_vls_gf_cover_id', true));
				
				$nodes[$index]['new_id'] = $node_id;
				unset($nodes[$index]['type']);
				unset($nodes[$index]['order_no']);
				unset($nodes[$index]['slug']);
				unset($nodes[$index]['name']);
				unset($nodes[$index]['caption']);
				unset($nodes[$index]['description']);
				
				$nodes_left--;
			}
			
		}
		//endregion
		
		//region Migrate images
		$images = $wpdb->get_results("
                    SELECT 
	                    post.ID,
	                    post.post_author as created_by,
	                    post.post_title as name,
	                    post.post_excerpt as caption,
	                    post.post_content as description,
	                    post.post_mime_type as mime_type,
	                    post.guid as url,
	                    post.post_date as created
                    FROM $wpdb->posts post
                    WHERE post.post_type = 'vls_gf_image'"
			, ARRAY_A
		);
		
		foreach ($images as $index => $image) {
			
			$path = WP_CONTENT_DIR . '/' . $this->config['uploads_dir_name'] . '/' . get_post_meta($image['ID'], '_vls_gf_file', true);
			$alt_text = get_post_meta($image['ID'], '_vls_gf_image_alt_text', true);
			$image_meta = get_post_meta($image['ID'], '_vls_gf_image_meta', true);
			
			$filename = $image_meta['filename'];
			$file_size = absint($image_meta['file_size']);;
			$image_width = absint($image_meta['width']);
			$image_height = absint($image_meta['height']);
			
			// Convert crop settings to the new format and store in image array
			$old_crop_top = isset($image_meta['crop_top']) ? floatval($image_meta['crop_top']) : 0;
			$old_crop_right = isset($image_meta['crop_right']) ? floatval($image_meta['crop_right']) : 0;
			$old_crop_bottom = isset($image_meta['crop_bottom']) ? floatval($image_meta['crop_bottom']) : 0;
			$old_crop_left = isset($image_meta['crop_left']) ? floatval($image_meta['crop_left']) : 0;
			
			if ($old_crop_top == 0 && $old_crop_right == 0 && $old_crop_bottom == 0 && $old_crop_left == 0) {
				$images[$index]['crop_meta'] = array();
			}
			else {
				$crop_top = absint(round($old_crop_top * $image_height * 0.01));
				$crop_left = absint(round($old_crop_left * $image_width * 0.01));
				$crop_width = $image_width - $crop_left - absint(round($old_crop_right * $image_width * 0.01));
				$crop_height = $image_height - $crop_top - absint(round($old_crop_bottom * $image_height * 0.01));
				
				$images[$index]['crop_meta'] = array(
					'top' => $crop_top,
					'left' => $crop_left,
					'width' => $crop_width,
					'height' => $crop_height
				);
			}
			
			
			unset($image_meta['filename']);
			unset($image_meta['file_size']);
			unset($image_meta['width']);
			unset($image_meta['height']);
			unset($image_meta['height']);
			unset($image_meta['preview_width']);
			unset($image_meta['preview_height']);
			unset($image_meta['crop_top']);
			unset($image_meta['crop_right']);
			unset($image_meta['crop_bottom']);
			unset($image_meta['crop_left']);
			
			$data = array(
				'created' => $image['created'],
				'modified' => current_time('mysql'),
				'created_by' => absint($image['created_by']),
				'filename' => $filename,
				'path' => $path,
				'url' => $image['url'],
				'slug' => sanitize_title($image['name']),
				'name' => $image['name'],
				'caption' => $image['caption'],
				'description' => $image['description'],
				'alt_text' => $alt_text,
				'mime_type' => $image['mime_type'],
				'file_size' => $file_size,
				'width' => $image_width,
				'height' => $image_height,
				'image_meta' => serialize($image_meta),
				'timestamp' => current_time('timestamp')
			);
			
			$wpdb->insert(
				$this->table_images,
				$data
			);
			$image_id = $wpdb->insert_id;
			
			$images[$index]['new_id'] = $image_id;
			unset($images[$index]['caption']);
			unset($images[$index]['description']);
			unset($images[$index]['created']);
		}
		
		//endregion
		
		//region Migrate image links
		$links = $wpdb->get_results("
                    SELECT 
	                    post.ID,
	                    post.post_parent as parent_id,
	                    post.menu_order as order_no,
	                    post.post_name as image_id,
	                    post.post_content as description,
	                    post.post_mime_type as mime_type,
	                    post.guid as url,
	                    post.post_date as created
                    FROM $wpdb->posts post
                    WHERE post.post_type = 'vls_gf_album_image'"
			, ARRAY_A
		);
		
		foreach ($links as $index => $link) {
			
			// Find image data
			unset($linked_image);
			foreach ($images as $image) {
				if ($image['ID'] == $link['image_id']) {
					$linked_image = $image;
					break;
				}
			}
			// Ignore broken links
			if (!isset($linked_image)) {
				continue;
			}
			
			// Find parent album data
			unset($parent_node);
			foreach ($nodes as $node) {
				if ($node['ID'] == $link['parent_id']) {
					$parent_node = $node;
					break;
				}
			}
			// Ignore broken links
			if (!isset($parent_node)) {
				continue;
			}
			
			
			$crop_meta = array();
			if (is_array($linked_image['crop_meta']) && isset($linked_image['crop_meta']['top'])) {
				$crop_meta = $linked_image['crop_meta'];
			}
			
			$image_layout_meta = get_post_meta($link['ID'], '_vls_gf_layout_meta', true);
			$layout_meta = array();
			if (is_array($image_layout_meta)) {
				if (isset($image_layout_meta['metro_w']) && absint($image_layout_meta['metro_w']) > 1) {
					$layout_meta['h_span'] = absint($image_layout_meta['metro_w']);
				}
				if (isset($image_layout_meta['metro_h']) && absint($image_layout_meta['metro_h']) > 1) {
					$layout_meta['v_span'] = absint($image_layout_meta['metro_h']);
				}
			}
			
			$data = array(
				'type' => 'image',
				'parent_id' => $parent_node['new_id'],
				'order_no' => 0,
				'layout_order_no' => intval($link['order_no']),
				'image_id' => $linked_image['new_id'],
				'details_id' => 0,
				'name' => $linked_image['name'],
				'crop_meta' => serialize($crop_meta),
				'layout_meta' => serialize($layout_meta)
			);
			
			$wpdb->insert(
				$this->table_nodes,
				$data
			);
		}
		
		//endregion
		
		//region Link cover images
		foreach ($nodes as $node) {
			
			$old_cover_id = $node['cover_id'];
			
			if ($old_cover_id <= 0) {
				continue;
			}
			
			// Find image data
			unset($linked_image);
			foreach ($images as $image) {
				if ($image['ID'] == $old_cover_id) {
					$linked_image = $image;
					break;
				}
			}
			// Ignore broken links
			if (!isset($linked_image)) {
				continue;
			}
			
			$data = array(
				'image_id' => $linked_image['new_id']
			);
			
			$wpdb->update(
				$this->table_nodes,
				$data,
				array('ID' => $node['new_id'])
			);
			
		}
		
		//endregion
		
		//region Update ids in shortcodes
		
		foreach ($nodes as $node) {
			$find = '[vls_gf_album id="' . $node['ID'] . '"]';
			$replace = '[vls_gf_album id="' . $node['new_id'] . '" v1_id="' . $node['ID'] . '"]';
			
			$query = 'UPDATE ' . $wpdb->posts . ' ';
			$query .= 'SET post_content = REPLACE(post_content, \'' . $find . '\', \'' . $replace . '\') ';
			$query .= 'WHERE post_content LIKE \'%[vls_gf_album%\'';
			
			$wpdb->query($query);
			
			$find = '[vls_gf_viewer id="' . $node['ID'] . '"';
			$replace = '[vls_gf_viewer id="' . $node['new_id'] . '" v1_id="' . $node['ID'] . '"';
			
			$query = 'UPDATE ' . $wpdb->posts . ' ';
			$query .= 'SET post_content = REPLACE(post_content, \'' . $find . '\', \'' . $replace . '\') ';
			$query .= 'WHERE post_content LIKE \'%[vls_gf_viewer%\'';
			
			$wpdb->query($query);
		}
		//endregion
		
		// Set the flag for showing the upgrade notice
		update_option('vls_gf_upgrade_notice_v2', true);
		
	}
	
	/** example
	 * private function update_database_to_ver_next() {
	 * // prepare data to the DB structure change
	 * $this->create_tables();
	 * // clean up data after the DB structure change
	 * }
	 */
}