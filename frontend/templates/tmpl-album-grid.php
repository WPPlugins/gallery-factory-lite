<div class="vls-gf-page">
    <?php foreach ($page_data as $row_data) { ?>
        <div class="vls-gf-row">
            <?php foreach ($row_data as $image) { ?>
                <div class="vls-gf-item vls-gf-item-<?php echo $col_count ?>">
                    <div style="<?php echo $image->spacings_style ?>">
                        <a <?php echo 'href="' . $image->url . '"'; ?>
                           style="<?php echo $image->a_style ?>">
                            <img
                                class="<?php echo $image->img_class; ?>"
                                src="<?php echo $image->url_preview_m; ?>"
                                alt="<?php echo $image->alt_text; ?>"/>
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
                        </a>
                    </div>
                </div>
            <?php } ?>
        </div>
    <?php } ?>
</div>
