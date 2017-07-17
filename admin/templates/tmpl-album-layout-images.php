<ul>
    <?php
    foreach ($images as $image) {
        ?>
        <li
            <?php
            if ($image->url === "") {
                echo ' style="background-color: #ccc; border: 1px solid #444;" ';
            } else {
                echo ' style="background-image: url(' . $image->url . ');" ';
            }
            ?>
            data-vls-gf-link-id="<?php echo $image->link_id ?>"
            data-vls-gf-image-id="<?php echo $image->image_id ?>"
            data-vls-gf-col="<?php echo $image->col ?>"
            data-vls-gf-row="<?php echo $image->row ?>"
            data-vls-gf-metro-w="<?php echo $image->metro_w ?>"
            data-vls-gf-metro-h="<?php echo $image->metro_h ?>">
        </li>
    <?php
    }
    ?>
</ul>


