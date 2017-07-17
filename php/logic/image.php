<?php namespace vilyon\gallery_factory\logic;

class Image_Logic extends \vilyon\gallery_factory\core\Logic_Base {
	
	/** @var string */
	private $table_nodes;
	
	/** @var string */
	private $table_images;
	
	/** @var string */
	private $table_aux_images;
	
	/**
	 * Image_Logic constructor
	 *
	 * @param array $config
	 * @param \vilyon\gallery_factory\logic\Logic $logic
	 */
	function __construct($config, $logic) {
		parent::__construct($config, $logic);
		$this->table_nodes = $config['tables']['nodes'];
		$this->table_images = $config['tables']['images'];
		$this->table_aux_images = $config['tables']['aux_images'];
	}
	
	public function get($id, $view, $node_id = 0) {
		global $wpdb;
		
		if ($view === '_essential') {
			$query = $wpdb->prepare("
						SELECT 
							image.ID,
							image.name
						FROM $this->table_images image						
						WHERE
							image.ID = %d",
				$id
			);
		}
		else if ($view === 'summary') {
			$query = $wpdb->prepare("
						SELECT 
							image.ID,
							image.created,	
							image.slug,
							image.name,							
							image.caption,
							image.description,
							image.alt_text,
							image.filename,
							image.file_size,
							image.width,
							image.height,
							image.image_meta,
							image.cover_url
						FROM $this->table_images image						
						WHERE
							image.ID = %d",
				$id
			);
		}
		else if ($view === 'editor') {
			$query = $wpdb->prepare("
						SELECT 
							image.ID,
							image.created,	
							image.created_by,
							image.slug,		
							image.name,							
							image.caption,
							image.description,
							image.alt_text,
							image.filename,
							image.file_size,
							image.width,
							image.height,
							image.image_meta,
							image.url,
							image.cover_url
						FROM $this->table_images image						
						WHERE
							image.ID = %d",
				$id
			);
		}
		else {
			return new \WP_Error('vls_gf_logic_error', 'Invalid view type "' . $view . '"');
		}
		
		$row = $wpdb->get_row($query, ARRAY_A);
		$image = new \vilyon\gallery_factory\entities\Image($row, $view);
		
		return $image;
	}
	
	public function update($model) {
		global $wpdb;
		
		// Sanitize and validate
		$id = absint($model['id']);
		
		$this->purge_cache($id);
		
		$image_data = array();
		
		// Update image entry
		if (array_key_exists('slug', $model)) {
			$image_data['slug'] = sanitize_title($model['slug']);
		}
		if (array_key_exists('name', $model)) {
			$image_data['name'] = sanitize_text_field($model['name']);
		}
		if (array_key_exists('caption', $model)) {
			$image_data['caption'] = sanitize_text_field($model['caption']);
		}
		if (array_key_exists('description', $model)) {
			$image_data['description'] = sanitize_text_field($model['description']);
		}
		if (array_key_exists('alt_text', $model)) {
			$image_data['alt_text'] = sanitize_text_field($model['alt_text']);
		}
		
		
		if (count($image_data) > 0) {
			$wpdb->update(
				$this->table_images,
				$image_data,
				array(
					'ID' => $id
				)
			);
		}
		
		// Update name for all image nodes
		if (array_key_exists('name', $image_data)) {
			// Update the current node
			$wpdb->update(
				$this->table_nodes,
				array('name' => $image_data['name']),
				array('type' => 'image', 'image_id' => $id)
			);
		}
		
		return true;
	}
	
