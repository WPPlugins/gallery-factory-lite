<?php namespace vilyon\gallery_factory\admin;

class Main {
	private $config;
	
	/**
	 * Constructor of the class. Registering hooks here.
	 */
	function __construct($config) {
		$this->config = $config;
		
		$this->require_php();
		
		// admin_init hook
		add_action('admin_init', array($this, 'init'));
		
		// admin_menu hook
		add_action('admin_menu', array($this, 'create_menu'));
		
		// admin_enqueue_scripts hook
		add_action('admin_enqueue_scripts', array($this, 'load_scripts'));
		add_action('admin_enqueue_scripts', array($this, 'load_stylesheets'));
		
		add_action('vc_after_mapping', array($this, 'integrate_with_visual_composer'));
		
		
		// Instantiate classes
		new \vilyon\gallery_factory\core\Database($config);
		$logic = new \vilyon\gallery_factory\logic\Logic($config);
		new \vilyon\gallery_factory\admin\api\API($config, $logic);
		
	}
	
	private function require_php() {
		$plugin_dir = $this->config['plugin_dir'];
		
		// Base classes
		require_once($plugin_dir . 'php/core/entity-base.php');
		require_once($plugin_dir . 'php/core/logic-base.php');
		require_once($plugin_dir . 'php/core/api-base.php');
		
		// Entities
		require_once($plugin_dir . 'php/entities/node.php');
		require_once($plugin_dir . 'php/entities/folder.php');
		require_once($plugin_dir . 'php/entities/image.php');
		
		// Logic
		require_once($plugin_dir . 'php/logic/user.php');
		require_once($plugin_dir . 'php/logic/node.php');
		require_once($plugin_dir . 'php/logic/folder.php');
		require_once($plugin_dir . 'php/logic/image.php');
		
		require_once($plugin_dir . 'php/logic/_logic.php');
		
		// API
		require_once($plugin_dir . 'php/admin/api/user.php');
		require_once($plugin_dir . 'php/admin/api/node.php');
		require_once($plugin_dir . 'php/admin/api/folder.php');
		require_once($plugin_dir . 'php/admin/api/image.php');
		require_once($plugin_dir . 'php/admin/api/settings.php');
		require_once($plugin_dir . 'php/admin/api/tools.php');
		require_once($plugin_dir . 'php/admin/api/other.php');
		
		require_once($plugin_dir . 'php/admin/api/_api.php');
	}
	
	/**
	 * Function is attached to 'init' hook
	 */
	public function init() {
		add_filter('upload_dir', array($this, 'filter_upload_dir'));
		
		//register filters for adding TinyMCE button
		add_action('before_wp_tiny_mce', array($this, 'tinymce_output_l10n'));
		add_filter('mce_external_plugins', array($this, 'tinymce_register_plugin'));
		add_filter('mce_buttons', array($this, 'tinymce_register_buttons'));
	}
	
