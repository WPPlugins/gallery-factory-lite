<?php namespace vilyon\gallery_factory\admin\api;

class Other_API extends \vilyon\gallery_factory\core\API_Base {
	/**
	 * Returns folders and albums view for displaying in TinyMCE editor dialog
	 */
	public function view_tinymce_album_selection_dialog() {
		$node_logic = $this->logic->get('node');
		$nodes = $node_logic->get_all_as_array();
		$html = $this->tinymce_list_render_child_items($nodes, 0);
		
		echo('<div class="vls-gf-container"><ul>' . $html . '</ul></div>');
		
		die();
	}
	
	/**
	 * Regenerates auxiliary image sizes
	 */
	public function regenerate_thumbnails_batch() {
		$this->ajax_security_check();
		set_time_limit(0);
		
		global $wpdb;
		$table_images = $this->config['tables']['images'];
		$table_nodes = $this->config['tables']['nodes'];
		
		$batch_no = intval($_POST['batch_no']);
		$batch_size = 5;

		/** @var  \vilyon\gallery_factory\logic\Image_Logic $image_logic */
		$image_logic = $this->logic->get('image');
		
		$image_rows = $wpdb->get_results(
			$wpdb->prepare("
					SELECT 
						image.ID,
						image.path,
						image.url												
					FROM $table_images image
					ORDER BY image.ID ASC
					LIMIT %d, %d;
				",
				($batch_no - 1) * $batch_size,
				$batch_size
			), ARRAY_A
		);
		
		foreach ($image_rows as $image_row) {
			
			$image = new \vilyon\gallery_factory\entities\Image($image_row);

			$image_logic->clear_aux_images($image->ID);
			
			$nodes = $wpdb->get_results(
				$wpdb->prepare("
						SELECT 
							node.ID, 
						    node.crop_meta
						FROM $table_nodes node
						WHERE node.type = 'image' AND node.image_id = %d
						ORDER BY node.ID ASC;
					",
					$image->ID
				), ARRAY_A
			);
			
			foreach ($nodes as $node) {
				$image_logic->clear_aux_images($image->ID, $node['ID']);

				$crop_meta = unserialize($node['crop_meta']);

				$result = $image_logic->create_aux_images($image, $node['ID'], $crop_meta);
				if (is_wp_error($result)) {
					$this->send_data($result);
					return;
				}
			}
			
			$result = $image_logic->create_aux_images($image);
			if (is_wp_error($result)) {
				$this->send_data($result);
				return;
			}
		}
		
		
		$response = array(
			'success' => true,
			'result' => (count($image_rows) == $batch_size) ? 'progress' : 'complete',
			'batch_no' => $batch_no
		);
		
		//counting images on processing the first batch
		if ($batch_no == 1) {
			$total_count = $wpdb->get_var("
				SELECT COUNT(*)
				FROM $table_images image
				LIMIT 1;"
			);
			$response['total_batches'] = ceil($total_count / $batch_size);
		}
		
		wp_send_json($response);
	}
	
