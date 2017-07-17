(function ($, window, document, undefined) {
var CalculatorGrid = (function () {
var Calculator = function(getDraggedItemPosition) {
	this.getDraggedItemPosition = getDraggedItemPosition;
};

Calculator.prototype = {
	exec: function(items, params) {
		var aspectRatio = params.aspect_ratio;
		var vSpacing = params.vertical_spacing;
		var pageSize = 0;

		//prepare column array
		var columns = this.getColumns(params);
		var columnCount = columns.length;

		// Calculate cell widths
		var rowHeight = Math.floor(columns[0].width / aspectRatio);

		var i,
			item,
			itemWidth,
			itemHeight,
			itemLeft,
			itemTop;

		var curCol = 0;
		var curRow = 0;

		var nextCell = function() {
			curCol++;
			if (curCol >= columnCount) {
				curCol = 0;
				curRow++;
			}
		};

		
		for (i = 0; i < items.length; i++) {
			item = items[i];
			if (item.isDragged) {
				continue;
			}

			
			// Calculate item placement
			itemWidth = columns[curCol].width;
			itemHeight = rowHeight;
			itemTop = (rowHeight + vSpacing) * curRow;
			itemLeft = columns[curCol].left;

			item.placement = {
				width: itemWidth,
				height: itemHeight,
				top: itemTop,
				left: itemLeft,
				col: curCol,
				row: curRow
			};

			nextCell();
		}

		return [{
			no: 1,
			vertOffset: 0,
			items: items
		}];
	},

	getColumns: function(params) {
		var hSpacing = params.horizontal_spacing;
		var containerWidth = params.container_width;
		var columnCount = (params.screen_size === 'xs') ? 1 : params.column_count;
		var columns = [];

		var totWidth = containerWidth - hSpacing * (columnCount - 1);  //total width of rows without spacings
		var baseWidth = Math.floor(totWidth / columnCount);
		var extraPixels = totWidth - baseWidth * columnCount;

		var i;
		var leftPos = 0;
		for (i = 0; i < columnCount; i++) {
			var extraPixel = 0;
			if (extraPixels > 0) {
				extraPixel = 1;
				extraPixels--;
			}

			columns[i] = {
				width: baseWidth + extraPixel,
				left: leftPos
			};

			leftPos += baseWidth + hSpacing + extraPixel;
		}
		return columns;
	}
};

return Calculator;
})();
var CalculatorMetro = (function () {
var Calculator = function(getDraggedItemCells) {
	this.getDraggedItemCells = getDraggedItemCells;
};

Calculator.prototype = {
	exec: function(items, params) {
		var aspectRatio = params.aspect_ratio;
		var hSpacing = params.horizontal_spacing;
		var vSpacing = params.vertical_spacing;

		//prepare column array
		var columns = this.getColumns(params);
		var columnCount = columns.length;

		// Calculate cell widths
		var rowHeight = Math.floor(columns[0].width / aspectRatio);

		var i, a, b, ok,
			curPageRow,
			itemWidth,
			itemHeight,
			itemLeft,
			itemTop;

		var occupiedCells = [];
		var firstFreeCell = {col: 0, row: 0};
		var currentCell = {col: 0, row: 0};

		
		for (i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.isDragged) {
				continue;
			}

			var itemParams = item.params;
			var hSpan = itemParams.h_span ? parseInt(itemParams.h_span) : 1;
			var vSpan = itemParams.v_span ? parseInt(itemParams.v_span) : 1;

			// For mobile screens scale spans to the mobile column count
			if (params.screen_size === 'xs') {
				hSpan = 1;
				vSpan = 1;
			}

			hSpan = hSpan > columnCount ? columnCount : hSpan; // item can't span more than all columns

			// Find a suitable position for the current item
			ok = false;
			currentCell = {col: firstFreeCell.col, row: firstFreeCell.row};

			// Check position candidates
			while (!ok) {
				ok = true;

				if (currentCell.col + hSpan > columnCount) {
					ok = false;
				}

				// Check each cell of the item
				if (ok) {
					for (a = 0; a < hSpan; a++) {
						for (b = 0; b < vSpan; b++) {
							if (
								(currentCell.col + a >= columnCount)
								|| _isOccupied(occupiedCells, currentCell.col + a, currentCell.row + b)
							) {
								ok = false;
							}
						}
					}
				}

				if (!ok) {
					currentCell.col++;
					if (currentCell.col >= columnCount) {
						currentCell.col = 0;
						currentCell.row++;
					}
				}
			}

			_addOccupiedCells(occupiedCells, hSpan, vSpan, currentCell.col, currentCell.row);

			// Calculate item placement
			itemWidth = 0;
			for (a = currentCell.col; a < currentCell.col + hSpan; a++) {
				itemWidth += columns[a].width;
			}
			itemWidth += hSpacing * (hSpan - 1);
			itemHeight = rowHeight * vSpan + vSpacing * (vSpan - 1);
			itemTop = (rowHeight + vSpacing) * currentCell.row;
			itemLeft = columns[currentCell.col].left;

			item.placement = {
				width: itemWidth,
				height: itemHeight,
				top: itemTop,
				left: itemLeft,
				col: currentCell.col,
				row: currentCell.row
			};

			// Move to the next free cell
			ok = false;
			while (!ok) {
				if (!_isOccupied(occupiedCells, firstFreeCell.col, firstFreeCell.row)) {
					ok = true;
				}
				else {
					firstFreeCell.col++;
					if (firstFreeCell.col >= columnCount) {
						firstFreeCell.col = 0;
						firstFreeCell.row++;
					}
				}
			}
		}

		return [{
			no: 1,
			vertOffset: 0,
			items: items
		}];
	},

	getColumns: function(params) {
		var hSpacing = params.horizontal_spacing;
		var containerWidth = params.container_width;
		var columnCount = (params.screen_size === 'xs') ? 1 : params.column_count;
		var columns = [];

		var totWidth = containerWidth - hSpacing * (columnCount - 1);  //total width of rows without spacings
		var baseWidth = Math.floor(totWidth / columnCount);
		var extraPixels = totWidth - baseWidth * columnCount;

		var i;
		var leftPos = 0;
		for (i = 0; i < columnCount; i++) {
			var extraPixel = 0;
			if (extraPixels > 0) {
				extraPixel = 1;
				extraPixels--;
			}

			columns[i] = {
				width: baseWidth + extraPixel,
				left: leftPos
			};

			leftPos += baseWidth + hSpacing + extraPixel;
		}
		return columns;
	}
};

function _isOccupied(array, col, row) {
	var count = array.length;
	var i;
	for (i = 0; i < count; i++) {
		var occupiedCell = array[i];
		if (occupiedCell.col === col && occupiedCell.row === row) {
			return true;
		}
	}
	return false;
}

function _addOccupiedCells(occupiedCells, hSpan, vSpan, col, row) {
	var a, b;
	for (a = 0; a < hSpan; a++) {
		for (b = 0; b < vSpan; b++) {
			occupiedCells.push({col: col + a, row: row + b});
		}
	}
}

return Calculator;
})();
var CalculatorMasonryV = (function () {
var Calculator = function(editorCallback) {
	this.editorCallback = editorCallback;
};

Calculator.prototype.exec = function(items, params) {
	var vSpacing = params.vertical_spacing;
	var alignBottom = params.align_bottom;

	
	var placementColumn,
		itemWidth,
		itemHeight,
		itemLeft,
		itemTop,
		i, iMax;

	var pageNo = 1;
	var pageVertOffset = 0;

	//prepare column array
	var columns = _getColumns(params);

	//process items
	iMax = items.length;
	var index = -1; // item index for ordering
	for (i = 0; i < iMax; i++) {
		index++;
		var item = items[i];

		//find the best column for placing the item
		placementColumn = _getPlacementColumn(columns);

		//calculate item dimensions
		itemWidth = placementColumn.width;
		itemHeight = Math.floor(item.thumbnail_height / item.thumbnail_width * itemWidth);

		var extraPixel = placementColumn.extraPixel;

		//calculate item position
		itemTop = placementColumn.height;
		itemLeft = placementColumn.left;

					item.placement = {
				pageNo: pageNo,
				width: itemWidth + extraPixel,
				height: itemHeight,
				top: itemTop,
				left: itemLeft,
				col: placementColumn.no
			};
			
		// Update the column
		placementColumn.items.push(item);
		placementColumn.pageItemsCount++;
		placementColumn.height += itemHeight + vSpacing;
		placementColumn.netHeight += itemHeight;
	}

	if (alignBottom) {
		_alignColumns(columns);
	}


	return [{
		no: 1,
		vertOffset: 0,
		items: items
	}];
};

function _getColumns(params) {
	var hSpacing = params.horizontal_spacing;
	var containerWidth = params.container_width;
	var columnCount = (params.screen_size === 'xs') ? 1 : params.column_count;
	var columns = [];

	var totWidth = containerWidth - hSpacing * (columnCount - 1);  //total width of rows without spacings
	var baseWidth = Math.floor(totWidth / columnCount);
	var extraPixels = totWidth - baseWidth * columnCount;

	var i;
	var leftPos = 0;
	for (i = 0; i < columnCount; i++) {
		// Store it separately, so the pixel won't affect the image height and hence the layout flow on changing the container width
		var extraPixel = 0;
		if (extraPixels > 0) {
			extraPixel = 1;
			extraPixels--;
		}

		columns[i] = {
			no: i,
			width: baseWidth,
			extraPixel: extraPixel,
			height: 0,
			netHeight: 0,
			left: leftPos,
			items: [],
			pageItemsCount: 0
		};

		leftPos += baseWidth + hSpacing + extraPixel;
	}
	return columns;
}

function _getPlacementColumn(columns) {
	var i;
	var iMax = columns.length;
	var minHeight = columns[0].height;
	var bestCol = columns[0];

	for (i = 1; i < iMax; i++) {
		var colHeight = columns[i].height;
		if (colHeight < minHeight) {
			minHeight = colHeight;
			bestCol = columns[i];
		}
	}

	return bestCol;
}

/**
 * Aligns all columns, cropping image vertical dimensions
 * @param columns
 * @private
 */
function _alignColumns(columns) {
	var i, j;
	var totalCols = columns.length;
	var targetHeight = columns[0].height;


	// Get the shortest column
	for (i = 0; i < totalCols; i++) {
		var colHeight = columns[i].height;
		if (colHeight > 0 && colHeight < targetHeight) {
			targetHeight = colHeight;
		}
	}

	// Adjust columns
	for (i = 0; i < totalCols; i++) {
		var items = columns[i].items;
		var totalHeight = columns[i].height;
		var deltaHeight = totalHeight - targetHeight;

		if (deltaHeight === 0) {
			continue;
		}

		var stackShift = 0;
		var unadjustedStackHeight = columns[i].netHeight;
		var totalItems = items.length;

		// Process and cut items
		for (j = 0; j < totalItems; j++) {
			var item = items[j];
			var cutHeight = Math.ceil(item.placement.height * deltaHeight / unadjustedStackHeight);
			deltaHeight -= cutHeight;
			unadjustedStackHeight -= item.placement.height;
			item.placement.height -= cutHeight;
			item.placement.top -= stackShift;
			stackShift += cutHeight;
		}
	}

}

return Calculator;
})();
var Gallery = (function() {
	var SCREEN_XS_WIDTH = 640;
	var $window = $(window);

	var Gallery = function(element) {
		this.$el = $(element);
		this.$container = this.$el.find('.vls-gf-container');
		this.layoutParams = {};
		this.settings = {};
		this.items = [];
		this.init();
	};

	Gallery.prototype = {
		init: function() {
			var $el = this.$el;
			var self = this;

			this.$el.removeClass('no-js');

			this.layoutParams = $el.data('vlsGfLayout');
			this.settings = $el.data('vlsGfSettings');

			// Instantiate layout calculator
			if (this.layoutParams.layout_type === 'grid') {
				this.calculator = new CalculatorGrid();
			}
			else if (this.layoutParams.layout_type === 'metro') {
				this.calculator = new CalculatorMetro();
			}
			else if (this.layoutParams.layout_type === 'masonry-v') {
				this.calculator = new CalculatorMasonryV();
			}
			else {
				console.log('Gallery Factory error: unknown layout type');
				return;
			}

			this.initItems();
			this.updateLayout();

			$window.bind("resize", function() {
				self.updateLayout();
			});
		},

		/**
		 * Collect items and their parameters from DOM
		 */
		initItems: function() {
			var items = this.items;
			this.$el.find('.vls-gf-item').each(function() {
				var $item = $(this);
				var params = $item.data('vlsGfLayout') || {};
				var thumbnailWidth = parseInt($item.data('vlsGfThumbnailWidth'));
				var thumbnailHeight = parseInt($item.data('vlsGfThumbnailHeight'));

				items.push({
					$el: $item,
					params: params,
					thumbnail_width: thumbnailWidth,
					thumbnail_height: thumbnailHeight
				})
			});
		},

		/**
		 * Recalculate and redraw the layout
		 */
		updateLayout: function(secondPass) {
			var params = this.layoutParams;
			params.container_width = this.$el.find('.vls-gf-container').innerWidth();

			if ($(window).width() <= SCREEN_XS_WIDTH) {
				params.screen_size = 'xs';
			}
			else {
				params.screen_size = 'lg';
			}

			this.layout = this.calculator.exec(this.items, this.layoutParams);

			this.showPage();

			// If the container width is changed due to the scrollbar, run the second pass
			if (!secondPass && params.container_width != this.$el.find('.vls-gf-container').innerWidth()) {
				this.updateLayout(true);
			}
		},

		showPage: function() {
			var self = this;
			var maxHeight = 0;

			// Place items
			$.each(this.layout[0].items, function(itemIndex, item) {
				item.$el.css({
					top: item.placement.top,
					left: item.placement.left,
					width: item.placement.width,
					height: item.placement.height
				}).removeClass('vls-gf-hidden');

				self.centerImage(item);

				var curHeight = item.placement.top + item.placement.height;
				if (maxHeight < curHeight) {
					maxHeight = curHeight;
				}
			});

			this.$container.css({height: maxHeight});

			this.initLightbox();
		},

		centerImage: function(item) {
			var wrapper = item.$el.find('.vls-gf-img');
			var wrapperWidth = item.$el.innerWidth();
			var wrapperHeight = item.$el.innerHeight();
			var overflow, overflowOne, overflowTwo;
			// the image is wider
			if (item.thumbnail_width / item.thumbnail_height > wrapperWidth / wrapperHeight) {
				overflow = Math.ceil(item.thumbnail_width / item.thumbnail_height * wrapperHeight - wrapperWidth);
				overflowOne = Math.floor(overflow / 2);
				overflowTwo = overflow - overflowOne;
				wrapper.css({
					top: 0,
					bottom: 0,
					left: -overflowOne,
					right: -overflowTwo
				});
			}
			// the image is taller
			else {
				overflow = Math.ceil(item.thumbnail_height / item.thumbnail_width * wrapperWidth - wrapperHeight);
				overflowOne = Math.floor(overflow / 2);
				overflowTwo = overflow - overflowOne;
				wrapper.css({
					top: -overflowOne,
					bottom: -overflowTwo,
					left: 0,
					right: 0
				});
			}
		},

		initLightbox: function() {
			var lightbox = this.$el.data('vlsGfLightbox');
			if (lightbox && typeof lightbox.updateTargets === "function") {
				lightbox.updateTargets(this.$el, false);
			}
		}
	};

	return Gallery;
})();

/* Register as a jQuery plugin */
$.fn.vlsGfGallery = function() {
	// Create a Gallery object for each gallery element
	this.each(function() {
		var gallery = new Gallery(this);
		$.data(this, 'vlsGfGallery', gallery);
	});
	return this;
};

// Init gallery on document load
$(function() {
	$('.vls-gf-gallery').vlsGfGallery();
});


})(jQuery, window, document);