	/**
	 * Creates main menu item and settings menu item
	 */
	public function create_menu() {
		$minimum_capability = 'edit_pages'; //'read'
		$textdomain = $this->config['textdomain'];
		
		$icon_svg = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB2aWV3Qm94PSIwIDAgMjAgMjAiIGZpbGw9IiM4Mjg3OGMiPg0KPGc+DQoJPHBhdGggZD0iTTEuNSw2LjZoMy4zSDhoMWgxaDFMOS41LDMuOWMwLDAsMCwwLDAsMEw5LDMuMUM4LjUsMy4xLDgsMy4zLDcuNSwzLjR2MC45QzcuMSw0LjUsNi43LDQuNyw2LjQsNC45TDUuNiw0LjUNCgkJQzUuMiw0LjgsNC45LDUuMiw0LjUsNS42bDAuMSwwLjJIMS45SDFDMC44LDYsMC43LDYuMywwLjYsNi42QzAuMiw3LjYsMCw4LjgsMCwxMGMwLDEuOCwwLjUsMy40LDEuMyw0LjlMMS43LDE0DQoJCWMtMC42LTEuMy0wLjktMi42LTAuOS00QzAuOSw4LjgsMS4xLDcuNywxLjUsNi42eiIvPg0KCTxwYXRoIGQ9Ik0zLjUsMTYuNWMtMC4zLTAuMy0wLjUtMC41LTAuNy0wLjhsMS42LTIuOEw2LDEwbDAuNS0wLjlsMS0xLjdINC40bDAsMGgtMUMzLjMsNy45LDMuMSw4LjQsMy4xLDguOWwwLjcsMC40DQoJCWMwLDAuMiwwLDAuNSwwLDAuN2MwLDAuMiwwLDAuNCwwLDAuNkwzLjEsMTFjMC4xLDAuNSwwLjIsMSwwLjQsMS41aDAuMmwtMS40LDIuNGwtMC41LDAuOGMwLjIsMC4zLDAuNCwwLjUsMC42LDAuNw0KCQlDNC4xLDE4LjYsNi44LDIwLDkuOSwyMGwtMC41LTAuOUM3LjIsMTksNS4xLDE4LjEsMy41LDE2LjV6Ii8+DQoJPHBhdGggZD0iTTE2LjUsMTYuNWMtMS40LDEuNC0zLjIsMi4zLTUuMiwyLjZsLTEuNi0yLjhMOCwxMy40bC0wLjUtMC45bC0xLTEuN0w1LDEzLjVjMCwwLDAsMCwwLDBsLTAuNSwwLjgNCgkJYzAuMywwLjQsMC43LDAuNywxLjEsMS4xTDYuMywxNWMwLjMsMC4zLDAuNywwLjUsMS4xLDAuN3YwLjljMC41LDAuMiwxLDAuMywxLjUsMC40TDksMTYuOGwxLjQsMi40bDAuNSwwLjhjMC4zLDAsMC42LTAuMSwwLjktMC4xDQoJCWMyLjktMC41LDUuNC0yLjMsNi45LTQuN2gtMUMxNy4zLDE1LjYsMTYuOSwxNi4xLDE2LjUsMTYuNXoiLz4NCgk8cGF0aCBkPSJNMTguOCw1LjFMMTguMyw2YzAuNiwxLjIsMC45LDIuNiwwLjksNGMwLDEuMi0wLjIsMi4zLTAuNywzLjRoLTMuM0gxMmgtMUg5bDEuNiwyLjdjMCwwLDAsMCwwLDBsMC41LDAuOA0KCQljMC41LTAuMSwxLTAuMiwxLjUtMC40di0wLjljMC40LTAuMiwwLjgtMC40LDEuMS0wLjZsMC44LDAuNGMwLjQtMC4zLDAuOC0wLjcsMS4xLTEuMWwtMC4xLTAuMmgyLjdoMC45YzAuMS0wLjMsMC4zLTAuNiwwLjMtMC45DQoJCWMwLjQtMS4xLDAuNi0yLjIsMC42LTMuNEMyMCw4LjIsMTkuNiw2LjYsMTguOCw1LjF6Ii8+DQoJPHBhdGggZD0iTTMuNSwzLjVjMS40LTEuNCwzLjItMi4zLDUuMi0yLjZsMS42LDIuOEwxMiw2LjVsMC41LDAuOWwxLDEuN0wxNSw2LjRjMCwwLDAsMCwwLDBsMC41LTAuOA0KCQljLTAuMy0wLjQtMC43LTAuNy0xLjEtMS4xTDEzLjcsNWMtMC4zLTAuMy0wLjctMC41LTEuMS0wLjdWMy41Yy0wLjUtMC4yLTEtMC4zLTEuNS0wLjRsLTAuMSwwLjJMOS43LDAuOUw5LjIsMA0KCQljLTAuMywwLTAuNiwwLjEtMC45LDAuMUM1LjQsMC43LDIuOSwyLjQsMS40LDQuOWgxQzIuNyw0LjQsMy4xLDMuOSwzLjUsMy41eiIvPg0KCTxwYXRoIGQ9Ik0xNi41LDMuNWMwLjMsMC4zLDAuNSwwLjUsMC43LDAuOGwtMS42LDIuOEwxNCwxMGwtMC41LDAuOWwtMSwxLjdoMy4xaDAuMWgwLjljMC4yLTAuNSwwLjMtMC45LDAuNC0xLjUNCgkJbC0wLjctMC40YzAtMC4yLDAtMC41LDAtMC43YzAtMC4yLDAtMC40LDAtMC42TDE2LjksOWMtMC4xLTAuNS0wLjItMS0wLjQtMS41aC0wLjFsMS40LTIuNGwwLjUtMC44Yy0wLjItMC4zLTAuNC0wLjUtMC42LTAuNw0KCQljLTEuOC0yLjEtNC41LTMuNS03LjYtMy41bDAuNSwwLjlDMTIuOSwxLDE0LjksMS45LDE2LjUsMy41eiIvPg0KPC9nPg0KPC9zdmc+';
		
		// Top level menu item
		$admin_menu = add_menu_page('Gallery Manager', 'Gallery Factory', $minimum_capability, 'vls_gallery_factory', array(
			$this,
			'display_app_page'
		), $icon_svg, '31.35891447');
		
		// Submenu items
		add_submenu_page('vls_gallery_factory', 'Gallery Factory', 'Gallery Factory', $minimum_capability, 'vls_gallery_factory', array(
			$this,
			'display_app_page'
		));
		add_submenu_page('vls_gallery_factory', __('Tools', $textdomain), __('Tools', $textdomain), $minimum_capability, 'vls_gallery_factory#tools', array(
			$this,
			'display_app_page'
		));
		add_submenu_page('vls_gallery_factory', __('Settings', $textdomain), __('Settings', $textdomain), $minimum_capability, 'vls_gallery_factory#settings', array(
			$this,
			'display_app_page'
		));
	}
	
