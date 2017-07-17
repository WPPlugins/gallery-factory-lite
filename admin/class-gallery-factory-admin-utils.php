<?php
/**
 * @package   Gallery_Factory_Lite
 * @author    Vilyon Studio <vilyonstudio@gmail.com>
 * @link      http://galleryfactory.vilyon.net
 * @copyright 2015 Vilyon Studio
 *
 * Class provides utility methods used in admin part of the plugin.
 */

if ( ! class_exists( "VLS_Gallery_Factory_Admin_Utils" ) ) {

	class VLS_Gallery_Factory_Admin_Utils {
		/**
		 * Function based on wordpress function wp_read_image_metadata. Extended with some useful info.
		 *
		 * Get extended image metadata, exif or iptc as available.
		 *
		 * @param string $file
		 *
		 * @return bool|array False on failure. Image metadata array on success.
		 */
		public static function read_image_metadata( $file ) {
			if ( ! file_exists( $file ) ) {
				return false;
			}

			list( $width, $height, $sourceImageType ) = getimagesize( $file );
			$file_size = filesize( $file );

			/*
			* EXIF contains a bunch of data we'll probably never need formatted in ways
			* that are difficult to use. We'll normalize it and just extract the fields
			* that are likely to be useful. Fractions and numbers are converted to
			* floats, dates to unix timestamps, and everything else to strings.
			*/
			$meta = array(
				'width'             => $width,
				'height'            => $height,
				'file_size'         => $file_size,
				'aperture'          => 0,
				'credit'            => '',
				'camera'            => '',
				'lens'              => '',
				'caption'           => '',
				'created_timestamp' => 0,
				'copyright'         => '',
				'focal_length'      => 0,
				'focal_length_35mm' => 0,
				'iso'               => 0,
				'shutter_speed'     => 0,
				'title'             => '',
				'orientation'       => 0,
				'description'       => ''
			);

			/*
			* Read IPTC first, since it might contain data not available in exif such
			* as caption, description etc.
			*/
			if ( is_callable( 'iptcparse' ) ) {
				getimagesize( $file, $info );

				if ( ! empty( $info['APP13'] ) ) {
					$iptc = iptcparse( $info['APP13'] );

					// Headline, "A brief synopsis of the caption."
					if ( ! empty( $iptc['2#105'][0] ) ) {
						$meta['title'] = trim( $iptc['2#105'][0] );
						/*
						* Title, "Many use the Title field to store the filename of the image,
						* though the field may be used in many ways."
						*/
					}
					elseif ( ! empty( $iptc['2#005'][0] ) ) {
						$meta['title'] = trim( $iptc['2#005'][0] );
					}

					if ( ! empty( $iptc['2#120'][0] ) ) { // description / legacy caption
						$caption = trim( $iptc['2#120'][0] );
						if ( empty( $meta['title'] ) ) {
							mbstring_binary_safe_encoding();
							$caption_length = strlen( $caption );
							reset_mbstring_encoding();

							// Assume the title is stored in 2:120 if it's short.
							if ( $caption_length < 80 ) {
								$meta['title'] = $caption;
							}
							else {
								$meta['caption'] = $caption;
							}
						}
						elseif ( $caption != $meta['title'] ) {
							$meta['caption'] = $caption;
						}
					}

					if ( ! empty( $iptc['2#110'][0] ) ) // credit
					{
						$meta['credit'] = trim( $iptc['2#110'][0] );
					}
					elseif ( ! empty( $iptc['2#080'][0] ) ) // creator / legacy byline
					{
						$meta['credit'] = trim( $iptc['2#080'][0] );
					}

					if ( ! empty( $iptc['2#055'][0] ) and ! empty( $iptc['2#060'][0] ) ) // created date and time
					{
						$meta['created_timestamp'] = strtotime( $iptc['2#055'][0] . ' ' . $iptc['2#060'][0] );
					}

					if ( ! empty( $iptc['2#116'][0] ) ) // copyright
					{
						$meta['copyright'] = trim( $iptc['2#116'][0] );
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
			if ( is_callable( 'exif_read_data' ) && in_array( $sourceImageType, apply_filters( 'wp_read_image_metadata_types', array(
					IMAGETYPE_JPEG,
					IMAGETYPE_TIFF_II,
					IMAGETYPE_TIFF_MM
				) ) )
			) {
				$exif = @exif_read_data( $file, 'ANY_TAG' );

				if ( ! empty( $exif['Title'] ) ) {
					$meta['title'] = trim( $exif['Title'] );
				}

				if ( ! empty( $exif['ImageDescription'] ) ) {
					mbstring_binary_safe_encoding();
					$description_length = strlen( $exif['ImageDescription'] );
					reset_mbstring_encoding();

					if ( empty( $meta['title'] ) && $description_length < 80 ) {
						// Assume the title is stored in ImageDescription
						$meta['title'] = trim( $exif['ImageDescription'] );
						if ( empty( $meta['caption'] ) && ! empty( $exif['COMPUTED']['UserComment'] ) && trim( $exif['COMPUTED']['UserComment'] ) != $meta['title'] ) {
							$meta['caption'] = trim( $exif['COMPUTED']['UserComment'] );
						}
					}
					elseif ( empty( $meta['caption'] ) && trim( $exif['ImageDescription'] ) != $meta['title'] ) {
						$meta['caption'] = trim( $exif['ImageDescription'] );
					}

				}
				elseif ( empty( $meta['caption'] ) && ! empty( $exif['Comments'] ) && trim( $exif['Comments'] ) != $meta['title'] ) {
					$meta['caption'] = trim( $exif['Comments'] );

				}

				if ( ! empty( $exif['ImageDescription'] ) ) {
					$meta['description'] = trim( $exif['ImageDescription'] );
				}

				if ( empty( $meta['credit'] ) ) {
					if ( ! empty( $exif['Artist'] ) ) {
						$meta['credit'] = trim( $exif['Artist'] );
					}
					elseif ( ! empty( $exif['Author'] ) ) {
						$meta['credit'] = trim( $exif['Author'] );
					}
				}

				if ( empty( $meta['copyright'] ) && ! empty( $exif['Copyright'] ) ) {
					$meta['copyright'] = trim( $exif['Copyright'] );
				}
				if ( ! empty( $exif['FNumber'] ) ) {
					$meta['aperture'] = round( wp_exif_frac2dec( $exif['FNumber'] ), 2 );
				}
				if ( ! empty( $exif['Make'] ) ) {
					$meta['camera'] = trim( $exif['Make'] );
				}
				if ( ! empty( $exif['Model'] ) ) {
					$model = trim( $exif['Model'] );
					if ( empty( $meta['camera'] ) || strpos( $model, $meta['camera'] ) ) {
						$meta['camera'] = $model;
					}
					else {
						$meta['camera'] = $meta['camera'] . ' ' . $model;
					}
				}
				if ( ! empty( $exif['UndefinedTag:0xA434'] ) ) {
					$meta['lens'] = trim( $exif['UndefinedTag:0xA434'] );
				}
				elseif ( ! empty( $exif['UndefinedTag:0x0095'] ) ) {
					$meta['lens'] = trim( $exif['UndefinedTag:0x0095'] );
				}

				if ( empty( $meta['created_timestamp'] ) && ! empty( $exif['DateTimeDigitized'] ) ) {
					$meta['created_timestamp'] = wp_exif_date2ts( $exif['DateTimeDigitized'] );
				}
				if ( ! empty( $exif['FocalLength'] ) ) {
					$meta['focal_length'] = (string) wp_exif_frac2dec( $exif['FocalLength'] );
				}
				if ( ! empty( $exif['FocalLengthIn35mmFilm'] ) ) {
					$meta['focal_length_35mm'] = (string) wp_exif_frac2dec( $exif['FocalLengthIn35mmFilm'] );
				}
				if ( ! empty( $exif['ISOSpeedRatings'] ) ) {
					$meta['iso'] = is_array( $exif['ISOSpeedRatings'] ) ? reset( $exif['ISOSpeedRatings'] ) : $exif['ISOSpeedRatings'];
					$meta['iso'] = trim( $meta['iso'] );
				}
				if ( ! empty( $exif['ExposureTime'] ) ) {
					$meta['shutter_speed'] = (string) wp_exif_frac2dec( $exif['ExposureTime'] );
				}
				if ( ! empty( $exif['Orientation'] ) ) {
					$meta['orientation'] = $exif['Orientation'];
				}
			}

			foreach ( array( 'title', 'caption', 'description', 'credit', 'copyright', 'camera', 'iso' ) as $key ) {
				if ( isset( $meta[ $key ] ) && ! seems_utf8( $meta[ $key ] ) ) {
					$meta[ $key ] = utf8_encode( $meta[ $key ] );
				}
			}

			foreach ( $meta as &$value ) {
				if ( is_string( $value ) ) {
					$value = wp_kses_post( $value );
				}
			}

			return $meta;

		}

		public static function clear_view_cache_by_album( $album_id ) {
			delete_post_meta( $album_id, '_vls_gf_album_view' );
		}

		public static function clear_view_cache_by_image( $image_id ) {

			global $wpdb;

			$albums = $wpdb->get_results(
				$wpdb->prepare( "
                    SELECT link.post_parent as ID
                    FROM $wpdb->posts link
                    WHERE link.post_type=%s
                    AND link.post_name = %d",
					VLS_GF_POST_TYPE_ALBUM_IMAGE,
					$image_id
				)
			);

			foreach ( $albums as $album ) {
				self::clear_view_cache_by_album( $album->ID );
			}

		}

		public static function add_image_file( $file, $album_id = 0 ) {

			global $wpdb;

			$now = new DateTime();

			$url         = $file['url'];
			$type        = $file['type'];
			$title       = isset( $file['title'] ) ? $file['title'] : '';
			$caption     = isset( $file['caption'] ) ? $file['caption'] : '';
			$description = isset( $file['description'] ) ? $file['description'] : '';
			$alt_text    = isset( $file['alt_text'] ) ? $file['alt_text'] : '';
			$file        = $file['file'];

			$name_parts = VLS_Gallery_Factory_Admin_Utils::pathinfo( $file );

			//read image metadata
			$image_meta = VLS_Gallery_Factory_Admin_Utils::read_image_metadata( $file );

			//region rotate image based on exif orientation info

			$exif_orient  = isset( $image_meta['orientation'] ) ? $image_meta['orientation'] : 1;
			$rotate_angle = 0;

			//get rotation angle
			if ( 6 == $exif_orient ) {
				$rotate_angle         = 270;
				$t                    = $image_meta['width'];
				$image_meta['width']  = $image_meta['height'];
				$image_meta['height'] = $t;
			}
			elseif ( 3 == $exif_orient ) {
				$rotate_angle = 180;
			}
			elseif ( 8 == $exif_orient ) {
				$rotate_angle         = 90;
				$t                    = $image_meta['width'];
				$image_meta['width']  = $image_meta['height'];
				$image_meta['height'] = $t;
			}
			$image_meta['orientation'] = 1;


			//if the image is rotated
			if ( $rotate_angle > 0 ) {
				$editor = wp_get_image_editor( $file, array() );
				$result = $editor->rotate( $rotate_angle );
				if ( ! is_wp_error( $result ) ) {
					$editor->save( $file );
				}
				unset( $editor );
			}

			//endregion


			if ( $image_meta ) {
				if ( trim( $image_meta['title'] ) && ! is_numeric( sanitize_title( $image_meta['title'] ) ) ) {
					$title = empty( $title ) ? $image_meta['title'] : $title;
				}

				$caption     = empty( $caption ) ? $image_meta['title'] : $caption;
				$alt_text    = empty( $alt_text ) ? $image_meta['title'] : $alt_text;
				$description = empty( $description ) ? $image_meta['description'] : $description;
				if ( trim( $image_meta['caption'] ) ) {
					$description = empty( $description ) ? $image_meta['caption'] : $description;
				}
			}

			$title   = empty( $title ) ? $name_parts['filename'] : $title;

			$caption = empty( $caption ) ? $title : $caption;

			$image_meta['filename']    = $name_parts['basename'];
			$image_meta['crop_top']    = 0;
			$image_meta['crop_right']  = 0;
			$image_meta['crop_bottom'] = 0;
			$image_meta['crop_left']   = 0;

			// Construct the image post array
			$post_data = array(
				'post_type'      => VLS_GF_POST_TYPE_IMAGE,
				'post_mime_type' => $type,
				'guid'           => $url,
				'post_title'     => $title,
				'post_excerpt'   => $caption,
				'post_content'   => $description,
				'post_status'    => 'draft'
			);

			$image_id = wp_insert_post( $post_data );

			if ( is_wp_error( $image_id ) ) {
				echo json_encode( array(
					'success' => false,
					'data'    => array(
						'message'  => $image_id->get_error_message(),
						'filename' => $_FILES['async-upload']['name'],
					)
				) );
				wp_die();
			}

			//storing relative path to the file
			$relative_path = $file;
			if ( 0 === strpos( $relative_path, WP_CONTENT_DIR . VLS_GF_UPLOADS_DIR ) ) {
				$relative_path = str_replace( WP_CONTENT_DIR . VLS_GF_UPLOADS_DIR, '', $relative_path );
				$relative_path = ltrim( $relative_path, '/' );
			}


			// if album ID is specified, link the uploaded image to this item
			if ( $album_id > 0 ) {

				$resultArray = VLS_Gallery_Factory_Admin_Utils::get_album_append_setup( $album_id );
				$appendTo    = $resultArray['append_to'];
				$orderNo     = $appendTo == 'top' ? $resultArray['last_order'] - 1 : $resultArray['last_order'] + 1;

				$wpdb->insert(
					$wpdb->posts,
					array(
						'post_type'    => VLS_GF_POST_TYPE_ALBUM_IMAGE,
						'post_parent'  => $album_id,
						'post_name'    => $image_id,
						'guid'         => $url,
						'post_status'  => 'draft',
						'menu_order'   => $orderNo,
						'post_content' => ''
					)
				);

				VLS_Gallery_Factory_Admin_Utils::clear_view_cache_by_album( $album_id );
			}

			$image_meta = VLS_Gallery_Factory_Admin_Utils::create_small_images( $file, $image_meta );

			//store image meta
			add_post_meta( $image_id, '_vls_gf_image_meta', $image_meta );
			add_post_meta( $image_id, '_vls_gf_image_alt_text', $alt_text );
			add_post_meta( $image_id, '_vls_gf_url', $url . '?' . $now->format( 'U' ) );
			add_post_meta( $image_id, '_vls_gf_file', $relative_path );

			return $image_id;

		}


		/**
		 * Function for the same purpose as the stock php pathinfo, but works with utf8 filenames.
		 *
		 * @param $path_file
		 *
		 * @return array
		 */
		public static function pathinfo( $path_file ) {

			$path_file = strtr( $path_file, array( '\\' => '/' ) );
			preg_match( "~[^/]+$~", $path_file, $file );
			preg_match( "~([^/]+)[.$]+(.*)~", $path_file, $file_ext );
			preg_match( "~(.*)[/$]+~", $path_file, $dirname );

			return array(
				'dirname'   => $dirname[1],
				'basename'  => $file[0],
				'extension' => ( isset( $file_ext[2] ) ) ? $file_ext[2] : false,
				'filename'  => ( isset( $file_ext[1] ) ) ? $file_ext[1] : $file[0]
			);
		}


		/**
		 * Function for getting album's setup for appending new images and the last used menu_order
		 *
		 * @param Int $album_id
		 *
		 * @returns array
		 */
		public static function get_album_append_setup( $album_id ) {

			global $wpdb;

			$album_meta = get_post_meta( $album_id, '_vls_gf_item_meta', true );

			$appendTo = 'bottom';
			if ( ! empty( $album_meta ) && array_key_exists( 'append_new_images_to', $album_meta ) ) {
				$appendTo = $album_meta['append_new_images_to'];
			}

			$lastOrder = 0;
			if ( $appendTo == 'top' ) {
				$lastOrder = $wpdb->get_var(
					$wpdb->prepare( "
                            SELECT MIN(link.menu_order)
                            FROM $wpdb->posts link
                            WHERE link.post_type=%s
                            AND link.post_parent = %d",
						VLS_GF_POST_TYPE_ALBUM_IMAGE,
						$album_id
					)
				);
			}
			else {
				$lastOrder = $wpdb->get_var(
					$wpdb->prepare( "
                            SELECT MAX(link.menu_order)
                            FROM $wpdb->posts link
                            WHERE link.post_type=%s
                            AND link.post_parent = %d",
						VLS_GF_POST_TYPE_ALBUM_IMAGE,
						$album_id
					)
				);
			}

			if ( $lastOrder == null ) {
				$lastOrder = 0;
			}

			return array(
				'append_to'  => $appendTo,
				'last_order' => $lastOrder
			);
		}

		/**
		 * Generates thumbnail and preview images
		 *
		 * @param $file
		 * @param $image_meta
		 *
		 * @returns array Image metadata with added preview dimensions
		 */
		public static function create_small_images( $file, $image_meta ) {

			$preview_max_width  = 800;
			$preview_max_height = 800;

			$crop_top    = floatval( $image_meta['crop_top'] );
			$crop_right  = floatval( $image_meta['crop_right'] );
			$crop_bottom = floatval( $image_meta['crop_bottom'] );
			$crop_left   = floatval( $image_meta['crop_left'] );


			//create cropped image
			$src_x = 0;
			$src_y = 0;
			$src_w = 0;
			$src_h = 0;
			if ( $crop_top + $crop_right + $crop_bottom + $crop_left > 0 ) {
				$crop_editor = wp_get_image_editor( $file );
				$img_size    = $crop_editor->get_size();
				$src_x       = round( $img_size['width'] * $crop_left * 0.01 );
				$src_y       = round( $img_size['height'] * $crop_top * 0.01 );
				$src_w       = round( $img_size['width'] - $src_x - $img_size['width'] * $crop_right * 0.01 );
				$src_h       = round( $img_size['height'] - $src_y - $img_size['height'] * $crop_bottom * 0.01 );
			}


			//creating thumbnail
			$editor = wp_get_image_editor( $file );

			if ( $crop_top + $crop_right + $crop_bottom + $crop_left > 0 ) {
				$editor->crop( $src_x, $src_y, $src_w, $src_h );
			}

			$resize_result = $editor->resize( 140, 140, true );
			if ( ! is_wp_error( $resize_result ) ) {
				$resized_file = VLS_Gallery_Factory::_get_image_url( $file, 'thumbnail' );
				$editor->save( $resized_file );
			}

			//creating medium-sized preview

			$resized_file = VLS_Gallery_Factory::_get_image_url( $file, 'preview-m' );
			$editor       = wp_get_image_editor( $file );

			if ( $crop_top + $crop_right + $crop_bottom + $crop_left > 0 ) {
				$editor->crop( $src_x, $src_y, $src_w, $src_h );
			}

			$img_size = $editor->get_size();
			if ( $img_size['width'] > $preview_max_width || $img_size['height'] > $preview_max_height ) { //resizing
				$resize_result = $editor->resize( $preview_max_width, $preview_max_height, false );
			}
			else { //original image is too small, then just save what we have
				$resize_result = true;
			}
			if ( ! is_wp_error( $resize_result ) ) {
				$img_size                     = $editor->get_size();
				$image_meta['preview_width']  = $img_size['width'];
				$image_meta['preview_height'] = $img_size['height'];
				$editor->save( $resized_file );
			}

			return $image_meta;

		}

		/**
		 * Moves the image to the album
		 */
		public static function move_images_to_album( $source_album, $target_album, $images ) {

			global $wpdb;

			// if somehow source and target are the same, exit
			if ( $source_album == $target_album ) {
				return;
			}

			//getting album setup
			$appendTo = '';
			$orderNo  = 0;
			if ( $target_album > 0 ) {
				$resultArray = VLS_Gallery_Factory_Admin_Utils::get_album_append_setup( $target_album );
				$appendTo    = $resultArray['append_to'];
				$orderNo     = $resultArray['last_order'];
			}

			$images = array_reverse( $images, false );

			foreach ( $images as $key => $image ) {

				$orderNo = $appendTo == 'top' ? $orderNo - 1 : $orderNo + 1;

				$image = intval( $image );

				$linkAction = 'none';

				//checking if the same image already linked to the target album
				$targetCount = 0;
				if ( $target_album > 0 ) {

					$targetCount = $wpdb->get_var(
						$wpdb->prepare(
							"
                            SELECT COUNT(*)
                            FROM $wpdb->posts l
                            WHERE l.post_type = %s AND l.post_parent = %d AND l.post_name = %s
                            ",
							VLS_GF_POST_TYPE_ALBUM_IMAGE,
							$target_album,
							$image
						)
					);
				}

				if ( $source_album > 0 and $target_album > 0 ) { //image is moved from one album to another
					if ( $targetCount == 0 ) {
						$linkAction = 'update';
					} else { //image is already linked to the target album
						$linkAction = 'delete';
					}
				} else if ( $source_album == 0 ) { //image is moved from unsorted or all images
					//if image is already linked, do nothing
					if ( $targetCount == 0 ) {
						$linkAction = 'insert';
					}
				} else if ( $target_album == 0 ) { //image is moved to the unsorted
					$linkAction = 'delete';
				} else { //shouldn't get there
					wp_die();
				}

				// writing link changes to the database
				if ( $linkAction == 'insert' ) {

					$image_post_data = get_post( $image );

					$wpdb->insert(
						$wpdb->posts,
						array(
							'post_type'   => VLS_GF_POST_TYPE_ALBUM_IMAGE,
							'post_parent' => $target_album,
							'post_name'   => $image,
							'guid'        => $image_post_data->guid,
							'post_status' => 'draft',
							'menu_order'  => $orderNo
						)
					);

				} else if ( $linkAction == 'update' ) {

					$wpdb->update(
						$wpdb->posts,
						array(
							'post_parent' => $target_album,
							'menu_order'  => $orderNo
						),
						array(
							'post_type'   => VLS_GF_POST_TYPE_ALBUM_IMAGE,
							'post_parent' => $source_album,
							'post_name'   => $image
						)
					);

				} else if ( $linkAction == 'delete' ) {

					$wpdb->delete(
						$wpdb->posts,
						array(
							'post_type'   => VLS_GF_POST_TYPE_ALBUM_IMAGE,
							'post_parent' => $source_album,
							'post_name'   => $image
						)
					);

				}
			}

			//clear cache
			VLS_Gallery_Factory_Admin_Utils::clear_view_cache_by_album( $source_album );
			VLS_Gallery_Factory_Admin_Utils::clear_view_cache_by_album( $target_album );

			return;

		}
	}
}