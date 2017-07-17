jQuery(function($) {

	var activityIndicatorOn = function() {
			$('<div id="imagelightbox-loading"><div></div></div>').appendTo('body');
		},
		activityIndicatorOff = function() {
			$('#imagelightbox-loading').remove();
		},

		overlayOn = function() {
			$('<div id="imagelightbox-overlay"></div>').appendTo('body');
		},
		overlayOff = function() {
			$('#imagelightbox-overlay').remove();
		},

		closeButtonOn = function(instance) {
			$('<a href="#" id="imagelightbox-close">Close</a>').appendTo('body').on('click touchend', function() {
				instance.quitImageLightbox();
				return false;
			});
		},

		closeButtonOff = function() {
			$('#imagelightbox-close').remove();
		},

		infoOn = function() {

			var ilb = $('#imagelightbox');

			var info = $('<div id="imagelightbox-info"/>');
			var imageUrl = $('#imagelightbox').attr('src');
			var $item = $('a[href="' + imageUrl + '"]').closest('.vls-gf-item');


			var caption = $item.find('.vls-gf-info-caption');
			if (caption) {
				var captionText = caption.text();
				if (caption.data('lightboxCaption')) {
					captionText = caption.data('lightboxCaption');
				}
				info.append('<h2 id="imagelightbox-info-caption">' + captionText + '</h2>');
			}

			var description = $item.find('.vls-gf-info-description');
			if (description) {
				var descriptionText = description.text();
				if (description.data('lightboxDescription')) {
					descriptionText = description.data('lightboxDescription');
				}
				info.append('<div id="imagelightbox-info-description">' + descriptionText + '</div>');
			}

			info.appendTo('body');

			//socialOn(imageUrl, captionText);

		},

		socialOn = function(imageUrl, captionText) {

			var facebookAppId = '000000000000000000';
			var pageUrl = window.location.href;

			var socialContainer = $('<div id="imagelightbox-social"></div>');

			//fb
			socialContainer.append('<a href="https://www.facebook.com/dialog/feed?' +
				'app_id=' + facebookAppId + '&amp;' +
				'link=' + encodeURIComponent(pageUrl) + '&amp;' +
				'picture=' + encodeURIComponent(imageUrl) + '&amp;' +
				'caption=' + encodeURIComponent(captionText) + '&amp;' +
				'redirect_uri=' + encodeURIComponent(pageUrl) +
				'" rel="nofollow" target="_blank" class="vls-gf-facebook" title="Facebook"></a>');

			//google+
			socialContainer.append('<a href="https://plus.google.com/share?' +
				'url=' + encodeURIComponent(imageUrl) + '" rel="nofollow" target="_blank" class="vls-gf-google-plus" title="GooglePlus"></a>');

			//twitter
			socialContainer.append('<a href="https://twitter.com/share?' +
				'url=' + encodeURIComponent(imageUrl) + '&amp;' +
				'text=' + encodeURIComponent(captionText) +
				'" rel="nofollow" target="_blank" class="vls-gf-twitter" title="Twitter"></a>');

			//pinterest
			socialContainer.append('<a href="https://pinterest.com/pin/create/bookmarklet/?' +
				'media=' + encodeURIComponent(imageUrl) + '&amp;' +
				'url=' + encodeURIComponent(pageUrl) + '&amp;' +
				'is_video=false&amp;' +
				'description=' + encodeURIComponent(captionText) +
				'" rel="nofollow" target="_blank" class="vls-gf-pinterest" title="Pinterest"></a>');

			//linkedin
			socialContainer.append('<a href="http://www.linkedin.com/shareArticle?' +
				'url=' + encodeURIComponent(imageUrl) + '&amp;' +
				'title=' + encodeURIComponent(captionText) +
				'" rel="nofollow" target="_blank" class="vls-gf-linkedin" title="LinkedIn"></a>');

			socialContainer.appendTo('body');

		},

		infoOff = function() {

			$('#imagelightbox-info').remove();

			$('#imagelightbox-social').remove();

		},


		// ARROWS

		arrowsOn = function(instance) {
			var $arrows = $('<button type="button" class="imagelightbox-arrow imagelightbox-arrow-left"></button><button type="button" class="imagelightbox-arrow imagelightbox-arrow-right"></button>');

			$arrows.appendTo('body');

			$arrows.on('click touchend', function(e) {
				e.preventDefault();

				if ($(this).hasClass('imagelightbox-arrow-left')) {
					instance.switchPrevImage();
				}
				else {
					instance.switchNextImage();
				}
				return false;
			});
		},

		arrowsOff = function() {
			$('.imagelightbox-arrow').remove();
		},


		navigationOn = function(instance, selector) {
			var images = $(selector);
			if (images.length) {
				var nav = $('<div id="imagelightbox-nav"></div>');
				for (var i = 0; i < images.length; i++)
					nav.append('<a href="#"></a>');

				nav.appendTo('body');
				nav.on('click touchend', function() {
					return false;
				});

				var navItems = nav.find('a');
				navItems.on('click touchend', function() {
						var $this = $(this);
						if (images.eq($this.index()).attr('href') != $('#imagelightbox').attr('src'))
							instance.switchImageLightbox($this.index());

						navItems.removeClass('active');
						navItems.eq($this.index()).addClass('active');

						return false;
					})
					.on('touchend', function() {
						return false;
					});
			}
		},
		navigationUpdate = function(selector) {
			var items = $('#imagelightbox-nav a');
			items.removeClass('active');
			items.eq($(selector).filter('[href="' + $('#imagelightbox').attr('src') + '"]').index(selector)).addClass('active');
		},
		navigationOff = function() {
			$('#imagelightbox-nav').remove();
		};


	$('.vls-gf-gallery').each(function() {

		var $this = $(this);

		var vlsGfImageLightbox = $this.imageLightbox(
			{
				container: $this.find('.vls-gf-page:first-child'),
				onStart: function() {
					overlayOn();
					closeButtonOn(vlsGfImageLightbox);
					arrowsOn(vlsGfImageLightbox);
				},
				onEnd: function() {
					arrowsOff();
					infoOff();
					closeButtonOff();
					overlayOff();
					activityIndicatorOff();
				},
				onLoadStart: function() {
					infoOff();
					activityIndicatorOn();
				},
				onLoadEnd: function() {
					$('.imagelightbox-arrow').css('display', 'block');
					infoOn();
					activityIndicatorOff();
				}
			});

		$this.data('vlsGfLightbox', vlsGfImageLightbox);

	});

});