	/**
	 * Loads admin scripts
	 */
	public function load_scripts() {
		$screen = get_current_screen();
		
		//registering scripts only for Gallery Manager page
		if ('toplevel_page_vls_gallery_factory' == $screen->id) {
			
			//deregister known scripts that are not used in GF pages anyway and have problems with compatibility
			//Prior to WP4.4 there is a bug on deregister, so leave it as is.
			if (version_compare($GLOBALS['wp_version'], '4.4', '>=')) {
				wp_deregister_script('vc_accordion_script'); //throws error when admin page contains hash like "album/1"
			}
			
			wp_register_script('vls-gf-gallery-manager', $this->config['plugin_url'] . 'js/admin/bundle.min.js', array(
				'jquery',
				'jquery-touch-punch',
				'jquery-ui-draggable',
				'jquery-ui-droppable',
				'jquery-ui-resizable',
				'plupload'
			), $this->config['version']);
			
			$max_upload_size = wp_max_upload_size();
			
			$tutorialStatus = get_user_option('vls_gf_tutorial_status');
			
			if (!$tutorialStatus) {
				$tutorialStatus = array(
					'manager' => false,
					'folder' => true,
					'album' => true,
					'image' => true
				);
			}
			
			$data = array(
				'pluginUrl' => $this->config['plugin_url'],
				'nonce' => wp_create_nonce("vls_gf_api"),
				'plupload' => array(
					'nonce' => wp_create_nonce("vls_gf_api"),
					'url' => admin_url('admin-ajax.php', 'relative'),
					'flashSwfUrl' => includes_url('js/plupload/plupload.flash.swf'),
					'silverlightXapUrl' => includes_url('js/plupload/plupload.silverlight.xap'),
					'maxFileSize' => $max_upload_size . 'b',
				),
				'localization' => $this->get_js_localization(),
				'enumerations' => $this->get_js_enumerations(),
				'tutorialStatus' => $tutorialStatus
			);
			wp_localize_script('vls-gf-gallery-manager', 'vlsGFData', $data);
			
			wp_enqueue_script('vls-gf-gallery-manager');
		}
	}
	
	/**
	 * Loads admin stylesheets
	 */
	public function load_stylesheets() {
		
		$screen = get_current_screen();
		
		//loading GF stylesheets for Gallery Manager page only
		if ('toplevel_page_vls_gallery_factory' == $screen->id) {
			
			wp_register_style('vls-gf-google-fonts', 'https://fonts.googleapis.com/css?family=Roboto:300,400,500&subset=latin,greek,cyrillic-ext,cyrillic,latin-ext');
			
			wp_enqueue_style('vls-gf-admin-style', $this->config['plugin_url'] . 'css/admin/style.css', array(
				'vls-gf-google-fonts'
			), $this->config['version']);
			
		}
	}
	
