<div class="vls-gf-tab-container">
    <form id="vls-gf-item-details">
        <?php wp_nonce_field('vls-gf-nonce'); ?>
        <input type="hidden" name="id" value="<?php echo $item->ID; ?>"/>

        <div class="vls-gf-tab-container-main">

            <input class="vls-gf-form-primary" type="text" name="title" value="<?php echo $item->post_title; ?>"/>

            <label class="vls-gf-form-element">
                <span><?php _e('Caption', VLS_GF_TEXTDOMAIN); ?></span>
                <textarea name="caption" rows="4"><?php echo $item->post_excerpt; ?></textarea>
            </label>

            <label class="vls-gf-form-element">
                <span><?php _e('Description', VLS_GF_TEXTDOMAIN); ?></span>
                <textarea name="description" rows="8"><?php echo $item->post_content; ?></textarea>
            </label>

            <label class="vls-gf-form-element">
                <span><?php _e('Append new images to', VLS_GF_TEXTDOMAIN); ?></span>
                <select name="append_new_images_to" class="vls-gf-half">
                    <option
                        value="top" <?php echo ("top" == $item_meta['append_new_images_to']) ? 'selected' : ''; ?>><?php _e('Top', VLS_GF_TEXTDOMAIN); ?></option>
                    <option
                        value="bottom" <?php echo ("bottom" == $item_meta['append_new_images_to']) ? 'selected' : ''; ?>><?php _e('Bottom', VLS_GF_TEXTDOMAIN); ?></option>
                </select>
            </label>

            <label class="vls-gf-form-element">
                <span><?php _e('Display info on hover', VLS_GF_TEXTDOMAIN); ?></span>
                <select name="display_image_info_on_hover" class="vls-gf-half">
                    <option
                        value="global" <?php echo ("global" == $item_meta['display_image_info_on_hover']) ? 'selected' : ''; ?>><?php _e('Use global setting', VLS_GF_TEXTDOMAIN); ?></option>
                    <option
                        value="none" <?php echo ("none" == $item_meta['display_image_info_on_hover']) ? 'selected' : ''; ?>><?php _e('None', VLS_GF_TEXTDOMAIN); ?></option>
                    <option
                        value="caption" <?php echo ("caption" == $item_meta['display_image_info_on_hover']) ? 'selected' : ''; ?>><?php _e('Caption', VLS_GF_TEXTDOMAIN); ?></option>
                    <option
	                    value="all" <?php echo ( "all" == $item_meta['display_image_info_on_hover'] ) ? 'selected' : ''; ?>><?php _e( 'Caption & description', VLS_GF_TEXTDOMAIN ); ?></option>
                </select>
            </label>

        </div>
        <div class="vls-gf-tab-container-side">
            <button class="button-primary"><?php _e('Update', VLS_GF_TEXTDOMAIN); ?></button>
            <span class="vls-gf-update-feedback"><?php _e('updated', VLS_GF_TEXTDOMAIN); ?></span>
            <label class="vls-gf-form-element">
                <span><?php _e('Slug', VLS_GF_TEXTDOMAIN); ?></span>
                <input type="text" name="slug" value="<?php echo $item->post_name; ?>"/>
            </label>
            <label class="vls-gf-form-element">
                <span><?php _e('Author', VLS_GF_TEXTDOMAIN); ?></span>
                <select name="author">
                    <?php foreach ($users as $user) { ?>
                        <option <?php echo ($item->post_author == $user->ID) ? 'selected' : ''; ?>
                            value="<?php echo $user->ID; ?>">
                            <?php echo $user->user_nicename; ?>
                        </option>
                    <?php } ?>
                </select>
            </label>
            <a class="vls-gf-edit-link"
               href="<?php echo $item->edit_link ?>"><?php _e('Edit more details', VLS_GF_TEXTDOMAIN); ?></a>

        </div>
    </form>
    <div class="clear"></div>
</div>