	public function import_wp_media_batch() {
		$this->ajax_security_check();
		
		set_time_limit(0);
		
		global $wpdb;
		
		/** @var  \vilyon\gallery_factory\logic\Image_Logic $image_logic */
		$image_logic = $this->logic->get('image');
		
		$batch_no = intval($_POST['batch_no']);
		$batch_size = 10;
		
		$wp_upload_dir = wp_upload_dir();
		$gf_upload_dir = WP_CONTENT_DIR . '/' . $this->config['uploads_dir_name'];
		
		$posts = $wpdb->get_results(
			$wpdb->prepare("
                        SELECT p.ID, p.post_title as title, p.post_excerpt as caption,
                          p.post_content as description, p.post_mime_type as mime_type,
                          m1.meta_value as attached_file, IFNULL(m2.meta_value, '') as alt_text
                        FROM $wpdb->posts p
                        INNER JOIN $wpdb->postmeta m1
                        ON
                          p.ID = m1.post_id
                          AND p.post_type = %s
                          AND p.post_mime_type IN (%s, %s, %s)
                          AND m1.meta_key = %s
                        LEFT JOIN $wpdb->postmeta m2
                        ON
                          p.ID = m2.post_id
                          AND m2.meta_key = %s
                        ORDER BY p.ID ASC
                        LIMIT %d, %d;",
				'attachment',
				'image/jpeg', 'image/gif', 'image/tiff',
				'_wp_attached_file',
				'_wp_attachment_image_alt',
				($batch_no - 1) * $batch_size,
				$batch_size
			)
		);
		
		foreach ($posts as $media_post) {
			
			$wp_media_file_location = $wp_upload_dir['basedir'] . '/' . $media_post->attached_file;
			
			if (!file_exists($wp_media_file_location)) {
				continue;
			}
			
			//getting WP media file info
			$media_file = $image_logic->pathinfo($media_post->attached_file);
			
			//creating the folder if not exists
			$gf_upload_subdir = $gf_upload_dir . '/' . $media_file['dirname'] . '/';
			if (!file_exists($gf_upload_subdir)) {
				mkdir($gf_upload_subdir, 0777, true);
			}
			
			//finding the unoccupied name for the file (incrementing postfix until success)
			$run = true;
			$a = 0;
			$gf_filename = '';
			while ($run) {
				$gf_filename = $media_file['filename'] . ($a > 0 ? '-' . $a : '') . '.' . $media_file['extension'];
				if (!file_exists($gf_upload_subdir . $gf_filename)) {
					$run = false;
				}
				$a++;
			}
			
			//copying the file to GF uploads
			$gf_file_path = $gf_upload_subdir . $gf_filename;
			
			copy($wp_media_file_location, $gf_file_path);
			
			$file = array(
				'url' => content_url($this->config['uploads_dir_name'] . '/' . $media_file['dirname'] . '/' . $gf_filename),
				'file' => $gf_file_path,
				'type' => $media_post->mime_type,
				'title' => $media_post->title,
				'caption' => $media_post->caption,
				'description' => $media_post->description,
				'alt_text' => $media_post->alt_text
			);
			
			//attaching the file to GF
			$image_logic->import_file($file);
			
		}
		
		$response = array(
			'success' => true,
			'result' => (count($posts) == $batch_size) ? 'progress' : 'complete',
			'batch_no' => $batch_no
		);
		
		//counting images on processing the first batch
		if ($batch_no == 1) {
			$total_count = $wpdb->get_var(
				$wpdb->prepare("
                        SELECT COUNT(*)
                        FROM $wpdb->posts p
                        WHERE p.post_type = %s
                          AND p.post_mime_type IN (%s, %s, %s)
                        LIMIT 1;",
					'attachment',
					'image/jpeg', 'image/gif', 'image/tiff'
				)
			);
			$response['total_batches'] = ceil($total_count / $batch_size);
		}
		
		wp_send_json($response);
	}
	