	private function get_js_localization() {
		$textdomain = $this->config['textdomain'];
		$locale = __('Locale', $textdomain);
		$locale = ($locale == 'Locale' ? 'en' : $locale);
		
		return array(
			'locale' => $locale,
			'phrases' => array(
				
				'settings' => __('Settings', $textdomain),
				'tools' => __('Tools', $textdomain),
				'navigation' => __('Navigation', $textdomain),
				'upgradeToPremium' => __('Upgrade to premium version', $textdomain),
				'rootFolderEmpty' => __('Start with creating a new folder or album by pressing "+" button in the bottom-right corner.', $textdomain),
				'folderEmpty' => __('The folder is empty yet.', $textdomain),
				'allImagesEmpty' => __('There are no images in image library yet. Drag files here to upload.', $textdomain),
				'unsortedImagesEmpty' => __('There are no unsorted images.', $textdomain),
				'albumImageListEmpty' => __('There are no images in this album yet. Drag files here to upload.', $textdomain),
				'view' => __('View', $textdomain),
				'hideNavigation' => __('Hide Navigation', $textdomain),
				'showNavigation' => __('Show Navigation', $textdomain),
				'hideSummary' => __('Hide Summary', $textdomain),
				'showSummary' => __('Show Summary', $textdomain),
				
				'allImages' => __('All images', $textdomain),
				'unsortedImages' => __('Unsorted images', $textdomain),
				'library' => __('Library', $textdomain),
				
				'file' => __('File', $textdomain),
				'exif' => __('EXIF', $textdomain),
				
				'name' => __('Name', $textdomain),
				'slug' => __('Slug', $textdomain),
				'caption' => __('Caption', $textdomain),
				'description' => __('Description', $textdomain),
				'altText' => __('Alt text', $textdomain),
				'url' => __('URL', $textdomain),
				'shortcode' => __('Shortcode', $textdomain),
				'folderCount' => __('Folders', $textdomain),
				'albumCount' => __('Albums', $textdomain),
				'setCoverImage' => __('Set cover image', $textdomain),
				'selectCoverImage' => __('Select cover image', $textdomain),
				'thumbnailCrop' => __('Thumbnail Crop', $textdomain),
				
				'tabGeneral' => _x('General', 'tab', $textdomain),
				'tabLayout' => _x('Layout', 'tab', $textdomain),
				'tabStyle' => _x('Style', 'tab', $textdomain),
				'tabSettings' => _x('Settings', 'tab', $textdomain),
				'tabPreview' => _x('Preview', 'tab', $textdomain),
				'tabMetadata' => _x('Metadata', 'tab', $textdomain),
				'tabLayoutDefaults' => _x('Layout defaults', 'tab', $textdomain),
				
				//image editor
				'fileName' => __('File name', $textdomain),
				'fileType' => __('File type', $textdomain),
				'fileSize' => __('File size', $textdomain),
				'dimensions' => __('Dimensions', $textdomain),
				'uploadDate' => __('Upload date', $textdomain),
				'uploadedBy' => __('Uploaded by', $textdomain),
				'camera' => __('Camera', $textdomain),
				'lens' => __('Lens', $textdomain),
				'focalLength' => __('Focal length', $textdomain),
				'shutterSpeed' => __('Shutter speed', $textdomain),
				'aperture' => __('Aperture', $textdomain),
				'iso' => __('ISO', $textdomain),
				'creationDate' => __('Creation date&time', $textdomain),
				'author' => __('Author', $textdomain),
				'copyright' => __('Copyright', $textdomain),
				'tags' => __('Tags', $textdomain),
				'thumbnailClickAction' => __('Click action', $textdomain),
				'thumbnailLinkUrl' => __('Link URL', $textdomain),
				'thumbnailLinkTarget' => __('Open link in', $textdomain),
				
				
				//album editor
				'appendNewImagesTo' => __('Append new images to', $textdomain),
				'displayImageInfoOnHover' => __('Display info on hover', $textdomain),
				'paginationType' => __('Pagination type', $textdomain),
				'paginationPageSize' => __('Page size (in rows), set 0 to use global setting', $textdomain),
				'paginationStyle' => __('Pagination style', $textdomain),
				
				'layoutType' => __('Layout type', $textdomain),
				'columnCount' => __('Column count', $textdomain),
				'columnCountXs' => __('Column count (mobile)', $textdomain),
				'aspectRatio' => __('Aspect ratio (width/height)', $textdomain),
				'horizontalSpacing' => __('Horizontal spacing (px)', $textdomain),
				'verticalSpacing' => __('Vertical spacing (px)', $textdomain),
				'alignBottom' => __('Align bottom row', $textdomain),
				'pageSize' => __('Page size in rows', $textdomain),
				
				'nImagesSelected' => __('%{smart_count} image selected |||| %{smart_count} images selected', $textdomain),
				
				
				//uploader
				'uploadingTo' => __('Uploading to', $textdomain),
				'done' => __('Done', $textdomain),
				'completed' => __('Completed', $textdomain),
				'cancelled' => __('Cancelled', $textdomain),
				'uploaderError' => __('Uploader error', $textdomain),
				'nOfN' => __('%{1} of %{2}', $textdomain),
				'imageLibrary' => __('Image library', $textdomain),
				
				//dialogs
				'enterNewFolderNameHeader' => __('Enter new folder name', $textdomain),
				'enterNewAlbumNameHeader' => __('Enter new album name', $textdomain),
				'confirmFolderDeleteHeader' => __('Delete the folder?', $textdomain),
				'confirmFolderDeleteText' => __('The folder "%{name}" and all folders & albums within it will be deleted. Images inside the albums will not be deleted and can be found in the "All images" folder.', $textdomain),
				'confirmAlbumDeleteHeader' => __('Delete the album?', $textdomain),
				'confirmAlbumDeleteText' => __('The album "%{name}" will be deleted. Images inside this album will not be deleted and can be found in the "All images" folder.', $textdomain),
				
				'folderSaved' => __('Folder saved', $textdomain),
				'albumSaved' => __('Album saved', $textdomain),
				'imageSaved' => __('Image saved', $textdomain),
				'settingsSaved' => __('Settings saved', $textdomain),
				
				//tools page
				'tabThumbnailRegeneration' => __('Thumbnail regeneration', $textdomain),
				'tabImportFromWPMedia' => __('Import from WP Media', $textdomain),
				'tabImportFromNextGenGallery' => __('Import from NextGen gallery', $textdomain),
				'regenerateThumbnailsDescription' => __('You can regenerate thumbnails here. Depending on your collection size, it can take a considerable amount of time.', $textdomain),
				'regenerateThumbnails' => __('Regenerate thumbnails', $textdomain),
				'regenerateThumbnailsProgressMessage' => __('Regenerating thumbnails... please do not switch off this page until it\'s completed.', $textdomain),
				'importWPMediaDescription1' => __('This feature imports all your Wordpress Media images to the Gallery Factory. All other attachment file types are ignored. The imported images are added to the "Unsorted images" folder within Gallery Factory. The WP Media content is just copied during the import and remains untouched.', $textdomain),
				'importWPMediaDescription2' => __('Please note, that Gallery Factory uses its own uploads folder on server, so physical image files will be copied there from the original WP location. Make sure that you have enough disk space before proceeding with the import. The import procedure may take time, depending on your WP Media content size. Import can\'t be canceled once started, and the result can\'t be reverted.', $textdomain),
				'importWPMedia' => __('Import images from WP Media', $textdomain),
				'importWPMediaProgressMessage' => __('Importing your WP Media image library... please do not switch off this page until it\'s completed.', $textdomain),
				'importNextGenDescription1' => __('This feature imports all your NextGen Gallery albums, galleries and images to the Gallery Factory. The NextGen content is just copied during the import and remains untouched.', $textdomain),
				'importNextGenDescription2' => __('Please note, that Gallery Factory uses its own uploads folder on server, so physical image files will be copied there from the original NextGen uploads folder. Make sure that you have enough disk space before proceeding with the import. The import procedure may take time, depending on your NextGen Gallery content size. Import can\'t be canceled once started, and the result can\'t be reverted.', $textdomain),
				'createNextGenFolder' => __('Create "NextGen" folder and put all imported items there', $textdomain),
				'importNextGen' => __('Import images from NextGen Gallery', $textdomain),
				'importNextGenProgressMessage' => __('Importing your NextGen Gallery image library... please do not switch off this page until it\'s completed.', $textdomain),
				
				//settings page
				'globalLightbox' => _x('Lightbox', 'settings', $textdomain),
				'globalDisplayImageInfoOnHover' => _x('Display info on hover', 'settings', $textdomain),
				'globalPaginationStyle' => _x('Pagination style', 'settings', $textdomain),
				'globalUseLazyLoading' => _x('Use lazy loading', 'settings', $textdomain),
				'globalThumbnailDimensions' => _x('Thumbnail maximum resolution (width&times;height)', 'settings', $textdomain),
				'globalThumbnailQuality' => _x('Thumbnail quality (from 0 to 100)', 'settings', $textdomain),
				
				'buttons' => array(
					'cancel' => _x('Cancel', 'button', $textdomain),
					'stop' => _x('Stop', 'button', $textdomain),
					'create' => _x('Create', 'button', $textdomain),
					'delete' => _x('Delete', 'button', $textdomain),
					'close' => _x('Close', 'button', $textdomain),
					'save' => _x('Save', 'button', $textdomain)
				),
				
				'tooltips' => array(
					'menu' => _x('Menu', 'tooltip', $textdomain),
					'deleteFolder' => _x('Delete folder', 'tooltip', $textdomain),
					'editFolder' => _x('Edit folder', 'tooltip', $textdomain),
					'deleteAlbum' => _x('Delete album', 'tooltip', $textdomain),
					'editAlbum' => _x('Edit album', 'tooltip', $textdomain),
					
					'addNewFolder' => _x('Add new folder', 'tooltip', $textdomain),
					'addNewAlbum' => _x('Add new album', 'tooltip', $textdomain),
					'uploadImages' => _x('Upload images', 'tooltip', $textdomain),
					
					'saveChanges' => _x('Save changes', 'tooltip', $textdomain),
					'prevImage' => _x('Previous image', 'tooltip', $textdomain),
					'nextImage' => _x('Next image', 'tooltip', $textdomain),
					'globalLightbox' => _x('This option defines the lightbox to be used. Select "Disable" to disable lightbox integration.', 'tooltip', $textdomain),
					'globalDisplayImageInfoOnHover' => _x('Select which info will be displayed on hovering the thumbnail.', 'tooltip', $textdomain),
					'globalPaginationType' => _x('Set the default pagination behaviour for the albums. For more info on available options please refer to the documentation.', 'tooltip', $textdomain),
					'globalPaginationStyle' => _x('You can choose from two predefined styles for pagination controls or select "Custom" and define your own style in css.', 'tooltip', $textdomain),
					'globalUseLazyLoading' => _x('Lazy loading of thumbnails means that image thumbnails outside of viewport are not loaded until user scrolls to them.', 'tooltip', $textdomain),
					'globalThumbnailDimensions' => _x('You can set the thumbnail dimensions that are most suitable for your website. After changing this setting you need to regenerate thumbnails using the "Tools" - "Regenerate thumbnails" dialog.', 'tooltip', $textdomain),
					'globalThumbnailQuality' => _x('This value affects the compression ratio for generated image thumbnails. Lower values allow to reduce image sizes, but with some quality loss.', 'tooltip', $textdomain),
					
					'defaultLayoutType' => _x('', 'tooltip', $textdomain),
					'defaultColumnCount' => _x('', 'tooltip', $textdomain),
					'defaultColumnCountXs' => _x('', 'tooltip', $textdomain),
					'defaultAspectRatio' => _x('', 'tooltip', $textdomain),
					'defaultHorizontalSpacing' => _x('', 'tooltip', $textdomain),
					'defaultVerticalSpacing' => _x('', 'tooltip', $textdomain),
					'defaultAlignBottom' => _x('', 'tooltip', $textdomain),
					'defaultPaginationType' => _x('', 'tooltip', $textdomain),
					'defaultPageSize' => _x('', 'tooltip', $textdomain),
					
					'toggleListMode' => _x('Toggle list mode', 'tooltip', $textdomain),
					'activateBulkSelectMode' => _x('Activate bulk select mode', 'tooltip', $textdomain),
					'cancelSelection' => _x('Cancel selection', 'tooltip', $textdomain),
					'selectAll' => _x('Select all', 'tooltip', $textdomain),
					'selectInvert' => _x('Invert selection', 'tooltip', $textdomain),
					'selectNone' => _x('Deselect all', 'tooltip', $textdomain),
					'deleteSelected' => _x('Delete selected', 'tooltip', $textdomain),
				),
				
				'tutorial' => array(
					'sampleFolder' => _x('Sample folder %{n}', 'tutorial', $textdomain),
					'sampleAlbum' => _x('Sample album %{n}', 'tutorial', $textdomain),
					'continue' => _x('Continue', 'tutorial', $textdomain),
					'skipTutorial' => _x('Skip tutorial', 'tutorial', $textdomain),
					'manager' => array(
						'step1h' => _x('Welcome to Gallery Factory!', 'tutorial', $textdomain),
						'step1t' => _x('This tour will guide you through the basic plugin features.<br>Click "Continue" at the bottom of the screen to proceed.', 'tutorial', $textdomain),
						
						'step2ah' => _x('Navigation panel', 'tutorial', $textdomain),
						'step2at' => _x('It shows your library structure and lets you easily navigate through it. Click the folder icon to expand/collapse it or the label to navigate to folder or album. Also, you can reorder the items by dragging them within the tree.', 'tutorial', $textdomain),
						'step2bh' => _x('Main panel', 'tutorial', $textdomain),
						'step2bt' => _x('That’s the main workspace showing the content of the current items (folder or album).', 'tutorial', $textdomain),
						'step2ch' => _x('Info panel', 'tutorial', $textdomain),
						'step2ct' => _x('This panel shows a summary of the item which is selected in the main panel.', 'tutorial', $textdomain),
						'step2dh' => _x('Add new items', 'tutorial', $textdomain),
						'step2dt' => _x('Use this button for adding new items to your library: folders and albums when you’re inside a folder, or upload images when you’re inside an album.', 'tutorial', $textdomain),
						
						'step3a' => _x('Currently selected album/folder', 'tutorial', $textdomain),
						'step3b' => _x('Open editor for the currently selected album/folder', 'tutorial', $textdomain),
						'step3c' => _x('Delete currently selected album/folder', 'tutorial', $textdomain),
						'step3d' => _x('Click a list item to show its info in the info panel, double-click to navigate to it', 'tutorial', $textdomain),
						
						'step4a' => _x('Use bulk select mode to select multiple images for moving them to another album or deleting', 'tutorial', $textdomain),
						'step4b' => _x('You can switch the image list view to the table mode', 'tutorial', $textdomain),
						'step4c' => _x('To open image editor double-click the image or the Edit button in the Info panel', 'tutorial', $textdomain),
						'step4d' => _x('You can drag single or multiple images to another album or to the &quot;All images&quot;/&quot;Unsorted images&quot; folders', 'tutorial', $textdomain),
					
					)
				)
			
			)
		);
	}
	
