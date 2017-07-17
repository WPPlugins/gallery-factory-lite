<?php namespace vilyon\gallery_factory\front;

class Gallery {
	
	private static $transient_prefix = 'vls_gf_album_';

	private $config;

	/** @var  \vilyon\gallery_factory\logic\Logic */
	private $logic;


	public function __construct($config, $logic) {
		$this->config = $config;
		$this->logic = $logic;
	}
	
	public function get_html($folder_id, $base_url = '') {
		$transient_key = static::$transient_prefix . $folder_id;
		
		// Try to fetch it from the transient storage
		$output = get_transient($transient_key);
		
		// If it's not found, generate output
		if ($output === false) {
			
			$output = $this->generate_html($folder_id, $base_url);
			
			// Store it
			set_transient($transient_key, $output, WEEK_IN_SECONDS);
		}
		
		return $output;
	}
	
	private function generate_html($folder_id, $base_url) {
		/** @var \vilyon\gallery_factory\logic\Folder_Logic $folder_logic */
		$folder_logic = $this->logic->get('folder');

		$output = '';
		
		// Fetch items
		$folder = $folder_logic->get($folder_id, '_front_output');
		
		if (is_wp_error($folder)) {
			return $this->output_error($folder);
		}
		
		$class = 'vls-gf-gallery vls-gf-' . $folder_id;
		
		$data_layout_encoded = json_encode($folder->layout_meta);
		
		
		$display_image_info_on_hover = $folder->style_meta['display_image_info_on_hover'];
		if ($display_image_info_on_hover === 'global') {
			$display_image_info_on_hover = get_option('vls_gf_display_image_info_on_hover');
		}
		
		if ($display_image_info_on_hover === 'none') {
			$class .= ' vls-gf-album-info-none';
		}
		else if ($display_image_info_on_hover === 'caption') {
			$class .= ' vls-gf-album-info-caption';
		}

		$options = array(
			'base_url' => $base_url
		);
		
		// Opening HTML
		$output .= '<div class="' . $class . '"';
		$output .= ' data-vls-gf-layout=\'' . $data_layout_encoded . '\'';
		$output .= '><div class="vls-gf-container">';
		
		// Output items
		foreach ($folder->items as $index => $item) {
			$output .= $this->generate_item_html($folder, $item, $index, $options);
		}
		
		// Closing HTML
		$output .= '</div></div>';
		
		return $output;
	}
	
	private function generate_item_html($folder, $item, $index, $options) {
		$data = '';
		if (count($item->layout_meta) > 0) {
			$data .= ' data-vls-gf-layout=\'' . json_encode($item->layout_meta) . '\'';
		}
		$data .= ' data-vls-gf-thumbnail-width="' . $item->thumbnail_width . '"';
		$data .= ' data-vls-gf-thumbnail-height="' . $item->thumbnail_height . '"';
		
		// Prepare caption & description for lightbox
		//replace [url] BB code for url link with the <a> tag
		$item->lightbox_caption = preg_replace('@\[url=([^]]*)\]([^[]*)\[/url\]@', '<a href=&quot;$1\&quot;>$2</a>', $item->caption);
		$item->lightbox_description = preg_replace('@\[url=([^]]*)\]([^[]*)\[/url\]@', '<a href=&quot;$1\&quot;>$2</a>', $item->description);
		
		//replace [link_open] BB code for url link with the <a> tag
		$item->lightbox_caption = preg_replace('@\[link_open=([^]]*)\]([^[]*)\[/link_open\]@', '<a href=&quot;$1\&quot; onclick=&quot;window.open(this.href); return false;&quot;>$2</a>', $item->lightbox_caption);
		$item->lightbox_description = preg_replace('@\[link_open=([^]]*)\]([^[]*)\[/link_open\]@', '<a href=&quot;$1\&quot; onclick=&quot;window.open(this.href); return false;&quot;>$2</a>', $item->lightbox_description);
		
		//strip bb-code from the caption
		$item->caption = preg_replace('@\[url=([^]]*)\]([^[]*)\[/url\]@', '$2', $item->caption);
		$item->description = preg_replace('@\[url=([^]]*)\]([^[]*)\[/url\]@', '$2', $item->description);
		$item->caption = preg_replace('@\[link_open=([^]]*)\]([^[]*)\[/link_open\]@', '$2', $item->caption);
		$item->description = preg_replace('@\[link_open=([^]]*)\]([^[]*)\[/link_open\]@', '$2', $item->description);
		
		
		// Opening HTML
		$output = '<div class="vls-gf-item vls-gf-' . $item->ID . '"' . $data . '>';
		
		// Anchor link
		$href = '';
		$url = '';
		$target = '';
		
		if ($item->type === 'image') {
			$url = $item->url;
		}
		// For folder and album items click should link to its URL
		else {
			$url = $options['base_url'] . $item->slug;
		}
		
		if (!empty($url)) {
			$href = ' href="' . $url . '"';
		}
		
		// Construct the markup
		$output .= '<a' . $href . $target . '></a>';
		$output .= '<div class="vls-gf-img">';

		$output .= '<img src = "' . $item->thumbnail_url . '?t=' . $item->thumbnail_timestamp . '" />';

		$output .= '</div>';
		$output .= '<div class="vls-gf-info-back">';
		$output .= '<h2 class="vls-gf-info-caption">' . $item->caption . '</h2>';
		$output .= '<div class="vls-gf-info-description">' . $item->description . '</div>';
		$output .= '</div>';
		
		
		// Close HTML
		$output .= '</div>';
		
		return $output;
	}
	
	/**
	 * @param $error \WP_Error
	 * @return string
	 */
	private function output_error($error) {
		$textdomain = $this->config['textdomain'];
		
		$error_message = implode("; ", $error->get_error_messages());
		$output = '<div style="color: red; text-align: center; font-weight: bold;" >';
		$output .= __('Gallery Factory error: ', $textdomain) . $error_message;
		$output .= '</div>';
		
		return $output;
	}
}