	public function import_nextgen() {
		$this->ajax_security_check();
		
		//remove time limit so this long-running script won't be interrupted by timeout
		set_time_limit(0);
		
		global $wpdb;
		$table_ngg_album = $wpdb->prefix . 'ngg_album';
		$table_ngg_gallery = $wpdb->prefix . 'ngg_gallery';
		$table_ngg_pictures = $wpdb->prefix . 'ngg_pictures';
		
		/** @var  \vilyon\gallery_factory\logic\Node_Logic $node_logic */
		$node_logic = $this->logic->get('node');
		
		/** @var  \vilyon\gallery_factory\logic\Folder_Logic $folder_logic */
		$folder_logic = $this->logic->get('folder');
		
		/** @var  \vilyon\gallery_factory\logic\Image_Logic $image_logic */
		$image_logic = $this->logic->get('image');
		
		$table_nodes = $this->config['tables']['nodes'];
		
		
		$create_ngg_root_folder = false;
		if (isset($_POST['create_folder']) && $_POST['create_folder'] == 'true') {
			$create_ngg_root_folder = true;
		}
		
		//check if the NGG table exist
		
		if (!$wpdb->get_var("SHOW TABLES LIKE '" . $table_ngg_album . "'")) {
			$response = array(
				'success' => false,
				'message' => __('No installed NextGen gallery found', $this->config['textdomain'])
			);
			wp_send_json($response);
		}
		
		$gf_items = array();
		$tmp_id = 0;
		$current_tmp_id = 0;
		
		$time = current_time('mysql');
		$upload_dir = wp_upload_dir($time);
		$upload_dir = $this->config['uploads_dir_name'] . $upload_dir['subdir'] . '/';
		$upload_abs_dir = WP_CONTENT_DIR . '/' . $upload_dir;
		
		//region Map NGG albums to GF folders
		
		$ngg_albums = $wpdb->get_results("SELECT * FROM " . $table_ngg_album);
		
		foreach ($ngg_albums as $ngg_album) {
			$ngg_id = intval($ngg_album->id);
			$ngg_name = $ngg_album->name;
			$ngg_description = $ngg_album->albumdesc;
			$sortorder = $ngg_album->sortorder;
			$sortorder_decoded = str_replace("[", "", str_replace("]", "", base64_decode($sortorder)));
			$sortorder_array = explode(",", $sortorder_decoded);
			
			//if folder is already added to GF array (probably multiple instances), then update its properties
			$is_found = false;
			foreach ($gf_items as $key => $value) {
				if ($value['type'] == 'folder' && $value['ngg_id'] == $ngg_id) {
					$gf_items[$key]['title'] = $ngg_name;
					$gf_items[$key]['description'] = $ngg_description;
					$gf_items[$key]['loaded'] = 1;
					$is_found = true;
				}
			}
			
			//if not found, create a new folder
			if (!$is_found) {
				$tmp_id++;
				$new_item = array();
				$new_item['type'] = 'folder';
				$new_item['tmp_id'] = $tmp_id;
				$new_item['ngg_id'] = $ngg_id;
				$new_item['title'] = $ngg_name;
				$new_item['description'] = $ngg_description;
				$new_item['parent_tmp_id'] = 0;
				$new_item['parents'] = array();
				$new_item['loaded'] = 1;
				array_push($gf_items, $new_item);
			}
			
			//loop through GF instances of the current folder and add child items to each
			if (!empty($sortorder_decoded)) {
				foreach ($gf_items as $key => $value) {
					
					if ($value['type'] == 'folder' && $value['ngg_id'] == $ngg_id) {
						
						$current_tmp_id = $value['tmp_id'];
						
						//add current level parent to the parents array
						$parents = $value['parents'];
						array_push($parents, $ngg_id);
						
						// loop through NGG child items
						foreach ($sortorder_array as $sort) {
							
							$sort = str_replace("\"", "", $sort);
							
							
							//child item is an NGG album
							if (substr($sort, 0, 1) == "a") {
								$ngg_child_id = intval(substr($sort, 1));
								$item_type = 'folder';
							}
							else {
								$ngg_child_id = intval($sort);
								$item_type = 'album';
							}
							
							//if the current item is a folder and is found in parent graph, ignore it
							if ($item_type == 'folder') {
								$is_found = false;
								foreach ($parents as $key => $value) {
									if ($value == $ngg_child_id) {
										$is_found = true;
									}
								}
								if ($is_found) {
									continue;
								}
							}
							
							//lookup this item in GF array
							//if found and it doesn't already has a parent, then set a parent
							$is_found = false;
							foreach ($gf_items as $key => $value) {
								if ($value['type'] == $item_type && $value['ngg_id'] == $ngg_child_id && $value['parent_tmp_id'] == 0) {
									$is_found = true;
									$gf_items[$key]['parent_tmp_id'] = $current_tmp_id;
									$gf_items[$key]['parents'] = $parents;
								}
							}
							
							//else create a new folder
							if (!$is_found) {
								$tmp_id++;
								
								$new_item = array();
								$new_item['type'] = $item_type;
								$new_item['tmp_id'] = $tmp_id;
								$new_item['ngg_id'] = $ngg_child_id;
								$new_item['title'] = '';
								$new_item['description'] = '';
								$new_item['parent_tmp_id'] = $current_tmp_id;
								$new_item['parents'] = $parents;
								$new_item['loaded'] = 0;
								
								//if already have loaded this folder, get its attributes
								foreach ($gf_items as $key => $value) {
									if ($value['type'] == $item_type && $value['ngg_id'] == $ngg_child_id && $value['loaded'] == 1) {
										$new_item['title'] = $value['title'];
										$new_item['description'] = $value['description'];
										$new_item['loaded'] = 1;
										break;
									}
								}
								
								array_push($gf_items, $new_item);
								
							}
							
							
						} //end loop through NGG child items
					}
					
				} // end loop by GF instances of the current folder
			}
		}
		
		//endregion
		
		//region Map NGG galleries to GF albums
		
		$ngg_galleries = $wpdb->get_results("SELECT * FROM " . $table_ngg_gallery);
		
		
		foreach ($ngg_galleries as $ngg_gallery) {
			
			$ngg_id = intval($ngg_gallery->gid);
			$ngg_name = $ngg_gallery->name;
			$ngg_description = $ngg_gallery->galdesc;
			
			//if album is already added to GF array (probably multiple instances), then update its properties
			$is_found = false;
			foreach ($gf_items as $key => $value) {
				if ($value['type'] == 'album' && $value['ngg_id'] == $ngg_id) {
					$gf_items[$key]['title'] = $ngg_name;
					$gf_items[$key]['description'] = $ngg_description;
					$gf_items[$key]['loaded'] = 1;
					$is_found = true;
				}
			}
			
			//if not found, create a new album
			if (!$is_found) {
				
				$tmp_id++;
				$new_item = array();
				$new_item['type'] = 'album';
				$new_item['tmp_id'] = $tmp_id;
				$new_item['ngg_id'] = $ngg_id;
				$new_item['title'] = $ngg_name;
				$new_item['description'] = $ngg_description;
				$new_item['parent_tmp_id'] = 0;
				$new_item['parents'] = array();
				$new_item['loaded'] = 1;
				array_push($gf_items, $new_item);
				
			}
			
		}
		
		//endregion
		
		//region Calculate sort order
		
		$sort_order = ($create_ngg_root_folder == true) ? 1 : 0;
		$this->import_nextgen_calculate_sort_order($sort_order, $gf_items, 0);
		
		//endregion
		
		//region Write GF folders to database
		
		// Sort by order
		$order_array = array();
		foreach ($gf_items as $key => $item) {
			$order_array[$key] = $item['gf_sort_order'];
		}
		array_multisort($order_array, SORT_ASC, $gf_items);
		
		// Get last order
		$last_order = $wpdb->get_var(
			$wpdb->prepare("
					SELECT MAX(node.order_no)
					FROM $table_nodes node
					WHERE node.type IN ('folder', 'album') AND node.parent_id = 0"
			)
		);
		if ($last_order == null) {
			$last_order = 0;
		}
		
		//create root folder if needed
		$root_id = 0;
		if ($create_ngg_root_folder == true) {
			$data = array(
				'name' => 'NextGen',
				'type' => 'folder',
				'parent_id' => 0,
				'menu_order' => $last_order + 1
			);
			
			$root_id = $folder_logic->create($data);
		}
		
		//create items
		foreach ($gf_items as $key => $value) {
			
			$post_data = array(
				'name' => $value['title'],
				'description' => $value['description'],
				'type' => $value['type'],
				'parent_id' => $root_id,
				'post_status' => 'draft',
				'menu_order' => $last_order + $value['gf_sort_order']
			);
			
			$id = $folder_logic->create($post_data);
			
			$gf_items[$key]['gf_id'] = $id;
			
		}
		
		//update folder parents
		foreach ($gf_items as $key => $value) {
			foreach ($gf_items as $parent_key => $parent_value) {
				if ($parent_value['tmp_id'] == $value['parent_tmp_id']) {
					$data = array(
						'id' => $value['gf_id'],
						'parent_id' => $parent_value['gf_id']
					);
					$node_logic->update($data);
				}
			}
		}
		
		//endregion
		
		//region Import images
		$ngg_pictures = $wpdb->get_results("
				SELECT p.*, g.path AS path
				FROM " . $table_ngg_pictures . " p
				INNER JOIN " . $table_ngg_gallery . " g
				ON p.galleryid = g.gid
				ORDER BY galleryid ASC, sortorder ASC
			");
		
		
		foreach ($ngg_pictures as $ngg_picture) {
			
			$ngg_id = intval($ngg_picture->pid);
			$ngg_gallery_id = intval($ngg_picture->galleryid);
			$ngg_alttext = $ngg_picture->alttext;
			$ngg_description = $ngg_picture->description;
			$ngg_filename = $ngg_picture->filename;
			$ngg_path = ABSPATH . $ngg_picture->path . '/' . $ngg_filename;
			
			
			//skipping the image if the file doesn't exist
			if (!file_exists($ngg_path)) {
				continue;
			}
			
			//get mime type
			$ngg_path_mime = wp_check_filetype($ngg_path);
			
			//get the unique filename for the GF location
			$gf_filename = wp_unique_filename($upload_abs_dir, $ngg_filename);
			$gf_path = $upload_abs_dir . $gf_filename;
			
			//copy the original image
			copy($ngg_path, $gf_path);
			
			foreach ($gf_items as $gf_item) {
				
				if ($gf_item['type'] == 'album' && $gf_item['ngg_id'] == $ngg_gallery_id) {
					$file = array(
						'url' => content_url($upload_dir . $gf_filename),
						'file' => $gf_path,
						'type' => $ngg_path_mime['type'],
						'title' => $ngg_alttext,
						'caption' => $ngg_alttext,
						'description' => $ngg_description,
						'alt_text' => $ngg_alttext
					);
					
					//attaching the file to GF
					$image_logic->import_file($file, $gf_item['gf_id']);
				}
			}
		}
		
		//endregion
		
		$response = array(
			'success' => true
		);
		wp_send_json($response);
	}
	
	//region Private functions
	
	private function import_nextgen_calculate_sort_order(& $sort_order, & $gf_items, $parent_id) {
		
		foreach ($gf_items as $key => $value) {
			if ($value['parent_tmp_id'] == $parent_id) {
				
				$sort_order++;
				$gf_items[$key]['gf_sort_order'] = $sort_order;
				
				$this->import_nextgen_calculate_sort_order($sort_order, $gf_items, $value['tmp_id']);
			}
			
		}
		
		return;
	}
	
	/**
	 * Returns the children HTML for the tinymce plugin dialog
	 *
	 * @param $nodes array
	 * @param $parent_id int
	 *
	 * @return string
	 */
	private function tinymce_list_render_child_items($nodes, $parent_id) {
		
		$html = "";
		
		foreach ($nodes as $node) {
			
			if ($parent_id == $node['parent_id']) {
				
				if ($node['type'] == 'album') {
					$html .= '<li class="vls-gf-album" data-id="' . $node['ID'] . '"><i></i>' . $node['name'];
				}
				else {
					$html .= '<li class="vls-gf-folder" data-id="' . $node['ID'] . '"><i></i>' . $node['name'];
				}
				
				$subHtml = $this->tinymce_list_render_child_items($nodes, $node['ID']);
				if (!empty($subHtml)) {
					$html .= '<ul>' . $subHtml . '</ul>';
				}
				
				$html .= '</li>';
			}
		}
		
		return $html;
	}
	
	//endregion
}