	private function get_js_enumerations() {
		$textdomain = $this->config['textdomain'];
		
		return array(
			'globalLightbox' => array(
				array(
					'value' => 'disabled',
					'text' => __('Disable', $textdomain)
				),
				array(
					'value' => 'imagelightbox',
					'text' => 'Imagelightbox'
				),
				array(
					'value' => 'colorbox',
					'text' => 'Colorbox'
				),
				array(
					'value' => 'lightbox2',
					'text' => 'Lightbox2'
				),
				array(
					'value' => 'ilightbox',
					'text' => __('ILightbox (not included, enable integration only)', $textdomain)
				),
				array(
					'value' => 'nivo',
					'text' => __('Nivo Lightbox (not included, enable integration only)', $textdomain)
				)
			),
			'appendNewImagesTo' => array(
				array(
					'value' => 'start',
					'text' => __('Top', $textdomain)
				),
				array(
					'value' => 'end',
					'text' => __('Bottom', $textdomain)
				),
			),
			'displayImageInfoOnHover' => array(
				array(
					'value' => 'global',
					'text' => __('Use global setting', $textdomain)
				),
				array(
					'value' => 'none',
					'text' => __('None', $textdomain)
				),
				array(
					'value' => 'caption',
					'text' => __('Caption', $textdomain)
				),
				array(
					'value' => 'all',
					'text' => __('Caption & description', $textdomain)
				),
			
			),
			'globalDisplayImageInfoOnHover' => array(
				array(
					'value' => 'none',
					'text' => __('None', $textdomain)
				),
				array(
					'value' => 'caption',
					'text' => __('Caption', $textdomain)
				),
				array(
					'value' => 'all',
					'text' => __('Caption & description', $textdomain)
				),
			),
			'paginationType' => array(
				array(
					'value' => 'none',
					'text' => __('None', $textdomain)
				),
				array(
					'value' => 'paged-numbers',
					'text' => __('Paged (numbers)', $textdomain)
				),
				array(
					'value' => 'paged-bullets',
					'text' => __('Paged (bullets)', $textdomain)
				),
				array(
					'value' => 'load-more',
					'text' => __('Load more button', $textdomain)
				),
				array(
					'value' => 'load-scroll',
					'text' => __('Load on scroll', $textdomain)
				),
			),
			'paginationStyle' => array(
				array(
					'value' => 'global',
					'text' => __('Use global setting', $textdomain)
				),
				array(
					'value' => 'light',
					'text' => __('Light', $textdomain)
				),
				array(
					'value' => 'dark',
					'text' => __('Dark', $textdomain)
				),
				array(
					'value' => 'custom',
					'text' => __('Custom', $textdomain)
				),
			),
			'globalPaginationStyle' => array(
				array(
					'value' => 'light',
					'text' => __('Light', $textdomain)
				),
				array(
					'value' => 'dark',
					'text' => __('Dark', $textdomain)
				),
				array(
					'value' => 'custom',
					'text' => __('Custom', $textdomain)
				),
			),
			
			'layoutType' => array(
				array(
					'value' => 'grid',
					'text' => __('Grid', $textdomain)
				),
				array(
					'value' => 'metro',
					'text' => __('Metro', $textdomain)
				),
				array(
					'value' => 'masonry-v',
					'text' => __('Masonry', $textdomain)
				)
			),
			'layoutColumnCount' => array(
				array(
					'value' => 1,
					'text' => '1'
				),
				array(
					'value' => 2,
					'text' => '2'
				),
				array(
					'value' => 3,
					'text' => '3'
				),
				array(
					'value' => 4,
					'text' => '4'
				),
				array(
					'value' => 5,
					'text' => '5'
				),
				array(
					'value' => 6,
					'text' => '6'
				),
				array(
					'value' => 7,
					'text' => '7'
				),
				array(
					'value' => 8,
					'text' => '8'
				),
				array(
					'value' => 9,
					'text' => '9'
				),
				array(
					'value' => 10,
					'text' => '10'
				),
				array(
					'value' => 11,
					'text' => '11'
				),
				array(
					'value' => 12,
					'text' => '12'
				),
				array(
					'value' => 13,
					'text' => '13'
				),
				array(
					'value' => 14,
					'text' => '14'
				),
				array(
					'value' => 15,
					'text' => '15'
				),
				array(
					'value' => 16,
					'text' => '16'
				)
			),
			
			'thumbnailClickAction' => array(
				array(
					'value' => 'lightbox',
					'text' => __('Open in lightbox', $textdomain)
				),
				array(
					'value' => 'redirect',
					'text' => __('Redirect to URL', $textdomain)
				),
				array(
					'value' => 'none',
					'text' => __('No action', $textdomain)
				)
			),
			'thumbnailLinkTarget' => array(
				array(
					'value' => '_self',
					'text' => __('Same window', $textdomain)
				),
				array(
					'value' => '_blank',
					'text' => __('New window', $textdomain)
				),
			)
		);
	}
	
