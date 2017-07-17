<div class="wrap">
    <h2>Gallery Factory Settings</h2>

    <form action="options.php" method="post">

        <?php settings_fields('vls-gallery-factory'); ?>

        <table class="form-table">
            <tbody>
            <tr>
                <th scope="row"><label
                        for="vls_gf_display_image_info_on_hover"><?php _e('Image info display on hover', VLS_GF_TEXTDOMAIN); ?></label>
                </th>
                <td>
                    <select name="vls_gf_display_image_info_on_hover" id="vls_gf_display_image_info_on_hover">
                        <option
                            value="none" <?php echo 'disabled' == get_option('vls_gf_display_image_info_on_hover') ? 'selected="selected"' : ''; ?>>
	                        <?php _e( 'None', VLS_GF_TEXTDOMAIN ); ?>
                        </option>
                        <option
                            value="caption" <?php echo 'caption' == get_option('vls_gf_display_image_info_on_hover') ? 'selected="selected"' : ''; ?>>
	                        <?php _e( 'Caption', VLS_GF_TEXTDOMAIN ); ?>
                        </option>
                        <option
                            value="all" <?php echo 'all' == get_option('vls_gf_display_image_info_on_hover') ? 'selected="selected"' : ''; ?>>
	                        <?php _e( 'Caption & description', VLS_GF_TEXTDOMAIN ); ?>
                        </option>
                    </select>

	                <p class="description"><?php _e( 'Select what info will be displayed on hovering the thumbnail.', VLS_GF_TEXTDOMAIN ); ?></p>
                </td>
            </tr>
            </tbody>
        </table>

        <?php submit_button("Save Changes"); ?>
    </form>

</div>