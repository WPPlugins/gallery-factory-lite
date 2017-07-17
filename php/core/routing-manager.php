<?php namespace vilyon\gallery_factory\core;

class Routing_Manager {
	
	/**
	 * Constructor of the class. Registering hooks here.
	 */
	public function __construct() {
		// Add action only for admin
		if (is_admin()) {
			add_action('save_post_page', array($this, 'check_post_content'), 10, 3);
		}
		
		// Add this filter both in admin and front mode, as third-party plugins can reset the rewrite rules there
		// TODO: make the front-end action optional, like "compatibility mode"
		add_filter('page_rewrite_rules', array($this, 'filter_page_rewrite_rules'));
	}
	
	/**
	 * @param $post_id
	 * @param $post
	 * @param $update
	 *
	 * Fires when the page is saved. If the content has a [vls_gf_viewer] shortcode than add this post to the array of
	 * the posts that need extended rewrite rules. If the shortcode is deleted, then remove the post from that array.
	 */
	public function check_post_content($post_id, $post, $update) {
		$rewrite_rules_changed = false;
		$extended_routing_posts = get_option('vls_gf_extended_routing_posts');
		
		//check if there is a navigation wrapper shortcode in the post content
		if (preg_match('/\[vls_gf_viewer.*\]/', $post->post_content) === 1) {
			if (!in_array($post_id, $extended_routing_posts)) {
				array_push($extended_routing_posts, $post_id);
				$rewrite_rules_changed = true;
			}
		} //if no shortcode, remove this post from the rewrite array
		else {
			if (in_array($post_id, $extended_routing_posts)) {
				array_splice($extended_routing_posts, array_search($post_id, $extended_routing_posts), 1);
				$rewrite_rules_changed = true;
			}
		}
		
		if ($rewrite_rules_changed) {
			update_option('vls_gf_extended_routing_posts', $extended_routing_posts);
			flush_rewrite_rules();
		}
	}
	
	/**
	 *
	 * Process extended rewrite rules
	 */
	public function filter_page_rewrite_rules($rules) {
		$extended_routing_posts = get_option('vls_gf_extended_routing_posts');
		
		if (!is_array($extended_routing_posts) || count($extended_routing_posts) <= 0) {
			return $rules;
		}
		
		$new_rules = array();
		foreach ($extended_routing_posts as $post_id) {
			$post = get_post($post_id);
			$route_array = array($post->post_name);
			$parents = get_post_ancestors($post_id);
			
			foreach ($parents as $parent_id) {
				$parent_post = get_post($parent_id);
				array_unshift($route_array, $parent_post->post_name);
			}
			
			$route = implode('/', $route_array);
			
			//with a page number (not supported yet)
			//$rule = $route . '(/.*)?/([0-9]+)/?$';
			//$rewrite = 'index.php?page_id=' . $post_id . '&vls_gf_path=$matches[1]&vls_gf_page=$matches[2]';
			//$new_rules[$rule] = $rewrite;
			
			//without a page number
			$rule = $route . '(/.*)/?';
			$rewrite = 'index.php?page_id=' . $post_id . '&vls_gf_path=$matches[1]';
			$new_rules[$rule] = $rewrite;
			
		}
		
		return array_merge($new_rules, $rules);
	}
}