	//region tinymce button
	
	/**
	 * Adds a plugin to the TinyMCE editor
	 *
	 * @param $plugin_array
	 *
	 * @return mixed
	 */
	function tinymce_register_plugin($plugin_array) {
		$plugin_array['vls_gf_buttons'] = $this->config['plugin_url'] . 'js/admin/tinymce-plugin.min.js';
		
		//add GF stylesheet for the pages with TinyMCE editor
		wp_enqueue_style('vls-gf-admin-style', $this->config['plugin_url'] . 'css/admin/tinymce-plugin.css');
		
		return $plugin_array;
	}
	
	/**
	 * Registers a button for a TinyMCE editor
	 *
	 * @param $buttons
	 *
	 * @return mixed
	 */
	function tinymce_register_buttons($buttons) {
		array_push($buttons, 'vls_gf_album');
		
		return $buttons;
	}
	
	function tinymce_output_l10n() {
		global $current_screen;
		$textdomain = $this->config['textdomain'];
		
		echo "<script type=\"text/javascript\">";
		echo "var vlsGfTinymceL10n = { ";
		echo "btnInsertGFAlbum: '" . __('Insert Gallery Factory Shortcode', $textdomain) . "', ";
		echo "btnCancel: '" . _x('Cancel', 'button', $textdomain) . "', ";
		echo "strDialogTitle: '" . __('Select an item to insert', $textdomain) . "', ";
		echo "postType: '" . $current_screen->post_type . "' ";
		echo "};</script>";
	}
	