	public function delete($id) {
		global $wpdb;
		
		$this->purge_cache($id);
		
		// Delete generic auxiliary images
		$this->clear_aux_images($id, 0, true); // skip image cleanup, as it'll be deleted anyway
		
		// Delete image nodes
		$nodes = $wpdb->get_col(
			$wpdb->prepare("
				SELECT ID
				FROM $this->table_nodes
				WHERE image_id = %d AND type= 'image'",
				$id
			)
		);
		foreach ($nodes as $node_id) {
			$this->clear_aux_images($id, $node_id);
		}
		
		// Delete nodes
		$wpdb->delete(
			$this->table_nodes,
			array(
				'type' => 'image',
				'image_id' => $id
			)
		);
		
		// Remove cover references
		$wpdb->query(
			$wpdb->prepare("
					UPDATE $this->table_nodes
					SET image_id = 0
					WHERE
						type IN ('folder', 'album')
						AND image_id = %d
				",
				$id)
		);
		
		// Delete image
		$image_row = $wpdb->get_row(
			$wpdb->prepare("
				SELECT path
				FROM $this->table_images
				WHERE ID = %d",
				$id
			),
			ARRAY_A
		);
		
		unlink($image_row['path']);
		
		$wpdb->delete(
			$this->table_images,
			array(
				'ID' => $id
			)
		);
		
		return true;
	}
	
	public function get_collection($collection_type, $view) {
		global $wpdb;
		$query = '';
		
		if ($view === 'list_item') {
			if ($collection_type == 'unsorted_images') {
				$query = "
						SELECT 
							image.ID,
							image.ID as image_id,
							image.created,
						  	image.slug,
							image.name,
							image.caption,
							image.description,
							image.filename,
							image.file_size,
							image.icon_url as icon_url,
							'image_entity' as type,
							0 as order_no
						FROM $this->table_images image
						LEFT OUTER JOIN $this->table_nodes node
						ON node.image_id = image.ID						
						WHERE node.ID IS NULL
						ORDER BY image.ID DESC";
			}
			else if ($collection_type == 'all_images') {
				$query = "
						SELECT 
							image.ID,
							image.ID as image_id,
							image.created,
						  	image.slug,
							image.name,
							image.caption,
							image.description,
							image.filename,
							image.file_size,
							image.icon_url as icon_url,
							'image_entity' as type,
							0 as order_no
						FROM $this->table_images image
						ORDER BY image.ID DESC";
			}
			else {
				return new \WP_Error('vls_gf_logic_error', 'Invalid collection type "' . $collection_type . '"');
			}
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
			$image = new \vilyon\gallery_factory\entities\Image($row, $view);
			array_push($collection, $image);
		}
		
		return $collection;
	}
	
	public function get_collection_descendant($parent_id, $view) {
		global $wpdb;
		
		$query = $wpdb->prepare("
				select
				  t.image_id as ID,
				  image.icon_url as icon_url,
				  image.cover_url as cover_url
				from (
					select distinct
						-- ifnull(L7.ID, ifnull(L6.ID, ifnull(L5.ID, ifnull(L4.ID, ifnull(L3.ID, ifnull(L2.ID, L1.ID)))))) as ID,	
						ifnull(L7.image_id, ifnull(L6.image_id, ifnull(L5.image_id, ifnull(L4.image_id, ifnull(L3.image_id, ifnull(L2.image_id, L1.image_id)))))) as image_id
					from $this->table_nodes L1
					left join $this->table_nodes L2 on L1.ID = L2.parent_id
					left join $this->table_nodes L3 on L2.ID = L3.parent_id
					left join $this->table_nodes L4 on L3.ID = L4.parent_id
					left join $this->table_nodes L5 on L4.ID = L5.parent_id
					left join $this->table_nodes L6 on L5.ID = L6.parent_id
					left join $this->table_nodes L7 on L6.ID = L7.parent_id
					where 
						L1.ID = %d
						and ifnull(L7.type, ifnull(L6.type, ifnull(L5.type, ifnull(L4.type, ifnull(L3.type, ifnull(L2.type, L1.type)))))) = 'image'
					) t
				LEFT OUTER JOIN $this->table_images image
				ON image.ID = t.image_id
				ORDER BY t.image_id          
			",
			$parent_id
		);
		
		$results = $wpdb->get_results($query, ARRAY_A);
		
		if ($wpdb->last_error) {
			return new \WP_Error('vls_gf_sql_error', $wpdb->last_error);
		}
		
		$collection = array();
		foreach ($results as $row) {
			$image = new \vilyon\gallery_factory\entities\Image($row, $view);
			array_push($collection, $image);
		}
		
		return $collection;
	}
	
	public function delete_collection($collection) {
		foreach ($collection as $image_id) {
			$this->delete($image_id);
		}
		
		return true;
	}
	
