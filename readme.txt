=== Gallery Factory Lite ===
Contributors: Vilyon
Donate link: http://galleryfactory.vilyon.net/
Tags: gallery manager, album, folder, gallery, grid layout, image, lightbox, metro layout, photo, portfolio, responsive, thumbnail, visual editor
Requires at least: 4.2.0
Tested up to: 4.6.1
Stable tag: 2.0.0
License: GPLv3
License URI: http://www.gnu.org/licenses/gpl.html

Great tool for managing large image collections with user-friendly gallery manager interface and visual layout builder.


== Description ==

Gallery Factory Lite is a WordPress plugin for managing image collections, creating albums and presenting them to the website visitors in modern, responsive and attractive way.

The main feature of the plugin is Gallery Manager, the ajax-driven interface which keeps almost everything that you need to work with your WordPress image gallery in one place. It allows to organise albums in multi-level folder structure using simple and intuitive UI, like in your favourite file manager.

The plugin offers three layouts to choose from: Grid, Metro, and Masonry. All three layout types can be edited using WYSIWYG layout editor.

This is the Lite version of the full-featured premium Gallery Factory plugin, which is available at [CodeCanyon](http://codecanyon.net/item/gallery-factory/11219294). Lite version is 100% forward-compatible with the premium version, so you can upgrade at any time.

= Features =
* Tree-like albums structure allowing albums to be grouped in folders and subfolders (Lite version is limited to 3 levels of this hierarchy)*
* Dedicated file upload location (keeps Gallery Factory uploads separate from the WP Media files)
* Responsive Grid layout
* 3 layout types , including the Metro layout with the unmatched customizing possibilities.
* WYSIWYG layout editor
* Importing of image EXIF metadata on upload
* Custom image thumbnail cropping
* Easy image import from WP Media and migration from NextGen Gallery
* Modern, fast & responsive
* Localization-ready (English, German and Russian languages included)

= Premium version =

If you enjoy the Lite version of Gallery Factory, you'll love the premium one. Additionally it offers:

* Folder shortcode: the shortcode that displays a Gallery Factory folder on a page, providing navigation to its child folders and albums. With this shortcode you'll never need to get back to the page to update your multi-album portfolio;
* Gallery pagination with 4 pagination types (page numbers, bullets, "load more" button and load on scroll);
* Adjustable column count for mobile gallery display;
* Lazy loading for thumbnails (loads thumbnails only when they're needed, speeding up the initial page load);
* Custom click behavior for thumbnails (redirect to a given URL or open it in a new window);
* Yoast SEO integration: all images within Gallery Factory shortcode are included in the XML sitemap;
* Custom thumbnail compression ratio
* Layout defaults: enable you to set the default layout options for the newly created albums;


== Installation ==

= IMPORTANT! Note on upgrading from version 1.x.x to 2.0.0 =
After updating to the version 2.0.0 please deactivate and reactivate the plugin, for the database to be upgraded to the new version. After activating the new version regenerate thumbnails (from "Gallery Factory" -> "Tools" page) to fonosh the upgrading process.

= Using Wordpress plugin manager =
1. Go to the WordPress `Plugins` menu
2. Press `Add New`
3. Find the `Gallery Factory` plugin
4. Click `Install Now`
5. Click `Activate plugin`


= Manual upload =
1. Upload `gallery-factory` folder and all its contents to the `/wp-content/plugins/` directory
2. Activate the plugin through the `Plugins` menu in WordPress


== Screenshots ==

1. Gallery Manager page, album images presented in the thumbnail mode
2. Gallery Manager page, album images presented in the table mode
3. Image editor
4. Album editor, "General" tab
5. Album editor, "Layout" tab
6. Tools page, "Thumbnail regeneration" tab


== Changelog ==

= 2.0.0 =
* Complete rework of the plugin's core
* Brand new admin interface
* Feature: new Masonry layout type

= 1.1.4 =
* Bug fix: fixed php warning on WP 4.4+

= 1.1.3 =
* Bug fix: fixed php warning on WP 4.4+

= 1.1.2 =
* Feature: added customizable cropping of image thumbnails.
* Feature: added localization support, English & Russian included
* Feature: data import from NextGen Gallery

= 1.1.1 =
* Fix: a bug with Metro layout display.

= 1.1.0 =
* First release of the Lite version.


== Upgrade Notice ==

= 2.0.0 =
Ground-up rebuild of the plugin. New core and admin interface. IMPORTANT: deactivate and reactivate the plugin after updating.

= 1.1.4 =
Bug fixes.

= 1.1.3 =
Bug fixes.

= 1.1.2 =
Plugin update. Added localization, custom thumbnail cropping, import from the NextGen Gallery.

= 1.1.1 =
Bug fix. Added missing ".min.js" files.