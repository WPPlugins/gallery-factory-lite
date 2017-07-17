<div class="vls-gf-page">
    <?php foreach ($page_data as $image) { ?>
        <div
            class="vls-gf-item"
            data-vls-gf-image-aspect="<?php echo $image->image_aspect; ?>"
            data-vls-gf-width="<?php echo $image->metro_w; ?>"
            data-vls-gf-height="<?php echo $image->metro_h; ?>"
            data-vls-gf-col="<?php echo $image->col; ?>"
            data-vls-gf-row="<?php echo $image->row; ?>"
            style="margin-bottom: <?php echo $album->vertical_spacing; ?>px;">
            <a href="<?php echo $image->url; ?>">
                <img
                    class="<?php echo $image->img_class; ?>"
                    src="<?php echo $image->url_preview_m; ?>"
                    alt="<?php echo $image->alt_text ?>"/>
                <div class="vls-gf-info-back">
                    <div class="vls-gf-info-back">
                        <h2 class="vls-gf-info-caption"
                            <?php if ( $image->lightbox_caption !== $image->caption ) {
                                echo ' data-lightbox-caption="' . $image->lightbox_caption . '"';
                            } ?>>
                            <?php echo $image->caption ?>
                        </h2>
                        <p class="vls-gf-info-description"
                            <?php if ( $image->lightbox_description !== $image->description ) {
                                echo ' data-lightbox-description="' . $image->lightbox_description . '"';
                            } ?>>
                            <?php echo $image->description ?>
                        </p>
                    </div>
                </div>
            </a>
        </div>
    <?php } ?>
</div>