	public function move_collection($collection, $from_folder_id, $to_folder_id) {
		
		// if somehow source and target are the same, exit
		if ($from_folder_id == $to_folder_id) {
			return true;
		}
		
		/** @var \vilyon\gallery_factory\logic\Folder_Logic $folder_logic */
		$folder_logic = $this->logic->get('folder');
		
		// Unlink
		if ($from_folder_id > 0) {
			foreach ($collection as $image_id) {
				$folder_logic->unlink_image(0, $image_id, $from_folder_id);
			}
		}
		
		// Link
		if ($to_folder_id > 0) {
			$to_folder = $folder_logic->get($to_folder_id, '_link_image_data');
			foreach ($collection as $image_id) {
				$image = $this->get($image_id, '_essential');
				$folder_logic->link_image($image, $to_folder);
			}
		}
		
		return true;
	}
	
	/**
	 * Imports a file into the library
	 *
	 * @param array $file
	 * @param int $parent_id
	 * @return \vilyon\gallery_factory\entities\Image
	 */
	public function import_file($file, $parent_id = 0) {
		global $wpdb;
		
		$url = $file['url'];
		$path = $file['file'];
		
		// Init values with the probably passed in data
		$mime_type = $file['type'];
		$name = isset($file['title']) ? $file['title'] : '';
		$caption = isset($file['caption']) ? $file['caption'] : '';
		$description = isset($file['description']) ? $file['description'] : '';
		$alt_text = isset($file['alt_text']) ? $file['alt_text'] : '';
		
		$name_parts = $this->pathinfo($path);
		
		//read image metadata
		$image_meta = $this->read_image_metadata($path);
		
		//region Rotate image based on exif orientation info
		
		$exif_orient = isset($image_meta['orientation']) ? $image_meta['orientation'] : 1;
		$rotate_angle = 0;
		
		//get rotation angle
		if (6 == $exif_orient) {
			$rotate_angle = 270;
			$t = $image_meta['width'];
			$image_meta['width'] = $image_meta['height'];
			$image_meta['height'] = $t;
		}
		elseif (3 == $exif_orient) {
			$rotate_angle = 180;
		}
		elseif (8 == $exif_orient) {
			$rotate_angle = 90;
			$t = $image_meta['width'];
			$image_meta['width'] = $image_meta['height'];
			$image_meta['height'] = $t;
		}
		$image_meta['orientation'] = 1;
		
		//if the image is rotated
		if ($rotate_angle > 0) {
			$editor = wp_get_image_editor($path);
			$result = $editor->rotate($rotate_angle);
			if (!is_wp_error($result)) {
				$editor->save($path);
			}
			unset($editor);
		}
		
		//endregion
		
		// Populate image properties
		if ($image_meta) {
			if (trim($image_meta['title']) && !is_numeric(sanitize_title($image_meta['title']))) {
				$name = empty($name) ? $image_meta['title'] : $name;
			}
			$caption = empty($caption) ? $image_meta['title'] : $caption;
			$alt_text = empty($alt_text) ? $caption : $alt_text;
			$description = empty($description) ? $image_meta['description'] : $description;
			if (trim($image_meta['caption'])) {
				$description = empty($description) ? $image_meta['caption'] : $description;
			}
		}
		$name = empty($name) ? $name_parts['filename'] : $name;
		$caption = empty($caption) ? $name : $caption;
		
		// Store values for inserting to the image entry
		$file_size = $image_meta['file_size'];
		$image_width = $image_meta['width'];
		$image_height = $image_meta['height'];
		
		// Remove redundant keys from meta
		unset($image_meta['file_size']);
		unset($image_meta['width']);
		unset($image_meta['height']);
		
		// Create image data structure
		$now = current_time('mysql');
		$image_data = array(
			'created' => $now,
			'modified' => $now,
			'created_by' => get_current_user_id(),
			'filename' => $name_parts['basename'],
			'path' => $path,
			'url' => $url,
			'slug' => sanitize_title($name),
			'name' => $name,
			'caption' => $caption,
			'description' => $description,
			'alt_text' => $alt_text,
			'mime_type' => $mime_type,
			'file_size' => $file_size,
			'width' => $image_width,
			'height' => $image_height,
			'image_meta' => serialize($image_meta),
			'timestamp' => current_time('timestamp')
		);
		
		// Insert image entry
		$wpdb->insert(
			$this->table_images,
			$image_data
		);
		
		$image_data['ID'] = $wpdb->insert_id;
		
		$image = new \vilyon\gallery_factory\entities\Image($image_data);
		
		// if album ID is specified, link the uploaded image to this item
		if ($parent_id > 0) {
			/** @var \vilyon\gallery_factory\logic\Folder_Logic $folder_logic */
			$folder_logic = $this->logic->get('folder');
			$parent_folder = $folder_logic->get($parent_id, '_link_image_data');
			$folder_logic->link_image($image, $parent_folder);
		}
		
		// Create intermediate images
		$result = $this->create_aux_images($image);
		if (is_wp_error($result)) {
			return $result;
		}
		
		return $image;
	}
	