	//endregion
	
	/**
	 * Displays Gallery Factory app page
	 */
	public function display_app_page() {
		echo '<div class="wrap">';
		echo '<div id="vls-gf-app">';
		echo '<section id="vls-gf-layer-primary"></section>';
		echo '<section id="vls-gf-layer-secondary"></section>';
		echo '<section id="vls-gf-layer-uploader"></section>';
		echo '<section id="vls-gf-layer-dialog"></section>';
		echo '<section id="vls-gf-layer-tutorial"></section></div>';
		echo '</div>';
	}
	
	###############################################################
	## Filters                                                   ##
	###############################################################
	
	/**
	 * Attached to 'upload_dir' filter. Sets upload directory for GF uploads.
	 *
	 * @param $dir_options
	 *
	 * @return mixed
	 */
	public function filter_upload_dir($dir_options) {
		
		if (isset($_REQUEST['action']) && $_REQUEST['action'] == 'vls_gf_api_image_upload') {
			$uploads_dir = $this->config['uploads_dir_name'];
			$date_dir = $dir_options['subdir'];
			
			$dir_options['basedir'] = WP_CONTENT_DIR . '/' . $uploads_dir;
			$dir_options['path'] = $dir_options['basedir'] . $date_dir;
			$dir_options['baseurl'] = WP_CONTENT_URL . '/' . $uploads_dir;
			$dir_options['url'] = $dir_options['baseurl'] . $date_dir;
		}
		
		return $dir_options;
	}
	
	###############################################################
	## Other                                                     ##
	###############################################################
	
	
	public function integrate_with_visual_composer() {
		$textdomain = $this->config['textdomain'];
		
		// Check if Visual Composer is installed
		if (!defined('WPB_VC_VERSION')) {
			return;
		}
		
		vc_map(array(
			"name" => __("Gallery Factory Album", $textdomain),
			"description" => __("Include a Gallery Factory album", $textdomain),
			"base" => "vls_gf_album",
			"class" => "",
			"controls" => "full",
			"icon" => 'vls-gf-icon',
			"category" => __('Content', 'js_composer'),
			//'admin_enqueue_js' => array( VLS_GF_PLUGIN_URL . 'admin/js/vc-element.js' ),
			//'admin_enqueue_css' => array(),
			"params" => array(
				array(
					"type" => "textfield",
					"holder" => "div",
					"class" => "",
					"heading" => __("Album ID", $textdomain),
					"param_name" => "id",
					"value" => "",
					"description" => __("Enter Gallery Factory album ID", $textdomain)
				)
			)
		));
	}
	
}