	/**
	 * Function for the same purpose as the stock php pathinfo, but works with utf8 filenames.
	 *
	 * @param string $path
	 *
	 * @return array
	 */
	public function pathinfo($path) {
		$path = strtr($path, array('\\' => '/'));
		preg_match('/(.*?)([^\/]*?)(\.(\w*))?$/', $path, $captured);
		
		if (!array_key_exists(3, $captured)) {
			$captured[3] = '';
			$captured[4] = '';
		}
		
		$dirname = $captured[1];
		
		// Remove leading slash
		if (substr($dirname, 0) === '/') {
			$dirname = substr($dirname, 1);
		}
		
		// Remove trailing slash
		if (substr($dirname, -1) === '/') {
			$dirname = substr($dirname, 0, strlen($dirname) - 1);
		}
		
		return array(
			'dirname' => $dirname,
			'basename' => $captured[2] . $captured[3],
			'extension' => $captured[4],
			'filename' => $captured[2]
		);
	}
	
	/**
	 * Deletes aux image data and files (generic OR node-specific)
	 * @param $image_id
	 * @param int $node_id
	 * @param bool $skip_image_cleanup - used to skip image data cleanup on image deleting
	 */
	public function clear_aux_images($image_id, $node_id = 0, $skip_image_cleanup = false) {
		global $wpdb;
		
		$files = $wpdb->get_col(
			$wpdb->prepare("
					SELECT path
					FROM $this->table_aux_images
					WHERE image_id = %d AND node_id = %d",
				$image_id, $node_id
			)
		);
		
		// Delete files
		foreach ($files as $file) {
			unlink($file);
		}
		
		// Delete DB entries
		if (!$skip_image_cleanup && $node_id === 0) {
			$wpdb->update($this->table_images, array('icon_url' => '', 'cover_url' => ''), array('ID' => $image_id));
		}
		
		$delete_where = array(
			'image_id' => $image_id,
			'node_id' => $node_id
		);
		
		$wpdb->delete($this->table_aux_images, $delete_where);
		
	}
	
	/**
	 * (Re)creates auxiliary images. If node ID is 0, creates the generic set, otherwise node-specific
	 *
	 * @param \vilyon\gallery_factory\entities\Image $image
	 *
	 * @return bool|\WP_Error
	 */
	public function create_aux_images($image, $node_id = 0, $crop_meta = null) {
		global $wpdb;
		$thumbnail_dimensions = get_option('vls_gf_thumbnail_dimensions');
		
		$aux_images_config = array(
			'icon' => array(
				'width' => 160,
				'height' => 160,
				'exact_dimension' => true,
				'use_crop' => false
			),
			'cover' => array(
				'width' => 320,
				'height' => 1200,
				'exact_dimension' => false,
				'use_crop' => false
			),
			/*--------------------------------------------------------*/
			'preview-m' => array(
				'width' => $thumbnail_dimensions['width'],
				'height' => $thumbnail_dimensions['height'],
				'exact_dimension' => false,
				'use_crop' => true
			)
		);
		
		// We're creating cropped images only linked to specific nodes.
		if ($node_id > 0) {
			$do_crop = is_array($crop_meta) && array_key_exists('top', $crop_meta);
			// Don't create any images if there's no crop set (will use generic image instead).
			if (!$do_crop) {
				return true;
			}
		}
		else {
			$do_crop = false;
		}
		
		if ($do_crop) {
			$crop_top = intval($crop_meta['top']);
			$crop_left = intval($crop_meta['left']);
			$crop_width = intval($crop_meta['width']);
			$crop_height = intval($crop_meta['height']);
		}
		
		// Bail out if the image file is not found
		if (!is_file($image->path)) {
			if (WP_DEBUG === true) {
				error_log('GF > Image file not found: ' . $image->path);
			}
			return true;
		}
		
		// Create aux images
		foreach ($aux_images_config as $size_id => $size_config) {
			
			// Recreate only crop-dependant sizes
			if ($do_crop && !$size_config['use_crop']) {
				continue;
			}
			
			$editor = wp_get_image_editor($image->path);
			
			if (is_wp_error($editor)) {
				return $editor;
			}
			
			// Crop the image if needed
			if ($do_crop && $size_config['use_crop']) {
				$result = $editor->crop($crop_left, $crop_top, $crop_width, $crop_height);
				if (is_wp_error($result)) {
					return $result;
				}
			}
			
			$img_size = $editor->get_size();
			
			if ($img_size['width'] > $size_config['width'] || $img_size['height'] > $size_config['height']) {
				$result = $editor->resize($size_config['width'], $size_config['height'], $size_config['exact_dimension']);
				if (is_wp_error($result)) {
					return $result;
				}
				$img_size = $editor->get_size();
			}
			
			$path = $image->get_path($size_id);
			$url = $image->get_url($size_id);
			
			// For a croppable image size append node ID to the filename
			if ($size_config['use_crop']) {
				$pathinfo = $this->pathinfo($path);
				$path = $pathinfo['dirname'] . '/' . $pathinfo['filename'] . '-' . $node_id . (empty($pathinfo['extension']) ? '' : '.' . $pathinfo['extension']);
				$pathinfo = $this->pathinfo($url);
				$url = $pathinfo['dirname'] . '/' . $pathinfo['filename'] . '-' . $node_id . (empty($pathinfo['extension']) ? '' : '.' . $pathinfo['extension']);
			}
			
			$editor->save($path);
			
			// Save to DB
			if ($size_id == 'icon' || $size_id == 'cover') {
				$update_array = array();
				$update_array[$size_id . '_url'] = $url;
				$wpdb->update($this->table_images, $update_array, array('ID' => $image->ID));
			}
			
			$wpdb->insert(
				$this->table_aux_images,
				array(
					'image_id' => $image->ID,
					'node_id' => $node_id,
					'size_id' => $size_id,
					'path' => $path,
					'url' => $url,
					'width' => $img_size['width'],
					'height' => $img_size['height'],
					'timestamp' => current_time('timestamp')
				)
			);
		}
		
		$this->purge_cache($image->ID);
		
		return true;
	}
	
	/**
	 * Function based on wordpress function wp_read_image_metadata. Extended with some useful info.
	 *
	 * Get extended image metadata, exif or iptc as available.
	 *
	 * @param string $file
	 *
	 * @return bool|array False on failure. Image metadata array on success.
	 */
	public function read_image_metadata($file) {
		if (!file_exists($file)) {
			return false;
		}
		
		list($width, $height, $sourceImageType) = getimagesize($file);
		
		$file_size = filesize($file);
		
		/*
		* EXIF contains a bunch of data we'll probably never need formatted in ways
		* that are difficult to use. We'll normalize it and just extract the fields
		* that are likely to be useful. Fractions and numbers are converted to
		* floats, dates to unix timestamps, and everything else to strings.
		*/
		$meta = array(
			'width' => $width,
			'height' => $height,
			'file_size' => $file_size,
			'aperture' => 0,
			'camera' => '',
			'lens' => '',
			'title' => '',
			'caption' => '',
			'description' => '',
			'created_timestamp' => 0,
			'credit' => '',
			'artist' => '',
			'copyright' => '',
			'focal_length' => 0,
			'focal_length_35mm' => 0,
			'iso' => 0,
			'shutter_speed' => 0,
			'orientation' => 0,
			'tags' => ''
		);
		
		/*
		* Read IPTC first, since it might contain data not available in exif such
		* as caption, description etc.
		*/
		if (is_callable('iptcparse')) {
			getimagesize($file, $info);
			
			if (!empty($info['APP13'])) {
				$iptc = iptcparse($info['APP13']);
				
				// Headline, "A brief synopsis of the caption."
				if (!empty($iptc['2#105'][0])) {
					$meta['title'] = trim($iptc['2#105'][0]);
				}
				elseif (!empty($iptc['2#005'][0])) {
					$meta['title'] = trim($iptc['2#005'][0]);
				}
				
				if (!empty($iptc['2#120'][0])) { // description / legacy caption
					$caption = trim($iptc['2#120'][0]);
					if (empty($meta['title'])) {
						mbstring_binary_safe_encoding();
						$caption_length = strlen($caption);
						reset_mbstring_encoding();
						
						// Assume the title is stored in 2:120 if it's short.
						if ($caption_length < 80) {
							$meta['title'] = $caption;
						}
						else {
							$meta['caption'] = $caption;
						}
					}
					elseif ($caption != $meta['title']) {
						$meta['caption'] = $caption;
					}
				}
				
				if (!empty($iptc['2#110'][0])) // credit
				{
					$meta['credit'] = trim($iptc['2#110'][0]);
				}
				elseif (!empty($iptc['2#080'][0])) // creator / legacy byline
				{
					$meta['credit'] = trim($iptc['2#080'][0]);
				}
				
				if (!empty($iptc['2#055'][0]) and !empty($iptc['2#060'][0])) // created date and time
				{
					$meta['created_timestamp'] = strtotime($iptc['2#055'][0] . ' ' . $iptc['2#060'][0]);
				}
				
				if (!empty($iptc['2#080'][0])) // author
				{
					$meta['author'] = trim($iptc['2#080'][0]);
				}
				
				if (!empty($iptc['2#116'][0])) // copyright
				{
					$meta['copyright'] = trim($iptc['2#116'][0]);
				}
				
				if (!empty($iptc['2#025']))// tags
				{
					$tags_arr = $iptc['2#025'];
					if (!empty($tags_arr[0])) {
						foreach ($tags_arr as $tag) {
							$meta['tags'] .= ($meta['tags'] === '' ? '' : ', ') . trim($tag);
						}
					}
				}
				
			}
		}
		
		/**
		 * Filter the image types to check for exif data.
		 *
		 * @since 2.5.0
		 *
		 * @param array $image_types Image types to check for exif data.
		 */
		if (is_callable('exif_read_data') && in_array($sourceImageType, apply_filters('wp_read_image_metadata_types', array(
				IMAGETYPE_JPEG,
				IMAGETYPE_TIFF_II,
				IMAGETYPE_TIFF_MM
			)))
		) {
			$exif = @exif_read_data($file, 'ANY_TAG');
			
			if (!empty($exif['Title'])) {
				$meta['title'] = trim($exif['Title']);
			}
			
			if (!empty($exif['ImageDescription'])) {
				mbstring_binary_safe_encoding();
				$description_length = strlen($exif['ImageDescription']);
				reset_mbstring_encoding();
				
				if (empty($meta['title']) && $description_length < 80) {
					// Assume the title is stored in ImageDescription
					$meta['title'] = trim($exif['ImageDescription']);
					if (empty($meta['caption']) && !empty($exif['COMPUTED']['UserComment']) && trim($exif['COMPUTED']['UserComment']) != $meta['title']) {
						$meta['caption'] = trim($exif['COMPUTED']['UserComment']);
					}
				}
				elseif (empty($meta['caption']) && trim($exif['ImageDescription']) != $meta['title']) {
					$meta['caption'] = trim($exif['ImageDescription']);
				}
				
			}
			elseif (empty($meta['caption']) && !empty($exif['Comments']) && trim($exif['Comments']) != $meta['title']) {
				$meta['caption'] = trim($exif['Comments']);
				
			}
			
			if (!empty($exif['ImageDescription'])) {
				$meta['description'] = trim($exif['ImageDescription']);
			}
			
			if (empty($meta['credit'])) {
				if (!empty($exif['Artist'])) {
					$meta['credit'] = trim($exif['Artist']);
				}
				elseif (!empty($exif['Author'])) {
					$meta['credit'] = trim($exif['Author']);
				}
			}
			
			if (empty($meta['copyright']) && !empty($exif['Copyright'])) {
				$meta['copyright'] = trim($exif['Copyright']);
			}
			if (!empty($exif['FNumber'])) {
				$meta['aperture'] = round(wp_exif_frac2dec($exif['FNumber']), 2);
			}
			if (!empty($exif['Make'])) {
				$meta['camera'] = trim($exif['Make']);
			}
			if (!empty($exif['Model'])) {
				$model = trim($exif['Model']);
				if (empty($meta['camera']) || strpos($model, $meta['camera'])) {
					$meta['camera'] = $model;
				}
				else {
					$meta['camera'] = $meta['camera'] . ' ' . $model;
				}
			}
			if (!empty($exif['UndefinedTag:0xA434'])) {
				$meta['lens'] = trim($exif['UndefinedTag:0xA434']);
			}
			elseif (!empty($exif['UndefinedTag:0x0095'])) {
				$meta['lens'] = trim($exif['UndefinedTag:0x0095']);
			}
			
			if (empty($meta['created_timestamp']) && !empty($exif['DateTimeDigitized'])) {
				$meta['created_timestamp'] = wp_exif_date2ts($exif['DateTimeDigitized']);
			}
			if (!empty($exif['FocalLength'])) {
				$meta['focal_length'] = (string)wp_exif_frac2dec($exif['FocalLength']);
			}
			if (!empty($exif['FocalLengthIn35mmFilm'])) {
				$meta['focal_length_35mm'] = (string)wp_exif_frac2dec($exif['FocalLengthIn35mmFilm']);
			}
			if (!empty($exif['ISOSpeedRatings'])) {
				$meta['iso'] = is_array($exif['ISOSpeedRatings']) ? reset($exif['ISOSpeedRatings']) : $exif['ISOSpeedRatings'];
				$meta['iso'] = trim($meta['iso']);
			}
			if (!empty($exif['ExposureTime'])) {
				$meta['shutter_speed'] = (string)wp_exif_frac2dec($exif['ExposureTime']);
			}
			if (!empty($exif['Orientation'])) {
				$meta['orientation'] = $exif['Orientation'];
			}
		}
		
		foreach (
			array(
				'title',
				'caption',
				'description',
				'credit',
				'artist',
				'copyright',
				'camera',
				'iso'
			) as $key
		) {
			if ($meta[$key] && !seems_utf8($meta[$key])) {
				$meta[$key] = utf8_encode($meta[$key]);
			}
		}
		
		foreach ($meta as &$value) {
			if (is_string($value)) {
				$value = wp_kses_post($value);
			}
		}
		
		return $meta;
		
	}
	
	private function purge_cache($image_id) {
		global $wpdb;
		$album_transient_prefix = 'vls_gf_album_';
		
		// Purge cache for all folders containing the image as an item
		$nodes = $wpdb->get_col(
			$wpdb->prepare("
				SELECT DISTINCT parent_id
				FROM $this->table_nodes
				WHERE image_id = %d AND type= 'image'",
				$image_id
			)
		);
		foreach ($nodes as $node_id) {
			delete_transient($album_transient_prefix . $node_id);
		}
		
		// Purge cache for all folders having the image as a cover, and their parents
		$nodes = $wpdb->get_results(
			$wpdb->prepare("
				SELECT DISTINCT ID, parent_id
				FROM $this->table_nodes
				WHERE image_id = %d AND type IN ('folder', 'album')",
				$image_id
			), ARRAY_A
		);
		foreach ($nodes as $node) {
			delete_transient($album_transient_prefix . $node['ID']);
			if ($node['parent_id'] > 0) {
				delete_transient($album_transient_prefix . $node['parent_id']);
			}
		}
	}
}