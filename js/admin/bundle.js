/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */

	var App = __webpack_require__(1);
	var $ = __webpack_require__(2);

	$(function() {
			var app = new App();
			app.start();
		}
	);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*global define, ajaxurl, console*/

	var $ = __webpack_require__(2);
	var Backbone = __webpack_require__(3);
	var BackboneRadioShim = __webpack_require__(7);
	var Marionette = __webpack_require__(8);
	var BackboneSync = __webpack_require__(12);
	var Radio = __webpack_require__(13);
	var Router = __webpack_require__(14);
	var Controller = __webpack_require__(15);
	var RootModel = __webpack_require__(18);
	var RootView = __webpack_require__(19);
	var UploaderView = __webpack_require__(113);
	var DialogManagerView = __webpack_require__(120);
	var TutorialView = __webpack_require__(133);
	var TutorialMockupData = __webpack_require__(135);

	var App = Marionette.Application.extend({

		radio: Radio,

		initialize: function(options) {

			//var self = this;
			//
			//self.listenTo(Radio, 'debug:message', self.debugMessage);

			//self.apiUrl = (window.location.origin ? window.location.origin : window.location.protocol + '/' + window.location.host) + '/api/';
			//self.on('navigation:main', self.navigate);


		},

		/**
		 * Instantiating main modules, pushing dependencies, kicking everything off
		 */
		start: function() {

			this.createRequestAnimationFramePolyfill();

			//Setup backbone sync method. Use WP 'ajaxurl' global.
			BackboneSync.setup(ajaxurl);

			//Initiating root classes
			var rootModel = new RootModel();
			var rootView = new RootView({model: rootModel});
			var controller = new Controller({rootModel: rootModel});

			var uploaderView = new UploaderView({});
			var dialogManagerView = new DialogManagerView({});


			//vlsGFData.tutorialStatus.manager = false;

			if (
				!vlsGFData.tutorialStatus.manager
				|| !vlsGFData.tutorialStatus.folder
				|| !vlsGFData.tutorialStatus.album
				|| !vlsGFData.tutorialStatus.image
			) {
				if (!vlsGFData.tutorialStatus.manager) {
					TutorialMockupData.setup();
				}
				var tutorialView = new TutorialView({model: rootModel});
			}
			else {
				$('#vls-gf-layer-tutorial').remove();
			}

			var router = new Router({controller: controller});

			controller.start();
			router.start();

			this.attachGlobalUIHandlers();

		},

		debugMessage: function(params) {
			var message = 'debug: ' + (params.message ? params.message : '');
			console.log(message);
		},

		createRequestAnimationFramePolyfill: function() {
			window.vlsGfRequestAnimationFrame = (function() {
				return window.requestAnimationFrame ||
					window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame ||
					window.oRequestAnimationFrame ||
					window.msRequestAnimationFrame ||
					function(callback) {
						window.setTimeout(callback, 1000 / 60);
					};
			})();
		},

		attachGlobalUIHandlers: function() {

			//region tooltip
			$(document).on('mouseenter.vls-gf', '[data-vls-gf-tooltip]:not(.vls-gf-no-tooltip)', function() {

				var control = $(this),
					$window = $(window),
					offset = control.offset(),
					height = control.outerHeight(),
					width = control.outerWidth(),
					windowWidth = $window.width(),
					windowScroll = $window.scrollTop(),
					posTop, posLeft, posRight;

				var tooltipEl = control.data('vlsGfTooltipEl');

				if (tooltipEl) {
					tooltipEl.addClass('vls-gf-visible');
					return;
				}

				var txt = control.data('vlsGfTooltip'),
					pos = control.data('vlsGfPosition'),
					tooltipOffset = control.data('vlsGfOffset');
				tooltipOffset = tooltipOffset ? tooltipOffset : 0;

				if (!txt) {
					return;
				}

				tooltipEl = $('<div class="vls-gf-tooltip"></div>')
					.html(txt);

				if (pos === 'left') { //placed left
					posTop = Math.round(offset.top + height / 2 - windowScroll);
					posRight = Math.round(windowWidth - offset.left);

					tooltipEl.addClass('vls-gf-left').css({
						top: posTop,
						right: posRight + tooltipOffset
					});

				}
				else { //placed below
					posTop = Math.round(offset.top + height - windowScroll);
					posLeft = Math.round(offset.left + width / 2);

					//if too close to the window edge, then need to position differently
					if (windowWidth - posLeft < 40) {
						tooltipEl.addClass('vls-gf-below-edge-r').css({
							top: posTop + tooltipOffset,
							right: 8
						});
					}
					else {
						tooltipEl.addClass('vls-gf-below').css({
							top: posTop + tooltipOffset,
							left: posLeft
						});
					}


				}

				control.data('vlsGfTooltipEl', tooltipEl);
				$('#vls-gf-app').append(tooltipEl);


				setTimeout(function() {
					//adjust width so the element won't be blurred by transform
					tooltipEl.css('width', Math.ceil((tooltipEl.outerWidth() + 2) / 2) * 2);
					tooltipEl.addClass('vls-gf-visible');
				}, 10);

			});

			$(document).on('mouseleave.vls-gf', '[data-vls-gf-tooltip]', function() {

				var control = $(this),
					tooltipEl = control.data('vlsGfTooltipEl');

				if (tooltipEl) {

					tooltipEl.removeClass('vls-gf-visible');
					control.data('vlsGfTooltipEl', null);

					setTimeout(function() {
						tooltipEl.remove();
					}, 200);

				}

			});
			//endregion

			//region field decorations
			$(document).on('focus.vls-gf', '.vls-gf-field>input, .vls-gf-field>select, .vls-gf-field>textarea', function() {
				$(this).closest('.vls-gf-field').addClass('vls-gf-focus');
			});

			$(document).on('blur.vls-gf', '.vls-gf-field>input, .vls-gf-field>select, .vls-gf-field>textarea', function() {
				$(this).closest('.vls-gf-field').removeClass('vls-gf-focus');
			});
			//endregion
		}


	});

	module.exports = App;

/***/ },
/* 2 */
/***/ function(module, exports) {

	/* global jQuery */
	module.exports = jQuery.noConflict();

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */

	var Backbone = __webpack_require__(4);

	module.exports = Backbone.noConflict();

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {//     Backbone.js 1.2.3

	//     (c) 2010-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Backbone may be freely distributed under the MIT license.
	//     For all details and documentation:
	//     http://backbonejs.org

	(function(factory) {

		// Establish the root object, `window` (`self`) in the browser, or `global` on the server.
		// We use `self` instead of `window` for `WebWorker` support.
		var root = (typeof self == 'object' && self.self == self && self) ||
			(typeof global == 'object' && global.global == global && global);

		// Set up Backbone appropriately for the environment. Start with AMD.
		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(5), __webpack_require__(2), exports], __WEBPACK_AMD_DEFINE_RESULT__ = function(_, $, exports) {
				// Export global even in AMD case in case this script is loaded with
				// others that may still expect a global Backbone.
				root.Backbone = factory(root, exports, _, $);
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

			// Next for Node.js or CommonJS. jQuery may not be needed as a module.
		}
		else if (typeof exports !== 'undefined') {
			var _ = require('underscore'), $;
			try {
				$ = require('jquery');
			} catch (e) {
			}
			factory(root, exports, _, $);

			// Finally, as a browser global.
		}
		else {
			root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
		}

	}(function(root, Backbone, _, $) {

		// Initial Setup
		// -------------

		// Save the previous value of the `Backbone` variable, so that it can be
		// restored later on, if `noConflict` is used.
		var previousBackbone = root.Backbone;

		// Create a local reference to a common array method we'll want to use later.
		var slice = Array.prototype.slice;

		// Current version of the library. Keep in sync with `package.json`.
		Backbone.VERSION = '1.2.3';

		// For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
		// the `$` variable.
		Backbone.$ = $;

		// Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
		// to its previous owner. Returns a reference to this Backbone object.
		Backbone.noConflict = function() {
			root.Backbone = previousBackbone;
			return this;
		};

		// Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
		// will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
		// set a `X-Http-Method-Override` header.
		Backbone.emulateHTTP = false;

		// Turn on `emulateJSON` to support legacy servers that can't deal with direct
		// `application/json` requests ... this will encode the body as
		// `application/x-www-form-urlencoded` instead and will send the model in a
		// form param named `model`.
		Backbone.emulateJSON = false;

		// Proxy Backbone class methods to Underscore functions, wrapping the model's
		// `attributes` object or collection's `models` array behind the scenes.
		//
		// collection.filter(function(model) { return model.get('age') > 10 });
		// collection.each(this.addView);
		//
		// `Function#apply` can be slow so we use the method's arg count, if we know it.
		var addMethod = function(length, method, attribute) {
			switch (length) {
				case 1:
					return function() {
						return _[method](this[attribute]);
					};
				case 2:
					return function(value) {
						return _[method](this[attribute], value);
					};
				case 3:
					return function(iteratee, context) {
						return _[method](this[attribute], cb(iteratee, this), context);
					};
				case 4:
					return function(iteratee, defaultVal, context) {
						return _[method](this[attribute], cb(iteratee, this), defaultVal, context);
					};
				default:
					return function() {
						var args = slice.call(arguments);
						args.unshift(this[attribute]);
						return _[method].apply(_, args);
					};
			}
		};
		var addUnderscoreMethods = function(Class, methods, attribute) {
			_.each(methods, function(length, method) {
				if (_[method]) Class.prototype[method] = addMethod(length, method, attribute);
			});
		};

		// Support `collection.sortBy('attr')` and `collection.findWhere({id: 1})`.
		var cb = function(iteratee, instance) {
			if (_.isFunction(iteratee)) return iteratee;
			if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
			if (_.isString(iteratee)) return function(model) {
				return model.get(iteratee);
			};
			return iteratee;
		};
		var modelMatcher = function(attrs) {
			var matcher = _.matches(attrs);
			return function(model) {
				return matcher(model.attributes);
			};
		};

		// Backbone.Events
		// ---------------

		// A module that can be mixed in to *any object* in order to provide it with
		// a custom event channel. You may bind a callback to an event with `on` or
		// remove with `off`; `trigger`-ing an event fires all callbacks in
		// succession.
		//
		//     var object = {};
		//     _.extend(object, Backbone.Events);
		//     object.on('expand', function(){ alert('expanded'); });
		//     object.trigger('expand');
		//
		var Events = Backbone.Events = {};

		// Regular expression used to split event strings.
		var eventSplitter = /\s+/;

		// Iterates over the standard `event, callback` (as well as the fancy multiple
		// space-separated events `"change blur", callback` and jQuery-style event
		// maps `{event: callback}`).
		var eventsApi = function(iteratee, events, name, callback, opts) {
			var i = 0, names;
			if (name && typeof name === 'object') {
				// Handle event maps.
				if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
				for (names = _.keys(name); i < names.length; i++) {
					events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
				}
			}
			else if (name && eventSplitter.test(name)) {
				// Handle space separated event names by delegating them individually.
				for (names = name.split(eventSplitter); i < names.length; i++) {
					events = iteratee(events, names[i], callback, opts);
				}
			}
			else {
				// Finally, standard events.
				events = iteratee(events, name, callback, opts);
			}
			return events;
		};

		// Bind an event to a `callback` function. Passing `"all"` will bind
		// the callback to all events fired.
		Events.on = function(name, callback, context) {
			return internalOn(this, name, callback, context);
		};

		// Guard the `listening` argument from the public API.
		var internalOn = function(obj, name, callback, context, listening) {
			obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
				context: context,
				ctx: obj,
				listening: listening
			});

			if (listening) {
				var listeners = obj._listeners || (obj._listeners = {});
				listeners[listening.id] = listening;
			}

			return obj;
		};

		// Inversion-of-control versions of `on`. Tell *this* object to listen to
		// an event in another object... keeping track of what it's listening to
		// for easier unbinding later.
		Events.listenTo = function(obj, name, callback) {
			if (!obj) return this;
			var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
			var listeningTo = this._listeningTo || (this._listeningTo = {});
			var listening = listeningTo[id];

			// This object is not listening to any other events on `obj` yet.
			// Setup the necessary references to track the listening callbacks.
			if (!listening) {
				var thisId = this._listenId || (this._listenId = _.uniqueId('l'));
				listening = listeningTo[id] = {obj: obj, objId: id, id: thisId, listeningTo: listeningTo, count: 0};
			}

			// Bind callbacks on obj, and keep track of them on listening.
			internalOn(obj, name, callback, this, listening);
			return this;
		};

		// The reducing API that adds a callback to the `events` object.
		var onApi = function(events, name, callback, options) {
			if (callback) {
				var handlers = events[name] || (events[name] = []);
				var context = options.context, ctx = options.ctx, listening = options.listening;
				if (listening) listening.count++;

				handlers.push({callback: callback, context: context, ctx: context || ctx, listening: listening});
			}
			return events;
		};

		// Remove one or many callbacks. If `context` is null, removes all
		// callbacks with that function. If `callback` is null, removes all
		// callbacks for the event. If `name` is null, removes all bound
		// callbacks for all events.
		Events.off = function(name, callback, context) {
			if (!this._events) return this;
			this._events = eventsApi(offApi, this._events, name, callback, {
				context: context,
				listeners: this._listeners
			});
			return this;
		};

		// Tell this object to stop listening to either specific events ... or
		// to every object it's currently listening to.
		Events.stopListening = function(obj, name, callback) {
			var listeningTo = this._listeningTo;
			if (!listeningTo) return this;

			var ids = obj ? [obj._listenId] : _.keys(listeningTo);

			for (var i = 0; i < ids.length; i++) {
				var listening = listeningTo[ids[i]];

				// If listening doesn't exist, this object is not currently
				// listening to obj. Break out early.
				if (!listening) break;

				listening.obj.off(name, callback, this);
			}
			if (_.isEmpty(listeningTo)) this._listeningTo = void 0;

			return this;
		};

		// The reducing API that removes a callback from the `events` object.
		var offApi = function(events, name, callback, options) {
			if (!events) return;

			var i = 0, listening;
			var context = options.context, listeners = options.listeners;

			// Delete all events listeners and "drop" events.
			if (!name && !callback && !context) {
				var ids = _.keys(listeners);
				for (; i < ids.length; i++) {
					listening = listeners[ids[i]];
					delete listeners[listening.id];
					delete listening.listeningTo[listening.objId];
				}
				return;
			}

			var names = name ? [name] : _.keys(events);
			for (; i < names.length; i++) {
				name = names[i];
				var handlers = events[name];

				// Bail out if there are no events stored.
				if (!handlers) break;

				// Replace events if there are any remaining.  Otherwise, clean up.
				var remaining = [];
				for (var j = 0; j < handlers.length; j++) {
					var handler = handlers[j];
					if (
						callback && callback !== handler.callback &&
						callback !== handler.callback._callback ||
						context && context !== handler.context
					) {
						remaining.push(handler);
					}
					else {
						listening = handler.listening;
						if (listening && --listening.count === 0) {
							delete listeners[listening.id];
							delete listening.listeningTo[listening.objId];
						}
					}
				}

				// Update tail event if the list has any events.  Otherwise, clean up.
				if (remaining.length) {
					events[name] = remaining;
				}
				else {
					delete events[name];
				}
			}
			if (_.size(events)) return events;
		};

		// Bind an event to only be triggered a single time. After the first time
		// the callback is invoked, its listener will be removed. If multiple events
		// are passed in using the space-separated syntax, the handler will fire
		// once for each event, not once for a combination of all events.
		Events.once = function(name, callback, context) {
			// Map the event into a `{event: once}` object.
			var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
			return this.on(events, void 0, context);
		};

		// Inversion-of-control versions of `once`.
		Events.listenToOnce = function(obj, name, callback) {
			// Map the event into a `{event: once}` object.
			var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
			return this.listenTo(obj, events);
		};

		// Reduces the event callbacks into a map of `{event: onceWrapper}`.
		// `offer` unbinds the `onceWrapper` after it has been called.
		var onceMap = function(map, name, callback, offer) {
			if (callback) {
				var once = map[name] = _.once(function() {
					offer(name, once);
					callback.apply(this, arguments);
				});
				once._callback = callback;
			}
			return map;
		};

		// Trigger one or many events, firing all bound callbacks. Callbacks are
		// passed the same arguments as `trigger` is, apart from the event name
		// (unless you're listening on `"all"`, which will cause your callback to
		// receive the true name of the event as the first argument).
		Events.trigger = function(name) {
			if (!this._events) return this;

			var length = Math.max(0, arguments.length - 1);
			var args = Array(length);
			for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

			eventsApi(triggerApi, this._events, name, void 0, args);
			return this;
		};

		// Handles triggering the appropriate event callbacks.
		var triggerApi = function(objEvents, name, cb, args) {
			if (objEvents) {
				var events = objEvents[name];
				var allEvents = objEvents.all;
				if (events && allEvents) allEvents = allEvents.slice();
				if (events) triggerEvents(events, args);
				if (allEvents) triggerEvents(allEvents, [name].concat(args));
			}
			return objEvents;
		};

		// A difficult-to-believe, but optimized internal dispatch function for
		// triggering events. Tries to keep the usual cases speedy (most internal
		// Backbone events have 3 arguments).
		var triggerEvents = function(events, args) {
			var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
			switch (args.length) {
				case 0:
					while (++i < l) (ev = events[i]).callback.call(ev.ctx);
					return;
				case 1:
					while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1);
					return;
				case 2:
					while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2);
					return;
				case 3:
					while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
					return;
				default:
					while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
					return;
			}
		};

		// Aliases for backwards compatibility.
		Events.bind = Events.on;
		Events.unbind = Events.off;

		// Allow the `Backbone` object to serve as a global event bus, for folks who
		// want global "pubsub" in a convenient place.
		_.extend(Backbone, Events);

		// Backbone.Model
		// --------------

		// Backbone **Models** are the basic data object in the framework --
		// frequently representing a row in a table in a database on your server.
		// A discrete chunk of data and a bunch of useful, related methods for
		// performing computations and transformations on that data.

		// Create a new model with the specified attributes. A client id (`cid`)
		// is automatically generated and assigned for you.
		var Model = Backbone.Model = function(attributes, options) {
			var attrs = attributes || {};
			options || (options = {});
			this.cid = _.uniqueId(this.cidPrefix);
			this.attributes = {};
			if (options.collection) this.collection = options.collection;
			if (options.parse) attrs = this.parse(attrs, options) || {};
			attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
			this.set(attrs, options);
			this.changed = {};
			this.initialize.apply(this, arguments);
		};

		// Attach all inheritable methods to the Model prototype.
		_.extend(Model.prototype, Events, {

			// A hash of attributes whose current and previous value differ.
			changed: null,

			// The value returned during the last failed validation.
			validationError: null,

			// The default name for the JSON `id` attribute is `"id"`. MongoDB and
			// CouchDB users may want to set this to `"_id"`.
			idAttribute: 'id',

			// The prefix is used to create the client id which is used to identify models locally.
			// You may want to override this if you're experiencing name clashes with model ids.
			cidPrefix: 'c',

			// Initialize is an empty function by default. Override it with your own
			// initialization logic.
			initialize: function() {
			},

			// Return a copy of the model's `attributes` object.
			toJSON: function(options) {
				return _.clone(this.attributes);
			},

			// Proxy `Backbone.sync` by default -- but override this if you need
			// custom syncing semantics for *this* particular model.
			sync: function() {
				return Backbone.sync.apply(this, arguments);
			},

			// Get the value of an attribute.
			get: function(attr) {
				return this.attributes[attr];
			},

			// Get the HTML-escaped value of an attribute.
			escape: function(attr) {
				return _.escape(this.get(attr));
			},

			// Returns `true` if the attribute contains a value that is not null
			// or undefined.
			has: function(attr) {
				return this.get(attr) != null;
			},

			// Special-cased proxy to underscore's `_.matches` method.
			matches: function(attrs) {
				return !!_.iteratee(attrs, this)(this.attributes);
			},

			// Set a hash of model attributes on the object, firing `"change"`. This is
			// the core primitive operation of a model, updating the data and notifying
			// anyone who needs to know about the change in state. The heart of the beast.
			set: function(key, val, options) {
				if (key == null) return this;

				// Handle both `"key", value` and `{key: value}` -style arguments.
				var attrs;
				if (typeof key === 'object') {
					attrs = key;
					options = val;
				}
				else {
					(attrs = {})[key] = val;
				}

				options || (options = {});

				// Run validation.
				if (!this._validate(attrs, options)) return false;

				// Extract attributes and options.
				var unset = options.unset;
				var silent = options.silent;
				var changes = [];
				var changing = this._changing;
				this._changing = true;

				if (!changing) {
					this._previousAttributes = _.clone(this.attributes);
					this.changed = {};
				}

				var current = this.attributes;
				var changed = this.changed;
				var prev = this._previousAttributes;

				// For each `set` attribute, update or delete the current value.
				for (var attr in attrs) {
					val = attrs[attr];
					if (!_.isEqual(current[attr], val)) changes.push(attr);
					if (!_.isEqual(prev[attr], val)) {
						changed[attr] = val;
					}
					else {
						delete changed[attr];
					}
					unset ? delete current[attr] : current[attr] = val;
				}

				// Update the `id`.
				this.id = this.get(this.idAttribute);

				// Trigger all relevant attribute changes.
				if (!silent) {
					if (changes.length) this._pending = options;
					for (var i = 0; i < changes.length; i++) {
						this.trigger('change:' + changes[i], this, current[changes[i]], options);
					}
				}

				// You might be wondering why there's a `while` loop here. Changes can
				// be recursively nested within `"change"` events.
				if (changing) return this;
				if (!silent) {
					while (this._pending) {
						options = this._pending;
						this._pending = false;
						this.trigger('change', this, options);
					}
				}
				this._pending = false;
				this._changing = false;
				return this;
			},

			// Remove an attribute from the model, firing `"change"`. `unset` is a noop
			// if the attribute doesn't exist.
			unset: function(attr, options) {
				return this.set(attr, void 0, _.extend({}, options, {unset: true}));
			},

			// Clear all attributes on the model, firing `"change"`.
			clear: function(options) {
				var attrs = {};
				for (var key in this.attributes) attrs[key] = void 0;
				return this.set(attrs, _.extend({}, options, {unset: true}));
			},

			// Determine if the model has changed since the last `"change"` event.
			// If you specify an attribute name, determine if that attribute has changed.
			hasChanged: function(attr) {
				if (attr == null) return !_.isEmpty(this.changed);
				return _.has(this.changed, attr);
			},

			// Return an object containing all the attributes that have changed, or
			// false if there are no changed attributes. Useful for determining what
			// parts of a view need to be updated and/or what attributes need to be
			// persisted to the server. Unset attributes will be set to undefined.
			// You can also pass an attributes object to diff against the model,
			// determining if there *would be* a change.
			changedAttributes: function(diff) {
				if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
				var old = this._changing ? this._previousAttributes : this.attributes;
				var changed = {};
				for (var attr in diff) {
					var val = diff[attr];
					if (_.isEqual(old[attr], val)) continue;
					changed[attr] = val;
				}
				return _.size(changed) ? changed : false;
			},

			// Get the previous value of an attribute, recorded at the time the last
			// `"change"` event was fired.
			previous: function(attr) {
				if (attr == null || !this._previousAttributes) return null;
				return this._previousAttributes[attr];
			},

			// Get all of the attributes of the model at the time of the previous
			// `"change"` event.
			previousAttributes: function() {
				return _.clone(this._previousAttributes);
			},

			// Fetch the model from the server, merging the response with the model's
			// local attributes. Any changed attributes will trigger a "change" event.
			fetch: function(options) {
				options = _.extend({parse: true}, options);
				var model = this;
				var success = options.success;
				options.success = function(resp) {
					var serverAttrs = options.parse ? model.parse(resp, options) : resp;
					if (!model.set(serverAttrs, options)) return false;
					if (success) success.call(options.context, model, resp, options);
					model.trigger('sync', model, resp, options);
				};
				wrapError(this, options);
				return this.sync('read', this, options);
			},

			// Set a hash of model attributes, and sync the model to the server.
			// If the server returns an attributes hash that differs, the model's
			// state will be `set` again.
			save: function(key, val, options) {
				// Handle both `"key", value` and `{key: value}` -style arguments.
				var attrs;
				if (key == null || typeof key === 'object') {
					attrs = key;
					options = val;
				}
				else {
					(attrs = {})[key] = val;
				}

				options = _.extend({validate: true, parse: true}, options);
				var wait = options.wait;

				// If we're not waiting and attributes exist, save acts as
				// `set(attr).save(null, opts)` with validation. Otherwise, check if
				// the model will be valid when the attributes, if any, are set.
				if (attrs && !wait) {
					if (!this.set(attrs, options)) return false;
				}
				else {
					if (!this._validate(attrs, options)) return false;
				}

				// After a successful server-side save, the client is (optionally)
				// updated with the server-side state.
				var model = this;
				var success = options.success;
				var attributes = this.attributes;
				options.success = function(resp) {
					// Ensure attributes are restored during synchronous saves.
					model.attributes = attributes;
					var serverAttrs = options.parse ? model.parse(resp, options) : resp;
					if (wait) serverAttrs = _.extend({}, attrs, serverAttrs);
					if (serverAttrs && !model.set(serverAttrs, options)) return false;
					if (success) success.call(options.context, model, resp, options);
					model.trigger('sync', model, resp, options);
				};
				wrapError(this, options);

				// Set temporary attributes if `{wait: true}` to properly find new ids.
				if (attrs && wait) this.attributes = _.extend({}, attributes, attrs);

				var method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
				if (method === 'patch' && !options.attrs) options.attrs = attrs;
				var xhr = this.sync(method, this, options);

				// Restore attributes.
				this.attributes = attributes;

				return xhr;
			},

			// Destroy this model on the server if it was already persisted.
			// Optimistically removes the model from its collection, if it has one.
			// If `wait: true` is passed, waits for the server to respond before removal.
			destroy: function(options) {
				options = options ? _.clone(options) : {};
				var model = this;
				var success = options.success;
				var wait = options.wait;

				var destroy = function() {
					model.stopListening();
					model.trigger('destroy', model, model.collection, options);
				};

				options.success = function(resp) {
					if (wait) destroy();
					if (success) success.call(options.context, model, resp, options);
					if (!model.isNew()) model.trigger('sync', model, resp, options);
				};

				var xhr = false;
				if (this.isNew()) {
					_.defer(options.success);
				}
				else {
					wrapError(this, options);
					xhr = this.sync('delete', this, options);
				}
				if (!wait) destroy();
				return xhr;
			},

			// Default URL for the model's representation on the server -- if you're
			// using Backbone's restful methods, override this to change the endpoint
			// that will be called.
			url: function() {
				var base =
					_.result(this, 'urlRoot') ||
					_.result(this.collection, 'url') ||
					urlError();
				if (this.isNew()) return base;
				var id = this.get(this.idAttribute);
				return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
			},

			// **parse** converts a response into the hash of attributes to be `set` on
			// the model. The default implementation is just to pass the response along.
			parse: function(resp, options) {
				return resp;
			},

			// Create a new model with identical attributes to this one.
			clone: function() {
				return new this.constructor(this.attributes);
			},

			// A model is new if it has never been saved to the server, and lacks an id.
			isNew: function() {
				return !this.has(this.idAttribute);
			},

			// Check if the model is currently in a valid state.
			isValid: function(options) {
				return this._validate({}, _.defaults({validate: true}, options));
			},

			// Run validation against the next complete set of model attributes,
			// returning `true` if all is well. Otherwise, fire an `"invalid"` event.
			_validate: function(attrs, options) {
				if (!options.validate || !this.validate) return true;
				attrs = _.extend({}, this.attributes, attrs);
				var error = this.validationError = this.validate(attrs, options) || null;
				if (!error) return true;
				this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
				return false;
			}

		});

		// Underscore methods that we want to implement on the Model, mapped to the
		// number of arguments they take.
		var modelMethods = {
			keys: 1, values: 1, pairs: 1, invert: 1, pick: 0,
			omit: 0, chain: 1, isEmpty: 1
		};

		// Mix in each Underscore method as a proxy to `Model#attributes`.
		addUnderscoreMethods(Model, modelMethods, 'attributes');

		// Backbone.Collection
		// -------------------

		// If models tend to represent a single row of data, a Backbone Collection is
		// more analogous to a table full of data ... or a small slice or page of that
		// table, or a collection of rows that belong together for a particular reason
		// -- all of the messages in this particular folder, all of the documents
		// belonging to this particular author, and so on. Collections maintain
		// indexes of their models, both in order, and for lookup by `id`.

		// Create a new **Collection**, perhaps to contain a specific type of `model`.
		// If a `comparator` is specified, the Collection will maintain
		// its models in sort order, as they're added and removed.
		var Collection = Backbone.Collection = function(models, options) {
			options || (options = {});
			if (options.model) this.model = options.model;
			if (options.comparator !== void 0) this.comparator = options.comparator;
			this._reset();
			this.initialize.apply(this, arguments);
			if (models) this.reset(models, _.extend({silent: true}, options));
		};

		// Default options for `Collection#set`.
		var setOptions = {add: true, remove: true, merge: true};
		var addOptions = {add: true, remove: false};

		// Splices `insert` into `array` at index `at`.
		var splice = function(array, insert, at) {
			at = Math.min(Math.max(at, 0), array.length);
			var tail = Array(array.length - at);
			var length = insert.length;
			for (var i = 0; i < tail.length; i++) tail[i] = array[i + at];
			for (i = 0; i < length; i++) array[i + at] = insert[i];
			for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
		};

		// Define the Collection's inheritable methods.
		_.extend(Collection.prototype, Events, {

			// The default model for a collection is just a **Backbone.Model**.
			// This should be overridden in most cases.
			model: Model,

			// Initialize is an empty function by default. Override it with your own
			// initialization logic.
			initialize: function() {
			},

			// The JSON representation of a Collection is an array of the
			// models' attributes.
			toJSON: function(options) {
				return this.map(function(model) {
					return model.toJSON(options);
				});
			},

			// Proxy `Backbone.sync` by default.
			sync: function() {
				return Backbone.sync.apply(this, arguments);
			},

			// Add a model, or list of models to the set. `models` may be Backbone
			// Models or raw JavaScript objects to be converted to Models, or any
			// combination of the two.
			add: function(models, options) {
				return this.set(models, _.extend({merge: false}, options, addOptions));
			},

			// Remove a model, or a list of models from the set.
			remove: function(models, options) {
				options = _.extend({}, options);
				var singular = !_.isArray(models);
				models = singular ? [models] : _.clone(models);
				var removed = this._removeModels(models, options);
				if (!options.silent && removed) this.trigger('update', this, options);
				return singular ? removed[0] : removed;
			},

			// Update a collection by `set`-ing a new list of models, adding new ones,
			// removing models that are no longer present, and merging models that
			// already exist in the collection, as necessary. Similar to **Model#set**,
			// the core operation for updating the data contained by the collection.
			set: function(models, options) {
				if (models == null) return;

				options = _.defaults({}, options, setOptions);
				if (options.parse && !this._isModel(models)) models = this.parse(models, options);

				var singular = !_.isArray(models);
				models = singular ? [models] : models.slice();

				var at = options.at;
				if (at != null) at = +at;
				if (at < 0) at += this.length + 1;

				var set = [];
				var toAdd = [];
				var toRemove = [];
				var modelMap = {};

				var add = options.add;
				var merge = options.merge;
				var remove = options.remove;

				var sort = false;
				var sortable = this.comparator && (at == null) && options.sort !== false;
				var sortAttr = _.isString(this.comparator) ? this.comparator : null;

				// Turn bare objects into model references, and prevent invalid models
				// from being added.
				var model;
				for (var i = 0; i < models.length; i++) {
					model = models[i];

					// If a duplicate is found, prevent it from being added and
					// optionally merge it into the existing model.
					var existing = this.get(model);
					if (existing) {
						if (merge && model !== existing) {
							var attrs = this._isModel(model) ? model.attributes : model;
							if (options.parse) attrs = existing.parse(attrs, options);
							existing.set(attrs, options);
							if (sortable && !sort) sort = existing.hasChanged(sortAttr);
						}
						if (!modelMap[existing.cid]) {
							modelMap[existing.cid] = true;
							set.push(existing);
						}
						models[i] = existing;

						// If this is a new, valid model, push it to the `toAdd` list.
					}
					else if (add) {
						model = models[i] = this._prepareModel(model, options);
						if (model) {
							toAdd.push(model);
							this._addReference(model, options);
							modelMap[model.cid] = true;
							set.push(model);
						}
					}
				}

				// Remove stale models.
				if (remove) {
					for (i = 0; i < this.length; i++) {
						model = this.models[i];
						if (!modelMap[model.cid]) toRemove.push(model);
					}
					if (toRemove.length) this._removeModels(toRemove, options);
				}

				// See if sorting is needed, update `length` and splice in new models.
				var orderChanged = false;
				var replace = !sortable && add && remove;
				if (set.length && replace) {
					orderChanged = this.length != set.length || _.some(this.models, function(model, index) {
							return model !== set[index];
						});
					this.models.length = 0;
					splice(this.models, set, 0);
					this.length = this.models.length;
				}
				else if (toAdd.length) {
					if (sortable) sort = true;
					splice(this.models, toAdd, at == null ? this.length : at);
					this.length = this.models.length;
				}

				// Silently sort the collection if appropriate.
				if (sort) this.sort({silent: true});

				// Unless silenced, it's time to fire all appropriate add/sort events.
				if (!options.silent) {
					for (i = 0; i < toAdd.length; i++) {
						if (at != null) options.index = at + i;
						model = toAdd[i];
						model.trigger('add', model, this, options);
					}
					if (sort || orderChanged) this.trigger('sort', this, options);
					if (toAdd.length || toRemove.length) this.trigger('update', this, options);
				}

				// Return the added (or merged) model (or models).
				return singular ? models[0] : models;
			},

			// When you have more items than you want to add or remove individually,
			// you can reset the entire set with a new list of models, without firing
			// any granular `add` or `remove` events. Fires `reset` when finished.
			// Useful for bulk operations and optimizations.
			reset: function(models, options) {
				options = options ? _.clone(options) : {};
				for (var i = 0; i < this.models.length; i++) {
					this._removeReference(this.models[i], options);
				}
				options.previousModels = this.models;
				this._reset();
				models = this.add(models, _.extend({silent: true}, options));
				if (!options.silent) this.trigger('reset', this, options);
				return models;
			},

			// Add a model to the end of the collection.
			push: function(model, options) {
				return this.add(model, _.extend({at: this.length}, options));
			},

			// Remove a model from the end of the collection.
			pop: function(options) {
				var model = this.at(this.length - 1);
				return this.remove(model, options);
			},

			// Add a model to the beginning of the collection.
			unshift: function(model, options) {
				return this.add(model, _.extend({at: 0}, options));
			},

			// Remove a model from the beginning of the collection.
			shift: function(options) {
				var model = this.at(0);
				return this.remove(model, options);
			},

			// Slice out a sub-array of models from the collection.
			slice: function() {
				return slice.apply(this.models, arguments);
			},

			// Get a model from the set by id.
			get: function(obj) {
				if (obj == null) return void 0;
				var id = this.modelId(this._isModel(obj) ? obj.attributes : obj);
				return this._byId[obj] || this._byId[id] || this._byId[obj.cid];
			},

			// Get the model at the given index.
			at: function(index) {
				if (index < 0) index += this.length;
				return this.models[index];
			},

			// Return models with matching attributes. Useful for simple cases of
			// `filter`.
			where: function(attrs, first) {
				return this[first ? 'find' : 'filter'](attrs);
			},

			// Return the first model with matching attributes. Useful for simple cases
			// of `find`.
			findWhere: function(attrs) {
				return this.where(attrs, true);
			},

			// Force the collection to re-sort itself. You don't need to call this under
			// normal circumstances, as the set will maintain sort order as each item
			// is added.
			sort: function(options) {
				var comparator = this.comparator;
				if (!comparator) throw new Error('Cannot sort a set without a comparator');
				options || (options = {});

				var length = comparator.length;
				if (_.isFunction(comparator)) comparator = _.bind(comparator, this);

				// Run sort based on type of `comparator`.
				if (length === 1 || _.isString(comparator)) {
					this.models = this.sortBy(comparator);
				}
				else {
					this.models.sort(comparator);
				}
				if (!options.silent) this.trigger('sort', this, options);
				return this;
			},

			// Pluck an attribute from each model in the collection.
			pluck: function(attr) {
				return _.invoke(this.models, 'get', attr);
			},

			// Fetch the default set of models for this collection, resetting the
			// collection when they arrive. If `reset: true` is passed, the response
			// data will be passed through the `reset` method instead of `set`.
			fetch: function(options) {
				options = _.extend({parse: true}, options);
				var success = options.success;
				var collection = this;
				options.success = function(resp) {
					var method = options.reset ? 'reset' : 'set';
					collection[method](resp, options);
					if (success) success.call(options.context, collection, resp, options);
					collection.trigger('sync', collection, resp, options);
				};
				wrapError(this, options);
				return this.sync('read', this, options);
			},

			// Create a new instance of a model in this collection. Add the model to the
			// collection immediately, unless `wait: true` is passed, in which case we
			// wait for the server to agree.
			create: function(model, options) {
				options = options ? _.clone(options) : {};
				var wait = options.wait;
				model = this._prepareModel(model, options);
				if (!model) return false;
				if (!wait) this.add(model, options);
				var collection = this;
				var success = options.success;
				options.success = function(model, resp, callbackOpts) {
					if (wait) collection.add(model, callbackOpts);
					if (success) success.call(callbackOpts.context, model, resp, callbackOpts);
				};
				model.save(null, options);
				return model;
			},

			// **parse** converts a response into a list of models to be added to the
			// collection. The default implementation is just to pass it through.
			parse: function(resp, options) {
				return resp;
			},

			// Create a new collection with an identical list of models as this one.
			clone: function() {
				return new this.constructor(this.models, {
					model: this.model,
					comparator: this.comparator
				});
			},

			// Define how to uniquely identify models in the collection.
			modelId: function(attrs) {
				return attrs[this.model.prototype.idAttribute || 'id'];
			},

			// Private method to reset all internal state. Called when the collection
			// is first initialized or reset.
			_reset: function() {
				this.length = 0;
				this.models = [];
				this._byId = {};
			},

			// Prepare a hash of attributes (or other model) to be added to this
			// collection.
			_prepareModel: function(attrs, options) {
				if (this._isModel(attrs)) {
					if (!attrs.collection) attrs.collection = this;
					return attrs;
				}
				options = options ? _.clone(options) : {};
				options.collection = this;
				var model = new this.model(attrs, options);
				if (!model.validationError) return model;
				this.trigger('invalid', this, model.validationError, options);
				return false;
			},

			// Internal method called by both remove and set.
			_removeModels: function(models, options) {
				var removed = [];
				for (var i = 0; i < models.length; i++) {
					var model = this.get(models[i]);
					if (!model) continue;

					var index = this.indexOf(model);
					this.models.splice(index, 1);
					this.length--;

					if (!options.silent) {
						options.index = index;
						model.trigger('remove', model, this, options);
					}

					removed.push(model);
					this._removeReference(model, options);
				}
				return removed.length ? removed : false;
			},

			// Method for checking whether an object should be considered a model for
			// the purposes of adding to the collection.
			_isModel: function(model) {
				return model instanceof Model;
			},

			// Internal method to create a model's ties to a collection.
			_addReference: function(model, options) {
				this._byId[model.cid] = model;
				var id = this.modelId(model.attributes);
				if (id != null) this._byId[id] = model;
				model.on('all', this._onModelEvent, this);
			},

			// Internal method to sever a model's ties to a collection.
			_removeReference: function(model, options) {
				delete this._byId[model.cid];
				var id = this.modelId(model.attributes);
				if (id != null) delete this._byId[id];
				if (this === model.collection) delete model.collection;
				model.off('all', this._onModelEvent, this);
			},

			// Internal method called every time a model in the set fires an event.
			// Sets need to update their indexes when models change ids. All other
			// events simply proxy through. "add" and "remove" events that originate
			// in other collections are ignored.
			_onModelEvent: function(event, model, collection, options) {
				if ((event === 'add' || event === 'remove') && collection !== this) return;
				if (event === 'destroy') this.remove(model, options);
				if (event === 'change') {
					var prevId = this.modelId(model.previousAttributes());
					var id = this.modelId(model.attributes);
					if (prevId !== id) {
						if (prevId != null) delete this._byId[prevId];
						if (id != null) this._byId[id] = model;
					}
				}
				this.trigger.apply(this, arguments);
			}

		});

		// Underscore methods that we want to implement on the Collection.
		// 90% of the core usefulness of Backbone Collections is actually implemented
		// right here:
		var collectionMethods = {
			forEach: 3, each: 3, map: 3, collect: 3, reduce: 4,
			foldl: 4, inject: 4, reduceRight: 4, foldr: 4, find: 3, detect: 3, filter: 3,
			select: 3, reject: 3, every: 3, all: 3, some: 3, any: 3, include: 3, includes: 3,
			contains: 3, invoke: 0, max: 3, min: 3, toArray: 1, size: 1, first: 3,
			head: 3, take: 3, initial: 3, rest: 3, tail: 3, drop: 3, last: 3,
			without: 0, difference: 0, indexOf: 3, shuffle: 1, lastIndexOf: 3,
			isEmpty: 1, chain: 1, sample: 3, partition: 3, groupBy: 3, countBy: 3,
			sortBy: 3, indexBy: 3
		};

		// Mix in each Underscore method as a proxy to `Collection#models`.
		addUnderscoreMethods(Collection, collectionMethods, 'models');

		// Backbone.View
		// -------------

		// Backbone Views are almost more convention than they are actual code. A View
		// is simply a JavaScript object that represents a logical chunk of UI in the
		// DOM. This might be a single item, an entire list, a sidebar or panel, or
		// even the surrounding frame which wraps your whole app. Defining a chunk of
		// UI as a **View** allows you to define your DOM events declaratively, without
		// having to worry about render order ... and makes it easy for the view to
		// react to specific changes in the state of your models.

		// Creating a Backbone.View creates its initial element outside of the DOM,
		// if an existing element is not provided...
		var View = Backbone.View = function(options) {
			this.cid = _.uniqueId('view');
			_.extend(this, _.pick(options, viewOptions));
			this._ensureElement();
			this.initialize.apply(this, arguments);
		};

		// Cached regex to split keys for `delegate`.
		var delegateEventSplitter = /^(\S+)\s*(.*)$/;

		// List of view options to be set as properties.
		var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

		// Set up all inheritable **Backbone.View** properties and methods.
		_.extend(View.prototype, Events, {

			// The default `tagName` of a View's element is `"div"`.
			tagName: 'div',

			// jQuery delegate for element lookup, scoped to DOM elements within the
			// current view. This should be preferred to global lookups where possible.
			$: function(selector) {
				return this.$el.find(selector);
			},

			// Initialize is an empty function by default. Override it with your own
			// initialization logic.
			initialize: function() {
			},

			// **render** is the core function that your view should override, in order
			// to populate its element (`this.el`), with the appropriate HTML. The
			// convention is for **render** to always return `this`.
			render: function() {
				return this;
			},

			// Remove this view by taking the element out of the DOM, and removing any
			// applicable Backbone.Events listeners.
			remove: function() {
				this._removeElement();
				this.stopListening();
				return this;
			},

			// Remove this view's element from the document and all event listeners
			// attached to it. Exposed for subclasses using an alternative DOM
			// manipulation API.
			_removeElement: function() {
				this.$el.remove();
			},

			// Change the view's element (`this.el` property) and re-delegate the
			// view's events on the new element.
			setElement: function(element) {
				this.undelegateEvents();
				this._setElement(element);
				this.delegateEvents();
				return this;
			},

			// Creates the `this.el` and `this.$el` references for this view using the
			// given `el`. `el` can be a CSS selector or an HTML string, a jQuery
			// context or an element. Subclasses can override this to utilize an
			// alternative DOM manipulation API and are only required to set the
			// `this.el` property.
			_setElement: function(el) {
				this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
				this.el = this.$el[0];
			},

			// Set callbacks, where `this.events` is a hash of
			//
			// *{"event selector": "callback"}*
			//
			//     {
			//       'mousedown .title':  'edit',
			//       'click .button':     'save',
			//       'click .open':       function(e) { ... }
			//     }
			//
			// pairs. Callbacks will be bound to the view, with `this` set properly.
			// Uses event delegation for efficiency.
			// Omitting the selector binds the event to `this.el`.
			delegateEvents: function(events) {
				events || (events = _.result(this, 'events'));
				if (!events) return this;
				this.undelegateEvents();
				for (var key in events) {
					var method = events[key];
					if (!_.isFunction(method)) method = this[method];
					if (!method) continue;
					var match = key.match(delegateEventSplitter);
					this.delegate(match[1], match[2], _.bind(method, this));
				}
				return this;
			},

			// Add a single event listener to the view's element (or a child element
			// using `selector`). This only works for delegate-able events: not `focus`,
			// `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
			delegate: function(eventName, selector, listener) {
				this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
				return this;
			},

			// Clears all callbacks previously bound to the view by `delegateEvents`.
			// You usually don't need to use this, but may wish to if you have multiple
			// Backbone views attached to the same DOM element.
			undelegateEvents: function() {
				if (this.$el) this.$el.off('.delegateEvents' + this.cid);
				return this;
			},

			// A finer-grained `undelegateEvents` for removing a single delegated event.
			// `selector` and `listener` are both optional.
			undelegate: function(eventName, selector, listener) {
				this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
				return this;
			},

			// Produces a DOM element to be assigned to your view. Exposed for
			// subclasses using an alternative DOM manipulation API.
			_createElement: function(tagName) {
				return document.createElement(tagName);
			},

			// Ensure that the View has a DOM element to render into.
			// If `this.el` is a string, pass it through `$()`, take the first
			// matching element, and re-assign it to `el`. Otherwise, create
			// an element from the `id`, `className` and `tagName` properties.
			_ensureElement: function() {
				if (!this.el) {
					var attrs = _.extend({}, _.result(this, 'attributes'));
					if (this.id) attrs.id = _.result(this, 'id');
					if (this.className) attrs['class'] = _.result(this, 'className');
					this.setElement(this._createElement(_.result(this, 'tagName')));
					this._setAttributes(attrs);
				}
				else {
					this.setElement(_.result(this, 'el'));
				}
			},

			// Set attributes from a hash on this view's element.  Exposed for
			// subclasses using an alternative DOM manipulation API.
			_setAttributes: function(attributes) {
				this.$el.attr(attributes);
			}

		});

		// Backbone.sync
		// -------------

		// Override this function to change the manner in which Backbone persists
		// models to the server. You will be passed the type of request, and the
		// model in question. By default, makes a RESTful Ajax request
		// to the model's `url()`. Some possible customizations could be:
		//
		// * Use `setTimeout` to batch rapid-fire updates into a single request.
		// * Send up the models as XML instead of JSON.
		// * Persist models via WebSockets instead of Ajax.
		//
		// Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
		// as `POST`, with a `_method` parameter containing the true HTTP method,
		// as well as all requests with the body as `application/x-www-form-urlencoded`
		// instead of `application/json` with the model in a param named `model`.
		// Useful when interfacing with server-side languages like **PHP** that make
		// it difficult to read the body of `PUT` requests.
		Backbone.sync = function(method, model, options) {
			var type = methodMap[method];

			// Default options, unless specified.
			_.defaults(options || (options = {}), {
				emulateHTTP: Backbone.emulateHTTP,
				emulateJSON: Backbone.emulateJSON
			});

			// Default JSON-request options.
			var params = {type: type, dataType: 'json'};

			// Ensure that we have a URL.
			if (!options.url) {
				params.url = _.result(model, 'url') || urlError();
			}

			// Ensure that we have the appropriate request data.
			if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
				params.contentType = 'application/json';
				params.data = JSON.stringify(options.attrs || model.toJSON(options));
			}

			// For older servers, emulate JSON by encoding the request into an HTML-form.
			if (options.emulateJSON) {
				params.contentType = 'application/x-www-form-urlencoded';
				params.data = params.data ? {model: params.data} : {};
			}

			// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
			// And an `X-HTTP-Method-Override` header.
			if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
				params.type = 'POST';
				if (options.emulateJSON) params.data._method = type;
				var beforeSend = options.beforeSend;
				options.beforeSend = function(xhr) {
					xhr.setRequestHeader('X-HTTP-Method-Override', type);
					if (beforeSend) return beforeSend.apply(this, arguments);
				};
			}

			// Don't process data on a non-GET request.
			if (params.type !== 'GET' && !options.emulateJSON) {
				params.processData = false;
			}

			// Pass along `textStatus` and `errorThrown` from jQuery.
			var error = options.error;
			options.error = function(xhr, textStatus, errorThrown) {
				options.textStatus = textStatus;
				options.errorThrown = errorThrown;
				if (error) error.call(options.context, xhr, textStatus, errorThrown);
			};

			// Make the request, allowing the user to override any Ajax options.
			var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
			model.trigger('request', model, xhr, options);
			return xhr;
		};

		// Map from CRUD to HTTP for our default `Backbone.sync` implementation.
		var methodMap = {
			'create': 'POST',
			'update': 'PUT',
			'patch': 'PATCH',
			'delete': 'DELETE',
			'read': 'GET'
		};

		// Set the default implementation of `Backbone.ajax` to proxy through to `$`.
		// Override this if you'd like to use a different library.
		Backbone.ajax = function() {
			return Backbone.$.ajax.apply(Backbone.$, arguments);
		};

		// Backbone.Router
		// ---------------

		// Routers map faux-URLs to actions, and fire events when routes are
		// matched. Creating a new one sets its `routes` hash, if not set statically.
		var Router = Backbone.Router = function(options) {
			options || (options = {});
			if (options.routes) this.routes = options.routes;
			this._bindRoutes();
			this.initialize.apply(this, arguments);
		};

		// Cached regular expressions for matching named param parts and splatted
		// parts of route strings.
		var optionalParam = /\((.*?)\)/g;
		var namedParam = /(\(\?)?:\w+/g;
		var splatParam = /\*\w+/g;
		var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

		// Set up all inheritable **Backbone.Router** properties and methods.
		_.extend(Router.prototype, Events, {

			// Initialize is an empty function by default. Override it with your own
			// initialization logic.
			initialize: function() {
			},

			// Manually bind a single named route to a callback. For example:
			//
			//     this.route('search/:query/p:num', 'search', function(query, num) {
			//       ...
			//     });
			//
			route: function(route, name, callback) {
				if (!_.isRegExp(route)) route = this._routeToRegExp(route);
				if (_.isFunction(name)) {
					callback = name;
					name = '';
				}
				if (!callback) callback = this[name];
				var router = this;
				Backbone.history.route(route, function(fragment) {
					var args = router._extractParameters(route, fragment);
					if (router.execute(callback, args, name) !== false) {
						router.trigger.apply(router, ['route:' + name].concat(args));
						router.trigger('route', name, args);
						Backbone.history.trigger('route', router, name, args);
					}
				});
				return this;
			},

			// Execute a route handler with the provided parameters.  This is an
			// excellent place to do pre-route setup or post-route cleanup.
			execute: function(callback, args, name) {
				if (callback) callback.apply(this, args);
			},

			// Simple proxy to `Backbone.history` to save a fragment into the history.
			navigate: function(fragment, options) {
				Backbone.history.navigate(fragment, options);
				return this;
			},

			// Bind all defined routes to `Backbone.history`. We have to reverse the
			// order of the routes here to support behavior where the most general
			// routes can be defined at the bottom of the route map.
			_bindRoutes: function() {
				if (!this.routes) return;
				this.routes = _.result(this, 'routes');
				var route, routes = _.keys(this.routes);
				while ((route = routes.pop()) != null) {
					this.route(route, this.routes[route]);
				}
			},

			// Convert a route string into a regular expression, suitable for matching
			// against the current location hash.
			_routeToRegExp: function(route) {
				route = route.replace(escapeRegExp, '\\$&')
					.replace(optionalParam, '(?:$1)?')
					.replace(namedParam, function(match, optional) {
						return optional ? match : '([^/?]+)';
					})
					.replace(splatParam, '([^?]*?)');
				return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
			},

			// Given a route, and a URL fragment that it matches, return the array of
			// extracted decoded parameters. Empty or unmatched parameters will be
			// treated as `null` to normalize cross-browser behavior.
			_extractParameters: function(route, fragment) {
				var params = route.exec(fragment).slice(1);
				return _.map(params, function(param, i) {
					// Don't decode the search params.
					if (i === params.length - 1) return param || null;
					return param ? decodeURIComponent(param) : null;
				});
			}

		});

		// Backbone.History
		// ----------------

		// Handles cross-browser history management, based on either
		// [pushState](http://diveintohtml5.info/history.html) and real URLs, or
		// [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
		// and URL fragments. If the browser supports neither (old IE, natch),
		// falls back to polling.
		var History = Backbone.History = function() {
			this.handlers = [];
			this.checkUrl = _.bind(this.checkUrl, this);

			// Ensure that `History` can be used outside of the browser.
			if (typeof window !== 'undefined') {
				this.location = window.location;
				this.history = window.history;
			}
		};

		// Cached regex for stripping a leading hash/slash and trailing space.
		var routeStripper = /^[#\/]|\s+$/g;

		// Cached regex for stripping leading and trailing slashes.
		var rootStripper = /^\/+|\/+$/g;

		// Cached regex for stripping urls of hash.
		var pathStripper = /#.*$/;

		// Has the history handling already been started?
		History.started = false;

		// Set up all inheritable **Backbone.History** properties and methods.
		_.extend(History.prototype, Events, {

			// The default interval to poll for hash changes, if necessary, is
			// twenty times a second.
			interval: 50,

			// Are we at the app root?
			atRoot: function() {
				var path = this.location.pathname.replace(/[^\/]$/, '$&/');
				return path === this.root && !this.getSearch();
			},

			// Does the pathname match the root?
			matchRoot: function() {
				var path = this.decodeFragment(this.location.pathname);
				var root = path.slice(0, this.root.length - 1) + '/';
				return root === this.root;
			},

			// Unicode characters in `location.pathname` are percent encoded so they're
			// decoded for comparison. `%25` should not be decoded since it may be part
			// of an encoded parameter.
			decodeFragment: function(fragment) {
				return decodeURI(fragment.replace(/%25/g, '%2525'));
			},

			// In IE6, the hash fragment and search params are incorrect if the
			// fragment contains `?`.
			getSearch: function() {
				var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
				return match ? match[0] : '';
			},

			// Gets the true hash value. Cannot use location.hash directly due to bug
			// in Firefox where location.hash will always be decoded.
			getHash: function(window) {
				var match = (window || this).location.href.match(/#(.*)$/);
				return match ? match[1] : '';
			},

			// Get the pathname and search params, without the root.
			getPath: function() {
				var path = this.decodeFragment(
					this.location.pathname + this.getSearch()
				).slice(this.root.length - 1);
				return path.charAt(0) === '/' ? path.slice(1) : path;
			},

			// Get the cross-browser normalized URL fragment from the path or hash.
			getFragment: function(fragment) {
				if (fragment == null) {
					if (this._usePushState || !this._wantsHashChange) {
						fragment = this.getPath();
					}
					else {
						fragment = this.getHash();
					}
				}
				return fragment.replace(routeStripper, '');
			},

			// Start the hash change handling, returning `true` if the current URL matches
			// an existing route, and `false` otherwise.
			start: function(options) {
				if (History.started) throw new Error('Backbone.history has already been started');
				History.started = true;

				// Figure out the initial configuration. Do we need an iframe?
				// Is pushState desired ... is it available?
				this.options = _.extend({root: '/'}, this.options, options);
				this.root = this.options.root;
				this._wantsHashChange = this.options.hashChange !== false;
				this._hasHashChange = 'onhashchange' in window && (document.documentMode === void 0 || document.documentMode > 7);
				this._useHashChange = this._wantsHashChange && this._hasHashChange;
				this._wantsPushState = !!this.options.pushState;
				this._hasPushState = !!(this.history && this.history.pushState);
				this._usePushState = this._wantsPushState && this._hasPushState;
				this.fragment = this.getFragment();

				// Normalize root to always include a leading and trailing slash.
				this.root = ('/' + this.root + '/').replace(rootStripper, '/');

				// Transition from hashChange to pushState or vice versa if both are
				// requested.
				if (this._wantsHashChange && this._wantsPushState) {

					// If we've started off with a route from a `pushState`-enabled
					// browser, but we're currently in a browser that doesn't support it...
					if (!this._hasPushState && !this.atRoot()) {
						var root = this.root.slice(0, -1) || '/';
						this.location.replace(root + '#' + this.getPath());
						// Return immediately as browser will do redirect to new url
						return true;

						// Or if we've started out with a hash-based route, but we're currently
						// in a browser where it could be `pushState`-based instead...
					}
					else if (this._hasPushState && this.atRoot()) {
						this.navigate(this.getHash(), {replace: true});
					}

				}

				// Proxy an iframe to handle location events if the browser doesn't
				// support the `hashchange` event, HTML5 history, or the user wants
				// `hashChange` but not `pushState`.
				if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
					this.iframe = document.createElement('iframe');
					this.iframe.src = 'javascript:0';
					this.iframe.style.display = 'none';
					this.iframe.tabIndex = -1;
					var body = document.body;
					// Using `appendChild` will throw on IE < 9 if the document is not ready.
					var iWindow = body.insertBefore(this.iframe, body.firstChild).contentWindow;
					iWindow.document.open();
					iWindow.document.close();
					iWindow.location.hash = '#' + this.fragment;
				}

				// Add a cross-platform `addEventListener` shim for older browsers.
				var addEventListener = window.addEventListener || function(eventName, listener) {
						return attachEvent('on' + eventName, listener);
					};

				// Depending on whether we're using pushState or hashes, and whether
				// 'onhashchange' is supported, determine how we check the URL state.
				if (this._usePushState) {
					addEventListener('popstate', this.checkUrl, false);
				}
				else if (this._useHashChange && !this.iframe) {
					addEventListener('hashchange', this.checkUrl, false);
				}
				else if (this._wantsHashChange) {
					this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
				}

				if (!this.options.silent) return this.loadUrl();
			},

			// Disable Backbone.history, perhaps temporarily. Not useful in a real app,
			// but possibly useful for unit testing Routers.
			stop: function() {
				// Add a cross-platform `removeEventListener` shim for older browsers.
				var removeEventListener = window.removeEventListener || function(eventName, listener) {
						return detachEvent('on' + eventName, listener);
					};

				// Remove window listeners.
				if (this._usePushState) {
					removeEventListener('popstate', this.checkUrl, false);
				}
				else if (this._useHashChange && !this.iframe) {
					removeEventListener('hashchange', this.checkUrl, false);
				}

				// Clean up the iframe if necessary.
				if (this.iframe) {
					document.body.removeChild(this.iframe);
					this.iframe = null;
				}

				// Some environments will throw when clearing an undefined interval.
				if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
				History.started = false;
			},

			// Add a route to be tested when the fragment changes. Routes added later
			// may override previous routes.
			route: function(route, callback) {
				this.handlers.unshift({route: route, callback: callback});
			},

			// Checks the current URL to see if it has changed, and if it has,
			// calls `loadUrl`, normalizing across the hidden iframe.
			checkUrl: function(e) {
				var current = this.getFragment();

				// If the user pressed the back button, the iframe's hash will have
				// changed and we should use that for comparison.
				if (current === this.fragment && this.iframe) {
					current = this.getHash(this.iframe.contentWindow);
				}

				if (current === this.fragment) return false;
				if (this.iframe) this.navigate(current);
				this.loadUrl();
			},

			// Attempt to load the current URL fragment. If a route succeeds with a
			// match, returns `true`. If no defined routes matches the fragment,
			// returns `false`.
			loadUrl: function(fragment) {
				// If the root doesn't match, no routes can match either.
				if (!this.matchRoot()) return false;
				fragment = this.fragment = this.getFragment(fragment);
				return _.some(this.handlers, function(handler) {
					if (handler.route.test(fragment)) {
						handler.callback(fragment);
						return true;
					}
				});
			},

			// Save a fragment into the hash history, or replace the URL state if the
			// 'replace' option is passed. You are responsible for properly URL-encoding
			// the fragment in advance.
			//
			// The options object can contain `trigger: true` if you wish to have the
			// route callback be fired (not usually desirable), or `replace: true`, if
			// you wish to modify the current URL without adding an entry to the history.
			navigate: function(fragment, options) {
				if (!History.started) return false;
				if (!options || options === true) options = {trigger: !!options};

				// Normalize the fragment.
				fragment = this.getFragment(fragment || '');

				// Don't include a trailing slash on the root.
				var root = this.root;
				if (fragment === '' || fragment.charAt(0) === '?') {
					root = root.slice(0, -1) || '/';
				}
				var url = root + fragment;

				// Strip the hash and decode for matching.
				fragment = this.decodeFragment(fragment.replace(pathStripper, ''));

				if (this.fragment === fragment) return;
				this.fragment = fragment;

				// If pushState is available, we use it to set the fragment as a real URL.
				if (this._usePushState) {
					this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

					// If hash changes haven't been explicitly disabled, update the hash
					// fragment to store history.
				}
				else if (this._wantsHashChange) {
					this._updateHash(this.location, fragment, options.replace);
					if (this.iframe && (fragment !== this.getHash(this.iframe.contentWindow))) {
						var iWindow = this.iframe.contentWindow;

						// Opening and closing the iframe tricks IE7 and earlier to push a
						// history entry on hash-tag change.  When replace is true, we don't
						// want this.
						if (!options.replace) {
							iWindow.document.open();
							iWindow.document.close();
						}

						this._updateHash(iWindow.location, fragment, options.replace);
					}

					// If you've told us that you explicitly don't want fallback hashchange-
					// based history, then `navigate` becomes a page refresh.
				}
				else {
					return this.location.assign(url);
				}
				if (options.trigger) return this.loadUrl(fragment);
			},

			// Update the hash location, either replacing the current entry, or adding
			// a new one to the browser history.
			_updateHash: function(location, fragment, replace) {
				if (replace) {
					var href = location.href.replace(/(javascript:|#).*$/, '');
					location.replace(href + '#' + fragment);
				}
				else {
					// Some browsers require that `hash` contains a leading #.
					location.hash = '#' + fragment;
				}
			}

		});

		// Create the default Backbone.history.
		Backbone.history = new History;

		// Helpers
		// -------

		// Helper function to correctly set up the prototype chain for subclasses.
		// Similar to `goog.inherits`, but uses a hash of prototype properties and
		// class properties to be extended.
		var extend = function(protoProps, staticProps) {
			var parent = this;
			var child;

			// The constructor function for the new subclass is either defined by you
			// (the "constructor" property in your `extend` definition), or defaulted
			// by us to simply call the parent constructor.
			if (protoProps && _.has(protoProps, 'constructor')) {
				child = protoProps.constructor;
			}
			else {
				child = function() {
					return parent.apply(this, arguments);
				};
			}

			// Add static properties to the constructor function, if supplied.
			_.extend(child, parent, staticProps);

			// Set the prototype chain to inherit from `parent`, without calling
			// `parent` constructor function.
			var Surrogate = function() {
				this.constructor = child;
			};
			Surrogate.prototype = parent.prototype;
			child.prototype = new Surrogate;

			// Add prototype properties (instance properties) to the subclass,
			// if supplied.
			if (protoProps) _.extend(child.prototype, protoProps);

			// Set a convenience property in case the parent's prototype is needed
			// later.
			child.__super__ = parent.prototype;

			return child;
		};

		// Set up inheritance for the model, collection, router, view and history.
		Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

		// Throw an error when a URL is needed, and none is supplied.
		var urlError = function() {
			throw new Error('A "url" property or function must be specified');
		};

		// Wrap an optional error callback with a fallback error event.
		var wrapError = function(model, options) {
			var error = options.error;
			options.error = function(resp) {
				if (error) error.call(options.context, model, resp, options);
				model.trigger('error', model, resp, options);
			};
		};

		return Backbone;

	}));

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */

	var _ = __webpack_require__(6);

	module.exports = _.noConflict();

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

		// Baseline setup
		// --------------

		// Establish the root object, `window` in the browser, or `exports` on the server.
		var root = this;

		// Save the previous value of the `_` variable.
		var previousUnderscore = root._;

		// Save bytes in the minified (but not gzipped) version:
		var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

		// Create quick reference variables for speed access to core prototypes.
		var
			push = ArrayProto.push,
			slice = ArrayProto.slice,
			toString = ObjProto.toString,
			hasOwnProperty = ObjProto.hasOwnProperty;

		// All **ECMAScript 5** native function implementations that we hope to use
		// are declared here.
		var
			nativeIsArray = Array.isArray,
			nativeKeys = Object.keys,
			nativeBind = FuncProto.bind,
			nativeCreate = Object.create;

		// Naked function reference for surrogate-prototype-swapping.
		var Ctor = function() {
		};

		// Create a safe reference to the Underscore object for use below.
		var _ = function(obj) {
			if (obj instanceof _) return obj;
			if (!(this instanceof _)) return new _(obj);
			this._wrapped = obj;
		};

		// Export the Underscore object for **Node.js**, with
		// backwards-compatibility for the old `require()` API. If we're in
		// the browser, add `_` as a global object.
		if (true) {
			if (typeof module !== 'undefined' && module.exports) {
				exports = module.exports = _;
			}
			exports._ = _;
		}
		else {
			root._ = _;
		}

		// Current version.
		_.VERSION = '1.8.3';

		// Internal function that returns an efficient (for current engines) version
		// of the passed-in callback, to be repeatedly applied in other Underscore
		// functions.
		var optimizeCb = function(func, context, argCount) {
			if (context === void 0) return func;
			switch (argCount == null ? 3 : argCount) {
				case 1:
					return function(value) {
						return func.call(context, value);
					};
				case 2:
					return function(value, other) {
						return func.call(context, value, other);
					};
				case 3:
					return function(value, index, collection) {
						return func.call(context, value, index, collection);
					};
				case 4:
					return function(accumulator, value, index, collection) {
						return func.call(context, accumulator, value, index, collection);
					};
			}
			return function() {
				return func.apply(context, arguments);
			};
		};

		// A mostly-internal function to generate callbacks that can be applied
		// to each element in a collection, returning the desired result — either
		// identity, an arbitrary callback, a property matcher, or a property accessor.
		var cb = function(value, context, argCount) {
			if (value == null) return _.identity;
			if (_.isFunction(value)) return optimizeCb(value, context, argCount);
			if (_.isObject(value)) return _.matcher(value);
			return _.property(value);
		};
		_.iteratee = function(value, context) {
			return cb(value, context, Infinity);
		};

		// An internal function for creating assigner functions.
		var createAssigner = function(keysFunc, undefinedOnly) {
			return function(obj) {
				var length = arguments.length;
				if (length < 2 || obj == null) return obj;
				for (var index = 1; index < length; index++) {
					var source = arguments[index],
						keys = keysFunc(source),
						l = keys.length;
					for (var i = 0; i < l; i++) {
						var key = keys[i];
						if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
					}
				}
				return obj;
			};
		};

		// An internal function for creating a new object that inherits from another.
		var baseCreate = function(prototype) {
			if (!_.isObject(prototype)) return {};
			if (nativeCreate) return nativeCreate(prototype);
			Ctor.prototype = prototype;
			var result = new Ctor;
			Ctor.prototype = null;
			return result;
		};

		var property = function(key) {
			return function(obj) {
				return obj == null ? void 0 : obj[key];
			};
		};

		// Helper for collection methods to determine whether a collection
		// should be iterated as an array or as an object
		// Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
		// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
		var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
		var getLength = property('length');
		var isArrayLike = function(collection) {
			var length = getLength(collection);
			return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
		};

		// Collection Functions
		// --------------------

		// The cornerstone, an `each` implementation, aka `forEach`.
		// Handles raw objects in addition to array-likes. Treats all
		// sparse array-likes as if they were dense.
		_.each = _.forEach = function(obj, iteratee, context) {
			iteratee = optimizeCb(iteratee, context);
			var i, length;
			if (isArrayLike(obj)) {
				for (i = 0, length = obj.length; i < length; i++) {
					iteratee(obj[i], i, obj);
				}
			}
			else {
				var keys = _.keys(obj);
				for (i = 0, length = keys.length; i < length; i++) {
					iteratee(obj[keys[i]], keys[i], obj);
				}
			}
			return obj;
		};

		// Return the results of applying the iteratee to each element.
		_.map = _.collect = function(obj, iteratee, context) {
			iteratee = cb(iteratee, context);
			var keys = !isArrayLike(obj) && _.keys(obj),
				length = (keys || obj).length,
				results = Array(length);
			for (var index = 0; index < length; index++) {
				var currentKey = keys ? keys[index] : index;
				results[index] = iteratee(obj[currentKey], currentKey, obj);
			}
			return results;
		};

		// Create a reducing function iterating left or right.
		function createReduce(dir) {
			// Optimized iterator function as using arguments.length
			// in the main function will deoptimize the, see #1991.
			function iterator(obj, iteratee, memo, keys, index, length) {
				for (; index >= 0 && index < length; index += dir) {
					var currentKey = keys ? keys[index] : index;
					memo = iteratee(memo, obj[currentKey], currentKey, obj);
				}
				return memo;
			}

			return function(obj, iteratee, memo, context) {
				iteratee = optimizeCb(iteratee, context, 4);
				var keys = !isArrayLike(obj) && _.keys(obj),
					length = (keys || obj).length,
					index = dir > 0 ? 0 : length - 1;
				// Determine the initial value if none is provided.
				if (arguments.length < 3) {
					memo = obj[keys ? keys[index] : index];
					index += dir;
				}
				return iterator(obj, iteratee, memo, keys, index, length);
			};
		}

		// **Reduce** builds up a single result from a list of values, aka `inject`,
		// or `foldl`.
		_.reduce = _.foldl = _.inject = createReduce(1);

		// The right-associative version of reduce, also known as `foldr`.
		_.reduceRight = _.foldr = createReduce(-1);

		// Return the first value which passes a truth test. Aliased as `detect`.
		_.find = _.detect = function(obj, predicate, context) {
			var key;
			if (isArrayLike(obj)) {
				key = _.findIndex(obj, predicate, context);
			}
			else {
				key = _.findKey(obj, predicate, context);
			}
			if (key !== void 0 && key !== -1) return obj[key];
		};

		// Return all the elements that pass a truth test.
		// Aliased as `select`.
		_.filter = _.select = function(obj, predicate, context) {
			var results = [];
			predicate = cb(predicate, context);
			_.each(obj, function(value, index, list) {
				if (predicate(value, index, list)) results.push(value);
			});
			return results;
		};

		// Return all the elements for which a truth test fails.
		_.reject = function(obj, predicate, context) {
			return _.filter(obj, _.negate(cb(predicate)), context);
		};

		// Determine whether all of the elements match a truth test.
		// Aliased as `all`.
		_.every = _.all = function(obj, predicate, context) {
			predicate = cb(predicate, context);
			var keys = !isArrayLike(obj) && _.keys(obj),
				length = (keys || obj).length;
			for (var index = 0; index < length; index++) {
				var currentKey = keys ? keys[index] : index;
				if (!predicate(obj[currentKey], currentKey, obj)) return false;
			}
			return true;
		};

		// Determine if at least one element in the object matches a truth test.
		// Aliased as `any`.
		_.some = _.any = function(obj, predicate, context) {
			predicate = cb(predicate, context);
			var keys = !isArrayLike(obj) && _.keys(obj),
				length = (keys || obj).length;
			for (var index = 0; index < length; index++) {
				var currentKey = keys ? keys[index] : index;
				if (predicate(obj[currentKey], currentKey, obj)) return true;
			}
			return false;
		};

		// Determine if the array or object contains a given item (using `===`).
		// Aliased as `includes` and `include`.
		_.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
			if (!isArrayLike(obj)) obj = _.values(obj);
			if (typeof fromIndex != 'number' || guard) fromIndex = 0;
			return _.indexOf(obj, item, fromIndex) >= 0;
		};

		// Invoke a method (with arguments) on every item in a collection.
		_.invoke = function(obj, method) {
			var args = slice.call(arguments, 2);
			var isFunc = _.isFunction(method);
			return _.map(obj, function(value) {
				var func = isFunc ? method : value[method];
				return func == null ? func : func.apply(value, args);
			});
		};

		// Convenience version of a common use case of `map`: fetching a property.
		_.pluck = function(obj, key) {
			return _.map(obj, _.property(key));
		};

		// Convenience version of a common use case of `filter`: selecting only objects
		// containing specific `key:value` pairs.
		_.where = function(obj, attrs) {
			return _.filter(obj, _.matcher(attrs));
		};

		// Convenience version of a common use case of `find`: getting the first object
		// containing specific `key:value` pairs.
		_.findWhere = function(obj, attrs) {
			return _.find(obj, _.matcher(attrs));
		};

		// Return the maximum element (or element-based computation).
		_.max = function(obj, iteratee, context) {
			var result = -Infinity, lastComputed = -Infinity,
				value, computed;
			if (iteratee == null && obj != null) {
				obj = isArrayLike(obj) ? obj : _.values(obj);
				for (var i = 0, length = obj.length; i < length; i++) {
					value = obj[i];
					if (value > result) {
						result = value;
					}
				}
			}
			else {
				iteratee = cb(iteratee, context);
				_.each(obj, function(value, index, list) {
					computed = iteratee(value, index, list);
					if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
						result = value;
						lastComputed = computed;
					}
				});
			}
			return result;
		};

		// Return the minimum element (or element-based computation).
		_.min = function(obj, iteratee, context) {
			var result = Infinity, lastComputed = Infinity,
				value, computed;
			if (iteratee == null && obj != null) {
				obj = isArrayLike(obj) ? obj : _.values(obj);
				for (var i = 0, length = obj.length; i < length; i++) {
					value = obj[i];
					if (value < result) {
						result = value;
					}
				}
			}
			else {
				iteratee = cb(iteratee, context);
				_.each(obj, function(value, index, list) {
					computed = iteratee(value, index, list);
					if (computed < lastComputed || computed === Infinity && result === Infinity) {
						result = value;
						lastComputed = computed;
					}
				});
			}
			return result;
		};

		// Shuffle a collection, using the modern version of the
		// [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
		_.shuffle = function(obj) {
			var set = isArrayLike(obj) ? obj : _.values(obj);
			var length = set.length;
			var shuffled = Array(length);
			for (var index = 0, rand; index < length; index++) {
				rand = _.random(0, index);
				if (rand !== index) shuffled[index] = shuffled[rand];
				shuffled[rand] = set[index];
			}
			return shuffled;
		};

		// Sample **n** random values from a collection.
		// If **n** is not specified, returns a single random element.
		// The internal `guard` argument allows it to work with `map`.
		_.sample = function(obj, n, guard) {
			if (n == null || guard) {
				if (!isArrayLike(obj)) obj = _.values(obj);
				return obj[_.random(obj.length - 1)];
			}
			return _.shuffle(obj).slice(0, Math.max(0, n));
		};

		// Sort the object's values by a criterion produced by an iteratee.
		_.sortBy = function(obj, iteratee, context) {
			iteratee = cb(iteratee, context);
			return _.pluck(_.map(obj, function(value, index, list) {
				return {
					value: value,
					index: index,
					criteria: iteratee(value, index, list)
				};
			}).sort(function(left, right) {
				var a = left.criteria;
				var b = right.criteria;
				if (a !== b) {
					if (a > b || a === void 0) return 1;
					if (a < b || b === void 0) return -1;
				}
				return left.index - right.index;
			}), 'value');
		};

		// An internal function used for aggregate "group by" operations.
		var group = function(behavior) {
			return function(obj, iteratee, context) {
				var result = {};
				iteratee = cb(iteratee, context);
				_.each(obj, function(value, index) {
					var key = iteratee(value, index, obj);
					behavior(result, value, key);
				});
				return result;
			};
		};

		// Groups the object's values by a criterion. Pass either a string attribute
		// to group by, or a function that returns the criterion.
		_.groupBy = group(function(result, value, key) {
			if (_.has(result, key)) result[key].push(value);
			else result[key] = [value];
		});

		// Indexes the object's values by a criterion, similar to `groupBy`, but for
		// when you know that your index values will be unique.
		_.indexBy = group(function(result, value, key) {
			result[key] = value;
		});

		// Counts instances of an object that group by a certain criterion. Pass
		// either a string attribute to count by, or a function that returns the
		// criterion.
		_.countBy = group(function(result, value, key) {
			if (_.has(result, key)) result[key]++;
			else result[key] = 1;
		});

		// Safely create a real, live array from anything iterable.
		_.toArray = function(obj) {
			if (!obj) return [];
			if (_.isArray(obj)) return slice.call(obj);
			if (isArrayLike(obj)) return _.map(obj, _.identity);
			return _.values(obj);
		};

		// Return the number of elements in an object.
		_.size = function(obj) {
			if (obj == null) return 0;
			return isArrayLike(obj) ? obj.length : _.keys(obj).length;
		};

		// Split a collection into two arrays: one whose elements all satisfy the given
		// predicate, and one whose elements all do not satisfy the predicate.
		_.partition = function(obj, predicate, context) {
			predicate = cb(predicate, context);
			var pass = [], fail = [];
			_.each(obj, function(value, key, obj) {
				(predicate(value, key, obj) ? pass : fail).push(value);
			});
			return [pass, fail];
		};

		// Array Functions
		// ---------------

		// Get the first element of an array. Passing **n** will return the first N
		// values in the array. Aliased as `head` and `take`. The **guard** check
		// allows it to work with `_.map`.
		_.first = _.head = _.take = function(array, n, guard) {
			if (array == null) return void 0;
			if (n == null || guard) return array[0];
			return _.initial(array, array.length - n);
		};

		// Returns everything but the last entry of the array. Especially useful on
		// the arguments object. Passing **n** will return all the values in
		// the array, excluding the last N.
		_.initial = function(array, n, guard) {
			return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
		};

		// Get the last element of an array. Passing **n** will return the last N
		// values in the array.
		_.last = function(array, n, guard) {
			if (array == null) return void 0;
			if (n == null || guard) return array[array.length - 1];
			return _.rest(array, Math.max(0, array.length - n));
		};

		// Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
		// Especially useful on the arguments object. Passing an **n** will return
		// the rest N values in the array.
		_.rest = _.tail = _.drop = function(array, n, guard) {
			return slice.call(array, n == null || guard ? 1 : n);
		};

		// Trim out all falsy values from an array.
		_.compact = function(array) {
			return _.filter(array, _.identity);
		};

		// Internal implementation of a recursive `flatten` function.
		var flatten = function(input, shallow, strict, startIndex) {
			var output = [], idx = 0;
			for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
				var value = input[i];
				if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
					//flatten current level of array or arguments object
					if (!shallow) value = flatten(value, shallow, strict);
					var j = 0, len = value.length;
					output.length += len;
					while (j < len) {
						output[idx++] = value[j++];
					}
				}
				else if (!strict) {
					output[idx++] = value;
				}
			}
			return output;
		};

		// Flatten out an array, either recursively (by default), or just one level.
		_.flatten = function(array, shallow) {
			return flatten(array, shallow, false);
		};

		// Return a version of the array that does not contain the specified value(s).
		_.without = function(array) {
			return _.difference(array, slice.call(arguments, 1));
		};

		// Produce a duplicate-free version of the array. If the array has already
		// been sorted, you have the option of using a faster algorithm.
		// Aliased as `unique`.
		_.uniq = _.unique = function(array, isSorted, iteratee, context) {
			if (!_.isBoolean(isSorted)) {
				context = iteratee;
				iteratee = isSorted;
				isSorted = false;
			}
			if (iteratee != null) iteratee = cb(iteratee, context);
			var result = [];
			var seen = [];
			for (var i = 0, length = getLength(array); i < length; i++) {
				var value = array[i],
					computed = iteratee ? iteratee(value, i, array) : value;
				if (isSorted) {
					if (!i || seen !== computed) result.push(value);
					seen = computed;
				}
				else if (iteratee) {
					if (!_.contains(seen, computed)) {
						seen.push(computed);
						result.push(value);
					}
				}
				else if (!_.contains(result, value)) {
					result.push(value);
				}
			}
			return result;
		};

		// Produce an array that contains the union: each distinct element from all of
		// the passed-in arrays.
		_.union = function() {
			return _.uniq(flatten(arguments, true, true));
		};

		// Produce an array that contains every item shared between all the
		// passed-in arrays.
		_.intersection = function(array) {
			var result = [];
			var argsLength = arguments.length;
			for (var i = 0, length = getLength(array); i < length; i++) {
				var item = array[i];
				if (_.contains(result, item)) continue;
				for (var j = 1; j < argsLength; j++) {
					if (!_.contains(arguments[j], item)) break;
				}
				if (j === argsLength) result.push(item);
			}
			return result;
		};

		// Take the difference between one array and a number of other arrays.
		// Only the elements present in just the first array will remain.
		_.difference = function(array) {
			var rest = flatten(arguments, true, true, 1);
			return _.filter(array, function(value) {
				return !_.contains(rest, value);
			});
		};

		// Zip together multiple lists into a single array -- elements that share
		// an index go together.
		_.zip = function() {
			return _.unzip(arguments);
		};

		// Complement of _.zip. Unzip accepts an array of arrays and groups
		// each array's elements on shared indices
		_.unzip = function(array) {
			var length = array && _.max(array, getLength).length || 0;
			var result = Array(length);

			for (var index = 0; index < length; index++) {
				result[index] = _.pluck(array, index);
			}
			return result;
		};

		// Converts lists into objects. Pass either a single array of `[key, value]`
		// pairs, or two parallel arrays of the same length -- one of keys, and one of
		// the corresponding values.
		_.object = function(list, values) {
			var result = {};
			for (var i = 0, length = getLength(list); i < length; i++) {
				if (values) {
					result[list[i]] = values[i];
				}
				else {
					result[list[i][0]] = list[i][1];
				}
			}
			return result;
		};

		// Generator function to create the findIndex and findLastIndex functions
		function createPredicateIndexFinder(dir) {
			return function(array, predicate, context) {
				predicate = cb(predicate, context);
				var length = getLength(array);
				var index = dir > 0 ? 0 : length - 1;
				for (; index >= 0 && index < length; index += dir) {
					if (predicate(array[index], index, array)) return index;
				}
				return -1;
			};
		}

		// Returns the first index on an array-like that passes a predicate test
		_.findIndex = createPredicateIndexFinder(1);
		_.findLastIndex = createPredicateIndexFinder(-1);

		// Use a comparator function to figure out the smallest index at which
		// an object should be inserted so as to maintain order. Uses binary search.
		_.sortedIndex = function(array, obj, iteratee, context) {
			iteratee = cb(iteratee, context, 1);
			var value = iteratee(obj);
			var low = 0, high = getLength(array);
			while (low < high) {
				var mid = Math.floor((low + high) / 2);
				if (iteratee(array[mid]) < value) low = mid + 1;
				else high = mid;
			}
			return low;
		};

		// Generator function to create the indexOf and lastIndexOf functions
		function createIndexFinder(dir, predicateFind, sortedIndex) {
			return function(array, item, idx) {
				var i = 0, length = getLength(array);
				if (typeof idx == 'number') {
					if (dir > 0) {
						i = idx >= 0 ? idx : Math.max(idx + length, i);
					}
					else {
						length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
					}
				}
				else if (sortedIndex && idx && length) {
					idx = sortedIndex(array, item);
					return array[idx] === item ? idx : -1;
				}
				if (item !== item) {
					idx = predicateFind(slice.call(array, i, length), _.isNaN);
					return idx >= 0 ? idx + i : -1;
				}
				for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
					if (array[idx] === item) return idx;
				}
				return -1;
			};
		}

		// Return the position of the first occurrence of an item in an array,
		// or -1 if the item is not included in the array.
		// If the array is large and already in sort order, pass `true`
		// for **isSorted** to use binary search.
		_.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
		_.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

		// Generate an integer Array containing an arithmetic progression. A port of
		// the native Python `range()` function. See
		// [the Python documentation](http://docs.python.org/library/functions.html#range).
		_.range = function(start, stop, step) {
			if (stop == null) {
				stop = start || 0;
				start = 0;
			}
			step = step || 1;

			var length = Math.max(Math.ceil((stop - start) / step), 0);
			var range = Array(length);

			for (var idx = 0; idx < length; idx++, start += step) {
				range[idx] = start;
			}

			return range;
		};

		// Function (ahem) Functions
		// ------------------

		// Determines whether to execute a function as a constructor
		// or a normal function with the provided arguments
		var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
			if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
			var self = baseCreate(sourceFunc.prototype);
			var result = sourceFunc.apply(self, args);
			if (_.isObject(result)) return result;
			return self;
		};

		// Create a function bound to a given object (assigning `this`, and arguments,
		// optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
		// available.
		_.bind = function(func, context) {
			if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
			if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
			var args = slice.call(arguments, 2);
			var bound = function() {
				return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
			};
			return bound;
		};

		// Partially apply a function by creating a version that has had some of its
		// arguments pre-filled, without changing its dynamic `this` context. _ acts
		// as a placeholder, allowing any combination of arguments to be pre-filled.
		_.partial = function(func) {
			var boundArgs = slice.call(arguments, 1);
			var bound = function() {
				var position = 0, length = boundArgs.length;
				var args = Array(length);
				for (var i = 0; i < length; i++) {
					args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
				}
				while (position < arguments.length) args.push(arguments[position++]);
				return executeBound(func, bound, this, this, args);
			};
			return bound;
		};

		// Bind a number of an object's methods to that object. Remaining arguments
		// are the method names to be bound. Useful for ensuring that all callbacks
		// defined on an object belong to it.
		_.bindAll = function(obj) {
			var i, length = arguments.length, key;
			if (length <= 1) throw new Error('bindAll must be passed function names');
			for (i = 1; i < length; i++) {
				key = arguments[i];
				obj[key] = _.bind(obj[key], obj);
			}
			return obj;
		};

		// Memoize an expensive function by storing its results.
		_.memoize = function(func, hasher) {
			var memoize = function(key) {
				var cache = memoize.cache;
				var address = '' + (hasher ? hasher.apply(this, arguments) : key);
				if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
				return cache[address];
			};
			memoize.cache = {};
			return memoize;
		};

		// Delays a function for the given number of milliseconds, and then calls
		// it with the arguments supplied.
		_.delay = function(func, wait) {
			var args = slice.call(arguments, 2);
			return setTimeout(function() {
				return func.apply(null, args);
			}, wait);
		};

		// Defers a function, scheduling it to run after the current call stack has
		// cleared.
		_.defer = _.partial(_.delay, _, 1);

		// Returns a function, that, when invoked, will only be triggered at most once
		// during a given window of time. Normally, the throttled function will run
		// as much as it can, without ever going more than once per `wait` duration;
		// but if you'd like to disable the execution on the leading edge, pass
		// `{leading: false}`. To disable execution on the trailing edge, ditto.
		_.throttle = function(func, wait, options) {
			var context, args, result;
			var timeout = null;
			var previous = 0;
			if (!options) options = {};
			var later = function() {
				previous = options.leading === false ? 0 : _.now();
				timeout = null;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			};
			return function() {
				var now = _.now();
				if (!previous && options.leading === false) previous = now;
				var remaining = wait - (now - previous);
				context = this;
				args = arguments;
				if (remaining <= 0 || remaining > wait) {
					if (timeout) {
						clearTimeout(timeout);
						timeout = null;
					}
					previous = now;
					result = func.apply(context, args);
					if (!timeout) context = args = null;
				}
				else if (!timeout && options.trailing !== false) {
					timeout = setTimeout(later, remaining);
				}
				return result;
			};
		};

		// Returns a function, that, as long as it continues to be invoked, will not
		// be triggered. The function will be called after it stops being called for
		// N milliseconds. If `immediate` is passed, trigger the function on the
		// leading edge, instead of the trailing.
		_.debounce = function(func, wait, immediate) {
			var timeout, args, context, timestamp, result;

			var later = function() {
				var last = _.now() - timestamp;

				if (last < wait && last >= 0) {
					timeout = setTimeout(later, wait - last);
				}
				else {
					timeout = null;
					if (!immediate) {
						result = func.apply(context, args);
						if (!timeout) context = args = null;
					}
				}
			};

			return function() {
				context = this;
				args = arguments;
				timestamp = _.now();
				var callNow = immediate && !timeout;
				if (!timeout) timeout = setTimeout(later, wait);
				if (callNow) {
					result = func.apply(context, args);
					context = args = null;
				}

				return result;
			};
		};

		// Returns the first function passed as an argument to the second,
		// allowing you to adjust arguments, run code before and after, and
		// conditionally execute the original function.
		_.wrap = function(func, wrapper) {
			return _.partial(wrapper, func);
		};

		// Returns a negated version of the passed-in predicate.
		_.negate = function(predicate) {
			return function() {
				return !predicate.apply(this, arguments);
			};
		};

		// Returns a function that is the composition of a list of functions, each
		// consuming the return value of the function that follows.
		_.compose = function() {
			var args = arguments;
			var start = args.length - 1;
			return function() {
				var i = start;
				var result = args[start].apply(this, arguments);
				while (i--) result = args[i].call(this, result);
				return result;
			};
		};

		// Returns a function that will only be executed on and after the Nth call.
		_.after = function(times, func) {
			return function() {
				if (--times < 1) {
					return func.apply(this, arguments);
				}
			};
		};

		// Returns a function that will only be executed up to (but not including) the Nth call.
		_.before = function(times, func) {
			var memo;
			return function() {
				if (--times > 0) {
					memo = func.apply(this, arguments);
				}
				if (times <= 1) func = null;
				return memo;
			};
		};

		// Returns a function that will be executed at most one time, no matter how
		// often you call it. Useful for lazy initialization.
		_.once = _.partial(_.before, 2);

		// Object Functions
		// ----------------

		// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
		var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
		var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
			'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

		function collectNonEnumProps(obj, keys) {
			var nonEnumIdx = nonEnumerableProps.length;
			var constructor = obj.constructor;
			var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

			// Constructor is a special case.
			var prop = 'constructor';
			if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

			while (nonEnumIdx--) {
				prop = nonEnumerableProps[nonEnumIdx];
				if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
					keys.push(prop);
				}
			}
		}

		// Retrieve the names of an object's own properties.
		// Delegates to **ECMAScript 5**'s native `Object.keys`
		_.keys = function(obj) {
			if (!_.isObject(obj)) return [];
			if (nativeKeys) return nativeKeys(obj);
			var keys = [];
			for (var key in obj) if (_.has(obj, key)) keys.push(key);
			// Ahem, IE < 9.
			if (hasEnumBug) collectNonEnumProps(obj, keys);
			return keys;
		};

		// Retrieve all the property names of an object.
		_.allKeys = function(obj) {
			if (!_.isObject(obj)) return [];
			var keys = [];
			for (var key in obj) keys.push(key);
			// Ahem, IE < 9.
			if (hasEnumBug) collectNonEnumProps(obj, keys);
			return keys;
		};

		// Retrieve the values of an object's properties.
		_.values = function(obj) {
			var keys = _.keys(obj);
			var length = keys.length;
			var values = Array(length);
			for (var i = 0; i < length; i++) {
				values[i] = obj[keys[i]];
			}
			return values;
		};

		// Returns the results of applying the iteratee to each element of the object
		// In contrast to _.map it returns an object
		_.mapObject = function(obj, iteratee, context) {
			iteratee = cb(iteratee, context);
			var keys = _.keys(obj),
				length = keys.length,
				results = {},
				currentKey;
			for (var index = 0; index < length; index++) {
				currentKey = keys[index];
				results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
			}
			return results;
		};

		// Convert an object into a list of `[key, value]` pairs.
		_.pairs = function(obj) {
			var keys = _.keys(obj);
			var length = keys.length;
			var pairs = Array(length);
			for (var i = 0; i < length; i++) {
				pairs[i] = [keys[i], obj[keys[i]]];
			}
			return pairs;
		};

		// Invert the keys and values of an object. The values must be serializable.
		_.invert = function(obj) {
			var result = {};
			var keys = _.keys(obj);
			for (var i = 0, length = keys.length; i < length; i++) {
				result[obj[keys[i]]] = keys[i];
			}
			return result;
		};

		// Return a sorted list of the function names available on the object.
		// Aliased as `methods`
		_.functions = _.methods = function(obj) {
			var names = [];
			for (var key in obj) {
				if (_.isFunction(obj[key])) names.push(key);
			}
			return names.sort();
		};

		// Extend a given object with all the properties in passed-in object(s).
		_.extend = createAssigner(_.allKeys);

		// Assigns a given object with all the own properties in the passed-in object(s)
		// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
		_.extendOwn = _.assign = createAssigner(_.keys);

		// Returns the first key on an object that passes a predicate test
		_.findKey = function(obj, predicate, context) {
			predicate = cb(predicate, context);
			var keys = _.keys(obj), key;
			for (var i = 0, length = keys.length; i < length; i++) {
				key = keys[i];
				if (predicate(obj[key], key, obj)) return key;
			}
		};

		// Return a copy of the object only containing the whitelisted properties.
		_.pick = function(object, oiteratee, context) {
			var result = {}, obj = object, iteratee, keys;
			if (obj == null) return result;
			if (_.isFunction(oiteratee)) {
				keys = _.allKeys(obj);
				iteratee = optimizeCb(oiteratee, context);
			}
			else {
				keys = flatten(arguments, false, false, 1);
				iteratee = function(value, key, obj) {
					return key in obj;
				};
				obj = Object(obj);
			}
			for (var i = 0, length = keys.length; i < length; i++) {
				var key = keys[i];
				var value = obj[key];
				if (iteratee(value, key, obj)) result[key] = value;
			}
			return result;
		};

		// Return a copy of the object without the blacklisted properties.
		_.omit = function(obj, iteratee, context) {
			if (_.isFunction(iteratee)) {
				iteratee = _.negate(iteratee);
			}
			else {
				var keys = _.map(flatten(arguments, false, false, 1), String);
				iteratee = function(value, key) {
					return !_.contains(keys, key);
				};
			}
			return _.pick(obj, iteratee, context);
		};

		// Fill in a given object with default properties.
		_.defaults = createAssigner(_.allKeys, true);

		// Creates an object that inherits from the given prototype object.
		// If additional properties are provided then they will be added to the
		// created object.
		_.create = function(prototype, props) {
			var result = baseCreate(prototype);
			if (props) _.extendOwn(result, props);
			return result;
		};

		// Create a (shallow-cloned) duplicate of an object.
		_.clone = function(obj) {
			if (!_.isObject(obj)) return obj;
			return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
		};

		// Invokes interceptor with the obj, and then returns obj.
		// The primary purpose of this method is to "tap into" a method chain, in
		// order to perform operations on intermediate results within the chain.
		_.tap = function(obj, interceptor) {
			interceptor(obj);
			return obj;
		};

		// Returns whether an object has a given set of `key:value` pairs.
		_.isMatch = function(object, attrs) {
			var keys = _.keys(attrs), length = keys.length;
			if (object == null) return !length;
			var obj = Object(object);
			for (var i = 0; i < length; i++) {
				var key = keys[i];
				if (attrs[key] !== obj[key] || !(key in obj)) return false;
			}
			return true;
		};


		// Internal recursive comparison function for `isEqual`.
		var eq = function(a, b, aStack, bStack) {
			// Identical objects are equal. `0 === -0`, but they aren't identical.
			// See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
			if (a === b) return a !== 0 || 1 / a === 1 / b;
			// A strict comparison is necessary because `null == undefined`.
			if (a == null || b == null) return a === b;
			// Unwrap any wrapped objects.
			if (a instanceof _) a = a._wrapped;
			if (b instanceof _) b = b._wrapped;
			// Compare `[[Class]]` names.
			var className = toString.call(a);
			if (className !== toString.call(b)) return false;
			switch (className) {
				// Strings, numbers, regular expressions, dates, and booleans are compared by value.
				case '[object RegExp]':
				// RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
				case '[object String]':
					// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
					// equivalent to `new String("5")`.
					return '' + a === '' + b;
				case '[object Number]':
					// `NaN`s are equivalent, but non-reflexive.
					// Object(NaN) is equivalent to NaN
					if (+a !== +a) return +b !== +b;
					// An `egal` comparison is performed for other numeric values.
					return +a === 0 ? 1 / +a === 1 / b : +a === +b;
				case '[object Date]':
				case '[object Boolean]':
					// Coerce dates and booleans to numeric primitive values. Dates are compared by their
					// millisecond representations. Note that invalid dates with millisecond representations
					// of `NaN` are not equivalent.
					return +a === +b;
			}

			var areArrays = className === '[object Array]';
			if (!areArrays) {
				if (typeof a != 'object' || typeof b != 'object') return false;

				// Objects with different constructors are not equivalent, but `Object`s or `Array`s
				// from different frames are.
				var aCtor = a.constructor, bCtor = b.constructor;
				if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
					_.isFunction(bCtor) && bCtor instanceof bCtor)
					&& ('constructor' in a && 'constructor' in b)) {
					return false;
				}
			}
			// Assume equality for cyclic structures. The algorithm for detecting cyclic
			// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

			// Initializing stack of traversed objects.
			// It's done here since we only need them for objects and arrays comparison.
			aStack = aStack || [];
			bStack = bStack || [];
			var length = aStack.length;
			while (length--) {
				// Linear search. Performance is inversely proportional to the number of
				// unique nested structures.
				if (aStack[length] === a) return bStack[length] === b;
			}

			// Add the first object to the stack of traversed objects.
			aStack.push(a);
			bStack.push(b);

			// Recursively compare objects and arrays.
			if (areArrays) {
				// Compare array lengths to determine if a deep comparison is necessary.
				length = a.length;
				if (length !== b.length) return false;
				// Deep compare the contents, ignoring non-numeric properties.
				while (length--) {
					if (!eq(a[length], b[length], aStack, bStack)) return false;
				}
			}
			else {
				// Deep compare objects.
				var keys = _.keys(a), key;
				length = keys.length;
				// Ensure that both objects contain the same number of properties before comparing deep equality.
				if (_.keys(b).length !== length) return false;
				while (length--) {
					// Deep compare each member
					key = keys[length];
					if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
				}
			}
			// Remove the first object from the stack of traversed objects.
			aStack.pop();
			bStack.pop();
			return true;
		};

		// Perform a deep comparison to check if two objects are equal.
		_.isEqual = function(a, b) {
			return eq(a, b);
		};

		// Is a given array, string, or object empty?
		// An "empty" object has no enumerable own-properties.
		_.isEmpty = function(obj) {
			if (obj == null) return true;
			if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
			return _.keys(obj).length === 0;
		};

		// Is a given value a DOM element?
		_.isElement = function(obj) {
			return !!(obj && obj.nodeType === 1);
		};

		// Is a given value an array?
		// Delegates to ECMA5's native Array.isArray
		_.isArray = nativeIsArray || function(obj) {
				return toString.call(obj) === '[object Array]';
			};

		// Is a given variable an object?
		_.isObject = function(obj) {
			var type = typeof obj;
			return type === 'function' || type === 'object' && !!obj;
		};

		// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
		_.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
			_['is' + name] = function(obj) {
				return toString.call(obj) === '[object ' + name + ']';
			};
		});

		// Define a fallback version of the method in browsers (ahem, IE < 9), where
		// there isn't any inspectable "Arguments" type.
		if (!_.isArguments(arguments)) {
			_.isArguments = function(obj) {
				return _.has(obj, 'callee');
			};
		}

		// Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
		// IE 11 (#1621), and in Safari 8 (#1929).
		if (typeof /./ != 'function' && typeof Int8Array != 'object') {
			_.isFunction = function(obj) {
				return typeof obj == 'function' || false;
			};
		}

		// Is a given object a finite number?
		_.isFinite = function(obj) {
			return isFinite(obj) && !isNaN(parseFloat(obj));
		};

		// Is the given value `NaN`? (NaN is the only number which does not equal itself).
		_.isNaN = function(obj) {
			return _.isNumber(obj) && obj !== +obj;
		};

		// Is a given value a boolean?
		_.isBoolean = function(obj) {
			return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
		};

		// Is a given value equal to null?
		_.isNull = function(obj) {
			return obj === null;
		};

		// Is a given variable undefined?
		_.isUndefined = function(obj) {
			return obj === void 0;
		};

		// Shortcut function for checking if an object has a given property directly
		// on itself (in other words, not on a prototype).
		_.has = function(obj, key) {
			return obj != null && hasOwnProperty.call(obj, key);
		};

		// Utility Functions
		// -----------------

		// Run Underscore.js in *noConflict* mode, returning the `_` variable to its
		// previous owner. Returns a reference to the Underscore object.
		_.noConflict = function() {
			root._ = previousUnderscore;
			return this;
		};

		// Keep the identity function around for default iteratees.
		_.identity = function(value) {
			return value;
		};

		// Predicate-generating functions. Often useful outside of Underscore.
		_.constant = function(value) {
			return function() {
				return value;
			};
		};

		_.noop = function() {
		};

		_.property = property;

		// Generates a function for a given object that returns a given property.
		_.propertyOf = function(obj) {
			return obj == null ? function() {
			} : function(key) {
				return obj[key];
			};
		};

		// Returns a predicate for checking whether an object has a given set of
		// `key:value` pairs.
		_.matcher = _.matches = function(attrs) {
			attrs = _.extendOwn({}, attrs);
			return function(obj) {
				return _.isMatch(obj, attrs);
			};
		};

		// Run a function **n** times.
		_.times = function(n, iteratee, context) {
			var accum = Array(Math.max(0, n));
			iteratee = optimizeCb(iteratee, context, 1);
			for (var i = 0; i < n; i++) accum[i] = iteratee(i);
			return accum;
		};

		// Return a random integer between min and max (inclusive).
		_.random = function(min, max) {
			if (max == null) {
				max = min;
				min = 0;
			}
			return min + Math.floor(Math.random() * (max - min + 1));
		};

		// A (possibly faster) way to get the current timestamp as an integer.
		_.now = Date.now || function() {
				return new Date().getTime();
			};

		// List of HTML entities for escaping.
		var escapeMap = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#x27;',
			'`': '&#x60;'
		};
		var unescapeMap = _.invert(escapeMap);

		// Functions for escaping and unescaping strings to/from HTML interpolation.
		var createEscaper = function(map) {
			var escaper = function(match) {
				return map[match];
			};
			// Regexes for identifying a key that needs to be escaped
			var source = '(?:' + _.keys(map).join('|') + ')';
			var testRegexp = RegExp(source);
			var replaceRegexp = RegExp(source, 'g');
			return function(string) {
				string = string == null ? '' : '' + string;
				return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
			};
		};
		_.escape = createEscaper(escapeMap);
		_.unescape = createEscaper(unescapeMap);

		// If the value of the named `property` is a function then invoke it with the
		// `object` as context; otherwise, return it.
		_.result = function(object, property, fallback) {
			var value = object == null ? void 0 : object[property];
			if (value === void 0) {
				value = fallback;
			}
			return _.isFunction(value) ? value.call(object) : value;
		};

		// Generate a unique integer id (unique within the entire client session).
		// Useful for temporary DOM ids.
		var idCounter = 0;
		_.uniqueId = function(prefix) {
			var id = ++idCounter + '';
			return prefix ? prefix + id : id;
		};

		// By default, Underscore uses ERB-style template delimiters, change the
		// following template settings to use alternative delimiters.
		_.templateSettings = {
			evaluate: /<%([\s\S]+?)%>/g,
			interpolate: /<%=([\s\S]+?)%>/g,
			escape: /<%-([\s\S]+?)%>/g
		};

		// When customizing `templateSettings`, if you don't want to define an
		// interpolation, evaluation or escaping regex, we need one that is
		// guaranteed not to match.
		var noMatch = /(.)^/;

		// Certain characters need to be escaped so that they can be put into a
		// string literal.
		var escapes = {
			"'": "'",
			'\\': '\\',
			'\r': 'r',
			'\n': 'n',
			'\u2028': 'u2028',
			'\u2029': 'u2029'
		};

		var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

		var escapeChar = function(match) {
			return '\\' + escapes[match];
		};

		// JavaScript micro-templating, similar to John Resig's implementation.
		// Underscore templating handles arbitrary delimiters, preserves whitespace,
		// and correctly escapes quotes within interpolated code.
		// NB: `oldSettings` only exists for backwards compatibility.
		_.template = function(text, settings, oldSettings) {
			if (!settings && oldSettings) settings = oldSettings;
			settings = _.defaults({}, settings, _.templateSettings);

			// Combine delimiters into one regular expression via alternation.
			var matcher = RegExp([
					(settings.escape || noMatch).source,
					(settings.interpolate || noMatch).source,
					(settings.evaluate || noMatch).source
				].join('|') + '|$', 'g');

			// Compile the template source, escaping string literals appropriately.
			var index = 0;
			var source = "__p+='";
			text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
				source += text.slice(index, offset).replace(escaper, escapeChar);
				index = offset + match.length;

				if (escape) {
					source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
				}
				else if (interpolate) {
					source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
				}
				else if (evaluate) {
					source += "';\n" + evaluate + "\n__p+='";
				}

				// Adobe VMs need the match returned to produce the correct offest.
				return match;
			});
			source += "';\n";

			// If a variable is not specified, place data values in local scope.
			if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

			source = "var __t,__p='',__j=Array.prototype.join," +
				"print=function(){__p+=__j.call(arguments,'');};\n" +
				source + 'return __p;\n';

			try {
				var render = new Function(settings.variable || 'obj', '_', source);
			} catch (e) {
				e.source = source;
				throw e;
			}

			var template = function(data) {
				return render.call(this, data, _);
			};

			// Provide the compiled source as a convenience for precompilation.
			var argument = settings.variable || 'obj';
			template.source = 'function(' + argument + '){\n' + source + '}';

			return template;
		};

		// Add a "chain" function. Start chaining a wrapped Underscore object.
		_.chain = function(obj) {
			var instance = _(obj);
			instance._chain = true;
			return instance;
		};

		// OOP
		// ---------------
		// If Underscore is called as a function, it returns a wrapped object that
		// can be used OO-style. This wrapper holds altered versions of all the
		// underscore functions. Wrapped objects may be chained.

		// Helper function to continue chaining intermediate results.
		var result = function(instance, obj) {
			return instance._chain ? _(obj).chain() : obj;
		};

		// Add your own custom functions to the Underscore object.
		_.mixin = function(obj) {
			_.each(_.functions(obj), function(name) {
				var func = _[name] = obj[name];
				_.prototype[name] = function() {
					var args = [this._wrapped];
					push.apply(args, arguments);
					return result(this, func.apply(_, args));
				};
			});
		};

		// Add all of the Underscore functions to the wrapper object.
		_.mixin(_);

		// Add all mutator Array functions to the wrapper.
		_.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
			var method = ArrayProto[name];
			_.prototype[name] = function() {
				var obj = this._wrapped;
				method.apply(obj, arguments);
				if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
				return result(this, obj);
			};
		});

		// Add all accessor Array functions to the wrapper.
		_.each(['concat', 'join', 'slice'], function(name) {
			var method = ArrayProto[name];
			_.prototype[name] = function() {
				return result(this, method.apply(this._wrapped, arguments));
			};
		});

		// Extracts the result from a wrapped and chained object.
		_.prototype.value = function() {
			return this._wrapped;
		};

		// Provide unwrapping proxy for some methods used in engine operations
		// such as arithmetic and JSON stringification.
		_.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

		_.prototype.toString = function() {
			return '' + this._wrapped;
		};

		// AMD registration happens at the end for compatibility with AMD loaders
		// that may not enforce next-turn semantics on modules. Even though general
		// practice for AMD registration is to be anonymous, underscore registers
		// as a named module because, like jQuery, it is a base library that is
		// popular enough to be bundled in a third party lib, but not be part of
		// an AMD load request. Those cases could generate an error when an
		// anonymous define() is called outside of a loader request.
		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return _;
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
	}.call(this));


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* globals define, module, require */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(8), __webpack_require__(11), __webpack_require__(5)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Marionette, Radio, _) {
		'use strict';

		Marionette.Application.prototype._initChannel = function() {
			this.channelName = _.result(this, 'channelName') || 'global';
			this.channel = _.result(this, 'channel') || Radio.channel(this.channelName);
		};

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


	//(function(root, factory) {
	//    'use strict';
	//
	//    if (typeof define === 'function' && define.amd) {
	//        define(['backbone.marionette', 'backbone.radio', 'underscore'], factory);
	//    } else if (typeof exports !== 'undefined') {
	//        module.exports = factory(require('backbone.marionette'), require('backbone.radio'), require('underscore'));
	//    } else {
	//        factory(root.Backbone.Marionette, root.Backbone.Radio, root._);
	//    }
	//}(this, function(Marionette, Radio, _) {
	//    'use strict';
	//
	//    Marionette.Application.prototype._initChannel = function () {
	//        this.channelName = _.result(this, 'channelName') || 'global';
	//        this.channel = _.result(this, 'channel') || Radio.channel(this.channelName);
	//    };
	//
	//}));

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// MarionetteJS (Backbone.Marionette)
	// ----------------------------------
	// v2.4.7
	//
	// Copyright (c)2016 Derick Bailey, Muted Solutions, LLC.
	// Distributed under MIT license
	//
	// http://marionettejs.com

	(function(root, factory) {

		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(3), __webpack_require__(5), __webpack_require__(9), __webpack_require__(10)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Backbone, _) {
				return (root.Marionette = root.Mn = factory(root, Backbone, _));
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
		else if (typeof exports !== 'undefined') {
			var Backbone = require('backbone');
			var _ = require('underscore');
			var Wreqr = require('backbone.wreqr');
			var BabySitter = require('backbone.babysitter');
			module.exports = factory(root, Backbone, _);
		}
		else {
			root.Marionette = root.Mn = factory(root, root.Backbone, root._);
		}

	}(this, function(root, Backbone, _) {
		'use strict';

		var previousMarionette = root.Marionette;
		var previousMn = root.Mn;

		var Marionette = Backbone.Marionette = {};

		Marionette.VERSION = '2.4.7';

		Marionette.noConflict = function() {
			root.Marionette = previousMarionette;
			root.Mn = previousMn;
			return this;
		};

		// Get the Deferred creator for later use
		Marionette.Deferred = Backbone.$.Deferred;

		Marionette.FEATURES = {};

		Marionette.isEnabled = function(name) {
			return !!Marionette.FEATURES[name];
		};

		/* jshint unused: false */
		/* global console */

		// Helpers
		// -------

		// Marionette.extend
		// -----------------

		// Borrow the Backbone `extend` method so we can use it as needed
		Marionette.extend = Backbone.Model.extend;

		// Marionette.isNodeAttached
		// -------------------------

		// Determine if `el` is a child of the document
		Marionette.isNodeAttached = function(el) {
			return Backbone.$.contains(document.documentElement, el);
		};

		// Merge `keys` from `options` onto `this`
		Marionette.mergeOptions = function(options, keys) {
			if (!options) {
				return;
			}
			_.extend(this, _.pick(options, keys));
		};

		// Marionette.getOption
		// --------------------

		// Retrieve an object, function or other value from a target
		// object or its `options`, with `options` taking precedence.
		Marionette.getOption = function(target, optionName) {
			if (!target || !optionName) {
				return;
			}
			if (target.options && (target.options[optionName] !== undefined)) {
				return target.options[optionName];
			}
			else {
				return target[optionName];
			}
		};

		// Proxy `Marionette.getOption`
		Marionette.proxyGetOption = function(optionName) {
			return Marionette.getOption(this, optionName);
		};

		// Similar to `_.result`, this is a simple helper
		// If a function is provided we call it with context
		// otherwise just return the value. If the value is
		// undefined return a default value
		Marionette._getValue = function(value, context, params) {
			if (_.isFunction(value)) {
				value = params ? value.apply(context, params) : value.call(context);
			}
			return value;
		};

		// Marionette.normalizeMethods
		// ----------------------

		// Pass in a mapping of events => functions or function names
		// and return a mapping of events => functions
		Marionette.normalizeMethods = function(hash) {
			return _.reduce(hash, function(normalizedHash, method, name) {
				if (!_.isFunction(method)) {
					method = this[method];
				}
				if (method) {
					normalizedHash[name] = method;
				}
				return normalizedHash;
			}, {}, this);
		};

		// utility method for parsing @ui. syntax strings
		// into associated selector
		Marionette.normalizeUIString = function(uiString, ui) {
			return uiString.replace(/@ui\.[a-zA-Z-_$0-9]*/g, function(r) {
				return ui[r.slice(4)];
			});
		};

		// allows for the use of the @ui. syntax within
		// a given key for triggers and events
		// swaps the @ui with the associated selector.
		// Returns a new, non-mutated, parsed events hash.
		Marionette.normalizeUIKeys = function(hash, ui) {
			return _.reduce(hash, function(memo, val, key) {
				var normalizedKey = Marionette.normalizeUIString(key, ui);
				memo[normalizedKey] = val;
				return memo;
			}, {});
		};

		// allows for the use of the @ui. syntax within
		// a given value for regions
		// swaps the @ui with the associated selector
		Marionette.normalizeUIValues = function(hash, ui, properties) {
			_.each(hash, function(val, key) {
				if (_.isString(val)) {
					hash[key] = Marionette.normalizeUIString(val, ui);
				}
				else if (_.isObject(val) && _.isArray(properties)) {
					_.extend(val, Marionette.normalizeUIValues(_.pick(val, properties), ui));
					/* Value is an object, and we got an array of embedded property names to normalize. */
					_.each(properties, function(property) {
						var propertyVal = val[property];
						if (_.isString(propertyVal)) {
							val[property] = Marionette.normalizeUIString(propertyVal, ui);
						}
					});
				}
			});
			return hash;
		};

		// Mix in methods from Underscore, for iteration, and other
		// collection related features.
		// Borrowing this code from Backbone.Collection:
		// http://backbonejs.org/docs/backbone.html#section-121
		Marionette.actAsCollection = function(object, listProperty) {
			var methods = ['forEach', 'each', 'map', 'find', 'detect', 'filter',
				'select', 'reject', 'every', 'all', 'some', 'any', 'include',
				'contains', 'invoke', 'toArray', 'first', 'initial', 'rest',
				'last', 'without', 'isEmpty', 'pluck'];

			_.each(methods, function(method) {
				object[method] = function() {
					var list = _.values(_.result(this, listProperty));
					var args = [list].concat(_.toArray(arguments));
					return _[method].apply(_, args);
				};
			});
		};

		var deprecate = Marionette.deprecate = function(message, test) {
			if (_.isObject(message)) {
				message = (
					message.prev + ' is going to be removed in the future. ' +
					'Please use ' + message.next + ' instead.' +
					(message.url ? ' See: ' + message.url : '')
				);
			}

			if ((test === undefined || !test) && !deprecate._cache[message]) {
				deprecate._warn('Deprecation warning: ' + message);
				deprecate._cache[message] = true;
			}
		};

		deprecate._console = typeof console !== 'undefined' ? console : {};
		deprecate._warn = function() {
			var warn = deprecate._console.warn || deprecate._console.log || function() {
				};
			return warn.apply(deprecate._console, arguments);
		};
		deprecate._cache = {};

		/* jshint maxstatements: 14, maxcomplexity: 7 */

		// Trigger Method
		// --------------

		Marionette._triggerMethod = (function() {
			// split the event name on the ":"
			var splitter = /(^|:)(\w)/gi;

			// take the event section ("section1:section2:section3")
			// and turn it in to uppercase name
			function getEventName(match, prefix, eventName) {
				return eventName.toUpperCase();
			}

			return function(context, event, args) {
				var noEventArg = arguments.length < 3;
				if (noEventArg) {
					args = event;
					event = args[0];
				}

				// get the method name from the event name
				var methodName = 'on' + event.replace(splitter, getEventName);
				var method = context[methodName];
				var result;

				// call the onMethodName if it exists
				if (_.isFunction(method)) {
					// pass all args, except the event name
					result = method.apply(context, noEventArg ? _.rest(args) : args);
				}

				// trigger the event, if a trigger method exists
				if (_.isFunction(context.trigger)) {
					if (noEventArg + args.length > 1) {
						context.trigger.apply(context, noEventArg ? args : [event].concat(_.drop(args, 0)));
					}
					else {
						context.trigger(event);
					}
				}

				return result;
			};
		})();

		// Trigger an event and/or a corresponding method name. Examples:
		//
		// `this.triggerMethod("foo")` will trigger the "foo" event and
		// call the "onFoo" method.
		//
		// `this.triggerMethod("foo:bar")` will trigger the "foo:bar" event and
		// call the "onFooBar" method.
		Marionette.triggerMethod = function(event) {
			return Marionette._triggerMethod(this, arguments);
		};

		// triggerMethodOn invokes triggerMethod on a specific context
		//
		// e.g. `Marionette.triggerMethodOn(view, 'show')`
		// will trigger a "show" event or invoke onShow the view.
		Marionette.triggerMethodOn = function(context) {
			var fnc = _.isFunction(context.triggerMethod) ?
				context.triggerMethod :
				Marionette.triggerMethod;

			return fnc.apply(context, _.rest(arguments));
		};

		// DOM Refresh
		// -----------

		// Monitor a view's state, and after it has been rendered and shown
		// in the DOM, trigger a "dom:refresh" event every time it is
		// re-rendered.

		Marionette.MonitorDOMRefresh = function(view) {
			if (view._isDomRefreshMonitored) {
				return;
			}
			view._isDomRefreshMonitored = true;

			// track when the view has been shown in the DOM,
			// using a Marionette.Region (or by other means of triggering "show")
			function handleShow() {
				view._isShown = true;
				triggerDOMRefresh();
			}

			// track when the view has been rendered
			function handleRender() {
				view._isRendered = true;
				triggerDOMRefresh();
			}

			// Trigger the "dom:refresh" event and corresponding "onDomRefresh" method
			function triggerDOMRefresh() {
				if (view._isShown && view._isRendered && Marionette.isNodeAttached(view.el)) {
					Marionette.triggerMethodOn(view, 'dom:refresh', view);
				}
			}

			view.on({
				show: handleShow,
				render: handleRender
			});
		};

		/* jshint maxparams: 5 */

		// Bind Entity Events & Unbind Entity Events
		// -----------------------------------------
		//
		// These methods are used to bind/unbind a backbone "entity" (e.g. collection/model)
		// to methods on a target object.
		//
		// The first parameter, `target`, must have the Backbone.Events module mixed in.
		//
		// The second parameter is the `entity` (Backbone.Model, Backbone.Collection or
		// any object that has Backbone.Events mixed in) to bind the events from.
		//
		// The third parameter is a hash of { "event:name": "eventHandler" }
		// configuration. Multiple handlers can be separated by a space. A
		// function can be supplied instead of a string handler name.

		(function(Marionette) {
			'use strict';

			// Bind the event to handlers specified as a string of
			// handler names on the target object
			function bindFromStrings(target, entity, evt, methods) {
				var methodNames = methods.split(/\s+/);

				_.each(methodNames, function(methodName) {

					var method = target[methodName];
					if (!method) {
						throw new Marionette.Error('Method "' + methodName +
							'" was configured as an event handler, but does not exist.');
					}

					target.listenTo(entity, evt, method);
				});
			}

			// Bind the event to a supplied callback function
			function bindToFunction(target, entity, evt, method) {
				target.listenTo(entity, evt, method);
			}

			// Bind the event to handlers specified as a string of
			// handler names on the target object
			function unbindFromStrings(target, entity, evt, methods) {
				var methodNames = methods.split(/\s+/);

				_.each(methodNames, function(methodName) {
					var method = target[methodName];
					target.stopListening(entity, evt, method);
				});
			}

			// Bind the event to a supplied callback function
			function unbindToFunction(target, entity, evt, method) {
				target.stopListening(entity, evt, method);
			}

			// generic looping function
			function iterateEvents(target, entity, bindings, functionCallback, stringCallback) {
				if (!entity || !bindings) {
					return;
				}

				// type-check bindings
				if (!_.isObject(bindings)) {
					throw new Marionette.Error({
						message: 'Bindings must be an object or function.',
						url: 'marionette.functions.html#marionettebindentityevents'
					});
				}

				// allow the bindings to be a function
				bindings = Marionette._getValue(bindings, target);

				// iterate the bindings and bind them
				_.each(bindings, function(methods, evt) {

					// allow for a function as the handler,
					// or a list of event names as a string
					if (_.isFunction(methods)) {
						functionCallback(target, entity, evt, methods);
					}
					else {
						stringCallback(target, entity, evt, methods);
					}

				});
			}

			// Export Public API
			Marionette.bindEntityEvents = function(target, entity, bindings) {
				iterateEvents(target, entity, bindings, bindToFunction, bindFromStrings);
			};

			Marionette.unbindEntityEvents = function(target, entity, bindings) {
				iterateEvents(target, entity, bindings, unbindToFunction, unbindFromStrings);
			};

			// Proxy `bindEntityEvents`
			Marionette.proxyBindEntityEvents = function(entity, bindings) {
				return Marionette.bindEntityEvents(this, entity, bindings);
			};

			// Proxy `unbindEntityEvents`
			Marionette.proxyUnbindEntityEvents = function(entity, bindings) {
				return Marionette.unbindEntityEvents(this, entity, bindings);
			};
		})(Marionette);


		// Error
		// -----

		var errorProps = ['description', 'fileName', 'lineNumber', 'name', 'message', 'number'];

		Marionette.Error = Marionette.extend.call(Error, {
			urlRoot: 'http://marionettejs.com/docs/v' + Marionette.VERSION + '/',

			constructor: function(message, options) {
				if (_.isObject(message)) {
					options = message;
					message = options.message;
				}
				else if (!options) {
					options = {};
				}

				var error = Error.call(this, message);
				_.extend(this, _.pick(error, errorProps), _.pick(options, errorProps));

				this.captureStackTrace();

				if (options.url) {
					this.url = this.urlRoot + options.url;
				}
			},

			captureStackTrace: function() {
				if (Error.captureStackTrace) {
					Error.captureStackTrace(this, Marionette.Error);
				}
			},

			toString: function() {
				return this.name + ': ' + this.message + (this.url ? ' See: ' + this.url : '');
			}
		});

		Marionette.Error.extend = Marionette.extend;

		// Callbacks
		// ---------

		// A simple way of managing a collection of callbacks
		// and executing them at a later point in time, using jQuery's
		// `Deferred` object.
		Marionette.Callbacks = function() {
			this._deferred = Marionette.Deferred();
			this._callbacks = [];
		};

		_.extend(Marionette.Callbacks.prototype, {

			// Add a callback to be executed. Callbacks added here are
			// guaranteed to execute, even if they are added after the
			// `run` method is called.
			add: function(callback, contextOverride) {
				var promise = _.result(this._deferred, 'promise');

				this._callbacks.push({cb: callback, ctx: contextOverride});

				promise.then(function(args) {
					if (contextOverride) {
						args.context = contextOverride;
					}
					callback.call(args.context, args.options);
				});
			},

			// Run all registered callbacks with the context specified.
			// Additional callbacks can be added after this has been run
			// and they will still be executed.
			run: function(options, context) {
				this._deferred.resolve({
					options: options,
					context: context
				});
			},

			// Resets the list of callbacks to be run, allowing the same list
			// to be run multiple times - whenever the `run` method is called.
			reset: function() {
				var callbacks = this._callbacks;
				this._deferred = Marionette.Deferred();
				this._callbacks = [];

				_.each(callbacks, function(cb) {
					this.add(cb.cb, cb.ctx);
				}, this);
			}
		});

		// Controller
		// ----------

		// A multi-purpose object to use as a controller for
		// modules and routers, and as a mediator for workflow
		// and coordination of other objects, views, and more.
		Marionette.Controller = function(options) {
			this.options = options || {};

			if (_.isFunction(this.initialize)) {
				this.initialize(this.options);
			}
		};

		Marionette.Controller.extend = Marionette.extend;

		// Controller Methods
		// --------------

		// Ensure it can trigger events with Backbone.Events
		_.extend(Marionette.Controller.prototype, Backbone.Events, {
			destroy: function() {
				Marionette._triggerMethod(this, 'before:destroy', arguments);
				Marionette._triggerMethod(this, 'destroy', arguments);

				this.stopListening();
				this.off();
				return this;
			},

			// import the `triggerMethod` to trigger events with corresponding
			// methods if the method exists
			triggerMethod: Marionette.triggerMethod,

			// A handy way to merge options onto the instance
			mergeOptions: Marionette.mergeOptions,

			// Proxy `getOption` to enable getting options from this or this.options by name.
			getOption: Marionette.proxyGetOption

		});

		// Object
		// ------

		// A Base Class that other Classes should descend from.
		// Object borrows many conventions and utilities from Backbone.
		Marionette.Object = function(options) {
			this.options = _.extend({}, _.result(this, 'options'), options);

			this.initialize.apply(this, arguments);
		};

		Marionette.Object.extend = Marionette.extend;

		// Object Methods
		// --------------

		// Ensure it can trigger events with Backbone.Events
		_.extend(Marionette.Object.prototype, Backbone.Events, {

			//this is a noop method intended to be overridden by classes that extend from this base
			initialize: function() {
			},

			destroy: function(options) {
				options = options || {};

				this.triggerMethod('before:destroy', options);
				this.triggerMethod('destroy', options);
				this.stopListening();

				return this;
			},

			// Import the `triggerMethod` to trigger events with corresponding
			// methods if the method exists
			triggerMethod: Marionette.triggerMethod,

			// A handy way to merge options onto the instance
			mergeOptions: Marionette.mergeOptions,

			// Proxy `getOption` to enable getting options from this or this.options by name.
			getOption: Marionette.proxyGetOption,

			// Proxy `bindEntityEvents` to enable binding view's events from another entity.
			bindEntityEvents: Marionette.proxyBindEntityEvents,

			// Proxy `unbindEntityEvents` to enable unbinding view's events from another entity.
			unbindEntityEvents: Marionette.proxyUnbindEntityEvents
		});

		/* jshint maxcomplexity: 16, maxstatements: 45, maxlen: 120 */

		// Region
		// ------

		// Manage the visual regions of your composite application. See
		// http://lostechies.com/derickbailey/2011/12/12/composite-js-apps-regions-and-region-managers/

		Marionette.Region = Marionette.Object.extend({
				constructor: function(options) {

					// set options temporarily so that we can get `el`.
					// options will be overriden by Object.constructor
					this.options = options || {};
					this.el = this.getOption('el');

					// Handle when this.el is passed in as a $ wrapped element.
					this.el = this.el instanceof Backbone.$ ? this.el[0] : this.el;

					if (!this.el) {
						throw new Marionette.Error({
							name: 'NoElError',
							message: 'An "el" must be specified for a region.'
						});
					}

					this.$el = this.getEl(this.el);
					Marionette.Object.call(this, options);
				},

				// Displays a backbone view instance inside of the region.
				// Handles calling the `render` method for you. Reads content
				// directly from the `el` attribute. Also calls an optional
				// `onShow` and `onDestroy` method on your view, just after showing
				// or just before destroying the view, respectively.
				// The `preventDestroy` option can be used to prevent a view from
				// the old view being destroyed on show.
				// The `forceShow` option can be used to force a view to be
				// re-rendered if it's already shown in the region.
				show: function(view, options) {
					if (!this._ensureElement()) {
						return;
					}

					this._ensureViewIsIntact(view);
					Marionette.MonitorDOMRefresh(view);

					var showOptions = options || {};
					var isDifferentView = view !== this.currentView;
					var preventDestroy = !!showOptions.preventDestroy;
					var forceShow = !!showOptions.forceShow;

					// We are only changing the view if there is a current view to change to begin with
					var isChangingView = !!this.currentView;

					// Only destroy the current view if we don't want to `preventDestroy` and if
					// the view given in the first argument is different than `currentView`
					var _shouldDestroyView = isDifferentView && !preventDestroy;

					// Only show the view given in the first argument if it is different than
					// the current view or if we want to re-show the view. Note that if
					// `_shouldDestroyView` is true, then `_shouldShowView` is also necessarily true.
					var _shouldShowView = isDifferentView || forceShow;

					if (isChangingView) {
						this.triggerMethod('before:swapOut', this.currentView, this, options);
					}

					if (this.currentView && isDifferentView) {
						delete this.currentView._parent;
					}

					if (_shouldDestroyView) {
						this.empty();

						// A `destroy` event is attached to the clean up manually removed views.
						// We need to detach this event when a new view is going to be shown as it
						// is no longer relevant.
					}
					else if (isChangingView && _shouldShowView) {
						this.currentView.off('destroy', this.empty, this);
					}

					if (_shouldShowView) {

						// We need to listen for if a view is destroyed
						// in a way other than through the region.
						// If this happens we need to remove the reference
						// to the currentView since once a view has been destroyed
						// we can not reuse it.
						view.once('destroy', this.empty, this);

						// make this region the view's parent,
						// It's important that this parent binding happens before rendering
						// so that any events the child may trigger during render can also be
						// triggered on the child's ancestor views
						view._parent = this;
						this._renderView(view);

						if (isChangingView) {
							this.triggerMethod('before:swap', view, this, options);
						}

						this.triggerMethod('before:show', view, this, options);
						Marionette.triggerMethodOn(view, 'before:show', view, this, options);

						if (isChangingView) {
							this.triggerMethod('swapOut', this.currentView, this, options);
						}

						// An array of views that we're about to display
						var attachedRegion = Marionette.isNodeAttached(this.el);

						// The views that we're about to attach to the document
						// It's important that we prevent _getNestedViews from being executed unnecessarily
						// as it's a potentially-slow method
						var displayedViews = [];

						var attachOptions = _.extend({
							triggerBeforeAttach: this.triggerBeforeAttach,
							triggerAttach: this.triggerAttach
						}, showOptions);

						if (attachedRegion && attachOptions.triggerBeforeAttach) {
							displayedViews = this._displayedViews(view);
							this._triggerAttach(displayedViews, 'before:');
						}

						this.attachHtml(view);
						this.currentView = view;

						if (attachedRegion && attachOptions.triggerAttach) {
							displayedViews = this._displayedViews(view);
							this._triggerAttach(displayedViews);
						}

						if (isChangingView) {
							this.triggerMethod('swap', view, this, options);
						}

						this.triggerMethod('show', view, this, options);
						Marionette.triggerMethodOn(view, 'show', view, this, options);

						return this;
					}

					return this;
				},

				triggerBeforeAttach: true,
				triggerAttach: true,

				_triggerAttach: function(views, prefix) {
					var eventName = (prefix || '') + 'attach';
					_.each(views, function(view) {
						Marionette.triggerMethodOn(view, eventName, view, this);
					}, this);
				},

				_displayedViews: function(view) {
					return _.union([view], _.result(view, '_getNestedViews') || []);
				},

				_renderView: function(view) {
					if (!view.supportsRenderLifecycle) {
						Marionette.triggerMethodOn(view, 'before:render', view);
					}
					view.render();
					if (!view.supportsRenderLifecycle) {
						Marionette.triggerMethodOn(view, 'render', view);
					}
				},

				_ensureElement: function() {
					if (!_.isObject(this.el)) {
						this.$el = this.getEl(this.el);
						this.el = this.$el[0];
					}

					if (!this.$el || this.$el.length === 0) {
						if (this.getOption('allowMissingEl')) {
							return false;
						}
						else {
							throw new Marionette.Error('An "el" ' + this.$el.selector + ' must exist in DOM');
						}
					}
					return true;
				},

				_ensureViewIsIntact: function(view) {
					if (!view) {
						throw new Marionette.Error({
							name: 'ViewNotValid',
							message: 'The view passed is undefined and therefore invalid. You must pass a view instance to show.'
						});
					}

					if (view.isDestroyed) {
						throw new Marionette.Error({
							name: 'ViewDestroyedError',
							message: 'View (cid: "' + view.cid + '") has already been destroyed and cannot be used.'
						});
					}
				},

				// Override this method to change how the region finds the DOM
				// element that it manages. Return a jQuery selector object scoped
				// to a provided parent el or the document if none exists.
				getEl: function(el) {
					return Backbone.$(el, Marionette._getValue(this.options.parentEl, this));
				},

				// Override this method to change how the new view is
				// appended to the `$el` that the region is managing
				attachHtml: function(view) {
					this.$el.contents().detach();

					this.el.appendChild(view.el);
				},

				// Destroy the current view, if there is one. If there is no
				// current view, it does nothing and returns immediately.
				empty: function(options) {
					var view = this.currentView;

					var emptyOptions = options || {};
					var preventDestroy = !!emptyOptions.preventDestroy;
					// If there is no view in the region
					// we should not remove anything
					if (!view) {
						return this;
					}

					view.off('destroy', this.empty, this);
					this.triggerMethod('before:empty', view);
					if (!preventDestroy) {
						this._destroyView();
					}
					this.triggerMethod('empty', view);

					// Remove region pointer to the currentView
					delete this.currentView;

					if (preventDestroy) {
						this.$el.contents().detach();
					}

					return this;
				},

				// call 'destroy' or 'remove', depending on which is found
				// on the view (if showing a raw Backbone view or a Marionette View)
				_destroyView: function() {
					var view = this.currentView;
					if (view.isDestroyed) {
						return;
					}

					if (!view.supportsDestroyLifecycle) {
						Marionette.triggerMethodOn(view, 'before:destroy', view);
					}
					if (view.destroy) {
						view.destroy();
					}
					else {
						view.remove();

						// appending isDestroyed to raw Backbone View allows regions
						// to throw a ViewDestroyedError for this view
						view.isDestroyed = true;
					}
					if (!view.supportsDestroyLifecycle) {
						Marionette.triggerMethodOn(view, 'destroy', view);
					}
				},

				// Attach an existing view to the region. This
				// will not call `render` or `onShow` for the new view,
				// and will not replace the current HTML for the `el`
				// of the region.
				attachView: function(view) {
					if (this.currentView) {
						delete this.currentView._parent;
					}
					view._parent = this;
					this.currentView = view;
					return this;
				},

				// Checks whether a view is currently present within
				// the region. Returns `true` if there is and `false` if
				// no view is present.
				hasView: function() {
					return !!this.currentView;
				},

				// Reset the region by destroying any existing view and
				// clearing out the cached `$el`. The next time a view
				// is shown via this region, the region will re-query the
				// DOM for the region's `el`.
				reset: function() {
					this.empty();

					if (this.$el) {
						this.el = this.$el.selector;
					}

					delete this.$el;
					return this;
				}

			},

			// Static Methods
			{

				// Build an instance of a region by passing in a configuration object
				// and a default region class to use if none is specified in the config.
				//
				// The config object should either be a string as a jQuery DOM selector,
				// a Region class directly, or an object literal that specifies a selector,
				// a custom regionClass, and any options to be supplied to the region:
				//
				// ```js
				// {
				//   selector: "#foo",
				//   regionClass: MyCustomRegion,
				//   allowMissingEl: false
				// }
				// ```
				//
				buildRegion: function(regionConfig, DefaultRegionClass) {
					if (_.isString(regionConfig)) {
						return this._buildRegionFromSelector(regionConfig, DefaultRegionClass);
					}

					if (regionConfig.selector || regionConfig.el || regionConfig.regionClass) {
						return this._buildRegionFromObject(regionConfig, DefaultRegionClass);
					}

					if (_.isFunction(regionConfig)) {
						return this._buildRegionFromRegionClass(regionConfig);
					}

					throw new Marionette.Error({
						message: 'Improper region configuration type.',
						url: 'marionette.region.html#region-configuration-types'
					});
				},

				// Build the region from a string selector like '#foo-region'
				_buildRegionFromSelector: function(selector, DefaultRegionClass) {
					return new DefaultRegionClass({el: selector});
				},

				// Build the region from a configuration object
				// ```js
				// { selector: '#foo', regionClass: FooRegion, allowMissingEl: false }
				// ```
				_buildRegionFromObject: function(regionConfig, DefaultRegionClass) {
					var RegionClass = regionConfig.regionClass || DefaultRegionClass;
					var options = _.omit(regionConfig, 'selector', 'regionClass');

					if (regionConfig.selector && !options.el) {
						options.el = regionConfig.selector;
					}

					return new RegionClass(options);
				},

				// Build the region directly from a given `RegionClass`
				_buildRegionFromRegionClass: function(RegionClass) {
					return new RegionClass();
				}
			});

		// Region Manager
		// --------------

		// Manage one or more related `Marionette.Region` objects.
		Marionette.RegionManager = Marionette.Controller.extend({
			constructor: function(options) {
				this._regions = {};
				this.length = 0;

				Marionette.Controller.call(this, options);

				this.addRegions(this.getOption('regions'));
			},

			// Add multiple regions using an object literal or a
			// function that returns an object literal, where
			// each key becomes the region name, and each value is
			// the region definition.
			addRegions: function(regionDefinitions, defaults) {
				regionDefinitions = Marionette._getValue(regionDefinitions, this, arguments);

				return _.reduce(regionDefinitions, function(regions, definition, name) {
					if (_.isString(definition)) {
						definition = {selector: definition};
					}
					if (definition.selector) {
						definition = _.defaults({}, definition, defaults);
					}

					regions[name] = this.addRegion(name, definition);
					return regions;
				}, {}, this);
			},

			// Add an individual region to the region manager,
			// and return the region instance
			addRegion: function(name, definition) {
				var region;

				if (definition instanceof Marionette.Region) {
					region = definition;
				}
				else {
					region = Marionette.Region.buildRegion(definition, Marionette.Region);
				}

				this.triggerMethod('before:add:region', name, region);

				region._parent = this;
				this._store(name, region);

				this.triggerMethod('add:region', name, region);
				return region;
			},

			// Get a region by name
			get: function(name) {
				return this._regions[name];
			},

			// Gets all the regions contained within
			// the `regionManager` instance.
			getRegions: function() {
				return _.clone(this._regions);
			},

			// Remove a region by name
			removeRegion: function(name) {
				var region = this._regions[name];
				this._remove(name, region);

				return region;
			},

			// Empty all regions in the region manager, and
			// remove them
			removeRegions: function() {
				var regions = this.getRegions();
				_.each(this._regions, function(region, name) {
					this._remove(name, region);
				}, this);

				return regions;
			},

			// Empty all regions in the region manager, but
			// leave them attached
			emptyRegions: function() {
				var regions = this.getRegions();
				_.invoke(regions, 'empty');
				return regions;
			},

			// Destroy all regions and shut down the region
			// manager entirely
			destroy: function() {
				this.removeRegions();
				return Marionette.Controller.prototype.destroy.apply(this, arguments);
			},

			// internal method to store regions
			_store: function(name, region) {
				if (!this._regions[name]) {
					this.length++;
				}

				this._regions[name] = region;
			},

			// internal method to remove a region
			_remove: function(name, region) {
				this.triggerMethod('before:remove:region', name, region);
				region.empty();
				region.stopListening();

				delete region._parent;
				delete this._regions[name];
				this.length--;
				this.triggerMethod('remove:region', name, region);
			}
		});

		Marionette.actAsCollection(Marionette.RegionManager.prototype, '_regions');


		// Template Cache
		// --------------

		// Manage templates stored in `<script>` blocks,
		// caching them for faster access.
		Marionette.TemplateCache = function(templateId) {
			this.templateId = templateId;
		};

		// TemplateCache object-level methods. Manage the template
		// caches from these method calls instead of creating
		// your own TemplateCache instances
		_.extend(Marionette.TemplateCache, {
			templateCaches: {},

			// Get the specified template by id. Either
			// retrieves the cached version, or loads it
			// from the DOM.
			get: function(templateId, options) {
				var cachedTemplate = this.templateCaches[templateId];

				if (!cachedTemplate) {
					cachedTemplate = new Marionette.TemplateCache(templateId);
					this.templateCaches[templateId] = cachedTemplate;
				}

				return cachedTemplate.load(options);
			},

			// Clear templates from the cache. If no arguments
			// are specified, clears all templates:
			// `clear()`
			//
			// If arguments are specified, clears each of the
			// specified templates from the cache:
			// `clear("#t1", "#t2", "...")`
			clear: function() {
				var i;
				var args = _.toArray(arguments);
				var length = args.length;

				if (length > 0) {
					for (i = 0; i < length; i++) {
						delete this.templateCaches[args[i]];
					}
				}
				else {
					this.templateCaches = {};
				}
			}
		});

		// TemplateCache instance methods, allowing each
		// template cache object to manage its own state
		// and know whether or not it has been loaded
		_.extend(Marionette.TemplateCache.prototype, {

			// Internal method to load the template
			load: function(options) {
				// Guard clause to prevent loading this template more than once
				if (this.compiledTemplate) {
					return this.compiledTemplate;
				}

				// Load the template and compile it
				var template = this.loadTemplate(this.templateId, options);
				this.compiledTemplate = this.compileTemplate(template, options);

				return this.compiledTemplate;
			},

			// Load a template from the DOM, by default. Override
			// this method to provide your own template retrieval
			// For asynchronous loading with AMD/RequireJS, consider
			// using a template-loader plugin as described here:
			// https://github.com/marionettejs/backbone.marionette/wiki/Using-marionette-with-requirejs
			loadTemplate: function(templateId, options) {
				var $template = Backbone.$(templateId);

				if (!$template.length) {
					throw new Marionette.Error({
						name: 'NoTemplateError',
						message: 'Could not find template: "' + templateId + '"'
					});
				}
				return $template.html();
			},

			// Pre-compile the template before caching it. Override
			// this method if you do not need to pre-compile a template
			// (JST / RequireJS for example) or if you want to change
			// the template engine used (Handebars, etc).
			compileTemplate: function(rawTemplate, options) {
				return _.template(rawTemplate, options);
			}
		});

		// Renderer
		// --------

		// Render a template with data by passing in the template
		// selector and the data to render.
		Marionette.Renderer = {

			// Render a template with data. The `template` parameter is
			// passed to the `TemplateCache` object to retrieve the
			// template function. Override this method to provide your own
			// custom rendering and template handling for all of Marionette.
			render: function(template, data) {
				if (!template) {
					throw new Marionette.Error({
						name: 'TemplateNotFoundError',
						message: 'Cannot render the template since its false, null or undefined.'
					});
				}

				var templateFunc = _.isFunction(template) ? template : Marionette.TemplateCache.get(template);

				return templateFunc(data);
			}
		};


		/* jshint maxlen: 114, nonew: false */
		// View
		// ----

		// The core view class that other Marionette views extend from.
		Marionette.View = Backbone.View.extend({
			isDestroyed: false,
			supportsRenderLifecycle: true,
			supportsDestroyLifecycle: true,

			constructor: function(options) {
				this.render = _.bind(this.render, this);

				options = Marionette._getValue(options, this);

				// this exposes view options to the view initializer
				// this is a backfill since backbone removed the assignment
				// of this.options
				// at some point however this may be removed
				this.options = _.extend({}, _.result(this, 'options'), options);

				this._behaviors = Marionette.Behaviors(this);

				Backbone.View.call(this, this.options);

				Marionette.MonitorDOMRefresh(this);
			},

			// Get the template for this view
			// instance. You can set a `template` attribute in the view
			// definition or pass a `template: "whatever"` parameter in
			// to the constructor options.
			getTemplate: function() {
				return this.getOption('template');
			},

			// Serialize a model by returning its attributes. Clones
			// the attributes to allow modification.
			serializeModel: function(model) {
				return model.toJSON.apply(model, _.rest(arguments));
			},

			// Mix in template helper methods. Looks for a
			// `templateHelpers` attribute, which can either be an
			// object literal, or a function that returns an object
			// literal. All methods and attributes from this object
			// are copies to the object passed in.
			mixinTemplateHelpers: function(target) {
				target = target || {};
				var templateHelpers = this.getOption('templateHelpers');
				templateHelpers = Marionette._getValue(templateHelpers, this);
				return _.extend(target, templateHelpers);
			},

			// normalize the keys of passed hash with the views `ui` selectors.
			// `{"@ui.foo": "bar"}`
			normalizeUIKeys: function(hash) {
				var uiBindings = _.result(this, '_uiBindings');
				return Marionette.normalizeUIKeys(hash, uiBindings || _.result(this, 'ui'));
			},

			// normalize the values of passed hash with the views `ui` selectors.
			// `{foo: "@ui.bar"}`
			normalizeUIValues: function(hash, properties) {
				var ui = _.result(this, 'ui');
				var uiBindings = _.result(this, '_uiBindings');
				return Marionette.normalizeUIValues(hash, uiBindings || ui, properties);
			},

			// Configure `triggers` to forward DOM events to view
			// events. `triggers: {"click .foo": "do:foo"}`
			configureTriggers: function() {
				if (!this.triggers) {
					return;
				}

				// Allow `triggers` to be configured as a function
				var triggers = this.normalizeUIKeys(_.result(this, 'triggers'));

				// Configure the triggers, prevent default
				// action and stop propagation of DOM events
				return _.reduce(triggers, function(events, value, key) {
					events[key] = this._buildViewTrigger(value);
					return events;
				}, {}, this);
			},

			// Overriding Backbone.View's delegateEvents to handle
			// the `triggers`, `modelEvents`, and `collectionEvents` configuration
			delegateEvents: function(events) {
				this._delegateDOMEvents(events);
				this.bindEntityEvents(this.model, this.getOption('modelEvents'));
				this.bindEntityEvents(this.collection, this.getOption('collectionEvents'));

				_.each(this._behaviors, function(behavior) {
					behavior.bindEntityEvents(this.model, behavior.getOption('modelEvents'));
					behavior.bindEntityEvents(this.collection, behavior.getOption('collectionEvents'));
				}, this);

				return this;
			},

			// internal method to delegate DOM events and triggers
			_delegateDOMEvents: function(eventsArg) {
				var events = Marionette._getValue(eventsArg || this.events, this);

				// normalize ui keys
				events = this.normalizeUIKeys(events);
				if (_.isUndefined(eventsArg)) {
					this.events = events;
				}

				var combinedEvents = {};

				// look up if this view has behavior events
				var behaviorEvents = _.result(this, 'behaviorEvents') || {};
				var triggers = this.configureTriggers();
				var behaviorTriggers = _.result(this, 'behaviorTriggers') || {};

				// behavior events will be overriden by view events and or triggers
				_.extend(combinedEvents, behaviorEvents, events, triggers, behaviorTriggers);

				Backbone.View.prototype.delegateEvents.call(this, combinedEvents);
			},

			// Overriding Backbone.View's undelegateEvents to handle unbinding
			// the `triggers`, `modelEvents`, and `collectionEvents` config
			undelegateEvents: function() {
				Backbone.View.prototype.undelegateEvents.apply(this, arguments);

				this.unbindEntityEvents(this.model, this.getOption('modelEvents'));
				this.unbindEntityEvents(this.collection, this.getOption('collectionEvents'));

				_.each(this._behaviors, function(behavior) {
					behavior.unbindEntityEvents(this.model, behavior.getOption('modelEvents'));
					behavior.unbindEntityEvents(this.collection, behavior.getOption('collectionEvents'));
				}, this);

				return this;
			},

			// Internal helper method to verify whether the view hasn't been destroyed
			_ensureViewIsIntact: function() {
				if (this.isDestroyed) {
					throw new Marionette.Error({
						name: 'ViewDestroyedError',
						message: 'View (cid: "' + this.cid + '") has already been destroyed and cannot be used.'
					});
				}
			},

			// Default `destroy` implementation, for removing a view from the
			// DOM and unbinding it. Regions will call this method
			// for you. You can specify an `onDestroy` method in your view to
			// add custom code that is called after the view is destroyed.
			destroy: function() {
				if (this.isDestroyed) {
					return this;
				}

				var args = _.toArray(arguments);

				this.triggerMethod.apply(this, ['before:destroy'].concat(args));

				// mark as destroyed before doing the actual destroy, to
				// prevent infinite loops within "destroy" event handlers
				// that are trying to destroy other views
				this.isDestroyed = true;
				this.triggerMethod.apply(this, ['destroy'].concat(args));

				// unbind UI elements
				this.unbindUIElements();

				this.isRendered = false;

				// remove the view from the DOM
				this.remove();

				// Call destroy on each behavior after
				// destroying the view.
				// This unbinds event listeners
				// that behaviors have registered for.
				_.invoke(this._behaviors, 'destroy', args);

				return this;
			},

			bindUIElements: function() {
				this._bindUIElements();
				_.invoke(this._behaviors, this._bindUIElements);
			},

			// This method binds the elements specified in the "ui" hash inside the view's code with
			// the associated jQuery selectors.
			_bindUIElements: function() {
				if (!this.ui) {
					return;
				}

				// store the ui hash in _uiBindings so they can be reset later
				// and so re-rendering the view will be able to find the bindings
				if (!this._uiBindings) {
					this._uiBindings = this.ui;
				}

				// get the bindings result, as a function or otherwise
				var bindings = _.result(this, '_uiBindings');

				// empty the ui so we don't have anything to start with
				this.ui = {};

				// bind each of the selectors
				_.each(bindings, function(selector, key) {
					this.ui[key] = this.$(selector);
				}, this);
			},

			// This method unbinds the elements specified in the "ui" hash
			unbindUIElements: function() {
				this._unbindUIElements();
				_.invoke(this._behaviors, this._unbindUIElements);
			},

			_unbindUIElements: function() {
				if (!this.ui || !this._uiBindings) {
					return;
				}

				// delete all of the existing ui bindings
				_.each(this.ui, function($el, name) {
					delete this.ui[name];
				}, this);

				// reset the ui element to the original bindings configuration
				this.ui = this._uiBindings;
				delete this._uiBindings;
			},

			// Internal method to create an event handler for a given `triggerDef` like
			// 'click:foo'
			_buildViewTrigger: function(triggerDef) {

				var options = _.defaults({}, triggerDef, {
					preventDefault: true,
					stopPropagation: true
				});

				var eventName = _.isObject(triggerDef) ? options.event : triggerDef;

				return function(e) {
					if (e) {
						if (e.preventDefault && options.preventDefault) {
							e.preventDefault();
						}

						if (e.stopPropagation && options.stopPropagation) {
							e.stopPropagation();
						}
					}

					var args = {
						view: this,
						model: this.model,
						collection: this.collection
					};

					this.triggerMethod(eventName, args);
				};
			},

			setElement: function() {
				var ret = Backbone.View.prototype.setElement.apply(this, arguments);

				// proxy behavior $el to the view's $el.
				// This is needed because a view's $el proxy
				// is not set until after setElement is called.
				_.invoke(this._behaviors, 'proxyViewProperties', this);

				return ret;
			},

			// import the `triggerMethod` to trigger events with corresponding
			// methods if the method exists
			triggerMethod: function() {
				var ret = Marionette._triggerMethod(this, arguments);

				this._triggerEventOnBehaviors(arguments);
				this._triggerEventOnParentLayout(arguments[0], _.rest(arguments));

				return ret;
			},

			_triggerEventOnBehaviors: function(args) {
				var triggerMethod = Marionette._triggerMethod;
				var behaviors = this._behaviors;
				// Use good ol' for as this is a very hot function
				for (var i = 0, length = behaviors && behaviors.length; i < length; i++) {
					triggerMethod(behaviors[i], args);
				}
			},

			_triggerEventOnParentLayout: function(eventName, args) {
				var layoutView = this._parentLayoutView();
				if (!layoutView) {
					return;
				}

				// invoke triggerMethod on parent view
				var eventPrefix = Marionette.getOption(layoutView, 'childViewEventPrefix');
				var prefixedEventName = eventPrefix + ':' + eventName;
				var callArgs = [this].concat(args);

				Marionette._triggerMethod(layoutView, prefixedEventName, callArgs);

				// call the parent view's childEvents handler
				var childEvents = Marionette.getOption(layoutView, 'childEvents');

				// since childEvents can be an object or a function use Marionette._getValue
				// to handle the abstaction for us.
				childEvents = Marionette._getValue(childEvents, layoutView);
				var normalizedChildEvents = layoutView.normalizeMethods(childEvents);

				if (normalizedChildEvents && _.isFunction(normalizedChildEvents[eventName])) {
					normalizedChildEvents[eventName].apply(layoutView, callArgs);
				}
			},

			// This method returns any views that are immediate
			// children of this view
			_getImmediateChildren: function() {
				return [];
			},

			// Returns an array of every nested view within this view
			_getNestedViews: function() {
				var children = this._getImmediateChildren();

				if (!children.length) {
					return children;
				}

				return _.reduce(children, function(memo, view) {
					if (!view._getNestedViews) {
						return memo;
					}
					return memo.concat(view._getNestedViews());
				}, children);
			},

			// Walk the _parent tree until we find a layout view (if one exists).
			// Returns the parent layout view hierarchically closest to this view.
			_parentLayoutView: function() {
				var parent = this._parent;

				while (parent) {
					if (parent instanceof Marionette.LayoutView) {
						return parent;
					}
					parent = parent._parent;
				}
			},

			// Imports the "normalizeMethods" to transform hashes of
			// events=>function references/names to a hash of events=>function references
			normalizeMethods: Marionette.normalizeMethods,

			// A handy way to merge passed-in options onto the instance
			mergeOptions: Marionette.mergeOptions,

			// Proxy `getOption` to enable getting options from this or this.options by name.
			getOption: Marionette.proxyGetOption,

			// Proxy `bindEntityEvents` to enable binding view's events from another entity.
			bindEntityEvents: Marionette.proxyBindEntityEvents,

			// Proxy `unbindEntityEvents` to enable unbinding view's events from another entity.
			unbindEntityEvents: Marionette.proxyUnbindEntityEvents
		});

		// Item View
		// ---------

		// A single item view implementation that contains code for rendering
		// with underscore.js templates, serializing the view's model or collection,
		// and calling several methods on extended views, such as `onRender`.
		Marionette.ItemView = Marionette.View.extend({

			// Setting up the inheritance chain which allows changes to
			// Marionette.View.prototype.constructor which allows overriding
			constructor: function() {
				Marionette.View.apply(this, arguments);
			},

			// Serialize the model or collection for the view. If a model is
			// found, the view's `serializeModel` is called. If a collection is found,
			// each model in the collection is serialized by calling
			// the view's `serializeCollection` and put into an `items` array in
			// the resulting data. If both are found, defaults to the model.
			// You can override the `serializeData` method in your own view definition,
			// to provide custom serialization for your view's data.
			serializeData: function() {
				if (!this.model && !this.collection) {
					return {};
				}

				var args = [this.model || this.collection];
				if (arguments.length) {
					args.push.apply(args, arguments);
				}

				if (this.model) {
					return this.serializeModel.apply(this, args);
				}
				else {
					return {
						items: this.serializeCollection.apply(this, args)
					};
				}
			},

			// Serialize a collection by serializing each of its models.
			serializeCollection: function(collection) {
				return collection.toJSON.apply(collection, _.rest(arguments));
			},

			// Render the view, defaulting to underscore.js templates.
			// You can override this in your view definition to provide
			// a very specific rendering for your view. In general, though,
			// you should override the `Marionette.Renderer` object to
			// change how Marionette renders views.
			render: function() {
				this._ensureViewIsIntact();

				this.triggerMethod('before:render', this);

				this._renderTemplate();
				this.isRendered = true;
				this.bindUIElements();

				this.triggerMethod('render', this);

				return this;
			},

			// Internal method to render the template with the serialized data
			// and template helpers via the `Marionette.Renderer` object.
			// Throws an `UndefinedTemplateError` error if the template is
			// any falsely value but literal `false`.
			_renderTemplate: function() {
				var template = this.getTemplate();

				// Allow template-less item views
				if (template === false) {
					return;
				}

				if (!template) {
					throw new Marionette.Error({
						name: 'UndefinedTemplateError',
						message: 'Cannot render the template since it is null or undefined.'
					});
				}

				// Add in entity data and template helpers
				var data = this.mixinTemplateHelpers(this.serializeData());

				// Render and add to el
				var html = Marionette.Renderer.render(template, data, this);
				this.attachElContent(html);

				return this;
			},

			// Attaches the content of a given view.
			// This method can be overridden to optimize rendering,
			// or to render in a non standard way.
			//
			// For example, using `innerHTML` instead of `$el.html`
			//
			// ```js
			// attachElContent: function(html) {
			//   this.el.innerHTML = html;
			//   return this;
			// }
			// ```
			attachElContent: function(html) {
				this.$el.html(html);

				return this;
			}
		});

		/* jshint maxstatements: 20, maxcomplexity: 7 */

		// Collection View
		// ---------------

		// A view that iterates over a Backbone.Collection
		// and renders an individual child view for each model.
		Marionette.CollectionView = Marionette.View.extend({

			// used as the prefix for child view events
			// that are forwarded through the collectionview
			childViewEventPrefix: 'childview',

			// flag for maintaining the sorted order of the collection
			sort: true,

			// constructor
			// option to pass `{sort: false}` to prevent the `CollectionView` from
			// maintaining the sorted order of the collection.
			// This will fallback onto appending childView's to the end.
			//
			// option to pass `{comparator: compFunction()}` to allow the `CollectionView`
			// to use a custom sort order for the collection.
			constructor: function(options) {
				this.once('render', this._initialEvents);
				this._initChildViewStorage();

				Marionette.View.apply(this, arguments);

				this.on({
					'before:show': this._onBeforeShowCalled,
					'show': this._onShowCalled,
					'before:attach': this._onBeforeAttachCalled,
					'attach': this._onAttachCalled
				});
				this.initRenderBuffer();
			},

			// Instead of inserting elements one by one into the page,
			// it's much more performant to insert elements into a document
			// fragment and then insert that document fragment into the page
			initRenderBuffer: function() {
				this._bufferedChildren = [];
			},

			startBuffering: function() {
				this.initRenderBuffer();
				this.isBuffering = true;
			},

			endBuffering: function() {
				// Only trigger attach if already shown and attached, otherwise Region#show() handles this.
				var canTriggerAttach = this._isShown && Marionette.isNodeAttached(this.el);
				var nestedViews;

				this.isBuffering = false;

				if (this._isShown) {
					this._triggerMethodMany(this._bufferedChildren, this, 'before:show');
				}
				if (canTriggerAttach && this._triggerBeforeAttach) {
					nestedViews = this._getNestedViews();
					this._triggerMethodMany(nestedViews, this, 'before:attach');
				}

				this.attachBuffer(this, this._createBuffer());

				if (canTriggerAttach && this._triggerAttach) {
					nestedViews = this._getNestedViews();
					this._triggerMethodMany(nestedViews, this, 'attach');
				}
				if (this._isShown) {
					this._triggerMethodMany(this._bufferedChildren, this, 'show');
				}
				this.initRenderBuffer();
			},

			_triggerMethodMany: function(targets, source, eventName) {
				var args = _.drop(arguments, 3);

				_.each(targets, function(target) {
					Marionette.triggerMethodOn.apply(target, [target, eventName, target, source].concat(args));
				});
			},

			// Configured the initial events that the collection view
			// binds to.
			_initialEvents: function() {
				if (this.collection) {
					this.listenTo(this.collection, 'add', this._onCollectionAdd);
					this.listenTo(this.collection, 'remove', this._onCollectionRemove);
					this.listenTo(this.collection, 'reset', this.render);

					if (this.getOption('sort')) {
						this.listenTo(this.collection, 'sort', this._sortViews);
					}
				}
			},

			// Handle a child added to the collection
			_onCollectionAdd: function(child, collection, opts) {
				// `index` is present when adding with `at` since BB 1.2; indexOf fallback for < 1.2
				var index = opts.at !== undefined && (opts.index || collection.indexOf(child));

				// When filtered or when there is no initial index, calculate index.
				if (this.getOption('filter') || index === false) {
					index = _.indexOf(this._filteredSortedModels(index), child);
				}

				if (this._shouldAddChild(child, index)) {
					this.destroyEmptyView();
					var ChildView = this.getChildView(child);
					this.addChild(child, ChildView, index);
				}
			},

			// get the child view by model it holds, and remove it
			_onCollectionRemove: function(model) {
				var view = this.children.findByModel(model);
				this.removeChildView(view);
				this.checkEmpty();
			},

			_onBeforeShowCalled: function() {
				// Reset attach event flags at the top of the Region#show() event lifecycle; if the Region's
				// show() options permit onBeforeAttach/onAttach events, these flags will be set true again.
				this._triggerBeforeAttach = this._triggerAttach = false;
				this.children.each(function(childView) {
					Marionette.triggerMethodOn(childView, 'before:show', childView);
				});
			},

			_onShowCalled: function() {
				this.children.each(function(childView) {
					Marionette.triggerMethodOn(childView, 'show', childView);
				});
			},

			// If during Region#show() onBeforeAttach was fired, continue firing it for child views
			_onBeforeAttachCalled: function() {
				this._triggerBeforeAttach = true;
			},

			// If during Region#show() onAttach was fired, continue firing it for child views
			_onAttachCalled: function() {
				this._triggerAttach = true;
			},

			// Render children views. Override this method to
			// provide your own implementation of a render function for
			// the collection view.
			render: function() {
				this._ensureViewIsIntact();
				this.triggerMethod('before:render', this);
				this._renderChildren();
				this.isRendered = true;
				this.triggerMethod('render', this);
				return this;
			},

			// Reorder DOM after sorting. When your element's rendering
			// do not use their index, you can pass reorderOnSort: true
			// to only reorder the DOM after a sort instead of rendering
			// all the collectionView
			reorder: function() {
				var children = this.children;
				var models = this._filteredSortedModels();

				if (!models.length && this._showingEmptyView) {
					return this;
				}

				var anyModelsAdded = _.some(models, function(model) {
					return !children.findByModel(model);
				});

				// If there are any new models added due to filtering
				// We need to add child views
				// So render as normal
				if (anyModelsAdded) {
					this.render();
				}
				else {
					// get the DOM nodes in the same order as the models
					var elsToReorder = _.map(models, function(model, index) {
						var view = children.findByModel(model);
						view._index = index;
						return view.el;
					});

					// find the views that were children before but arent in this new ordering
					var filteredOutViews = children.filter(function(view) {
						return !_.contains(elsToReorder, view.el);
					});

					this.triggerMethod('before:reorder');

					// since append moves elements that are already in the DOM,
					// appending the elements will effectively reorder them
					this._appendReorderedChildren(elsToReorder);

					// remove any views that have been filtered out
					_.each(filteredOutViews, this.removeChildView, this);
					this.checkEmpty();

					this.triggerMethod('reorder');
				}
			},

			// Render view after sorting. Override this method to
			// change how the view renders after a `sort` on the collection.
			// An example of this would be to only `renderChildren` in a `CompositeView`
			// rather than the full view.
			resortView: function() {
				if (Marionette.getOption(this, 'reorderOnSort')) {
					this.reorder();
				}
				else {
					this.render();
				}
			},

			// Internal method. This checks for any changes in the order of the collection.
			// If the index of any view doesn't match, it will render.
			_sortViews: function() {
				var models = this._filteredSortedModels();

				// check for any changes in sort order of views
				var orderChanged = _.find(models, function(item, index) {
					var view = this.children.findByModel(item);
					return !view || view._index !== index;
				}, this);

				if (orderChanged) {
					this.resortView();
				}
			},

			// Internal reference to what index a `emptyView` is.
			_emptyViewIndex: -1,

			// Internal method. Separated so that CompositeView can append to the childViewContainer
			// if necessary
			_appendReorderedChildren: function(children) {
				this.$el.append(children);
			},

			// Internal method. Separated so that CompositeView can have
			// more control over events being triggered, around the rendering
			// process
			_renderChildren: function() {
				this.destroyEmptyView();
				this.destroyChildren({checkEmpty: false});

				if (this.isEmpty(this.collection)) {
					this.showEmptyView();
				}
				else {
					this.triggerMethod('before:render:collection', this);
					this.startBuffering();
					this.showCollection();
					this.endBuffering();
					this.triggerMethod('render:collection', this);

					// If we have shown children and none have passed the filter, show the empty view
					if (this.children.isEmpty() && this.getOption('filter')) {
						this.showEmptyView();
					}
				}
			},

			// Internal method to loop through collection and show each child view.
			showCollection: function() {
				var ChildView;

				var models = this._filteredSortedModels();

				_.each(models, function(child, index) {
					ChildView = this.getChildView(child);
					this.addChild(child, ChildView, index);
				}, this);
			},

			// Allow the collection to be sorted by a custom view comparator
			_filteredSortedModels: function(addedAt) {
				var viewComparator = this.getViewComparator();
				var models = this.collection.models;
				addedAt = Math.min(Math.max(addedAt, 0), models.length - 1);

				if (viewComparator) {
					var addedModel;
					// Preserve `at` location, even for a sorted view
					if (addedAt) {
						addedModel = models[addedAt];
						models = models.slice(0, addedAt).concat(models.slice(addedAt + 1));
					}
					models = this._sortModelsBy(models, viewComparator);
					if (addedModel) {
						models.splice(addedAt, 0, addedModel);
					}
				}

				// Filter after sorting in case the filter uses the index
				if (this.getOption('filter')) {
					models = _.filter(models, function(model, index) {
						return this._shouldAddChild(model, index);
					}, this);
				}

				return models;
			},

			_sortModelsBy: function(models, comparator) {
				if (typeof comparator === 'string') {
					return _.sortBy(models, function(model) {
						return model.get(comparator);
					}, this);
				}
				else if (comparator.length === 1) {
					return _.sortBy(models, comparator, this);
				}
				else {
					return models.sort(_.bind(comparator, this));
				}
			},

			// Internal method to show an empty view in place of
			// a collection of child views, when the collection is empty
			showEmptyView: function() {
				var EmptyView = this.getEmptyView();

				if (EmptyView && !this._showingEmptyView) {
					this.triggerMethod('before:render:empty');

					this._showingEmptyView = true;
					var model = new Backbone.Model();
					this.addEmptyView(model, EmptyView);

					this.triggerMethod('render:empty');
				}
			},

			// Internal method to destroy an existing emptyView instance
			// if one exists. Called when a collection view has been
			// rendered empty, and then a child is added to the collection.
			destroyEmptyView: function() {
				if (this._showingEmptyView) {
					this.triggerMethod('before:remove:empty');

					this.destroyChildren();
					delete this._showingEmptyView;

					this.triggerMethod('remove:empty');
				}
			},

			// Retrieve the empty view class
			getEmptyView: function() {
				return this.getOption('emptyView');
			},

			// Render and show the emptyView. Similar to addChild method
			// but "add:child" events are not fired, and the event from
			// emptyView are not forwarded
			addEmptyView: function(child, EmptyView) {
				// Only trigger attach if already shown, attached, and not buffering, otherwise endBuffer() or
				// Region#show() handles this.
				var canTriggerAttach = this._isShown && !this.isBuffering && Marionette.isNodeAttached(this.el);
				var nestedViews;

				// get the emptyViewOptions, falling back to childViewOptions
				var emptyViewOptions = this.getOption('emptyViewOptions') ||
					this.getOption('childViewOptions');

				if (_.isFunction(emptyViewOptions)) {
					emptyViewOptions = emptyViewOptions.call(this, child, this._emptyViewIndex);
				}

				// build the empty view
				var view = this.buildChildView(child, EmptyView, emptyViewOptions);

				view._parent = this;

				// Proxy emptyView events
				this.proxyChildEvents(view);

				view.once('render', function() {
					// trigger the 'before:show' event on `view` if the collection view has already been shown
					if (this._isShown) {
						Marionette.triggerMethodOn(view, 'before:show', view);
					}

					// Trigger `before:attach` following `render` to avoid adding logic and event triggers
					// to public method `renderChildView()`.
					if (canTriggerAttach && this._triggerBeforeAttach) {
						nestedViews = this._getViewAndNested(view);
						this._triggerMethodMany(nestedViews, this, 'before:attach');
					}
				}, this);

				// Store the `emptyView` like a `childView` so we can properly remove and/or close it later
				this.children.add(view);
				this.renderChildView(view, this._emptyViewIndex);

				// Trigger `attach`
				if (canTriggerAttach && this._triggerAttach) {
					nestedViews = this._getViewAndNested(view);
					this._triggerMethodMany(nestedViews, this, 'attach');
				}
				// call the 'show' method if the collection view has already been shown
				if (this._isShown) {
					Marionette.triggerMethodOn(view, 'show', view);
				}
			},

			// Retrieve the `childView` class, either from `this.options.childView`
			// or from the `childView` in the object definition. The "options"
			// takes precedence.
			// This method receives the model that will be passed to the instance
			// created from this `childView`. Overriding methods may use the child
			// to determine what `childView` class to return.
			getChildView: function(child) {
				var childView = this.getOption('childView');

				if (!childView) {
					throw new Marionette.Error({
						name: 'NoChildViewError',
						message: 'A "childView" must be specified'
					});
				}

				return childView;
			},

			// Render the child's view and add it to the
			// HTML for the collection view at a given index.
			// This will also update the indices of later views in the collection
			// in order to keep the children in sync with the collection.
			addChild: function(child, ChildView, index) {
				var childViewOptions = this.getOption('childViewOptions');
				childViewOptions = Marionette._getValue(childViewOptions, this, [child, index]);

				var view = this.buildChildView(child, ChildView, childViewOptions);

				// increment indices of views after this one
				this._updateIndices(view, true, index);

				this.triggerMethod('before:add:child', view);
				this._addChildView(view, index);
				this.triggerMethod('add:child', view);

				view._parent = this;

				return view;
			},

			// Internal method. This decrements or increments the indices of views after the
			// added/removed view to keep in sync with the collection.
			_updateIndices: function(view, increment, index) {
				if (!this.getOption('sort')) {
					return;
				}

				if (increment) {
					// assign the index to the view
					view._index = index;
				}

				// update the indexes of views after this one
				this.children.each(function(laterView) {
					if (laterView._index >= view._index) {
						laterView._index += increment ? 1 : -1;
					}
				});
			},

			// Internal Method. Add the view to children and render it at
			// the given index.
			_addChildView: function(view, index) {
				// Only trigger attach if already shown, attached, and not buffering, otherwise endBuffer() or
				// Region#show() handles this.
				var canTriggerAttach = this._isShown && !this.isBuffering && Marionette.isNodeAttached(this.el);
				var nestedViews;

				// set up the child view event forwarding
				this.proxyChildEvents(view);

				view.once('render', function() {
					// trigger the 'before:show' event on `view` if the collection view has already been shown
					if (this._isShown && !this.isBuffering) {
						Marionette.triggerMethodOn(view, 'before:show', view);
					}

					// Trigger `before:attach` following `render` to avoid adding logic and event triggers
					// to public method `renderChildView()`.
					if (canTriggerAttach && this._triggerBeforeAttach) {
						nestedViews = this._getViewAndNested(view);
						this._triggerMethodMany(nestedViews, this, 'before:attach');
					}
				}, this);

				// Store the child view itself so we can properly remove and/or destroy it later
				this.children.add(view);
				this.renderChildView(view, index);

				// Trigger `attach`
				if (canTriggerAttach && this._triggerAttach) {
					nestedViews = this._getViewAndNested(view);
					this._triggerMethodMany(nestedViews, this, 'attach');
				}
				// Trigger `show`
				if (this._isShown && !this.isBuffering) {
					Marionette.triggerMethodOn(view, 'show', view);
				}
			},

			// render the child view
			renderChildView: function(view, index) {
				if (!view.supportsRenderLifecycle) {
					Marionette.triggerMethodOn(view, 'before:render', view);
				}
				view.render();
				if (!view.supportsRenderLifecycle) {
					Marionette.triggerMethodOn(view, 'render', view);
				}
				this.attachHtml(this, view, index);
				return view;
			},

			// Build a `childView` for a model in the collection.
			buildChildView: function(child, ChildViewClass, childViewOptions) {
				var options = _.extend({model: child}, childViewOptions);
				var childView = new ChildViewClass(options);
				Marionette.MonitorDOMRefresh(childView);
				return childView;
			},

			// Remove the child view and destroy it.
			// This function also updates the indices of
			// later views in the collection in order to keep
			// the children in sync with the collection.
			removeChildView: function(view) {
				if (!view) {
					return view;
				}

				this.triggerMethod('before:remove:child', view);

				if (!view.supportsDestroyLifecycle) {
					Marionette.triggerMethodOn(view, 'before:destroy', view);
				}
				// call 'destroy' or 'remove', depending on which is found
				if (view.destroy) {
					view.destroy();
				}
				else {
					view.remove();
				}
				if (!view.supportsDestroyLifecycle) {
					Marionette.triggerMethodOn(view, 'destroy', view);
				}

				delete view._parent;
				this.stopListening(view);
				this.children.remove(view);
				this.triggerMethod('remove:child', view);

				// decrement the index of views after this one
				this._updateIndices(view, false);

				return view;
			},

			// check if the collection is empty
			isEmpty: function() {
				return !this.collection || this.collection.length === 0;
			},

			// If empty, show the empty view
			checkEmpty: function() {
				if (this.isEmpty(this.collection)) {
					this.showEmptyView();
				}
			},

			// You might need to override this if you've overridden attachHtml
			attachBuffer: function(collectionView, buffer) {
				collectionView.$el.append(buffer);
			},

			// Create a fragment buffer from the currently buffered children
			_createBuffer: function() {
				var elBuffer = document.createDocumentFragment();
				_.each(this._bufferedChildren, function(b) {
					elBuffer.appendChild(b.el);
				});
				return elBuffer;
			},

			// Append the HTML to the collection's `el`.
			// Override this method to do something other
			// than `.append`.
			attachHtml: function(collectionView, childView, index) {
				if (collectionView.isBuffering) {
					// buffering happens on reset events and initial renders
					// in order to reduce the number of inserts into the
					// document, which are expensive.
					collectionView._bufferedChildren.splice(index, 0, childView);
				}
				else {
					// If we've already rendered the main collection, append
					// the new child into the correct order if we need to. Otherwise
					// append to the end.
					if (!collectionView._insertBefore(childView, index)) {
						collectionView._insertAfter(childView);
					}
				}
			},

			// Internal method. Check whether we need to insert the view into
			// the correct position.
			_insertBefore: function(childView, index) {
				var currentView;
				var findPosition = this.getOption('sort') && (index < this.children.length - 1);
				if (findPosition) {
					// Find the view after this one
					currentView = this.children.find(function(view) {
						return view._index === index + 1;
					});
				}

				if (currentView) {
					currentView.$el.before(childView.el);
					return true;
				}

				return false;
			},

			// Internal method. Append a view to the end of the $el
			_insertAfter: function(childView) {
				this.$el.append(childView.el);
			},

			// Internal method to set up the `children` object for
			// storing all of the child views
			_initChildViewStorage: function() {
				this.children = new Backbone.ChildViewContainer();
			},

			// Handle cleanup and other destroying needs for the collection of views
			destroy: function() {
				if (this.isDestroyed) {
					return this;
				}

				this.triggerMethod('before:destroy:collection');
				this.destroyChildren({checkEmpty: false});
				this.triggerMethod('destroy:collection');

				return Marionette.View.prototype.destroy.apply(this, arguments);
			},

			// Destroy the child views that this collection view
			// is holding on to, if any
			destroyChildren: function(options) {
				var destroyOptions = options || {};
				var shouldCheckEmpty = true;
				var childViews = this.children.map(_.identity);

				if (!_.isUndefined(destroyOptions.checkEmpty)) {
					shouldCheckEmpty = destroyOptions.checkEmpty;
				}

				this.children.each(this.removeChildView, this);

				if (shouldCheckEmpty) {
					this.checkEmpty();
				}
				return childViews;
			},

			// Return true if the given child should be shown
			// Return false otherwise
			// The filter will be passed (child, index, collection)
			// Where
			//  'child' is the given model
			//  'index' is the index of that model in the collection
			//  'collection' is the collection referenced by this CollectionView
			_shouldAddChild: function(child, index) {
				var filter = this.getOption('filter');
				return !_.isFunction(filter) || filter.call(this, child, index, this.collection);
			},

			// Set up the child view event forwarding. Uses a "childview:"
			// prefix in front of all forwarded events.
			proxyChildEvents: function(view) {
				var prefix = this.getOption('childViewEventPrefix');

				// Forward all child view events through the parent,
				// prepending "childview:" to the event name
				this.listenTo(view, 'all', function() {
					var args = _.toArray(arguments);
					var rootEvent = args[0];
					var childEvents = this.normalizeMethods(_.result(this, 'childEvents'));

					args[0] = prefix + ':' + rootEvent;
					args.splice(1, 0, view);

					// call collectionView childEvent if defined
					if (typeof childEvents !== 'undefined' && _.isFunction(childEvents[rootEvent])) {
						childEvents[rootEvent].apply(this, args.slice(1));
					}

					this.triggerMethod.apply(this, args);
				});
			},

			_getImmediateChildren: function() {
				return _.values(this.children._views);
			},

			_getViewAndNested: function(view) {
				// This will not fail on Backbone.View which does not have #_getNestedViews.
				return [view].concat(_.result(view, '_getNestedViews') || []);
			},

			getViewComparator: function() {
				return this.getOption('viewComparator');
			}
		});

		/* jshint maxstatements: 17, maxlen: 117 */

		// Composite View
		// --------------

		// Used for rendering a branch-leaf, hierarchical structure.
		// Extends directly from CollectionView and also renders an
		// a child view as `modelView`, for the top leaf
		Marionette.CompositeView = Marionette.CollectionView.extend({

			// Setting up the inheritance chain which allows changes to
			// Marionette.CollectionView.prototype.constructor which allows overriding
			// option to pass '{sort: false}' to prevent the CompositeView from
			// maintaining the sorted order of the collection.
			// This will fallback onto appending childView's to the end.
			constructor: function() {
				Marionette.CollectionView.apply(this, arguments);
			},

			// Configured the initial events that the composite view
			// binds to. Override this method to prevent the initial
			// events, or to add your own initial events.
			_initialEvents: function() {

				// Bind only after composite view is rendered to avoid adding child views
				// to nonexistent childViewContainer

				if (this.collection) {
					this.listenTo(this.collection, 'add', this._onCollectionAdd);
					this.listenTo(this.collection, 'remove', this._onCollectionRemove);
					this.listenTo(this.collection, 'reset', this._renderChildren);

					if (this.getOption('sort')) {
						this.listenTo(this.collection, 'sort', this._sortViews);
					}
				}
			},

			// Retrieve the `childView` to be used when rendering each of
			// the items in the collection. The default is to return
			// `this.childView` or Marionette.CompositeView if no `childView`
			// has been defined
			getChildView: function(child) {
				var childView = this.getOption('childView') || this.constructor;

				return childView;
			},

			// Serialize the model for the view.
			// You can override the `serializeData` method in your own view
			// definition, to provide custom serialization for your view's data.
			serializeData: function() {
				var data = {};

				if (this.model) {
					data = _.partial(this.serializeModel, this.model).apply(this, arguments);
				}

				return data;
			},

			// Renders the model and the collection.
			render: function() {
				this._ensureViewIsIntact();
				this._isRendering = true;
				this.resetChildViewContainer();

				this.triggerMethod('before:render', this);

				this._renderTemplate();
				this._renderChildren();

				this._isRendering = false;
				this.isRendered = true;
				this.triggerMethod('render', this);
				return this;
			},

			_renderChildren: function() {
				if (this.isRendered || this._isRendering) {
					Marionette.CollectionView.prototype._renderChildren.call(this);
				}
			},

			// Render the root template that the children
			// views are appended to
			_renderTemplate: function() {
				var data = {};
				data = this.serializeData();
				data = this.mixinTemplateHelpers(data);

				this.triggerMethod('before:render:template');

				var template = this.getTemplate();
				var html = Marionette.Renderer.render(template, data, this);
				this.attachElContent(html);

				// the ui bindings is done here and not at the end of render since they
				// will not be available until after the model is rendered, but should be
				// available before the collection is rendered.
				this.bindUIElements();
				this.triggerMethod('render:template');
			},

			// Attaches the content of the root.
			// This method can be overridden to optimize rendering,
			// or to render in a non standard way.
			//
			// For example, using `innerHTML` instead of `$el.html`
			//
			// ```js
			// attachElContent: function(html) {
			//   this.el.innerHTML = html;
			//   return this;
			// }
			// ```
			attachElContent: function(html) {
				this.$el.html(html);

				return this;
			},

			// You might need to override this if you've overridden attachHtml
			attachBuffer: function(compositeView, buffer) {
				var $container = this.getChildViewContainer(compositeView);
				$container.append(buffer);
			},

			// Internal method. Append a view to the end of the $el.
			// Overidden from CollectionView to ensure view is appended to
			// childViewContainer
			_insertAfter: function(childView) {
				var $container = this.getChildViewContainer(this, childView);
				$container.append(childView.el);
			},

			// Internal method. Append reordered childView'.
			// Overidden from CollectionView to ensure reordered views
			// are appended to childViewContainer
			_appendReorderedChildren: function(children) {
				var $container = this.getChildViewContainer(this);
				$container.append(children);
			},

			// Internal method to ensure an `$childViewContainer` exists, for the
			// `attachHtml` method to use.
			getChildViewContainer: function(containerView, childView) {
				if (!!containerView.$childViewContainer) {
					return containerView.$childViewContainer;
				}

				var container;
				var childViewContainer = Marionette.getOption(containerView, 'childViewContainer');
				if (childViewContainer) {

					var selector = Marionette._getValue(childViewContainer, containerView);

					if (selector.charAt(0) === '@' && containerView.ui) {
						container = containerView.ui[selector.substr(4)];
					}
					else {
						container = containerView.$(selector);
					}

					if (container.length <= 0) {
						throw new Marionette.Error({
							name: 'ChildViewContainerMissingError',
							message: 'The specified "childViewContainer" was not found: ' + containerView.childViewContainer
						});
					}

				}
				else {
					container = containerView.$el;
				}

				containerView.$childViewContainer = container;
				return container;
			},

			// Internal method to reset the `$childViewContainer` on render
			resetChildViewContainer: function() {
				if (this.$childViewContainer) {
					this.$childViewContainer = undefined;
				}
			}
		});

		// Layout View
		// -----------

		// Used for managing application layoutViews, nested layoutViews and
		// multiple regions within an application or sub-application.
		//
		// A specialized view class that renders an area of HTML and then
		// attaches `Region` instances to the specified `regions`.
		// Used for composite view management and sub-application areas.
		Marionette.LayoutView = Marionette.ItemView.extend({
			regionClass: Marionette.Region,

			options: {
				destroyImmediate: false
			},

			// used as the prefix for child view events
			// that are forwarded through the layoutview
			childViewEventPrefix: 'childview',

			// Ensure the regions are available when the `initialize` method
			// is called.
			constructor: function(options) {
				options = options || {};

				this._firstRender = true;
				this._initializeRegions(options);

				Marionette.ItemView.call(this, options);
			},

			// LayoutView's render will use the existing region objects the
			// first time it is called. Subsequent calls will destroy the
			// views that the regions are showing and then reset the `el`
			// for the regions to the newly rendered DOM elements.
			render: function() {
				this._ensureViewIsIntact();

				if (this._firstRender) {
					// if this is the first render, don't do anything to
					// reset the regions
					this._firstRender = false;
				}
				else {
					// If this is not the first render call, then we need to
					// re-initialize the `el` for each region
					this._reInitializeRegions();
				}

				return Marionette.ItemView.prototype.render.apply(this, arguments);
			},

			// Handle destroying regions, and then destroy the view itself.
			destroy: function() {
				if (this.isDestroyed) {
					return this;
				}
				// #2134: remove parent element before destroying the child views, so
				// removing the child views doesn't retrigger repaints
				if (this.getOption('destroyImmediate') === true) {
					this.$el.remove();
				}
				this.regionManager.destroy();
				return Marionette.ItemView.prototype.destroy.apply(this, arguments);
			},

			showChildView: function(regionName, view, options) {
				var region = this.getRegion(regionName);
				return region.show.apply(region, _.rest(arguments));
			},

			getChildView: function(regionName) {
				return this.getRegion(regionName).currentView;
			},

			// Add a single region, by name, to the layoutView
			addRegion: function(name, definition) {
				var regions = {};
				regions[name] = definition;
				return this._buildRegions(regions)[name];
			},

			// Add multiple regions as a {name: definition, name2: def2} object literal
			addRegions: function(regions) {
				this.regions = _.extend({}, this.regions, regions);
				return this._buildRegions(regions);
			},

			// Remove a single region from the LayoutView, by name
			removeRegion: function(name) {
				delete this.regions[name];
				return this.regionManager.removeRegion(name);
			},

			// Provides alternative access to regions
			// Accepts the region name
			// getRegion('main')
			getRegion: function(region) {
				return this.regionManager.get(region);
			},

			// Get all regions
			getRegions: function() {
				return this.regionManager.getRegions();
			},

			// internal method to build regions
			_buildRegions: function(regions) {
				var defaults = {
					regionClass: this.getOption('regionClass'),
					parentEl: _.partial(_.result, this, 'el')
				};

				return this.regionManager.addRegions(regions, defaults);
			},

			// Internal method to initialize the regions that have been defined in a
			// `regions` attribute on this layoutView.
			_initializeRegions: function(options) {
				var regions;
				this._initRegionManager();

				regions = Marionette._getValue(this.regions, this, [options]) || {};

				// Enable users to define `regions` as instance options.
				var regionOptions = this.getOption.call(options, 'regions');

				// enable region options to be a function
				regionOptions = Marionette._getValue(regionOptions, this, [options]);

				_.extend(regions, regionOptions);

				// Normalize region selectors hash to allow
				// a user to use the @ui. syntax.
				regions = this.normalizeUIValues(regions, ['selector', 'el']);

				this.addRegions(regions);
			},

			// Internal method to re-initialize all of the regions by updating the `el` that
			// they point to
			_reInitializeRegions: function() {
				this.regionManager.invoke('reset');
			},

			// Enable easy overriding of the default `RegionManager`
			// for customized region interactions and business specific
			// view logic for better control over single regions.
			getRegionManager: function() {
				return new Marionette.RegionManager();
			},

			// Internal method to initialize the region manager
			// and all regions in it
			_initRegionManager: function() {
				this.regionManager = this.getRegionManager();
				this.regionManager._parent = this;

				this.listenTo(this.regionManager, 'before:add:region', function(name) {
					this.triggerMethod('before:add:region', name);
				});

				this.listenTo(this.regionManager, 'add:region', function(name, region) {
					this[name] = region;
					this.triggerMethod('add:region', name, region);
				});

				this.listenTo(this.regionManager, 'before:remove:region', function(name) {
					this.triggerMethod('before:remove:region', name);
				});

				this.listenTo(this.regionManager, 'remove:region', function(name, region) {
					delete this[name];
					this.triggerMethod('remove:region', name, region);
				});
			},

			_getImmediateChildren: function() {
				return _.chain(this.regionManager.getRegions())
					.pluck('currentView')
					.compact()
					.value();
			}
		});


		// Behavior
		// --------

		// A Behavior is an isolated set of DOM /
		// user interactions that can be mixed into any View.
		// Behaviors allow you to blackbox View specific interactions
		// into portable logical chunks, keeping your views simple and your code DRY.

		Marionette.Behavior = Marionette.Object.extend({
			constructor: function(options, view) {
				// Setup reference to the view.
				// this comes in handle when a behavior
				// wants to directly talk up the chain
				// to the view.
				this.view = view;
				this.defaults = _.result(this, 'defaults') || {};
				this.options = _.extend({}, this.defaults, options);
				// Construct an internal UI hash using
				// the views UI hash and then the behaviors UI hash.
				// This allows the user to use UI hash elements
				// defined in the parent view as well as those
				// defined in the given behavior.
				this.ui = _.extend({}, _.result(view, 'ui'), _.result(this, 'ui'));

				Marionette.Object.apply(this, arguments);
			},

			// proxy behavior $ method to the view
			// this is useful for doing jquery DOM lookups
			// scoped to behaviors view.
			$: function() {
				return this.view.$.apply(this.view, arguments);
			},

			// Stops the behavior from listening to events.
			// Overrides Object#destroy to prevent additional events from being triggered.
			destroy: function() {
				this.stopListening();

				return this;
			},

			proxyViewProperties: function(view) {
				this.$el = view.$el;
				this.el = view.el;
			}
		});

		/* jshint maxlen: 143 */
		// Behaviors
		// ---------

		// Behaviors is a utility class that takes care of
		// gluing your behavior instances to their given View.
		// The most important part of this class is that you
		// **MUST** override the class level behaviorsLookup
		// method for things to work properly.

		Marionette.Behaviors = (function(Marionette, _) {
			// Borrow event splitter from Backbone
			var delegateEventSplitter = /^(\S+)\s*(.*)$/;

			function Behaviors(view, behaviors) {

				if (!_.isObject(view.behaviors)) {
					return {};
				}

				// Behaviors defined on a view can be a flat object literal
				// or it can be a function that returns an object.
				behaviors = Behaviors.parseBehaviors(view, behaviors || _.result(view, 'behaviors'));

				// Wraps several of the view's methods
				// calling the methods first on each behavior
				// and then eventually calling the method on the view.
				Behaviors.wrap(view, behaviors, _.keys(methods));
				return behaviors;
			}

			var methods = {
				behaviorTriggers: function(behaviorTriggers, behaviors) {
					var triggerBuilder = new BehaviorTriggersBuilder(this, behaviors);
					return triggerBuilder.buildBehaviorTriggers();
				},

				behaviorEvents: function(behaviorEvents, behaviors) {
					var _behaviorsEvents = {};

					_.each(behaviors, function(b, i) {
						var _events = {};
						var behaviorEvents = _.clone(_.result(b, 'events')) || {};

						// Normalize behavior events hash to allow
						// a user to use the @ui. syntax.
						behaviorEvents = Marionette.normalizeUIKeys(behaviorEvents, getBehaviorsUI(b));

						var j = 0;
						_.each(behaviorEvents, function(behaviour, key) {
							var match = key.match(delegateEventSplitter);

							// Set event name to be namespaced using the view cid,
							// the behavior index, and the behavior event index
							// to generate a non colliding event namespace
							// http://api.jquery.com/event.namespace/
							var eventName = match[1] + '.' + [this.cid, i, j++, ' '].join('');
							var selector = match[2];

							var eventKey = eventName + selector;
							var handler = _.isFunction(behaviour) ? behaviour : b[behaviour];
							if (!handler) {
								return;
							}
							_events[eventKey] = _.bind(handler, b);
						}, this);

						_behaviorsEvents = _.extend(_behaviorsEvents, _events);
					}, this);

					return _behaviorsEvents;
				}
			};

			_.extend(Behaviors, {

				// Placeholder method to be extended by the user.
				// The method should define the object that stores the behaviors.
				// i.e.
				//
				// ```js
				// Marionette.Behaviors.behaviorsLookup: function() {
				//   return App.Behaviors
				// }
				// ```
				behaviorsLookup: function() {
					throw new Marionette.Error({
						message: 'You must define where your behaviors are stored.',
						url: 'marionette.behaviors.html#behaviorslookup'
					});
				},

				// Takes care of getting the behavior class
				// given options and a key.
				// If a user passes in options.behaviorClass
				// default to using that. Otherwise delegate
				// the lookup to the users `behaviorsLookup` implementation.
				getBehaviorClass: function(options, key) {
					if (options.behaviorClass) {
						return options.behaviorClass;
					}

					// Get behavior class can be either a flat object or a method
					return Marionette._getValue(Behaviors.behaviorsLookup, this, [options, key])[key];
				},

				// Iterate over the behaviors object, for each behavior
				// instantiate it and get its grouped behaviors.
				parseBehaviors: function(view, behaviors) {
					return _.chain(behaviors).map(function(options, key) {
						var BehaviorClass = Behaviors.getBehaviorClass(options, key);

						var behavior = new BehaviorClass(options, view);
						var nestedBehaviors = Behaviors.parseBehaviors(view, _.result(behavior, 'behaviors'));

						return [behavior].concat(nestedBehaviors);
					}).flatten().value();
				},

				// Wrap view internal methods so that they delegate to behaviors. For example,
				// `onDestroy` should trigger destroy on all of the behaviors and then destroy itself.
				// i.e.
				//
				// `view.delegateEvents = _.partial(methods.delegateEvents, view.delegateEvents, behaviors);`
				wrap: function(view, behaviors, methodNames) {
					_.each(methodNames, function(methodName) {
						view[methodName] = _.partial(methods[methodName], view[methodName], behaviors);
					});
				}
			});

			// Class to build handlers for `triggers` on behaviors
			// for views
			function BehaviorTriggersBuilder(view, behaviors) {
				this._view = view;
				this._behaviors = behaviors;
				this._triggers = {};
			}

			_.extend(BehaviorTriggersBuilder.prototype, {
				// Main method to build the triggers hash with event keys and handlers
				buildBehaviorTriggers: function() {
					_.each(this._behaviors, this._buildTriggerHandlersForBehavior, this);
					return this._triggers;
				},

				// Internal method to build all trigger handlers for a given behavior
				_buildTriggerHandlersForBehavior: function(behavior, i) {
					var triggersHash = _.clone(_.result(behavior, 'triggers')) || {};

					triggersHash = Marionette.normalizeUIKeys(triggersHash, getBehaviorsUI(behavior));

					_.each(triggersHash, _.bind(this._setHandlerForBehavior, this, behavior, i));
				},

				// Internal method to create and assign the trigger handler for a given
				// behavior
				_setHandlerForBehavior: function(behavior, i, eventName, trigger) {
					// Unique identifier for the `this._triggers` hash
					var triggerKey = trigger.replace(/^\S+/, function(triggerName) {
						return triggerName + '.' + 'behaviortriggers' + i;
					});

					this._triggers[triggerKey] = this._view._buildViewTrigger(eventName);
				}
			});

			function getBehaviorsUI(behavior) {
				return behavior._uiBindings || behavior.ui;
			}

			return Behaviors;

		})(Marionette, _);


		// App Router
		// ----------

		// Reduce the boilerplate code of handling route events
		// and then calling a single method on another object.
		// Have your routers configured to call the method on
		// your object, directly.
		//
		// Configure an AppRouter with `appRoutes`.
		//
		// App routers can only take one `controller` object.
		// It is recommended that you divide your controller
		// objects in to smaller pieces of related functionality
		// and have multiple routers / controllers, instead of
		// just one giant router and controller.
		//
		// You can also add standard routes to an AppRouter.

		Marionette.AppRouter = Backbone.Router.extend({

			constructor: function(options) {
				this.options = options || {};

				Backbone.Router.apply(this, arguments);

				var appRoutes = this.getOption('appRoutes');
				var controller = this._getController();
				this.processAppRoutes(controller, appRoutes);
				this.on('route', this._processOnRoute, this);
			},

			// Similar to route method on a Backbone Router but
			// method is called on the controller
			appRoute: function(route, methodName) {
				var controller = this._getController();
				this._addAppRoute(controller, route, methodName);
			},

			// process the route event and trigger the onRoute
			// method call, if it exists
			_processOnRoute: function(routeName, routeArgs) {
				// make sure an onRoute before trying to call it
				if (_.isFunction(this.onRoute)) {
					// find the path that matches the current route
					var routePath = _.invert(this.getOption('appRoutes'))[routeName];
					this.onRoute(routeName, routePath, routeArgs);
				}
			},

			// Internal method to process the `appRoutes` for the
			// router, and turn them in to routes that trigger the
			// specified method on the specified `controller`.
			processAppRoutes: function(controller, appRoutes) {
				if (!appRoutes) {
					return;
				}

				var routeNames = _.keys(appRoutes).reverse(); // Backbone requires reverted order of routes

				_.each(routeNames, function(route) {
					this._addAppRoute(controller, route, appRoutes[route]);
				}, this);
			},

			_getController: function() {
				return this.getOption('controller');
			},

			_addAppRoute: function(controller, route, methodName) {
				var method = controller[methodName];

				if (!method) {
					throw new Marionette.Error('Method "' + methodName + '" was not found on the controller');
				}

				this.route(route, methodName, _.bind(method, controller));
			},

			mergeOptions: Marionette.mergeOptions,

			// Proxy `getOption` to enable getting options from this or this.options by name.
			getOption: Marionette.proxyGetOption,

			triggerMethod: Marionette.triggerMethod,

			bindEntityEvents: Marionette.proxyBindEntityEvents,

			unbindEntityEvents: Marionette.proxyUnbindEntityEvents
		});

		// Application
		// -----------

		// Contain and manage the composite application as a whole.
		// Stores and starts up `Region` objects, includes an
		// event aggregator as `app.vent`
		Marionette.Application = Marionette.Object.extend({
			constructor: function(options) {
				this._initializeRegions(options);
				this._initCallbacks = new Marionette.Callbacks();
				this.submodules = {};
				_.extend(this, options);
				this._initChannel();
				Marionette.Object.apply(this, arguments);
			},

			// Command execution, facilitated by Backbone.Wreqr.Commands
			execute: function() {
				this.commands.execute.apply(this.commands, arguments);
			},

			// Request/response, facilitated by Backbone.Wreqr.RequestResponse
			request: function() {
				return this.reqres.request.apply(this.reqres, arguments);
			},

			// Add an initializer that is either run at when the `start`
			// method is called, or run immediately if added after `start`
			// has already been called.
			addInitializer: function(initializer) {
				this._initCallbacks.add(initializer);
			},

			// kick off all of the application's processes.
			// initializes all of the regions that have been added
			// to the app, and runs all of the initializer functions
			start: function(options) {
				this.triggerMethod('before:start', options);
				this._initCallbacks.run(options, this);
				this.triggerMethod('start', options);
			},

			// Add regions to your app.
			// Accepts a hash of named strings or Region objects
			// addRegions({something: "#someRegion"})
			// addRegions({something: Region.extend({el: "#someRegion"}) });
			addRegions: function(regions) {
				return this._regionManager.addRegions(regions);
			},

			// Empty all regions in the app, without removing them
			emptyRegions: function() {
				return this._regionManager.emptyRegions();
			},

			// Removes a region from your app, by name
			// Accepts the regions name
			// removeRegion('myRegion')
			removeRegion: function(region) {
				return this._regionManager.removeRegion(region);
			},

			// Provides alternative access to regions
			// Accepts the region name
			// getRegion('main')
			getRegion: function(region) {
				return this._regionManager.get(region);
			},

			// Get all the regions from the region manager
			getRegions: function() {
				return this._regionManager.getRegions();
			},

			// Create a module, attached to the application
			module: function(moduleNames, moduleDefinition) {

				// Overwrite the module class if the user specifies one
				var ModuleClass = Marionette.Module.getClass(moduleDefinition);

				var args = _.toArray(arguments);
				args.unshift(this);

				// see the Marionette.Module object for more information
				return ModuleClass.create.apply(ModuleClass, args);
			},

			// Enable easy overriding of the default `RegionManager`
			// for customized region interactions and business-specific
			// view logic for better control over single regions.
			getRegionManager: function() {
				return new Marionette.RegionManager();
			},

			// Internal method to initialize the regions that have been defined in a
			// `regions` attribute on the application instance
			_initializeRegions: function(options) {
				var regions = _.isFunction(this.regions) ? this.regions(options) : this.regions || {};

				this._initRegionManager();

				// Enable users to define `regions` in instance options.
				var optionRegions = Marionette.getOption(options, 'regions');

				// Enable region options to be a function
				if (_.isFunction(optionRegions)) {
					optionRegions = optionRegions.call(this, options);
				}

				// Overwrite current regions with those passed in options
				_.extend(regions, optionRegions);

				this.addRegions(regions);

				return this;
			},

			// Internal method to set up the region manager
			_initRegionManager: function() {
				this._regionManager = this.getRegionManager();
				this._regionManager._parent = this;

				this.listenTo(this._regionManager, 'before:add:region', function() {
					Marionette._triggerMethod(this, 'before:add:region', arguments);
				});

				this.listenTo(this._regionManager, 'add:region', function(name, region) {
					this[name] = region;
					Marionette._triggerMethod(this, 'add:region', arguments);
				});

				this.listenTo(this._regionManager, 'before:remove:region', function() {
					Marionette._triggerMethod(this, 'before:remove:region', arguments);
				});

				this.listenTo(this._regionManager, 'remove:region', function(name) {
					delete this[name];
					Marionette._triggerMethod(this, 'remove:region', arguments);
				});
			},

			// Internal method to setup the Wreqr.radio channel
			_initChannel: function() {
				this.channelName = _.result(this, 'channelName') || 'global';
				this.channel = _.result(this, 'channel') || Backbone.Wreqr.radio.channel(this.channelName);
				this.vent = _.result(this, 'vent') || this.channel.vent;
				this.commands = _.result(this, 'commands') || this.channel.commands;
				this.reqres = _.result(this, 'reqres') || this.channel.reqres;
			}
		});

		/* jshint maxparams: 9 */

		// Module
		// ------

		// A simple module system, used to create privacy and encapsulation in
		// Marionette applications
		Marionette.Module = function(moduleName, app, options) {
			this.moduleName = moduleName;
			this.options = _.extend({}, this.options, options);
			// Allow for a user to overide the initialize
			// for a given module instance.
			this.initialize = options.initialize || this.initialize;

			// Set up an internal store for sub-modules.
			this.submodules = {};

			this._setupInitializersAndFinalizers();

			// Set an internal reference to the app
			// within a module.
			this.app = app;

			if (_.isFunction(this.initialize)) {
				this.initialize(moduleName, app, this.options);
			}
		};

		Marionette.Module.extend = Marionette.extend;

		// Extend the Module prototype with events / listenTo, so that the module
		// can be used as an event aggregator or pub/sub.
		_.extend(Marionette.Module.prototype, Backbone.Events, {

			// By default modules start with their parents.
			startWithParent: true,

			// Initialize is an empty function by default. Override it with your own
			// initialization logic when extending Marionette.Module.
			initialize: function() {
			},

			// Initializer for a specific module. Initializers are run when the
			// module's `start` method is called.
			addInitializer: function(callback) {
				this._initializerCallbacks.add(callback);
			},

			// Finalizers are run when a module is stopped. They are used to teardown
			// and finalize any variables, references, events and other code that the
			// module had set up.
			addFinalizer: function(callback) {
				this._finalizerCallbacks.add(callback);
			},

			// Start the module, and run all of its initializers
			start: function(options) {
				// Prevent re-starting a module that is already started
				if (this._isInitialized) {
					return;
				}

				// start the sub-modules (depth-first hierarchy)
				_.each(this.submodules, function(mod) {
					// check to see if we should start the sub-module with this parent
					if (mod.startWithParent) {
						mod.start(options);
					}
				});

				// run the callbacks to "start" the current module
				this.triggerMethod('before:start', options);

				this._initializerCallbacks.run(options, this);
				this._isInitialized = true;

				this.triggerMethod('start', options);
			},

			// Stop this module by running its finalizers and then stop all of
			// the sub-modules for this module
			stop: function() {
				// if we are not initialized, don't bother finalizing
				if (!this._isInitialized) {
					return;
				}
				this._isInitialized = false;

				this.triggerMethod('before:stop');

				// stop the sub-modules; depth-first, to make sure the
				// sub-modules are stopped / finalized before parents
				_.invoke(this.submodules, 'stop');

				// run the finalizers
				this._finalizerCallbacks.run(undefined, this);

				// reset the initializers and finalizers
				this._initializerCallbacks.reset();
				this._finalizerCallbacks.reset();

				this.triggerMethod('stop');
			},

			// Configure the module with a definition function and any custom args
			// that are to be passed in to the definition function
			addDefinition: function(moduleDefinition, customArgs) {
				this._runModuleDefinition(moduleDefinition, customArgs);
			},

			// Internal method: run the module definition function with the correct
			// arguments
			_runModuleDefinition: function(definition, customArgs) {
				// If there is no definition short circut the method.
				if (!definition) {
					return;
				}

				// build the correct list of arguments for the module definition
				var args = _.flatten([
					this,
					this.app,
					Backbone,
					Marionette,
					Backbone.$, _,
					customArgs
				]);

				definition.apply(this, args);
			},

			// Internal method: set up new copies of initializers and finalizers.
			// Calling this method will wipe out all existing initializers and
			// finalizers.
			_setupInitializersAndFinalizers: function() {
				this._initializerCallbacks = new Marionette.Callbacks();
				this._finalizerCallbacks = new Marionette.Callbacks();
			},

			// import the `triggerMethod` to trigger events with corresponding
			// methods if the method exists
			triggerMethod: Marionette.triggerMethod
		});

		// Class methods to create modules
		_.extend(Marionette.Module, {

			// Create a module, hanging off the app parameter as the parent object.
			create: function(app, moduleNames, moduleDefinition) {
				var module = app;

				// get the custom args passed in after the module definition and
				// get rid of the module name and definition function
				var customArgs = _.drop(arguments, 3);

				// Split the module names and get the number of submodules.
				// i.e. an example module name of `Doge.Wow.Amaze` would
				// then have the potential for 3 module definitions.
				moduleNames = moduleNames.split('.');
				var length = moduleNames.length;

				// store the module definition for the last module in the chain
				var moduleDefinitions = [];
				moduleDefinitions[length - 1] = moduleDefinition;

				// Loop through all the parts of the module definition
				_.each(moduleNames, function(moduleName, i) {
					var parentModule = module;
					module = this._getModule(parentModule, moduleName, app, moduleDefinition);
					this._addModuleDefinition(parentModule, module, moduleDefinitions[i], customArgs);
				}, this);

				// Return the last module in the definition chain
				return module;
			},

			_getModule: function(parentModule, moduleName, app, def, args) {
				var options = _.extend({}, def);
				var ModuleClass = this.getClass(def);

				// Get an existing module of this name if we have one
				var module = parentModule[moduleName];

				if (!module) {
					// Create a new module if we don't have one
					module = new ModuleClass(moduleName, app, options);
					parentModule[moduleName] = module;
					// store the module on the parent
					parentModule.submodules[moduleName] = module;
				}

				return module;
			},

			// ## Module Classes
			//
			// Module classes can be used as an alternative to the define pattern.
			// The extend function of a Module is identical to the extend functions
			// on other Backbone and Marionette classes.
			// This allows module lifecyle events like `onStart` and `onStop` to be called directly.
			getClass: function(moduleDefinition) {
				var ModuleClass = Marionette.Module;

				if (!moduleDefinition) {
					return ModuleClass;
				}

				// If all of the module's functionality is defined inside its class,
				// then the class can be passed in directly. `MyApp.module("Foo", FooModule)`.
				if (moduleDefinition.prototype instanceof ModuleClass) {
					return moduleDefinition;
				}

				return moduleDefinition.moduleClass || ModuleClass;
			},

			// Add the module definition and add a startWithParent initializer function.
			// This is complicated because module definitions are heavily overloaded
			// and support an anonymous function, module class, or options object
			_addModuleDefinition: function(parentModule, module, def, args) {
				var fn = this._getDefine(def);
				var startWithParent = this._getStartWithParent(def, module);

				if (fn) {
					module.addDefinition(fn, args);
				}

				this._addStartWithParent(parentModule, module, startWithParent);
			},

			_getStartWithParent: function(def, module) {
				var swp;

				if (_.isFunction(def) && (def.prototype instanceof Marionette.Module)) {
					swp = module.constructor.prototype.startWithParent;
					return _.isUndefined(swp) ? true : swp;
				}

				if (_.isObject(def)) {
					swp = def.startWithParent;
					return _.isUndefined(swp) ? true : swp;
				}

				return true;
			},

			_getDefine: function(def) {
				if (_.isFunction(def) && !(def.prototype instanceof Marionette.Module)) {
					return def;
				}

				if (_.isObject(def)) {
					return def.define;
				}

				return null;
			},

			_addStartWithParent: function(parentModule, module, startWithParent) {
				module.startWithParent = module.startWithParent && startWithParent;

				if (!module.startWithParent || !!module.startWithParentIsConfigured) {
					return;
				}

				module.startWithParentIsConfigured = true;

				parentModule.addInitializer(function(options) {
					if (module.startWithParent) {
						module.start(options);
					}
				});
			}
		});


		return Marionette;
	}));


/***/ },
/* 9 */
/***/ function(module, exports) {

	function WreqrNull() {

	}

	module.exports = WreqrNull;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// Backbone.BabySitter
	// -------------------
	// v0.1.10
	//
	// Copyright (c)2015 Derick Bailey, Muted Solutions, LLC.
	// Distributed under MIT license
	//
	// http://github.com/marionettejs/backbone.babysitter

	(function(root, factory) {

		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(3), __webpack_require__(5)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Backbone, _) {
				return factory(Backbone, _);
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
		else if (typeof exports !== 'undefined') {
			var Backbone = require('backbone');
			var _ = require('underscore');
			module.exports = factory(Backbone, _);
		}
		else {
			factory(root.Backbone, root._);
		}

	}(this, function(Backbone, _) {
		'use strict';

		var previousChildViewContainer = Backbone.ChildViewContainer;

		// BabySitter.ChildViewContainer
		// -----------------------------
		//
		// Provide a container to store, retrieve and
		// shut down child views.

		Backbone.ChildViewContainer = (function(Backbone, _) {

			// Container Constructor
			// ---------------------

			var Container = function(views) {
				this._views = {};
				this._indexByModel = {};
				this._indexByCustom = {};
				this._updateLength();

				_.each(views, this.add, this);
			};

			// Container Methods
			// -----------------

			_.extend(Container.prototype, {

				// Add a view to this container. Stores the view
				// by `cid` and makes it searchable by the model
				// cid (and model itself). Optionally specify
				// a custom key to store an retrieve the view.
				add: function(view, customIndex) {
					var viewCid = view.cid;

					// store the view
					this._views[viewCid] = view;

					// index it by model
					if (view.model) {
						this._indexByModel[view.model.cid] = viewCid;
					}

					// index by custom
					if (customIndex) {
						this._indexByCustom[customIndex] = viewCid;
					}

					this._updateLength();
					return this;
				},

				// Find a view by the model that was attached to
				// it. Uses the model's `cid` to find it.
				findByModel: function(model) {
					return this.findByModelCid(model.cid);
				},

				// Find a view by the `cid` of the model that was attached to
				// it. Uses the model's `cid` to find the view `cid` and
				// retrieve the view using it.
				findByModelCid: function(modelCid) {
					var viewCid = this._indexByModel[modelCid];
					return this.findByCid(viewCid);
				},

				// Find a view by a custom indexer.
				findByCustom: function(index) {
					var viewCid = this._indexByCustom[index];
					return this.findByCid(viewCid);
				},

				// Find by index. This is not guaranteed to be a
				// stable index.
				findByIndex: function(index) {
					return _.values(this._views)[index];
				},

				// retrieve a view by its `cid` directly
				findByCid: function(cid) {
					return this._views[cid];
				},

				// Remove a view
				remove: function(view) {
					var viewCid = view.cid;

					// delete model index
					if (view.model) {
						delete this._indexByModel[view.model.cid];
					}

					// delete custom index
					_.any(this._indexByCustom, function(cid, key) {
						if (cid === viewCid) {
							delete this._indexByCustom[key];
							return true;
						}
					}, this);

					// remove the view from the container
					delete this._views[viewCid];

					// update the length
					this._updateLength();
					return this;
				},

				// Call a method on every view in the container,
				// passing parameters to the call method one at a
				// time, like `function.call`.
				call: function(method) {
					this.apply(method, _.tail(arguments));
				},

				// Apply a method on every view in the container,
				// passing parameters to the call method one at a
				// time, like `function.apply`.
				apply: function(method, args) {
					_.each(this._views, function(view) {
						if (_.isFunction(view[method])) {
							view[method].apply(view, args || []);
						}
					});
				},

				// Update the `.length` attribute on this container
				_updateLength: function() {
					this.length = _.size(this._views);
				}
			});

			// Borrowing this code from Backbone.Collection:
			// http://backbonejs.org/docs/backbone.html#section-106
			//
			// Mix in methods from Underscore, for iteration, and other
			// collection related features.
			var methods = ['forEach', 'each', 'map', 'find', 'detect', 'filter',
				'select', 'reject', 'every', 'all', 'some', 'any', 'include',
				'contains', 'invoke', 'toArray', 'first', 'initial', 'rest',
				'last', 'without', 'isEmpty', 'pluck', 'reduce'];

			_.each(methods, function(method) {
				Container.prototype[method] = function() {
					var views = _.values(this._views);
					var args = [views].concat(_.toArray(arguments));
					return _[method].apply(_, args);
				};
			});

			// return the public API
			return Container;
		})(Backbone, _);


		Backbone.ChildViewContainer.VERSION = '0.1.10';

		Backbone.ChildViewContainer.noConflict = function() {
			Backbone.ChildViewContainer = previousChildViewContainer;
			return this;
		};

		return Backbone.ChildViewContainer;

	}));


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// Backbone.Radio v1.0.2
	(function(global, factory) {
		 true ? module.exports = factory(__webpack_require__(5), __webpack_require__(3)) : typeof define === "function" && define.amd ? define(["underscore", "backbone"], factory) : global.Backbone.Radio = factory(global._, global.Backbone);
	})(this, function(_, Backbone) {


		var previousRadio = Backbone.Radio;

		var Radio = Backbone.Radio = {};

		Radio.VERSION = "1.0.2";

		// This allows you to run multiple instances of Radio on the same
		// webapp. After loading the new version, call `noConflict()` to
		// get a reference to it. At the same time the old version will be
		// returned to Backbone.Radio.
		Radio.noConflict = function() {
			Backbone.Radio = previousRadio;
			return this;
		};

		// Whether or not we're in DEBUG mode or not. DEBUG mode helps you
		// get around the issues of lack of warnings when events are mis-typed.
		Radio.DEBUG = false;

		// Format debug text.
		Radio._debugText = function(warning, eventName, channelName) {
			return warning + (channelName ? " on the " + channelName + " channel" : "") + ": \"" + eventName + "\"";
		};

		// This is the method that's called when an unregistered event was called.
		// By default, it logs warning to the console. By overriding this you could
		// make it throw an Error, for instance. This would make firing a nonexistent event
		// have the same consequence as firing a nonexistent method on an Object.
		Radio.debugLog = function(warning, eventName, channelName) {
			if (Radio.DEBUG && console && console.warn) {
				console.warn(Radio._debugText(warning, eventName, channelName));
			}
		};

		var eventSplitter = /\s+/;

		// An internal method used to handle Radio's method overloading for Requests.
		// It's borrowed from Backbone.Events. It differs from Backbone's overload
		// API (which is used in Backbone.Events) in that it doesn't support space-separated
		// event names.
		Radio._eventsApi = function(obj, action, name, rest) {
			if (!name) {
				return false;
			}

			var results = {};

			// Handle event maps.
			if (typeof name === "object") {
				for (var key in name) {
					var result = obj[action].apply(obj, [key, name[key]].concat(rest));
					eventSplitter.test(key) ? _.extend(results, result) : results[key] = result;
				}
				return results;
			}

			// Handle space separated event names.
			if (eventSplitter.test(name)) {
				var names = name.split(eventSplitter);
				for (var i = 0, l = names.length; i < l; i++) {
					results[names[i]] = obj[action].apply(obj, [names[i]].concat(rest));
				}
				return results;
			}

			return false;
		};

		// An optimized way to execute callbacks.
		Radio._callHandler = function(callback, context, args) {
			var a1 = args[0],
				a2 = args[1],
				a3 = args[2];
			switch (args.length) {
				case 0:
					return callback.call(context);
				case 1:
					return callback.call(context, a1);
				case 2:
					return callback.call(context, a1, a2);
				case 3:
					return callback.call(context, a1, a2, a3);
				default:
					return callback.apply(context, args);
			}
		};

		// A helper used by `off` methods to the handler from the store
		function removeHandler(store, name, callback, context) {
			var event = store[name];
			if ((!callback || (callback === event.callback || callback === event.callback._callback)) && (!context || context === event.context)) {
				delete store[name];
				return true;
			}
		}

		function removeHandlers(store, name, callback, context) {
			store || (store = {});
			var names = name ? [name] : _.keys(store);
			var matched = false;

			for (var i = 0, length = names.length; i < length; i++) {
				name = names[i];

				// If there's no event by this name, log it and continue
				// with the loop
				if (!store[name]) {
					continue;
				}

				if (removeHandler(store, name, callback, context)) {
					matched = true;
				}
			}

			return matched;
		}

		/*
		 * tune-in
		 * -------
		 * Get console logs of a channel's activity
		 *
		 */

		var _logs = {};

		// This is to produce an identical function in both tuneIn and tuneOut,
		// so that Backbone.Events unregisters it.
		function _partial(channelName) {
			return _logs[channelName] || (_logs[channelName] = _.partial(Radio.log, channelName));
		}

		_.extend(Radio, {

			// Log information about the channel and event
			log: function log(channelName, eventName) {
				var args = _.rest(arguments, 2);
				console.log("[" + channelName + "] \"" + eventName + "\"", args);
			},

			// Logs all events on this channel to the console. It sets an
			// internal value on the channel telling it we're listening,
			// then sets a listener on the Backbone.Events
			tuneIn: function tuneIn(channelName) {
				var channel = Radio.channel(channelName);
				channel._tunedIn = true;
				channel.on("all", _partial(channelName));
				return this;
			},

			// Stop logging all of the activities on this channel to the console
			tuneOut: function tuneOut(channelName) {
				var channel = Radio.channel(channelName);
				channel._tunedIn = false;
				channel.off("all", _partial(channelName));
				delete _logs[channelName];
				return this;
			}
		});

		/*
		 * Backbone.Radio.Requests
		 * -----------------------
		 * A messaging system for requesting data.
		 *
		 */

		function makeCallback(callback) {
			return _.isFunction(callback) ? callback : function() {
				return callback;
			};
		}

		Radio.Requests = {

			// Make a request
			request: function request(name) {
				var args = _.rest(arguments);
				var results = Radio._eventsApi(this, "request", name, args);
				if (results) {
					return results;
				}
				var channelName = this.channelName;
				var requests = this._requests;

				// Check if we should log the request, and if so, do it
				if (channelName && this._tunedIn) {
					Radio.log.apply(this, [channelName, name].concat(args));
				}

				// If the request isn't handled, log it in DEBUG mode and exit
				if (requests && (requests[name] || requests["default"])) {
					var handler = requests[name] || requests["default"];
					args = requests[name] ? args : arguments;
					return Radio._callHandler(handler.callback, handler.context, args);
				}
				else {
					Radio.debugLog("An unhandled request was fired", name, channelName);
				}
			},

			// Set up a handler for a request
			reply: function reply(name, callback, context) {
				if (Radio._eventsApi(this, "reply", name, [callback, context])) {
					return this;
				}

				this._requests || (this._requests = {});

				if (this._requests[name]) {
					Radio.debugLog("A request was overwritten", name, this.channelName);
				}

				this._requests[name] = {
					callback: makeCallback(callback),
					context: context || this
				};

				return this;
			},

			// Set up a handler that can only be requested once
			replyOnce: function replyOnce(name, callback, context) {
				if (Radio._eventsApi(this, "replyOnce", name, [callback, context])) {
					return this;
				}

				var self = this;

				var once = _.once(function() {
					self.stopReplying(name);
					return makeCallback(callback).apply(this, arguments);
				});

				return this.reply(name, once, context);
			},

			// Remove handler(s)
			stopReplying: function stopReplying(name, callback, context) {
				if (Radio._eventsApi(this, "stopReplying", name)) {
					return this;
				}

				// Remove everything if there are no arguments passed
				if (!name && !callback && !context) {
					delete this._requests;
				}
				else if (!removeHandlers(this._requests, name, callback, context)) {
					Radio.debugLog("Attempted to remove the unregistered request", name, this.channelName);
				}

				return this;
			}
		};

		/*
		 * Backbone.Radio.channel
		 * ----------------------
		 * Get a reference to a channel by name.
		 *
		 */

		Radio._channels = {};

		Radio.channel = function(channelName) {
			if (!channelName) {
				throw new Error("You must provide a name for the channel.");
			}

			if (Radio._channels[channelName]) {
				return Radio._channels[channelName];
			}
			else {
				return Radio._channels[channelName] = new Radio.Channel(channelName);
			}
		};

		/*
		 * Backbone.Radio.Channel
		 * ----------------------
		 * A Channel is an object that extends from Backbone.Events,
		 * and Radio.Requests.
		 *
		 */

		Radio.Channel = function(channelName) {
			this.channelName = channelName;
		};

		_.extend(Radio.Channel.prototype, Backbone.Events, Radio.Requests, {

			// Remove all handlers from the messaging systems of this channel
			reset: function reset() {
				this.off();
				this.stopListening();
				this.stopReplying();
				return this;
			}
		});

		/*
		 * Top-level API
		 * -------------
		 * Supplies the 'top-level API' for working with Channels directly
		 * from Backbone.Radio.
		 *
		 */

		var channel,
			args,
			systems = [Backbone.Events, Radio.Commands, Radio.Requests];

		_.each(systems, function(system) {
			_.each(system, function(method, methodName) {
				Radio[methodName] = function(channelName) {
					args = _.rest(arguments);
					channel = this.channel(channelName);
					return channel[methodName].apply(channel, args);
				};
			});
		});

		Radio.reset = function(channelName) {
			var channels = !channelName ? this._channels : [this._channels[channelName]];
			_.invoke(channels, "reset");
		};

		var backbone_radio = Radio;

		return backbone_radio;
	});

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*global define*/

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(5), __webpack_require__(3)], __WEBPACK_AMD_DEFINE_RESULT__ = function(_, Backbone) {
		'use strict';

		return {
			setup: function(url) {
				// Store the original version of Backbone.sync
				var backboneSync = Backbone.sync;

				Backbone.sync = function(method, model, options) {

					// Change the `url` property of options to begin with the given URL
					options = _.extend(options, {
						url: url + '?action=vls_gf_api_' + model.url, /*(_.isFunction(model.url) ? model.url() : model.url)*/
						emulateHTTP: true,
						emulateJSON: true
					});

					if (options.attrs && method === 'patch') {
						options.attrs.id = model.get('id');
					}

					if (method === 'delete') {
						options = _.extend(options, {
							data: {
								_method: 'DELETE',
								id: model.get('id')
							}
						});
					}

					// Pass it down to differentiate toJSON logic between view and sync serialization
					options.mode = 'sync';

					// Call the stored original Backbone.sync method with the new url property
					backboneSync.call(Backbone, method, model, options);
				};

				// Override Backbone.ajax to provide nonce for every request
				var backboneAjax = Backbone.ajax;
				Backbone.ajax = function(params, options) {
					params.data._nonce = window.vlsGFData.nonce;
					backboneAjax.call(Backbone, params, options);
				};
			}
		};
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));



















/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/*global define*/

	'use strict';

	var Backbone = __webpack_require__(3);
	var Shim = __webpack_require__(7);
	var channel = Backbone.Radio.channel('global');
	module.exports = channel;



/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/*global define*/


	var Backbone = __webpack_require__(3);
	var Marionette = __webpack_require__(8);
	var Radio = __webpack_require__(13);

	var Router = Marionette.AppRouter.extend({

		radio: Radio,

		initialize: function(options) {
			this.listenTo(this.radio, 'global:requestHashChange', this.onRequestHashChange);
		},

		start: function() {
			Backbone.history.start();
		},

		appRoutes: {
			"manager": "manager",
			"folder/:id": "folder",
			"album/:id": "album",
			"image/:id": "image",
			"settings": "settings",
			"tools": "tools",
			"*defaults": "default"
		},

		onRequestHashChange: function(hash) {
			this.navigate(hash);
		}


	});

	module.exports = Router;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/*global define*/


	var $ = __webpack_require__(2);
	var Marionette = __webpack_require__(8);
	var Radio = __webpack_require__(13);
	var NavTreeItemModel = __webpack_require__(16);

	var Controller = Marionette.Object.extend({

		radio: Radio,

		initialize: function(options) {

			this.rootModel = options.rootModel;

			$(window).on('resize.vls-gf', this.onWindowResize.bind(this));
			$(window).on('scroll.vls-gf', this.onWindowScroll.bind(this));


			this.listenTo(this.radio, 'global:requestRoute', this.onRequestRoute);

			this.listenTo(this.radio, 'dialog:newFolder:confirmed', this.onNewFolderDialogConfirmed);
			this.listenTo(this.radio, 'dialog:newAlbum:confirmed', this.onNewAlbumDialogConfirmed);
			this.listenTo(this.radio, 'dialog:deleteFolder:confirmed', this.onDeleteFolderDialogConfirmed);
			this.listenTo(this.radio, 'dialog:deleteAlbum:confirmed', this.onDeleteAlbumDialogConfirmed);


		},

		onWindowResize: function(e) {
			if (e.target !== window) {
				return;
			}
			this.radio.trigger('global:windowResize', {});
		},

		onWindowScroll: function(e) {
			if (e.target !== window) {
				return;
			}
			this.radio.trigger('global:windowScroll', {});
		},

		/**
		 * some fixes for WordPress UI outside the app
		 */
		start: function() {

			$('#adminmenu a[href="admin.php?page=vls_gallery_factory"]')
				.attr('href', 'admin.php?page=vls_gallery_factory#manager');

			var radio = this.radio;
			$('#collapse-button').on('click.vls-gf', function() {
				radio.trigger('global:windowResize', {});
			});

			$('html').css('background-color', '#fcfcfc');
			$('#wpbody-content').css('padding-bottom', '0');
			$('#wpfooter').hide();
			$('#wpbody .update-nag').remove();
			$('#wpbody-content > .notice').remove();
			$('#wpbody-content > .error').remove();
			$('#wpbody-content > .updated').remove();
			$('#adminmenuback').css('z-index', 200);
		},

		default: function() {
			this.manager();
		},

		manager: function() {
			this.switchMainView({view: "manager"});
		},

		folder: function(id) {
			this.switchMainView({view: "folder", id: id});
		},

		album: function(id) {
			this.switchMainView({view: "album", id: id});
		},

		image: function(id) {
			this.switchMainView({view: "image", id: id});
		},

		settings: function() {
			this.switchMainView({view: "settings"});
		},

		tools: function() {
			this.switchMainView({view: "tools"});
		},

		onRequestRoute: function(params) {

			var hash = params.view;
			if (params.id) {
				hash += '/' + params.id;
			}

			this.switchMainView(params);

			this.radio.trigger('global:requestHashChange', hash);
		},

		/**
		 * Updates native WP interface highlights and changes main model state
		 * The view switching work is then done by the root layout view
		 * @param view
		 * @param id
		 */

		switchMainView: function(params) {

			var view = params.view,
				id = params.id || '',
				name = params.name || '',
				nodeId = params.nodeId || 0;

			//highlight WP main menu item

			var $menu = $('#toplevel_page_vls_gallery_factory > ul');
			$menu.find('>li.current').removeClass('current').find('a').removeClass('current');

			var menuItem = '';
			if (view === 'settings' || view === 'tools') {
				menuItem = '#' + view;
			}
			else {
				menuItem = '#manager';
			}

			$menu.find('>li>a[href="admin.php?page=vls_gallery_factory' + menuItem + '"]').addClass('current').closest('li').addClass('current');

			//change the root model's current state
			this.rootModel.set({
				currentView: view,
				currentModel: {
					id: id,
					name: name,
					node_id: nodeId
				}
			});

		},

		onNewFolderDialogConfirmed: function(params) {

			var radio = this.radio,
				parentId = params.parentId,
				model = new NavTreeItemModel({
					type: 'folder',
					parent_id: parentId,
					name: params.value
				});
			model.url = 'folder';

			model.save(null, {
				success: function() {
					radio.trigger('folder:contentChanged', {id: parentId})
				}
			});


		},

		onNewAlbumDialogConfirmed: function(params) {

			var radio = this.radio,
				parentId = params.parentId,
				model = new NavTreeItemModel({
					type: 'album',
					parent_id: parentId,
					name: params.value
				});
			model.url = 'folder';

			model.save(null, {
				success: function() {
					radio.trigger('folder:contentChanged', {id: parentId})
				}
			});

		},

		onDeleteFolderDialogConfirmed: function(params) {

			var radio = this.radio,
				parentId = params.parentId,
				model = new NavTreeItemModel({
					id: params.id
				});

			model.destroy({
				success: function() {
					radio.trigger('navigation:requested', {id: parentId, type: 'folder'});
					radio.trigger('folder:contentChanged', {id: parentId})
				}
			});
		},

		onDeleteAlbumDialogConfirmed: function(params) {

			var radio = this.radio,
				parentId = params.parentId,
				model = new NavTreeItemModel({
					id: params.id
				});

			model.destroy({
				success: function() {
					radio.trigger('navigation:requested', {id: parentId, type: 'folder'});
					radio.trigger('folder:contentChanged', {id: parentId})
				}
			});

		}

	});

	module.exports = Controller;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var PersistentModel = __webpack_require__(17);

	var Model = PersistentModel.extend({

		url: 'node',
		defaults: {
			type: '',
			parent_id: 0,
			name: ''
		}

	});

	module.exports = Model;



/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var _ = __webpack_require__(5);
	var Backbone = __webpack_require__(3);

	var Model = Backbone.Model.extend({

		fetch: function(options) {
			options = options || {};
			var data = options.data || {};
			data.id = this.id;
			if (this.api_view) {
				data.view = this.api_view;
			}
			options = _.extend(options, {data: data});
			Backbone.Model.prototype.fetch.call(this, options);
		}

	});

	module.exports = Model;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*global require */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
		__webpack_require__(3)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(Backbone) {

		'use strict';

		var Model = Backbone.Model.extend({

			defaults: {
				currentView: '',
				currentId: 0,
				tutorialActive: false
			}

		});

		return Model;

	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/*global define*/


	var $ = __webpack_require__(2);
	var Marionette = __webpack_require__(8);
	var Radio = __webpack_require__(13);

	var GalleryManagerLayoutView = __webpack_require__(20);

	var FolderEditorModel = __webpack_require__(65);
	var FolderEditorLayoutView = __webpack_require__(68);

	// var AlbumEditorModel = require('models/albumEditor');
	// var AlbumEditorView = require('views/albumEditor/layout');

	var ImageEditorModel = __webpack_require__(90);
	var ImageEditorLayoutView = __webpack_require__(91);

	var SettingsModel = __webpack_require__(99);
	var SettingsLayoutView = __webpack_require__(100);

	var ToolsLayoutView = __webpack_require__(104);

	var View = Marionette.LayoutView.extend({

		el: '#vls-gf-app',
		template: false,

		regions: {
			primaryLayer: '#vls-gf-layer-primary',
			secondaryLayer: '#vls-gf-layer-secondary'
		},

		ui: {
			primaryLayer: '>section:nth-child(1)',
			secondaryLayer: '>section:nth-child(2)'
		},

		events: {
			//'click #top-search>button': 'showGlobalSearch'
		},

		modelEvents: {
			'change:currentView': 'switchCurrentView'
		},

		radio: Radio,

		//childEvents: {
		//    //'drawer:open': 'showDrawer',
		//    'drawer:close': 'closeDrawer'
		//},

		initialize: function(options) {

			this.animationTicking = false;

			this.listenTo(this.radio, 'global:windowResize', this.onWindowResize);
			//this.listenTo(this.radio, 'global:windowScroll', this.onWindowScrollOrResize);
			this.listenTo(this.radio, 'global:needAdjustFixedElement', this._adjustFixedElements);

			this.render();

		},

		switchCurrentView: function() {

			var currentView = this.model.get('currentView');
			var currentModel = this.model.get('currentModel');

			if (currentView === "manager") {
				this._hideSecondaryLayer();
				if (!this.primaryLayer.currentView) {
					this.primaryLayer.show(new GalleryManagerLayoutView());
				}
				this.secondaryLayer.empty();
			}
			else if (currentView === "folder") {
				this._showSecondaryLayer();
				var model = new FolderEditorModel({id: currentModel.id, name: currentModel.name});
				this.secondaryLayer.show(new FolderEditorLayoutView({model: model}));
			}
			// else if (currentView === "album") {
			//     this._showSecondaryLayer();
			//     var model = new AlbumEditorModel({id: currentModel.id, name: currentModel.name});
			//     this.secondaryLayer.show(new AlbumEditorView({model: model}));
			// }
			else if (currentView === "image") {
				this._showSecondaryLayer();
				var model = new ImageEditorModel(currentModel);
				this.secondaryLayer.show(new ImageEditorLayoutView({model: model}));
			}
			else if (currentView === "settings") {
				this._showSecondaryLayer();
				var model = new SettingsModel();
				this.secondaryLayer.show(new SettingsLayoutView({model: model}));
			}
			else if (currentView === "tools") {
				this._showSecondaryLayer();
				this.secondaryLayer.show(new ToolsLayoutView());
			}
			this.radio.trigger('global:needAdjustFixedElement', {});

		},

		onWindowResize: function(e) {

			if (!this.animationTicking) {
				this.animationTicking = true;
				vlsGfRequestAnimationFrame(this._adjustFixedElements.bind(this));
			}
		},

		_adjustFixedElements: function() {

			var $window = $(window),
				$adminBar = $('#wpadminbar'),
				$adminMenuBack = $('#adminmenuback'),
				$wpBodyContent = $('#wpbody-content'),
				$fixedWrapper = $('#vls-gf-app .vls-gf-fixed-wrapper'),
				$mainPanel = $('#vls-gf-app .vls-gf-main-panel'),
				$navPanel = $('#vls-gf-app .vls-gf-nav-panel'),
				$sidePanel = $('#vls-gf-app .vls-gf-side-panel'),
				windowHeight = $window.height(),
				//adminBarHeight = $adminBar.outerHeight(),
				adminMenuWidth = $adminMenuBack.outerWidth(),
				mainPanelMinHeight = windowHeight - $adminBar.outerHeight();

			$mainPanel.css({"min-height": mainPanelMinHeight + 'px'});

			if ($navPanel.length != 0 || $sidePanel.length != 0) {

				var wpBodyContentHeight = $wpBodyContent.height(),
					scrollTop = $window.scrollTop();
	//                footerInWindow = windowHeight - wpBodyContentHeight + scrollTop - adminBarHeight;


				//horizontal positioning
				$navPanel.css({"left": adminMenuWidth + 'px'});
				$fixedWrapper.css({"left": adminMenuWidth + 'px'});


				// //vertical positioning
				// if (footerInWindow <= 0) {
				//     if ($navPanel.length !== 0) {
				//         $navPanel.css({"bottom": 0});
				//     }
				//     if ($sidePanel.length !== 0) {
				//         $sidePanel.css({"bottom": 0});
				//     }
				// } else {
				//     if ($navPanel.length !== 0) {
				//         $navPanel.css({"bottom": footerInWindow + 'px'});
				//     }
				//     if ($sidePanel.length !== 0) {
				//         $sidePanel.css({"bottom": footerInWindow + 'px'});
				//     }
				// }

			}

			this.animationTicking = false;

		},

		_showSecondaryLayer: function() {
			this.ui.primaryLayer.css({display: 'none'});
			this.ui.secondaryLayer.css({display: 'block'});

			if (this.primaryLayer.currentView) {
				this.primaryLayer.currentView.hideMoreMenu();
			}
		},

		_hideSecondaryLayer: function() {
			this.ui.primaryLayer.css({display: 'block'});
			this.ui.secondaryLayer.css({display: 'none'});
		}
	});

	module.exports = View;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/*global require  */


	var $ = __webpack_require__(2);
	var _ = __webpack_require__(5);

	var LayoutView = __webpack_require__(21);

	var Template = __webpack_require__(24);

	var NavigationTreeView = __webpack_require__(25);
	var FolderOverviewView = __webpack_require__(32);
	var AlbumOverviewView = __webpack_require__(43);

	var FolderSummaryModel = __webpack_require__(56);
	var FolderSummaryView = __webpack_require__(57);

	var AlbumSummaryModel = __webpack_require__(59);
	var AlbumSummaryView = __webpack_require__(60);

	var ImageSummaryModel = __webpack_require__(62);
	var ImageSummaryView = __webpack_require__(63);

	var View = LayoutView.extend({
		className: 'vls-gf-view-gallery-manager',

		template: Template,
		templateHelpers: function() {
			return {
				t: {
					navigation: this.l10n.t('navigation'),
					view: this.l10n.t('view'),
					toggleNavigation: this.state.navigationPanelVisible ? this.l10n.t('hideNavigation') : this.l10n.t('showNavigation'),
					toggleSummary: this.state.summaryPanelVisible ? this.l10n.t('hideSummary') : this.l10n.t('showSummary'),
					tools: this.l10n.t('tools'),
					settings: this.l10n.t('settings'),
					upgradeToPremium: this.l10n.t('upgradeToPremium'),
					tt: {
						addNewFolder: this.l10n.t('tooltips.addNewFolder'),
						addNewAlbum: this.l10n.t('tooltips.addNewAlbum'),
						menu: this.l10n.t('tooltips.menu'),
						editAlbum: this.l10n.t('tooltips.editAlbum'),
						deleteAlbum: this.l10n.t('tooltips.deleteAlbum'),
						editFolder: this.l10n.t('tooltips.editFolder'),
						deleteFolder: this.l10n.t('tooltips.deleteFolder')
					}
				}
			}
		},

		regions: {
			navContent: '.vls-gf-nav-panel',
			mainContent: '.vls-gf-main-panel',
			sideContent: '.vls-gf-side-panel'
		},

		ui: {
			mainPanelHeader: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar .vls-gf-main h3',
			toolbarImages: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar ul.vls-gf-images',
			toolbarStorage: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar ul.vls-gf-library',
			toolbarFolder: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar ul.vls-gf-folder',
			toolbarAlbum: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar ul.vls-gf-album',

			fabWrapper: '.vls-gf-fab-wrapper',

			btnFAB: '.vls-gf-fab-wrapper .vls-gf-fab',
			btnAddFolder: '.vls-gf-fab-wrapper .vls-gf-fab-option[data-action="add-folder"]',
			btnAddAlbum: '.vls-gf-fab-wrapper .vls-gf-fab-option[data-action="add-album"]',

			// "More" menu
			btnMoreMenu: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar .vls-gf-more-menu button',
			btnMoreMenuSidebars: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar .vls-gf-more-menu li[data-action="submenu-sidebars"] > span',
			actionToggleNavigation: 'li[data-action="toggle-navigation"]',
			actionToggleSummary: 'li[data-action="toggle-summary"]',
			btnFolderEdit: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar ul.vls-gf-folder button[data-action="edit"]',
			btnFolderDelete: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar ul.vls-gf-folder button[data-action="delete"]',
			btnAlbumEdit: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar ul.vls-gf-album button[data-action="edit"]',
			btnAlbumDelete: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar ul.vls-gf-album button[data-action="delete"]',

			dropdownMoreMenu: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar .vls-gf-more-menu > ul',
			dropdownMoreSubMenu: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar .vls-gf-more-menu li[data-action="submenu-sidebars"] > ul'

		},

		events: {
			'click @ui.btnFAB': 'onBtnFAB',
			'click @ui.btnAddFolder': 'onBtnAddFolder',
			'click @ui.btnAddAlbum': 'onBtnAddAlbum',
			'click @ui.mainPanelHeader': 'onMainPanelHeaderClick',

			'click @ui.btnFolderEdit, @ui.btnAlbumEdit': 'onEditClick',
			'click @ui.btnFolderDelete': 'onBtnFolderDelete',
			'click @ui.btnAlbumDelete': 'onBtnAlbumDelete',
			'click @ui.btnMoreMenu': 'onBtnMoreMenu',
			'click @ui.btnMoreMenuSidebars': 'onBtnMoreMenuSidebars',
			'click @ui.actionToggleNavigation': 'toggleNavigation',
			'click @ui.actionToggleSummary': 'toggleSummary'
		},

		initialize: function(options) {
			this.state = {
				navigationPanelVisible: true,
				summaryPanelVisible: true,
				moreMenuOpened: false,
				commandSet: '',
				currentItem: {
					type: '',
					id: 0,
					name: ''
				}
			};

			if (this.state.navigationPanelVisible) {
				this.$el.addClass('vls-gf-navigation-visible');
			}
			if (this.state.summaryPanelVisible) {
				this.$el.addClass('vls-gf-summary-visible');
			}

			this.listenTo(this.radio, 'navigation:itemActivated', this.onNavigationItemActivated);
			this.listenTo(this.radio, 'manager:content:itemActivated', this.onContentItemActivated);
		},

		onRender: function() {

			this.navContent.show(new NavigationTreeView());

		},

		onShow: function() {
			this.radio.trigger('global:needAdjustFixedElement', {});
		},

		onNavigationItemActivated: function(params) {

			this.state.currentItem = {
				type: params.type,
				id: params.id,
				name: params.name,
				parentId: params.parentId
			};

			//TODO: replace with the collection view
			var headerHtml = '<div class="vls-gf-breadcrumbs">';

			if (params.id !== 0) {
				headerHtml += '<span data-id="0">' + this.l10n.t('library') + '</span>&nbsp;&gt;&nbsp;';
			}

			_.each(params.breadcrumbs, function(item) {
				headerHtml += '<span data-id="' + item.id + '">' + item.name + '</span>&nbsp;&gt;&nbsp;';
			});
			headerHtml += '<span class="vls-gf-current">' + params.name + '</span></div>';

			this.ui.mainPanelHeader.html(headerHtml);


			if (params.type === 'all_images' || params.type === 'unsorted_images') {
				this._switchCommandSet('images');
				this.mainContent.show(new AlbumOverviewView({type: params.type}));
			}
			else if (params.type === 'album') {
				this._switchCommandSet('album');
				this.mainContent.show(new AlbumOverviewView({type: 'album', albumId: params.id}));
			}
			else if (params.type === 'library') {
				this._switchCommandSet('library');
				this.mainContent.show(new FolderOverviewView({folderId: 0}));
			}
			else if (params.type === 'folder') {
				this._switchCommandSet('folder');
				this.mainContent.show(new FolderOverviewView({folderId: params.id}));
			}
		},

		onContentItemActivated: function(params) {
			var model;

			if (params.type === 'folder') {
				model = new FolderSummaryModel({id: params.id});
				this.sideContent.show(new FolderSummaryView({model: model}));
			}
			else if (params.type === 'album') {
				model = new AlbumSummaryModel({id: params.id});
				this.sideContent.show(new AlbumSummaryView({model: model}));
			}
			else if (params.type === 'image') {
				model = new ImageSummaryModel({id: params.imageId, node_id: params.id});
				this.sideContent.show(new ImageSummaryView({model: model}));
			}
			else if (params.type === 'image_entity') {
				model = new ImageSummaryModel({id: params.id});
				this.sideContent.show(new ImageSummaryView({model: model}));
			}
		},

		onEditClick: function() {
			var id = this.state.currentItem.id;
			var name = this.state.currentItem.name;

			this.radio.trigger('global:requestRoute', {view: 'folder', id: id, name: name});

			return false;
		},

		onMainPanelHeaderClick: function(e) {
			var id = $(e.target).data('id');
			if (typeof id !== 'undefined') {
				this.radio.trigger('navigation:requested', {id: id, type: (id > 0 ? 'folder' : 'library')});
			}
		},

		onBtnFAB: function() {
			if (this.state.commandSet === 'images' || this.state.commandSet === 'album') {

				var tooltipEl = this.ui.btnFAB.data('vlsGfTooltipEl');

				if (tooltipEl) {

					tooltipEl.removeClass('vls-gf-visible');
					this.ui.btnFAB.data('vlsGfTooltipEl', null);
					tooltipEl.remove();
				}

				this.radio.trigger('manager:uploadBrowseRequested');
			}
		},

		onBtnAddFolder: function() {
			if (this.state.commandSet === 'library' || this.state.commandSet === 'folder') {
				this.radio.trigger('dialog:newFolder:requested', {parentId: this.state.currentItem.id});
			}
		},

		onBtnAddAlbum: function() {
			if (this.state.commandSet === 'library' || this.state.commandSet === 'folder') {
				this.radio.trigger('dialog:newAlbum:requested', {parentId: this.state.currentItem.id});
			}
		},

		onBtnFolderDelete: function() {
			if (this.state.commandSet === 'folder') {
				this.radio.trigger('dialog:deleteFolder:requested', {
					id: this.state.currentItem.id,
					name: this.state.currentItem.name,
					parentId: this.state.currentItem.parentId
				});
			}
		},

		onBtnAlbumDelete: function() {
			if (this.state.commandSet === 'album') {
				this.radio.trigger('dialog:deleteAlbum:requested', {
					id: this.state.currentItem.id,
					name: this.state.currentItem.name,
					parentId: this.state.currentItem.parentId
				});
			}
		},

		onBtnMoreMenu: function() {

			if (!this.state.moreMenuOpened) {
				this.state.moreMenuOpened = true;

				var self = this,
					m = this.ui.dropdownMoreMenu;
				m.css('display', 'block');
				m.width();
				m.addClass('vls-gf-visible');

				$(document).on('click.vls-gf.menu', function(event) {
					if (!$(event.target).closest('.vls-gf-more-menu').length) {
						self.hideMoreMenu.call(self);
					}
				});


			}
		},

		onBtnMoreMenuSidebars: function() {
			if (!this.state.moreSubMenuOpened) {
				this.state.moreSubMenuOpened = true;
				var m = this.ui.dropdownMoreSubMenu;
				m.css('display', 'block');
				m.width();
				m.addClass('vls-gf-visible');
			}
			else {
				var self = this;
				this.state.moreSubMenuOpened = false;
				var m = this.ui.dropdownMoreSubMenu;
				m.removeClass('vls-gf-visible');
				setTimeout(function() {
					if (!self.state.moreSubMenuOpened) {
						m.css('display', 'none');
					}
				}, 400);
			}
		},

		hideMoreMenu: function() {
			this.state.moreMenuOpened = false;

			if (this.state.moreSubMenuOpened) {
				this.onBtnMoreMenuSidebars();
			}

			$(document).off('click.vls-gf.menu');
			var self = this,
				m = this.ui.dropdownMoreMenu;
			m.removeClass('vls-gf-visible');
			m.find('vls-gf-visible').removeClass('vls-gf-visible');
			setTimeout(function() {
				if (!self.state.moreMenuOpened) {
					m.css('display', 'none');
				}
			}, 400);
		},

		toggleNavigation: function() {
			var text = this.ui.actionToggleNavigation.find('span');
			var l10n = this.l10n;
			if (this.state.navigationPanelVisible) {
				this.$el.removeClass('vls-gf-navigation-visible');
				setTimeout(function() {
					text.html(l10n.t('showNavigation'));
				}, 300);
			}
			else {
				this.$el.addClass('vls-gf-navigation-visible');
				setTimeout(function() {
					text.html(l10n.t('hideNavigation'));
				}, 300);
			}
			this.state.navigationPanelVisible = !this.state.navigationPanelVisible;
			this.hideMoreMenu();
		},

		toggleSummary: function() {
			var text = this.ui.actionToggleSummary.find('span');
			var l10n = this.l10n;
			if (this.state.summaryPanelVisible) {
				this.$el.removeClass('vls-gf-summary-visible');
				setTimeout(function() {
					text.html(l10n.t('showSummary'));
				}, 300);
			}
			else {
				this.$el.addClass('vls-gf-summary-visible');
				setTimeout(function() {
					text.find('span').html(l10n.t('hideSummary'));
				}, 300);
			}
			this.state.summaryPanelVisible = !this.state.summaryPanelVisible;
			this.hideMoreMenu();
		},

		_switchCommandSet: function(commandSet) {

			var currentCommandSet = this.state.commandSet;

			if (commandSet === currentCommandSet) {
				return;
			}


			//set FAB view
			if (commandSet === 'images' || commandSet === 'album') {
				this.ui.fabWrapper.removeClass('vls-gf-actions-folder').addClass('vls-gf-actions-album');
				this.ui.btnFAB.data('vlsGfTooltip', this.l10n.t('tooltips.uploadImages'));
			}
			else if (commandSet === 'library' || commandSet === 'folder') {
				this.ui.fabWrapper.removeClass('vls-gf-actions-album').addClass('vls-gf-actions-folder');
				this.ui.btnFAB.data('vlsGfTooltip', '');
			}

			//fade off old actions
			if (currentCommandSet === 'images') {
				this._fadeOut(this.ui.toolbarImages);
			}
			else if (currentCommandSet === 'album') {
				this._fadeOut(this.ui.toolbarAlbum);
			}
			else if (currentCommandSet === 'library') {
				this._fadeOut(this.ui.toolbarStorage);
			}
			else if (currentCommandSet === 'folder') {
				this._fadeOut(this.ui.toolbarFolder);
			}


			//fade in new actions
			if (commandSet === 'images') {
				this._fadeIn(this.ui.toolbarImages);
			}
			else if (commandSet === 'album') {
				this._fadeIn(this.ui.toolbarAlbum);
			}
			else if (commandSet === 'library') {
				this._fadeIn(this.ui.toolbarStorage);
			}
			else if (commandSet === 'folder') {
				this._fadeIn(this.ui.toolbarFolder);
			}


			this.state.commandSet = commandSet;

		},

		_fadeOut: function(element) {

			element.addClass('vls-gf-transitioning').removeClass('vls-gf-visible');
			setTimeout(function() {
				element.removeClass('vls-gf-transitioning');
			}, 600);
		},

		_fadeIn: function(element) {

			element.addClass('vls-gf-transitioning');

			setTimeout(function() {
				element.addClass('vls-gf-visible');
			}, 10);

			setTimeout(function() {
				element.removeClass('vls-gf-transitioning');
			}, 600);
		}

	});

	module.exports = View;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */

	'use strict';

	var Marionette = __webpack_require__(8);
	var radio = __webpack_require__(13);
	var l10n = __webpack_require__(22);

	var View = Marionette.LayoutView.extend({

		l10n: l10n,
		radio: radio

	});

	module.exports = View;



/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */

	'use strict';

	var Polyglot = __webpack_require__(23);

	var polyglot = new Polyglot({
		locale: window.vlsGFData.localization.locale,
		phrases: window.vlsGFData.localization.phrases
	});

	module.exports = polyglot;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     (c) 2012 Airbnb, Inc.
	//
	//     polyglot.js may be freely distributed under the terms of the BSD
	//     license. For all licensing information, details, and documention:
	//     http://airbnb.github.com/polyglot.js
	//
	//
	// Polyglot.js is an I18n helper library written in JavaScript, made to
	// work both in the browser and in Node. It provides a simple solution for
	// interpolation and pluralization, based off of Airbnb's
	// experience adding I18n functionality to its Backbone.js and Node apps.
	//
	// Polylglot is agnostic to your translation backend. It doesn't perform any
	// translation; it simply gives you a way to manage translated phrases from
	// your client- or server-side JavaScript application.
	//


	(function(root, factory) {
		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return factory(root);
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
		else if (typeof exports === 'object') {
			module.exports = factory(root);
		}
		else {
			root.Polyglot = factory(root);
		}
	}(this, function(root) {
		'use strict';

		// ### Polyglot class constructor
		function Polyglot(options) {
			options = options || {};
			this.phrases = {};
			this.extend(options.phrases || {});
			this.currentLocale = options.locale || 'en';
			this.allowMissing = !!options.allowMissing;
			this.warn = options.warn || warn;
		}

		// ### Version
		Polyglot.VERSION = '0.4.3';

		// ### polyglot.locale([locale])
		//
		// Get or set locale. Internally, Polyglot only uses locale for pluralization.
		Polyglot.prototype.locale = function(newLocale) {
			if (newLocale) this.currentLocale = newLocale;
			return this.currentLocale;
		};

		// ### polyglot.extend(phrases)
		//
		// Use `extend` to tell Polyglot how to translate a given key.
		//
		//     polyglot.extend({
		//       "hello": "Hello",
		//       "hello_name": "Hello, %{name}"
		//     });
		//
		// The key can be any string.  Feel free to call `extend` multiple times;
		// it will override any phrases with the same key, but leave existing phrases
		// untouched.
		//
		// It is also possible to pass nested phrase objects, which get flattened
		// into an object with the nested keys concatenated using dot notation.
		//
		//     polyglot.extend({
		//       "nav": {
		//         "hello": "Hello",
		//         "hello_name": "Hello, %{name}",
		//         "sidebar": {
		//           "welcome": "Welcome"
		//         }
		//       }
		//     });
		//
		//     console.log(polyglot.phrases);
		//     // {
		//     //   'nav.hello': 'Hello',
		//     //   'nav.hello_name': 'Hello, %{name}',
		//     //   'nav.sidebar.welcome': 'Welcome'
		//     // }
		//
		// `extend` accepts an optional second argument, `prefix`, which can be used
		// to prefix every key in the phrases object with some string, using dot
		// notation.
		//
		//     polyglot.extend({
		//       "hello": "Hello",
		//       "hello_name": "Hello, %{name}"
		//     }, "nav");
		//
		//     console.log(polyglot.phrases);
		//     // {
		//     //   'nav.hello': 'Hello',
		//     //   'nav.hello_name': 'Hello, %{name}'
		//     // }
		//
		// This feature is used internally to support nested phrase objects.
		Polyglot.prototype.extend = function(morePhrases, prefix) {
			var phrase;

			for (var key in morePhrases) {
				if (morePhrases.hasOwnProperty(key)) {
					phrase = morePhrases[key];
					if (prefix) key = prefix + '.' + key;
					if (typeof phrase === 'object') {
						this.extend(phrase, key);
					}
					else {
						this.phrases[key] = phrase;
					}
				}
			}
		};

		// ### polyglot.clear()
		//
		// Clears all phrases. Useful for special cases, such as freeing
		// up memory if you have lots of phrases but no longer need to
		// perform any translation. Also used internally by `replace`.
		Polyglot.prototype.clear = function() {
			this.phrases = {};
		};

		// ### polyglot.replace(phrases)
		//
		// Completely replace the existing phrases with a new set of phrases.
		// Normally, just use `extend` to add more phrases, but under certain
		// circumstances, you may want to make sure no old phrases are lying around.
		Polyglot.prototype.replace = function(newPhrases) {
			this.clear();
			this.extend(newPhrases);
		};


		// ### polyglot.t(key, options)
		//
		// The most-used method. Provide a key, and `t` will return the
		// phrase.
		//
		//     polyglot.t("hello");
		//     => "Hello"
		//
		// The phrase value is provided first by a call to `polyglot.extend()` or
		// `polyglot.replace()`.
		//
		// Pass in an object as the second argument to perform interpolation.
		//
		//     polyglot.t("hello_name", {name: "Spike"});
		//     => "Hello, Spike"
		//
		// If you like, you can provide a default value in case the phrase is missing.
		// Use the special option key "_" to specify a default.
		//
		//     polyglot.t("i_like_to_write_in_language", {
		//       _: "I like to write in %{language}.",
		//       language: "JavaScript"
		//     });
		//     => "I like to write in JavaScript."
		//
		Polyglot.prototype.t = function(key, options) {
			var phrase, result;
			options = options == null ? {} : options;
			// allow number as a pluralization shortcut
			if (typeof options === 'number') {
				options = {smart_count: options};
			}
			if (typeof this.phrases[key] === 'string') {
				phrase = this.phrases[key];
			}
			else if (typeof options._ === 'string') {
				phrase = options._;
			}
			else if (this.allowMissing) {
				phrase = key;
			}
			else {
				this.warn('Missing translation for key: "' + key + '"');
				result = key;
			}
			if (typeof phrase === 'string') {
				options = clone(options);
				result = choosePluralForm(phrase, this.currentLocale, options.smart_count);
				result = interpolate(result, options);
			}
			return result;
		};


		// ### polyglot.has(key)
		//
		// Check if polyglot has a translation for given key
		Polyglot.prototype.has = function(key) {
			return key in this.phrases;
		};


		// #### Pluralization methods
		// The string that separates the different phrase possibilities.
		var delimeter = '||||';

		// Mapping from pluralization group plural logic.
		var pluralTypes = {
			chinese: function(n) {
				return 0;
			},
			german: function(n) {
				return n !== 1 ? 1 : 0;
			},
			french: function(n) {
				return n > 1 ? 1 : 0;
			},
			russian: function(n) {
				return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
			},
			czech: function(n) {
				return (n === 1) ? 0 : (n >= 2 && n <= 4) ? 1 : 2;
			},
			polish: function(n) {
				return (n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
			},
			icelandic: function(n) {
				return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0;
			}
		};

		// Mapping from pluralization group to individual locales.
		var pluralTypeToLanguages = {
			chinese: ['fa', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh'],
			german: ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv'],
			french: ['fr', 'tl', 'pt-br'],
			russian: ['hr', 'ru'],
			czech: ['cs'],
			polish: ['pl'],
			icelandic: ['is']
		};

		function langToTypeMap(mapping) {
			var type, langs, l, ret = {};
			for (type in mapping) {
				if (mapping.hasOwnProperty(type)) {
					langs = mapping[type];
					for (l in langs) {
						ret[langs[l]] = type;
					}
				}
			}
			return ret;
		}

		// Trim a string.
		function trim(str) {
			var trimRe = /^\s+|\s+$/g;
			return str.replace(trimRe, '');
		}

		// Based on a phrase text that contains `n` plural forms separated
		// by `delimeter`, a `locale`, and a `count`, choose the correct
		// plural form, or none if `count` is `null`.
		function choosePluralForm(text, locale, count) {
			var ret, texts, chosenText;
			if (count != null && text) {
				texts = text.split(delimeter);
				chosenText = texts[pluralTypeIndex(locale, count)] || texts[0];
				ret = trim(chosenText);
			}
			else {
				ret = text;
			}
			return ret;
		}

		function pluralTypeName(locale) {
			var langToPluralType = langToTypeMap(pluralTypeToLanguages);
			return langToPluralType[locale] || langToPluralType.en;
		}

		function pluralTypeIndex(locale, count) {
			return pluralTypes[pluralTypeName(locale)](count);
		}

		// ### interpolate
		//
		// Does the dirty work. Creates a `RegExp` object for each
		// interpolation placeholder.
		function interpolate(phrase, options) {
			for (var arg in options) {
				if (arg !== '_' && options.hasOwnProperty(arg)) {
					// We create a new `RegExp` each time instead of using a more-efficient
					// string replace so that the same argument can be replaced multiple times
					// in the same phrase.
					phrase = phrase.replace(new RegExp('%\\{' + arg + '\\}', 'g'), options[arg]);
				}
			}
			return phrase;
		}

		// ### warn
		//
		// Provides a warning in the console if a phrase key is missing.
		function warn(message) {
			root.console && root.console.warn && root.console.warn('WARNING: ' + message);
		}

		// ### clone
		//
		// Clone an object.
		function clone(source) {
			var ret = {};
			for (var prop in source) {
				ret[prop] = source[prop];
			}
			return ret;
		}

		return Polyglot;
	}));

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-fixed-wrapper">\r\n	<div class="vls-gf-primary-toolbar">\r\n		<div class="vls-gf-nav">\r\n			<h3>'+
	((__t=( t.navigation ))==null?'':__t)+
	'</h3>\r\n		</div>\r\n		<div class="vls-gf-main">\r\n			<h3></h3>\r\n			<ul class="vls-gf-actions vls-gf-images">\r\n			</ul>\r\n			<ul class="vls-gf-actions vls-gf-library">\r\n			</ul>\r\n			<ul class="vls-gf-actions vls-gf-album">\r\n				<li>\r\n					<button data-action="edit" class="vls-gf-icon vls-gf-icon-edit-w"\r\n							data-vls-gf-tooltip="'+
	((__t=( t.tt.editAlbum ))==null?'':__t)+
	'" data-vls-gf-position="below"\r\n							data-vls-gf-offset="0"></button>\r\n				</li>\r\n				<li>\r\n					<button data-action="delete" class="vls-gf-icon vls-gf-icon-delete-w"\r\n							data-vls-gf-tooltip="'+
	((__t=( t.tt.deleteAlbum ))==null?'':__t)+
	'" data-vls-gf-position="below"\r\n							data-vls-gf-offset="0"></button>\r\n				</li>\r\n			</ul>\r\n			<ul class="vls-gf-actions vls-gf-folder">\r\n				<li>\r\n					<button data-action="edit" class="vls-gf-icon vls-gf-icon-edit-w"\r\n							data-vls-gf-tooltip="'+
	((__t=( t.tt.editFolder ))==null?'':__t)+
	'" data-vls-gf-position="below"\r\n							data-vls-gf-offset="0"></button>\r\n				</li>\r\n				<li>\r\n					<button data-action="delete" class="vls-gf-icon vls-gf-icon-delete-w"\r\n							data-vls-gf-tooltip="'+
	((__t=( t.tt.deleteFolder ))==null?'':__t)+
	'" data-vls-gf-position="below"\r\n							data-vls-gf-offset="0"></button>\r\n				</li>\r\n			</ul>\r\n			<span class="vls-gf-more-menu">\r\n            <button class="vls-gf-icon vls-gf-icon-more-vert-w" data-vls-gf-tooltip="'+
	((__t=( t.tt.menu ))==null?'':__t)+
	'"\r\n					data-vls-gf-position="below" data-vls-gf-offset="0"></button>\r\n            <ul>\r\n                <li data-action="submenu-sidebars"><span>'+
	((__t=( t.view ))==null?'':__t)+
	'</span>\r\n                    <ul>\r\n                        <li data-action="toggle-navigation"><i class="vls-gf-check vls-gf-checked"></i><span>'+
	((__t=( t.toggleNavigation ))==null?'':__t)+
	'</span></li>\r\n                        <li data-action="toggle-summary"><i class="vls-gf-check vls-gf-checked"></i><span>'+
	((__t=( t.toggleSummary ))==null?'':__t)+
	'</span></li>\r\n                    </ul>\r\n                </li>\r\n                <li class="vls-gf-divider"></li>\r\n                <li><a href="#tools">'+
	((__t=( t.tools ))==null?'':__t)+
	'</a></li>\r\n                <li><a href="#settings">'+
	((__t=( t.settings ))==null?'':__t)+
	'</a></li>\r\n                <li><a href="http://codecanyon.net/item/gallery-factory/11219294/"\r\n                       target="_blank">'+
	((__t=( t.upgradeToPremium ))==null?'':__t)+
	'</a></li>\r\n            </ul>\r\n        </span>\r\n		</div>\r\n	</div>\r\n</div>\r\n\r\n<div class="vls-gf-content-wrapper">\r\n	<div class="vls-gf-nav-panel"></div>\r\n	<div class="vls-gf-main-panel"></div>\r\n	<div class="vls-gf-side-panel"></div>\r\n</div>\r\n\r\n<div class="vls-gf-fab-wrapper">\r\n	<button data-action="add-folder" class="vls-gf-fab-option" data-vls-gf-tooltip="'+
	((__t=( t.tt.addNewFolder ))==null?'':__t)+
	'"\r\n			data-vls-gf-position="left" data-vls-gf-offset="14">\r\n		<i class="vls-gf-icon vls-gf-icon-folder-w"></i></button>\r\n	<button data-action="add-album" class="vls-gf-fab-option" data-vls-gf-tooltip="'+
	((__t=( t.tt.addNewAlbum ))==null?'':__t)+
	'"\r\n			data-vls-gf-position="left" data-vls-gf-offset="14">\r\n		<i class="vls-gf-icon vls-gf-icon-album-w"></i></button>\r\n	<button class="vls-gf-fab" data-vls-gf-tooltip="" data-vls-gf-position="left" data-vls-gf-offset="14">\r\n		<i class="vls-gf-icon vls-gf-icon-add-w"></i>\r\n		<i class="vls-gf-icon vls-gf-icon-file-upload-w"></i>\r\n	</button>\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */

	var $ = __webpack_require__(2);
	var CompositeView = __webpack_require__(26);
	var Template = __webpack_require__(27);
	var ListCollection = __webpack_require__(28);
	var ListItemView = __webpack_require__(29);
	var Baron = __webpack_require__(31);

	var View = CompositeView.extend({

		className: 'vls-gf-navigation-view-wrapper',
		viewName: 'tree',
		template: Template,
		templateHelpers: function() {
			return {
				t: {
					allImages: this.l10n.t('allImages'),
					unsortedImages: this.l10n.t('unsortedImages'),
					library: this.l10n.t('library')
				}
			}
		},

		childView: ListItemView,
		childViewContainer: '.vls-gf-navigation-tree',

		ui: {
			'navigationTree': '.vls-gf-navigation-tree',
			'treeScrollWrapper': '.vls-gf-scroll-wrapper',
			'allImages': 'div.vls-gf-navigation-fixed div.vls-gf-all',
			'unsortedImages': 'div.vls-gf-navigation-fixed div.vls-gf-unsorted',
			'library': 'div.vls-gf-navigation-fixed div.vls-gf-library'
		},

		events: {
			'click @ui.allImages': 'onAllImagesClick',
			'click @ui.unsortedImages': 'onUnsortedImagesClick',
			'click @ui.library': 'onLibraryClick'
		},

		tutorialMode: vlsGFData.tutorialMode,

		initialize: function(options) {


			this.state = {
				initialLoad: true
			};

			this.draggingState = {
				isItemDragging: false,
				currentOrderNo: 0
			};

			this.listenTo(this.radio, 'navigationPanel:requestRedrawTree', this.onRequestRedrawTree);
			this.listenTo(this.radio, 'navigationPanel:itemDragStart', this.onItemDragStart);
			this.listenTo(this.radio, 'navigationPanel:itemDrag', this.onItemDrag);
			this.listenTo(this.radio, 'navigationPanel:itemDragStop', this.onItemDragStop);

			this.listenTo(this.radio, 'folder:contentChanged', this.onFolderContentChanged);

			this.listenTo(this.radio, 'navigation:itemActivated', this.onItemActivated);
			this.listenTo(this.radio, 'navigation:requested', this.onNavigationRequested);


			//pass init options for children
			this.childViewOptions = {
				parentId: 0,
				level: 1,
				visibilityState: 'visible'
			};

			// if (!this.tutorialMode) {
			this.collection = new ListCollection([], {parentId: 0});
			this.listenTo(this.collection, 'sync', this.onCollectionSync);

			// } else {
			//
			//     this.collection = new ListCollection([
			//         new ItemModel({id:1, type: 'folder', name: 'Folder #1', }),
			//         new ItemModel({id:2, type: 'folder', name: 'Folder #2'}),
			//         new ItemModel({id:3, type: 'folder', name: 'Folder #3'}),
			//         new ItemModel({id:4, type: 'folder', name: 'Folder #4'}),
			//         new ItemModel({id:5, type: 'folder', name: 'Folder #5'})
			//     ], {parentId: 0})
			//
			// }


		},

		onRender: function() {

			this.collection.fetch();

			// add droppable to the "all images" and "unsorted images"

			this.ui.allImages.droppable({
				accept: '.vls-gf-dragged-image',
				hoverClass: 'vls-gf-drop-ready',
				drop: this._onImageDrop.bind(this)
			});

			this.ui.unsortedImages.droppable({
				accept: '.vls-gf-dragged-image',
				hoverClass: 'vls-gf-drop-ready',
				drop: this._onImageDrop.bind(this)
			});


		},

		onShow: function() {

			var baronParams = {
				$: $,
				scroller: '.vls-gf-scroll-scroller',
				container: '.vls-gf-navigation-tree',
				bar: '.vls-gf-scroll-bar',
				barOnCls: 'vls-gf-bar-on',
				scrollingCls: 'vls-gf-scrolling',
				cssGuru: true
			};

			Baron.call(this.ui.treeScrollWrapper, baronParams);

			this.radio.trigger('global:needAdjustFixedElement', {});

			this.onLibraryClick();

		},

		onCollectionSync: function() {

			this._updateTreePositions();

			if (this.state.initialLoad) {

				this.$el.find('.vls-gf-navigation-tree>div').addClass('vls-gf-init');

				//reveal animation
				var i = 0;
				this.children.each(function(view) {
					var $el = view.$el,
						delay = i * 10;
					setTimeout(function() {
						$el.removeClass('vls-gf-init');
					}, delay);
					i++;
				});

				this.state.initialLoad = false;

			}

		},

		onRequestRedrawTree: function(params) {
			this._updateTreePositions();
		},

		onItemDragStart: function(params) {

			this.draggingState.isItemDragging = true;

			this.draggingState.indentHelper = $('<div id="vls-gf-drag-indent-helper"></div>');
			this.ui.navigationTree.append(this.draggingState.indentHelper);
			this.ui.navigationTree.addClass('vls-gf-dragging');

		},

		/**
		 Respond on item dragging, draw drop helper
		 */
		onItemDrag: function(params) {

			var self = this;

			self.draggingState.currentOrderNo = params.currentOrderNo;
			self.draggingState.currentIndent = params.currentIndent;
			self.draggingState.maybeFolderOpenIntent = params.maybeFolderOpenIntent;
			self.draggingState.isFirstDragMove = params.isFirstDragMove;
			self.draggingState.directionY = params.directionY;

			if (
				self.draggingState.maybeFolderOpenIntent &&
				self.draggingState.directionY == 'up' &&
				self.draggingState.upperNeighbour &&
				self.draggingState.upperNeighbour.type === "folder" &&
				self.draggingState.upperNeighbour.collapseState === "collapsed"
			) {

				self.draggingState.currentOrderNo++;
				self.draggingState.upperNeighbour.setOpenTimeout('prev');

			}
			else if (
				self.draggingState.maybeFolderOpenIntent &&
				self.draggingState.directionY == 'down' &&
				self.draggingState.lowerNeighbour &&
				self.draggingState.lowerNeighbour.type === "folder" &&
				self.draggingState.lowerNeighbour.collapseState === "collapsed"
			) {

				self.draggingState.lowerNeighbour.setOpenTimeout('next');
			}
			else {
				self._updateTreePositions();
			}

		},

		onItemDragStop: function(params) {

			this.draggingState.isItemDragging = false;

			this.draggingState.indentHelper.remove();
			this.draggingState.indentHelper = null;

			//if parent or position is changed, trigger move event
			var draggedItem = params.draggedItem;
			var oldParent = params.oldParent;
			var newParent = this.draggingState.currentParent;
			var oldUpperSibling = this.draggingState.oldUpperSibling;
			var newUpperSibling = this.draggingState.upperSibling;
			var dropLevel = this.draggingState.dropLevel;

			//var startUpperNeighbour = this.draggingState.startUpperNeighbour;
			//var startLowerNeighbour = this.draggingState.startLowerNeighbour;
			//var lowerNeighbour = this.draggingState.lowerNeighbour;


			var isChanged = false;
			var newIndex = 0;
			//remove item from the origin collection
			//if (oldParent === null && newParent != null) {
			//    this.collection.remove(draggedItem.model);
			//} else
			//
			// add to a new collection
			//if (newParent === null && oldParent != null) {
			//    this.collection.add(draggedItem.model);
			//} else


			//if parent is changed, edit collections
			if (oldParent.cid !== newParent.cid) {
				//remove from old parent
				oldParent.collection.remove(draggedItem.model);

				if (newUpperSibling) {
					newIndex = newParent.collection.indexOf(newUpperSibling.model) + 1;
				}
				newParent.collection.add(draggedItem.model, {at: newIndex});

				isChanged = true;
			}
			else {
				//reorder
				newIndex = 0;
				if (newUpperSibling) {
					newIndex = oldParent.collection.indexOf(newUpperSibling.model) + 1;
				}

				var oldIndex = oldParent.collection.indexOf(draggedItem.model);
				if (newIndex !== oldIndex) {
					if (newIndex > oldIndex) {
						newIndex--;
					}
					oldParent.collection.remove(draggedItem.model);
					oldParent.collection.add(draggedItem.model, {at: newIndex});

					isChanged = true;
				}

			}


			//save changes to the item
			var newParentId = 0;
			if (newParent.viewName === 'item') {
				newParentId = newParent.model.get('id');
			}

			if (isChanged) {
				draggedItem.model.save({parent_id: newParentId, order_no: newIndex}, {parse: false, patch: true});
			}

			this._updateTreePositions();

			this.ui.navigationTree.removeClass('vls-gf-dragging');

		},

		onAllImagesClick: function() {

			this.ui.allImages.addClass('vls-gf-active');

			this.radio.trigger('navigation:itemActivated', {
				type: 'all_images',
				id: 0,
				name: this.l10n.t('allImages')
			});

			return false;

		},

		onUnsortedImagesClick: function() {

			this.ui.unsortedImages.addClass('vls-gf-active');

			this.radio.trigger('navigation:itemActivated', {
				type: 'unsorted_images',
				id: 0,
				name: this.l10n.t('unsortedImages')
			});

			return false;

		},

		onLibraryClick: function() {

			this.ui.library.addClass('vls-gf-active');

			this.radio.trigger('navigation:itemActivated', {
				type: 'library',
				id: 0,
				name: this.l10n.t('library')
			});
			return false;

		},

		onItemActivated: function(params) {
			if (params.type !== 'all_images') {
				this.ui.allImages.removeClass('vls-gf-active');
			}
			if (params.type !== 'unsorted_images') {
				this.ui.unsortedImages.removeClass('vls-gf-active');
			}
			if (params.type !== 'library') {
				this.ui.library.removeClass('vls-gf-active');
			}
		},

		onFolderContentChanged: function(params) {
			if (params.id === 0) {
				this.collection.fetch();
			}
		},

		onNavigationRequested: function(params) {
			if (params.type === 'library' || params.id === 0) {
				this.onLibraryClick();
			}
		},

		onChildviewActivatedDownstream: function(child, params) {

			this.radio.trigger('navigation:itemActivated', {
				type: params.type,
				id: params.id,
				name: params.name,
				parentId: params.parentId,
				breadcrumbs: params.breadcrumbs
			});
		},

		// Responds to drops into "All images" and "Unsorted images"
		_onImageDrop: function(e, ui) {

			var radio = this.radio,
				sourceAlbum = ui.helper.data('sourceAlbum');

			var draggedImages = ui.helper.data('draggedImages');

			if (sourceAlbum != 0) {

				//sending move request to the server
				$.post(
					ajaxurl,
					{
						action: 'vls_gf_api_image_collection_move',
						_nonce: vlsGFData.nonce,
						collection: JSON.stringify(draggedImages),
						from_folder: sourceAlbum,
						to_folder: 0
					},
					function() {
						radio.trigger('manager:content:bulkSelectModeDeactivated', {});
						radio.trigger('album:contentChanged', {id: sourceAlbum});
						radio.trigger('album:contentChanged', {id: 0});
					}
				);
			}
		},

		_updateTreePositions: function() {

			var self = this;

			//throttle update requests
			if (self._isUpdatingPositions === true) {
				self._needUpdatingPositions = true;
			}

			self._isUpdatingPositions = true;

			var params = {
				orderNo: -1,
				isItemDragging: self.draggingState.isItemDragging,
				draggingOrderNo: self.draggingState.currentOrderNo,
				maybeFolderOpenIntent: self.draggingState.maybeFolderOpenIntent,
				upperNeighbour: null,
				lowerNeighbour: null,
				parents: []
			};

			self.collection.each(function(childModel) {
				var childView = self.children.findByModel(childModel);
				if (childView) {
					params = childView.updatePositions(params);
				}
			});


			if (self.draggingState.isItemDragging) {

				//restrict dragging to one position below the last item
				if (self.draggingState.currentOrderNo >= params.orderNo + 1) {
					self.draggingState.currentOrderNo = params.orderNo + 1;
					params.orderNo = params.orderNo + 1;
				}

				self.draggingState.upperNeighbour = params.upperNeighbour;
				self.draggingState.lowerNeighbour = params.lowerNeighbour;

				self.draggingState.parents = params.parents;

				self._updateDraggingHelper();

				self.draggingState.upperSibling = self.draggingState.parents[self.draggingState.dropLevel];
				if (self.draggingState.isFirstDragMove) {
					self.draggingState.oldUpperSibling = self.draggingState.parents[self.draggingState.dropLevel];
				}

			}

			self._isUpdatingPositions = false;

			var treeHeight = (params.orderNo + 1) * 32 + 6; //extra 6px for the drop-ready shadow;

			self.ui.navigationTree.css({height: treeHeight});

			//make sure that positions are up-to date
			if (self._needUpdatingPositions === true) {
				self._updateTreePositions();
			}
		},

		_updateDraggingHelper: function() {


			var self = this;

			var upperNeighbour = self.draggingState.upperNeighbour;
			var lowerNeighbour = self.draggingState.lowerNeighbour;
			var upperNeighbourType = upperNeighbour ? upperNeighbour.type : '';
			var upperNeighbourLevel = upperNeighbour ? upperNeighbour.level : 1;
			var lowerNeighbourLevel = lowerNeighbour ? lowerNeighbour.level : 1;

			var dropLevel = self.draggingState.currentIndent + 1;

			//set allowed range of drop levels
			if (dropLevel < lowerNeighbourLevel) {
				dropLevel = lowerNeighbourLevel;
			}

			var upperLevel = upperNeighbourLevel;
			if (upperNeighbourType === 'folder') {
				upperLevel = upperLevel < 7 ? upperLevel + 1 : 7;
			}

			if (dropLevel > upperLevel) {
				dropLevel = upperLevel;
			}

			//draw indent helper
			var currentOrderNo = self.draggingState.currentOrderNo;
			var parentOrderNo = -1;

			var currentParent;
			if (dropLevel > 1) {
				currentParent = self.draggingState.parents[dropLevel - 1];
				parentOrderNo = currentParent.orderNo;
			}
			else {
				currentParent = self;
			}


			var helperTop = parentOrderNo * 32 + 32;
			var helperBottom = currentOrderNo * 32 + 17;
			var helperLeft = dropLevel * 16 + 8;

			self.draggingState.currentParent = currentParent;
			self.draggingState.dropLevel = dropLevel;

			self.draggingState.indentHelper.css({
				display: 'block',
				top: helperTop,
				left: helperLeft,
				height: helperBottom - helperTop
			});

		}

	});

	module.exports = View;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */

	'use strict';

	var Marionette = __webpack_require__(8);
	var radio = __webpack_require__(13);
	var l10n = __webpack_require__(22);

	var View = Marionette.CompositeView.extend({

		l10n: l10n,
		radio: radio

	});

	module.exports = View;



/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-navigation-fixed">\r\n	<div class="vls-gf-all">\r\n		<div>\r\n			<span class="vls-gf-icon"></span>\r\n			<span class="vls-gf-label">'+
	((__t=( t.allImages ))==null?'':__t)+
	'</span>\r\n		</div>\r\n	</div>\r\n	<div class="vls-gf-unsorted">\r\n		<div>\r\n			<span class="vls-gf-icon"></span>\r\n			<span class="vls-gf-label">'+
	((__t=( t.unsortedImages ))==null?'':__t)+
	'</span>\r\n		</div>\r\n	</div>\r\n	<div class="vls-gf-library">\r\n		<div>\r\n			<span class="vls-gf-icon"></span>\r\n			<span class="vls-gf-label">'+
	((__t=( t.library ))==null?'':__t)+
	'</span>\r\n		</div>\r\n	</div>\r\n</div>\r\n<div class="vls-gf-scroll-wrapper">\r\n	<div class="vls-gf-scroll-scroller">\r\n		<div class="vls-gf-navigation-tree">\r\n		</div>\r\n		<div class="vls-gf-scroll-bar"></div>\r\n	</div>\r\n</div>\r\n\r\n\r\n';
	}
	return __p;
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var _ = __webpack_require__(5);
	var Backbone = __webpack_require__(3);
	var Model = __webpack_require__(16);

	var Collection = Backbone.Collection.extend({

		model: Model,
		url: 'node_collection',
		parentId: 0,

		initialize: function(models, options) {
			this.parentId = options.parentId;
		},

		fetch: function(options) {
			options = options ? options : {};
			options = _.extend(options, {data: {parent_type: 'folder', parent_id: this.parentId, view: 'nav_item'}});
			Backbone.Collection.prototype.fetch.call(this, options);
		}

	});

	module.exports = Collection;

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var $ = __webpack_require__(2);
	var CompositeView = __webpack_require__(26);
	var Radio = __webpack_require__(13);
	var Template = __webpack_require__(30);
	var ListCollection = __webpack_require__(28);

	var itemMetrics = {height: 32, middle: 15, topPart: 10, bottomPart: 20, indent: 16};

	var View = CompositeView.extend({

		tagName: 'div',

		className: function() {
			var className;
			if (this.model.get('type') === 'folder') {
				className = 'vls-gf-folder vls-gf-no-tran';
			}
			else {
				className = 'vls-gf-album vls-gf-no-tran';
			}

			// if (this.options.level === 1) {
			//     className += ' vls-gf-init';
			// }

			return className;
		},

		viewName: 'item',

		template: Template,

		ui: {
			'body': '> div',
			'icon': '> div >.vls-gf-icon',
			'label': '> div > .vls-gf-label'
		},

		events: {
			'click @ui.body': 'onBodyClick', 'touchstart @ui.body': 'onBodyClick',
			'click @ui.icon': 'toggleCollapsed', 'touchstart @ui.icon': 'toggleCollapsed'
		},

		initialize: function(options) {

			this.parentId = options.parentId;
			this.level = options.level;
			this.visibilityState = options.visibilityState;
			this.isActive = false;

			this.type = '';
			this.orderNo = 0;
			this.collapseState = 'collapsed';
			this.draggingState = {
				isDragging: false,
				startY: 0,
				currentY: 0,
				directionY: '',
				currentArea: {
					top: 0,
					bottom: 0,
					left: 0,
					right: 0
				}
			};


			this.listenTo(this.radio, 'navigation:requested', this.onNavigationRequested);
			this.listenTo(this.radio, 'navigation:itemActivated', this.onItemActivated);

			this.listenTo(this.radio, 'folder:changed', this.onFolderChanged);
			this.listenTo(this.radio, 'album:changed', this.onAlbumChanged);

			this.listenTo(this.radio, 'folder:contentChanged', this.onFolderContentChanged);


		},

		onBeforeRender: function() {
			this.$childViewContainer = $('#vls-gf-app .vls-gf-navigation-tree');
		},

		onRender: function() {

			var self = this,
				id = this.model.get('id');

			//pass init options for children
			this.childViewOptions = {
				parentId: parseInt(id),
				level: this.level + 1,
				visibilityState: (this.collapseState === 'opened' ? 'visible' : 'hidden')
			};


			this.type = this.model.get('type');

			this.collection = new ListCollection([], {parentId: id});

			this.listenTo(this.collection, 'sync', this.onCollectionSync);

			if (this.visibilityState === 'visible') {
				this.collection.fetch();
			}

			this.$el.draggable({
				distance: 2,
				delay: 200,
				addClasses: false,
				position: 'absolute',
				scroll: false,
				cursor: false,
				helper: function() {
					return $('<div id="vls-gf-nav-item-drag-helper"></div>').append(self.$el.html());
				},
				appendTo: 'body',
				//cancel: '.btn'
				start: this._onDragStart.bind(this),
				drag: this._onDrag.bind(this),
				//revert: galleryItemDragRevert,
				stop: this._onDragStop.bind(this)
			});


			// add droppable to the albums
			if (this.type == 'album') {
				this.$el.droppable({
					accept: '.vls-gf-dragged-image',
					hoverClass: 'vls-gf-drop-ready',
					drop: this._onImageDrop.bind(this)
				});
			}


			this.$el.addClass('vls-gf-level-' + this.level);
			if (this.visibilityState === 'hidden') {
				this.$el.addClass('vls-gf-hidden');
			}
		},

		onShow: function() {
			var $el = this.$el;
			setTimeout(function() {
				$el.removeClass('vls-gf-no-tran');
			});

			this.radio.trigger('global:needAdjustFixedElement', {});
		},

		updatePositions: function(params) {

			var self = this;

			//do not place currently dragged item and hidden ones
			if (!self.draggingState.isDragging) {
				params.orderNo++;
			}

			clearTimeout(self.hoverTimeout);

			//skip the position of currently dragged item (with respect of open folder intent)
			if (params.isItemDragging && params.draggingOrderNo === params.orderNo) {
				params.orderNo++;
			}

			//place item
			self.orderNo = params.orderNo;
			this._setPosition(0, itemMetrics.height * params.orderNo);

			if (params.isItemDragging) {
				params = self._updateDraggingContext(params);
			}

			if (self.visibilityState === 'visible' || self.visibilityState === 'revealing') {
				var parentOrder = params.orderNo;

				//self.children.each(function (child) {
				//    params = child.updatePositions(params);
				//});

				self.collection.each(function(childModel) {
					var childView = self.children.findByModel(childModel);
					if (childView) {
						params = childView.updatePositions(params);
					}
				});

				if (self.collapseState === 'collapsed' || self.collapseState === 'collapsing') {
					params.orderNo = parentOrder;
				}
			}


			return params;

		},

		onCollectionSync: function() {
			this.radio.trigger('navigationPanel:requestRedrawTree');
		},

		toggleCollapsed: function(event, forceCollapsed, isRecursiveCall) {

			var self = this;

			if (self.type !== 'folder') {
				return;
			}

			if (self.collapseState === 'collapsed' && !forceCollapsed) {

				self.collapseState = 'opening';
				self.$el.addClass('vls-gf-opened');

				self.children.each(function(child) {
					child.setVisibilityState('revealing');
				});


				setTimeout(function() {

					self.collapseState = 'opened';

					self.childViewOptions.visibilityState = (self.collapseState === 'opened' ? 'visible' : 'hidden');

					self.children.each(function(child) {
						child.setVisibilityState('visible');
					});

				}, 600);


			}
			else if (self.collapseState === 'opened') {

				self.collapseState = 'collapsing';
				self.$el.removeClass('vls-gf-opened');

				self.children.each(function(child) {
					child.setVisibilityState('hiding');
				});

				setTimeout(function() {
					self.collapseState = 'collapsed';

					self.childViewOptions.visibilityState = (self.collapseState === 'opened' ? 'visible' : 'hidden');

					self.children.each(function(child) {
						child.setVisibilityState('hidden');
					});

				}, 600);

			}

			if (!isRecursiveCall) {
				self.radio.trigger('navigationPanel:requestRedrawTree');
			}

			return false;
		},

		onBodyClick: function(e) {
			this.radio.trigger('navigation:requested', {id: this.model.get('id'), type: this.model.get('type')});
		},

		onNavigationRequested: function(params) {
			if (this.model.get('id') == params.id) {
				this.isActive = true;
				this.$el.addClass('vls-gf-active');

				this.triggerMethod('activatedDownstream', {
					type: this.model.get('type'),
					id: this.model.get('id'),
					name: this.model.get('name'),
					parentId: this.parentId,
					breadcrumbs: []
				});

			}
		},

		onChildviewActivatedDownstream: function(child, params) {

			if (this.type == 'folder' && this.collapseState === 'collapsed') {
				this.toggleCollapsed();
			}

			params.breadcrumbs.unshift({
				id: this.model.get('id'),
				name: this.model.get('name')
			});

			this.triggerMethod('activatedDownstream', {
				type: params.type,
				id: params.id,
				name: params.name,
				parentId: params.parentId,
				breadcrumbs: params.breadcrumbs
			});
		},

		onItemActivated: function(params) {
			if (this.isActive && this.model.get('id') != params.id) {
				this.$el.removeClass('vls-gf-active');
			}
		},

		setOpenTimeout: function() {
			var self = this;
			self.hoverTimeout = setTimeout(function() {
				self.toggleCollapsed();
			}, 600);
		},

		setVisibilityState: function(state) {

			var self = this,
				$el = self.$el;

			if (
				self.visibilityState === state ||
				(self.visibilityState === 'hidden' && state === 'hiding')
			) {
				return;
			}

			self.visibilityState = state;

			if (state === 'hidden') {
				$el.removeClass('vls-gf-hiding').addClass('vls-gf-hidden');

				//hide all children
				self.children.each(function(child) {
					child.setVisibilityState('hidden');
				});
			}
			else if (state === 'hiding') {
				$el.addClass('vls-gf-hiding');
				self.toggleCollapsed({}, true, true);

				//start hiding all children
				self.children.each(function(child) {
					child.setVisibilityState('hiding');
				});

			}
			else if (state === 'visible') {
				$el.removeClass('vls-gf-revealing vls-gf-hidden');

				if (this.visibilityState === 'visible') {
					self.collection.fetch();
				}
			}
			else if (state === 'revealing') {
				$el.addClass('vls-gf-revealing');
			}


		},

		onFolderChanged: function(params) {
			var changedModel = params.model;
			if (this.model.get('id') == changedModel.get('id')) {
				var name = changedModel.get('name');
				this.model.set('name', name);
				this.ui.label.html(name);
			}
		},

		onAlbumChanged: function(params) {
			var changedModel = params.model;
			if (this.model.get('id') == changedModel.get('id')) {
				var name = changedModel.get('name');
				this.model.set('name', name);
				this.ui.label.html(name);
			}
		},

		onFolderContentChanged: function(params) {
			if (this.model.get('id') == params.id) {
				this.collection.fetch();
			}
		},

		_onDragStart: function(event, ui) {

			this.draggingState.navigationTreeElement = $('#vls-gf-app .vls-gf-navigation-tree');
			this.draggingState.isDragging = true;
			this.draggingState.isFirstDragMove = true;
			this.draggingState.currentArea = {
				top: 0,
				bottom: 0,
				left: 0,
				right: 0
			};

			//indent in px relative to 1-st level
			this.draggingState.dragStartIndent = (this.level - 1) * itemMetrics.indent;

			this.draggingState.previousY = Math.floor(ui.offset.top + itemMetrics.height / 2);

			ui.helper.addClass('vls-gf-' + this.type + ' vls-gf-level-' + this.level);


			this.toggleCollapsed({}, true);

			this.$el.addClass('vls-gf-dragged');

			this.radio.trigger("navigationPanel:itemDragStart", {});

		},

		/**
		 * Process raw drag data and pass drag event with the processed data to the navigation panel
		 * @param event
		 * @param ui
		 */
		_onDrag: function(event, ui) {

			var self = this;

			var prevY = self.draggingState.previousY;
			var maybeFolderOpenIntent = false;
			var directionY = 'none';
			var isFirstDragMove = self.draggingState.isFirstDragMove;


			var curY = Math.floor(ui.offset.top + itemMetrics.height / 2),
				curX = ui.offset.left + self.draggingState.dragStartIndent;

			self.draggingState.previousY = curY;


			//$('#debug-line-h-3').css("top", curY + "px");

			// if still dragging within current area, do nothing
			if (
				curY >= self.draggingState.currentArea.top &&
				curY <= self.draggingState.currentArea.bottom &&
				curX >= self.draggingState.currentArea.left &&
				curX <= self.draggingState.currentArea.right
			) {
				return;
			}

			//update current area (vertical)

			var parentY = this.draggingState.navigationTreeElement.offset().top;


			var currentOrderNo = Math.floor((curY - parentY) / itemMetrics.height);
			if (currentOrderNo < 0) {
				currentOrderNo = 0;
			}
			var itemY = parentY + itemMetrics.height * currentOrderNo;
			var localY = curY - itemY;


			//if within current vertical area then leave it as is
			if (curY < self.draggingState.currentArea.top || curY > self.draggingState.currentArea.bottom) {

				//first move can't have subregions
				if (isFirstDragMove) {
					self.draggingState.currentArea.top = itemY;
					self.draggingState.currentArea.bottom = itemY + itemMetrics.height - 1;
					self.draggingState.isFirstDragMove = false;
				}
				else
				//if going down
				if (curY > prevY) {
					directionY = 'down';
					if (localY <= itemMetrics.bottomPart) {
						self.draggingState.currentArea.top = itemY;
						self.draggingState.currentArea.bottom = itemY + itemMetrics.bottomPart;
						maybeFolderOpenIntent = true;
					}
					else {
						self.draggingState.currentArea.top = itemY;
						self.draggingState.currentArea.bottom = itemY + itemMetrics.height - 1;
					}
				}
				//if going up
				else if (curY < prevY) {
					directionY = 'up';
					if (localY <= itemMetrics.bottomPart) {
						self.draggingState.currentArea.top = itemY;
						self.draggingState.currentArea.bottom = itemY + itemMetrics.height - 1;
					}
					else {
						self.draggingState.currentArea.top = itemY + itemMetrics.topPart + 1;
						self.draggingState.currentArea.bottom = itemY + itemMetrics.height - 1;
						maybeFolderOpenIntent = true;
					}
				}
			}

			//update current area (horizontal)
			var parentX = this.draggingState.navigationTreeElement.offset().left;
			var currentIndent = Math.floor((curX - parentX) / itemMetrics.indent);

			if (currentIndent < 0) {
				currentIndent = 0;
			}
			else if (currentIndent > 7) {
				currentIndent = 7;
			}

			if (currentIndent === 0) {
				this.draggingState.currentArea.left = -9999;
			}
			else {
				this.draggingState.currentArea.left = parentX + currentIndent * itemMetrics.indent;
			}

			if (currentIndent === 7) {
				this.draggingState.currentArea.right = 9999;
			}
			else {
				this.draggingState.currentArea.right = parentX + (currentIndent + 1) * itemMetrics.indent - 1;
			}

			Radio.trigger("navigationPanel:itemDrag", {
				currentOrderNo: currentOrderNo,
				currentIndent: currentIndent,
				directionY: directionY,
				maybeFolderOpenIntent: maybeFolderOpenIntent,
				isFirstDragMove: isFirstDragMove
			});


		},

		_onDragStop: function(event, ui) {

			this.draggingState.isDragging = false;

			this.$el.removeClass('vls-gf-dragged');

			//TODO: check the usage of the oldParent
			var oldParent = this._parent;
			this.radio.trigger("navigationPanel:itemDragStop", {draggedItem: this, oldParent: oldParent});

			this.draggingState = {};

		},

		// Drop to any album
		_onImageDrop: function(e, ui) {

			var radio = this.radio,
				targetAlbum = this.model.get('id'),
				sourceAlbum = ui.helper.data('sourceAlbum');

			var draggedImages = ui.helper.data('draggedImages');

			if (sourceAlbum != targetAlbum) {

				//sending move request to the server
				$.post(
					ajaxurl,
					{
						action: 'vls_gf_api_image_collection_move',
						_nonce: vlsGFData.nonce,
						collection: JSON.stringify(draggedImages),
						from_folder: sourceAlbum,
						to_folder: targetAlbum
					},
					function() {
						radio.trigger('manager:content:bulkSelectModeDeactivated', {});
						radio.trigger('album:contentChanged', {id: sourceAlbum});
						radio.trigger('album:contentChanged', {id: targetAlbum});
					}
				);

			}

		},

		_setPosition: function(x, y) {
			this.$el.css({transform: 'translate3d(' + x + 'px, ' + y + 'px, 0)'});
		},

		_updateDraggingContext: function(params) {

			// consider only visible items
			if ((this.visibilityState !== 'visible' && this.visibilityState !== 'revealing') || this.draggingState.isDragging) {
				return params;
			}

			var draggingOrderNo = params.draggingOrderNo;

			if (this.orderNo < params.draggingOrderNo) {

				params.parents[this.level] = this;
				var i;
				for (i = this.level + 1; i <= 7; i++) {
					params.parents[i] = null;
				}

			}

			if (draggingOrderNo - this.orderNo === 1) {
				params.upperNeighbour = this;

			}
			else if (this.orderNo - draggingOrderNo === 1) {
				params.lowerNeighbour = this;
			}

			return params;

		}

	});

	module.exports = View;



































/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div data-id="'+
	((__t=( id ))==null?'':__t)+
	'"><span class="vls-gf-icon"></span><span class="vls-gf-label">'+
	((__t=( name ))==null?'':__t)+
	'</span></div>';
	}
	return __p;
	};


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	(function(window, undefined) {
		'use strict';

		if (!window) return; // Server side

		var $ = window.$;
		var _baron = baron; // Stored baron value for noConflict usage
		var pos = ['left', 'top', 'right', 'bottom', 'width', 'height'];
		// Global store for all baron instances (to be able to dispose them on html-nodes)
		var instances = [];
		var origin = {
			v: { // Vertical
				x: 'Y', pos: pos[1], oppos: pos[3], crossPos: pos[0], crossOpPos: pos[2],
				size: pos[5],
				crossSize: pos[4], crossMinSize: 'min-' + pos[4], crossMaxSize: 'max-' + pos[4],
				client: 'clientHeight', crossClient: 'clientWidth',
				scrollEdge: 'scrollLeft',
				offset: 'offsetHeight', crossOffset: 'offsetWidth', offsetPos: 'offsetTop',
				scroll: 'scrollTop', scrollSize: 'scrollHeight'
			},
			h: { // Horizontal
				x: 'X', pos: pos[0], oppos: pos[2], crossPos: pos[1], crossOpPos: pos[3],
				size: pos[4],
				crossSize: pos[5], crossMinSize: 'min-' + pos[5], crossMaxSize: 'max-' + pos[5],
				client: 'clientWidth', crossClient: 'clientHeight',
				scrollEdge: 'scrollTop',
				offset: 'offsetWidth', crossOffset: 'offsetHeight', offsetPos: 'offsetLeft',
				scroll: 'scrollLeft', scrollSize: 'scrollWidth'
			}
		};

		// Some ugly vars
		var opera12maxScrollbarSize = 17;
		// I hate you https://github.com/Diokuz/baron/issues/110
		var macmsxffScrollbarSize = 15;
		var macosxffRe = /[\s\S]*Macintosh[\s\S]*\) Gecko[\s\S]*/;
		var isMacFF = macosxffRe.test(window.navigator.userAgent);

		// window.baron and jQuery.fn.baron points to this function
		function baron(params) {
			var jQueryMode;
			var roots;
			var withParams = !!params;
			var defaultParams = {
				$: window.jQuery,
				direction: 'v',
				barOnCls: '_scrollbar',
				resizeDebounce: 0,
				event: function(elem, event, func, mode) {
					params.$(elem)[mode || 'on'](event, func);
				},
				cssGuru: false,
				impact: 'scroller'
			};

			params = params || {};

			// Extending default params by user-defined params
			for (var key in defaultParams) {
				if (params[key] === undefined) {
					params[key] = defaultParams[key];
				}
			}
			if (!params.$) {
				throw new Error('baron: no $ found.');
			}

			// this - something or jQuery instance
			jQueryMode = this instanceof params.$;

			if (jQueryMode) {
				params.root = roots = this;
			}
			else {
				roots = params.$(params.root || params.scroller);
			}

			var instance = new baron.fn.constructor(roots, params, withParams);

			if (instance.autoUpdate) {
				instance.autoUpdate();
			}

			return instance;
		}

		function arrayEach(obj, iterator) {
			var i = 0;

			if (obj.length === undefined || obj === window) obj = [obj];

			while (obj[i]) {
				iterator.call(this, obj[i], i);
				i++;
			}
		}

		// shortcut for getTime
		function getTime() {
			return new Date().getTime();
		}

		baron._instances = instances; // for debug

		baron.fn = {
			constructor: function(roots, totalParams, withParams) {
				var params = clone(totalParams);

				// Intrinsic params.event is not the same as totalParams.event
				params.event = function(elems, e, func, mode) {
					arrayEach(elems, function(elem) {
						totalParams.event(elem, e, func, mode);
					});
				};

				this.length = 0;

				arrayEach.call(this, roots, function(root, i) {
					var attr = manageAttr(root, params.direction);
					var id = +attr; // Could be NaN

					// baron() can return existing instances,
					// @TODO update params on-the-fly
					// https://github.com/Diokuz/baron/issues/124
					if (id == id && attr != undefined && instances[id]) {
						if (withParams) {
							console.log('Error! Baron for this node already initialized', totalParams.root);
						}

						this[i] = instances[id];
					}
					else {
						var perInstanceParams = clone(params);

						// root and scroller can be different nodes
						if (params.root && params.scroller) {
							perInstanceParams.scroller = params.$(params.scroller, root);
							if (!perInstanceParams.scroller.length) {
								console.log('Scroller not found!', root, params.scroller);
								return;
							}
						}
						else {
							perInstanceParams.scroller = root;
						}

						perInstanceParams.root = root;
						perInstanceParams.$root = params.$(root);
						this[i] = init(perInstanceParams);
					}

					this.length = i + 1;
				});

				this.params = params;
			},

			dispose: function() {
				var params = this.params;

				arrayEach(this, function(item) {
					item.dispose(params);
				});

				this.params = null;
			},

			update: function() {
				var i = 0;

				while (this[i]) {
					this[i].update.apply(this[i], arguments);
					i++;
				}
			},

			baron: function(params) {
				params.root = [];
				params.scroller = this.params.scroller;

				arrayEach.call(this, this, function(elem) {
					params.root.push(elem.root);
				});
				params.direction = (this.params.direction == 'v') ? 'h' : 'v';
				params._chain = true;

				return baron(params);
			}
		};

		function manageEvents(item, eventManager, mode) {
			// Creating new functions for one baron item only one time
			item._eventHandlers = item._eventHandlers || [
					{
						// onScroll:
						element: item.scroller,

						handler: function(e) {
							item.scroll(e);
						},

						type: 'scroll'
					}, {
						// css transitions & animations
						element: item.root,

						handler: function() {
							item.update();
						},

						type: 'transitionend animationend'
					}, {
						// onKeyup (textarea):
						element: item.scroller,

						handler: function() {
							item.update();
						},

						type: 'keyup'
					}, {
						// onMouseDown:
						element: item.bar,

						handler: function(e) {
							e.preventDefault(); // Text selection disabling in Opera
							item.selection(); // Disable text selection in ie8
							item.drag.now = 1; // Save private byte
							if (item.draggingCls) {
								item.root.addClass(item.draggingCls);
							}
						},

						type: 'touchstart mousedown'
					}, {
						// onMouseUp:
						element: document,

						handler: function() {
							item.selection(1); // Enable text selection
							item.drag.now = 0;
							if (item.draggingCls) {
								item.root.removeClass(item.draggingCls);
							}
						},

						type: 'mouseup blur touchend'
					}, {
						// onCoordinateReset:
						element: document,

						handler: function(e) {
							if (e.button != 2) { // Not RM
								item._pos0(e);
							}
						},

						type: 'touchstart mousedown'
					}, {
						// onMouseMove:
						element: document,

						handler: function(e) {
							if (item.drag.now) {
								item.drag(e);
							}
						},

						type: 'mousemove touchmove'
					}, {
						// onResize:
						element: window,

						handler: function() {
							item.update();
						},

						type: 'resize'
					}, {
						// sizeChange:
						element: item.root,

						handler: function() {
							item.update();
						},

						type: 'sizeChange'
					}, {
						// Clipper onScroll bug https://github.com/Diokuz/baron/issues/116
						element: item.clipper,

						handler: function() {
							item.clipperOnScroll();
						},

						type: 'scroll'
					}
				];

			arrayEach(item._eventHandlers, function(event) {
				if (event.element) {
					eventManager(event.element, event.type, event.handler, mode);
				}
			});

			// if (item.scroller) {
			//     event(item.scroller, 'scroll', item._eventHandlers.onScroll, mode);
			// }
			// if (item.bar) {
			//     event(item.bar, 'touchstart mousedown', item._eventHandlers.onMouseDown, mode);
			// }
			// event(document, 'mouseup blur touchend', item._eventHandlers.onMouseUp, mode);
			// event(document, 'touchstart mousedown', item._eventHandlers.onCoordinateReset, mode);
			// event(document, 'mousemove touchmove', item._eventHandlers.onMouseMove, mode);
			// event(window, 'resize', item._eventHandlers.onResize, mode);
			// if (item.root) {
			//     event(item.root, 'sizeChange', item._eventHandlers.onResize, mode);
			//     // Custon event for alternate baron update mechanism
			// }
		}

		// set, remove or read baron-specific id-attribute
		// @returns {String|undefined} - id node value, or undefined, if there is no attr
		function manageAttr(node, direction, mode, id) {
			var attrName = 'data-baron-' + direction + '-id';

			if (mode == 'on') {
				node.setAttribute(attrName, id);
			}
			else if (mode == 'off') {
				node.removeAttribute(attrName);
			}
			else {
				return node.getAttribute(attrName);
			}
		}

		function init(params) {
			// __proto__ of returning object is baron.prototype
			var out = new item.prototype.constructor(params);

			manageEvents(out, params.event, 'on');

			manageAttr(out.root, params.direction, 'on', instances.length);
			instances.push(out);

			out.update();

			out.scrollEdge = 0;
			if (params.rtl) {
				out.scrollEdge = out.clipper[out.origin.scrollEdge]; // initial position
			}

			return out;
		}

		function clone(input) {
			var output = {};

			input = input || {};

			for (var key in input) {
				if (input.hasOwnProperty(key)) {
					output[key] = input[key];
				}
			}

			return output;
		}

		function validate(input) {
			var output = clone(input);

			output.event = function(elems, e, func, mode) {
				arrayEach(elems, function(elem) {
					input.event(elem, e, func, mode);
				});
			};

			return output;
		}

		function fire(eventName) {
			/* jshint validthis:true */
			if (this.events && this.events[eventName]) {
				for (var i = 0; i < this.events[eventName].length; i++) {
					var args = Array.prototype.slice.call(arguments, 1);

					this.events[eventName][i].apply(this, args);
				}
			}
		}

		var item = {};

		item.prototype = {
			// underscore.js realization
			// used in autoUpdate plugin
			_debounce: function(func, wait) {
				var self = this,
					timeout,
					// args, // right now there is no need for arguments
					// context, // and for context
					timestamp;
				// result; // and for result

				var later = function() {
					if (self._disposed) {
						clearTimeout(timeout);
						timeout = self = null;
						return;
					}

					var last = getTime() - timestamp;

					if (last < wait && last >= 0) {
						timeout = setTimeout(later, wait - last);
					}
					else {
						timeout = null;
						// result = func.apply(context, args);
						func();
						// context = args = null;
					}
				};

				return function() {
					// context = this;
					// args = arguments;
					timestamp = getTime();

					if (!timeout) {
						timeout = setTimeout(later, wait);
					}

					// return result;
				};
			},

			constructor: function(params) {
				var $,
					barPos,
					scrollerPos0,
					track,
					resizePauseTimer,
					scrollingTimer,
					scrollLastFire,
					resizeLastFire,
					oldBarSize;

				resizeLastFire = scrollLastFire = getTime();

				$ = this.$ = params.$;
				this.event = params.event;
				this.events = {};

				function getNode(sel, context) {
					return $(sel, context)[0]; // Can be undefined
				}

				// DOM elements
				this.root = params.root; // Always html node, not just selector
				this.$root = params.$root;
				this.scroller = getNode(params.scroller);
				this.bar = getNode(params.bar, this.root);
				track = this.track = getNode(params.track, this.root);
				if (!this.track && this.bar) {
					track = this.bar.parentNode;
				}
				this.clipper = this.scroller.parentNode;

				// Parameters
				this.direction = params.direction;
				this.origin = origin[this.direction];
				this.barOnCls = params.barOnCls || '_baron';
				this.scrollingCls = params.scrollingCls;
				this.draggingCls = params.draggingCls;
				this.impact = params.impact;
				this.barTopLimit = 0;
				this.resizeDebounce = params.resizeDebounce;

				// Updating height or width of bar
				function setBarSize(size) {
					/* jshint validthis:true */
					var barMinSize = this.barMinSize || 20;

					if (size > 0 && size < barMinSize) {
						size = barMinSize;
					}

					if (this.bar) {
						$(this.bar).css(this.origin.size, parseInt(size, 10) + 'px');
					}
				}

				// Updating top or left bar position
				function posBar(pos) {
					/* jshint validthis:true */
					if (this.bar) {
						var was = $(this.bar).css(this.origin.pos),
							will = +pos + 'px';

						if (will && will != was) {
							$(this.bar).css(this.origin.pos, will);
						}
					}
				}

				// Free path for bar
				function k() {
					/* jshint validthis:true */
					return track[this.origin.client] - this.barTopLimit - this.bar[this.origin.offset];
				}

				// Relative content top position to bar top position
				function relToPos(r) {
					/* jshint validthis:true */
					return r * k.call(this) + this.barTopLimit;
				}

				// Bar position to relative content position
				function posToRel(t) {
					/* jshint validthis:true */
					return (t - this.barTopLimit) / k.call(this);
				}

				// Cursor position in main direction in px // Now with iOs support
				this.cursor = function(e) {
					return e['client' + this.origin.x] ||
						(((e.originalEvent || e).touches || {})[0] || {})['page' + this.origin.x];
				};

				// Text selection pos preventing
				function dontPosSelect() {
					return false;
				}

				this.pos = function(x) { // Absolute scroller position in px
					var ie = 'page' + this.origin.x + 'Offset',
						key = (this.scroller[ie]) ? ie : this.origin.scroll;

					if (x !== undefined) this.scroller[key] = x;

					return this.scroller[key];
				};

				this.rpos = function(r) { // Relative scroller position (0..1)
					var free = this.scroller[this.origin.scrollSize] - this.scroller[this.origin.client],
						x;

					if (r) {
						x = this.pos(r * free);
					}
					else {
						x = this.pos();
					}

					return x / (free || 1);
				};

				// Switch on the bar by adding user-defined CSS classname to scroller
				this.barOn = function(dispose) {
					if (this.barOnCls) {
						if (dispose ||
							this.scroller[this.origin.client] >= this.scroller[this.origin.scrollSize]) {
							if (this.$root.hasClass(this.barOnCls)) {
								this.$root.removeClass(this.barOnCls);
							}
						}
						else {
							if (!this.$root.hasClass(this.barOnCls)) {
								this.$root.addClass(this.barOnCls);
							}
						}
					}
				};

				this._pos0 = function(e) {
					scrollerPos0 = this.cursor(e) - barPos;
				};

				this.drag = function(e) {
					var rel = posToRel.call(this, this.cursor(e) - scrollerPos0);
					var k = (this.scroller[this.origin.scrollSize] - this.scroller[this.origin.client]);
					this.scroller[this.origin.scroll] = rel * k;
				};

				// Text selection preventing on drag
				this.selection = function(enable) {
					this.event(document, 'selectpos selectstart', dontPosSelect, enable ? 'off' : 'on');
				};

				// onResize & DOM modified handler
				// also fires on init
				this.resize = function() {
					var self = this;
					var minPeriod = (self.resizeDebounce === undefined) ? 300 : self.resizeDebounce;
					var delay = 0;

					if (getTime() - resizeLastFire < minPeriod) {
						clearTimeout(resizePauseTimer);
						delay = minPeriod;
					}

					function upd() {
						var was;
						var will;
						var offset = self.scroller[self.origin.crossOffset];
						var client = self.scroller[self.origin.crossClient];
						var padding = 0;

						// https://github.com/Diokuz/baron/issues/110
						if (isMacFF) {
							padding = macmsxffScrollbarSize;

							// Opera 12 bug https://github.com/Diokuz/baron/issues/105
						}
						else if (client > 0 && offset === 0) {
							// Only Opera 12 in some rare nested flexbox cases goes here
							// Sorry guys for magic,
							// but I dont want to create temporary html-nodes set
							// just for measuring scrollbar size in Opera 12.
							// 17px for Windows XP-8.1, 15px for Mac (really rare).
							offset = client + opera12maxScrollbarSize;
						}

						if (offset) { // if there is no size, css should not be set
							self.barOn();
							client = self.scroller[self.origin.crossClient];

							if (self.impact == 'scroller') { // scroller
								var delta = offset - client + padding;

								was = $(self.scroller).css(self.origin.crossSize);
								will = self.clipper[self.origin.crossClient] + delta + 'px';

								if (was != will) {
									self._setCrossSizes(self.scroller, will);
								}
							}
							else { // clipper
								was = $(self.clipper).css(self.origin.crossSize);
								will = client + 'px';

								if (was != will) {
									self._setCrossSizes(self.clipper, will);
								}
							}
						}

						Array.prototype.unshift.call(arguments, 'resize');
						fire.apply(self, arguments);

						resizeLastFire = getTime();
					}

					if (delay) {
						resizePauseTimer = setTimeout(upd, delay);
					}
					else {
						upd();
					}
				};

				this.updatePositions = function() {
					var newBarSize,
						self = this;

					if (self.bar) {
						newBarSize = (track[self.origin.client] - self.barTopLimit) *
							self.scroller[self.origin.client] / self.scroller[self.origin.scrollSize];

						// Positioning bar
						if (parseInt(oldBarSize, 10) != parseInt(newBarSize, 10)) {
							setBarSize.call(self, newBarSize);
							oldBarSize = newBarSize;
						}

						barPos = relToPos.call(self, self.rpos());

						posBar.call(self, barPos);
					}

					Array.prototype.unshift.call(arguments, 'scroll');
					fire.apply(self, arguments);

					scrollLastFire = getTime();
				};

				// onScroll handler
				this.scroll = function() {
					var self = this;

					self.updatePositions();

					if (self.scrollingCls) {
						if (!scrollingTimer) {
							self.$root.addClass(self.scrollingCls);
						}
						clearTimeout(scrollingTimer);
						scrollingTimer = setTimeout(function() {
							self.$root.removeClass(self.scrollingCls);
							scrollingTimer = undefined;
						}, 300);
					}

				};

				// https://github.com/Diokuz/baron/issues/116
				this.clipperOnScroll = function() {
					if (this.direction == 'h') return;

					// clipper.scrollLeft = initial scroll position (0 for ltr, 20 for rtl)
					this.clipper[this.origin.scrollEdge] = this.scrollEdge;
				};

				// Flexbox `align-items: stretch` (default) requires to set min-width for vertical
				// and max-height for horizontal scroll. Just set them all.
				// http://www.w3.org/TR/css-flexbox-1/#valdef-align-items-stretch
				this._setCrossSizes = function(node, size) {
					var css = {};

					css[this.origin.crossSize] = size;
					css[this.origin.crossMinSize] = size;
					css[this.origin.crossMaxSize] = size;

					this.$(node).css(css);
				};

				// Set most common css rules
				this._dumbCss = function(on) {
					if (params.cssGuru) return;

					var overflow = on ? 'hidden' : null;
					var msOverflowStyle = on ? 'none' : null;

					this.$(this.clipper).css({
						overflow: overflow,
						msOverflowStyle: msOverflowStyle
					});

					var scroll = on ? 'scroll' : null;
					var axis = this.direction == 'v' ? 'y' : 'x';
					var scrollerCss = {};

					scrollerCss['overflow-' + axis] = scroll;
					scrollerCss['box-sizing'] = 'border-box';
					scrollerCss.margin = '0';
					scrollerCss.border = '0';
					this.$(this.scroller).css(scrollerCss);
				};

				// onInit actions
				this._dumbCss(true);

				if (isMacFF) {
					var padding = 'paddingRight';
					var css = {};
					var paddingWas = window.getComputedStyle(this.scroller)[[padding]];
					var delta = this.scroller[this.origin.crossOffset] -
						this.scroller[this.origin.crossClient];

					if (params.direction == 'h') {
						padding = 'paddingBottom';
					}
					else if (params.rtl) {
						padding = 'paddingLeft';
					}

					// getComputedStyle is ie9+, but we here only in f ff
					var numWas = parseInt(paddingWas, 10);
					if (numWas != numWas) numWas = 0;
					css[padding] = (macmsxffScrollbarSize + numWas) + 'px';
					$(this.scroller).css(css);
				}

				return this;
			},

			// fires on any update and on init
			update: function(params) {
				fire.call(this, 'upd', params); // Update all plugins' params

				this.resize(1);
				this.updatePositions();

				return this;
			},

			// One instance
			dispose: function(params) {
				manageEvents(this, this.event, 'off');
				manageAttr(this.root, params.direction, 'off');
				if (params.direction == 'v') {
					this._setCrossSizes(this.scroller, '');
				}
				else {
					this._setCrossSizes(this.clipper, '');
				}
				this._dumbCss(false);
				this.barOn(true);
				fire.call(this, 'dispose');
				this._disposed = true;
			},

			on: function(eventName, func, arg) {
				var names = eventName.split(' ');

				for (var i = 0; i < names.length; i++) {
					if (names[i] == 'init') {
						func.call(this, arg);
					}
					else {
						this.events[names[i]] = this.events[names[i]] || [];

						this.events[names[i]].push(function(userArg) {
							func.call(this, userArg || arg);
						});
					}
				}
			}
		};

		baron.fn.constructor.prototype = baron.fn;
		item.prototype.constructor.prototype = item.prototype;

		// Use when you need "baron" global var for another purposes
		baron.noConflict = function() {
			window.baron = _baron; // Restoring original value of "baron" global var

			return baron;
		};

		baron.version = '2.0.1';

		if ($ && $.fn) { // Adding baron to jQuery as plugin
			$.fn.baron = baron;
		}

		window.baron = baron; // Use noConflict method if you need window.baron var for another purposes
		if (true) {
			module.exports = baron.noConflict();
		}
	})(window);

	/* Autoupdate plugin for baron 0.6+ */
	(function(window) {
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;

		var autoUpdate = function() {
			var self = this;
			var watcher;

			if (this._au) {
				return;
			}

			function actualizeWatcher() {
				if (!self.root[self.origin.offset]) {
					startWatch();
				}
				else {
					stopWatch();
				}
			}

			// Set interval timeout for watching when root node will be visible
			function startWatch() {
				if (watcher) return;

				watcher = setInterval(function() {
					if (self.root[self.origin.offset]) {
						stopWatch();
						self.update();
					}
				}, 300); // is it good enough for you?)
			}

			function stopWatch() {
				clearInterval(watcher);
				watcher = null;
			}

			var debouncedUpdater = self._debounce(function() {
				self.update();
			}, 300);

			this._observer = new MutationObserver(function() {
				actualizeWatcher();
				self.update();
				debouncedUpdater();
			});

			this.on('init', function() {
				self._observer.observe(self.root, {
					childList: true,
					subtree: true,
					characterData: true
					// attributes: true
					// No reasons to set attributes to true
					// The case when root/child node with already properly inited baron toggled to hidden and then back to visible,
					// and the size of parent was changed during that hidden state, is very rare
					// Other cases are covered by watcher, and you still can do .update by yourself
				});

				actualizeWatcher();
			});

			this.on('dispose', function() {
				self._observer.disconnect();
				stopWatch();
				delete self._observer;
			});

			this._au = true;
		};

		baron.fn.autoUpdate = function(params) {
			if (!MutationObserver) return this;

			var i = 0;

			while (this[i]) {
				autoUpdate.call(this[i], params);
				i++;
			}

			return this;
		};
	})(window);

	/* Controls plugin for baron 0.6+ */
	(function(window, undefined) {
		var controls = function(params) {
			var forward, backward, track, screen,
				self = this, // AAAAAA!!!!!11
				event;

			screen = params.screen || 0.9;

			if (params.forward) {
				forward = this.$(params.forward, this.clipper);

				event = {
					element: forward,

					handler: function() {
						var y = self.pos() + (params.delta || 30);

						self.pos(y);
					},

					type: 'click'
				};

				this._eventHandlers.push(event); // For auto-dispose
				this.event(event.element, event.type, event.handler, 'on');
			}

			if (params.backward) {
				backward = this.$(params.backward, this.clipper);

				event = {
					element: backward,

					handler: function() {
						var y = self.pos() - (params.delta || 30);

						self.pos(y);
					},

					type: 'click'
				};

				this._eventHandlers.push(event); // For auto-dispose
				this.event(event.element, event.type, event.handler, 'on');
			}

			if (params.track) {
				if (params.track === true) {
					track = this.track;
				}
				else {
					track = this.$(params.track, this.clipper)[0];
				}

				if (track) {
					event = {
						element: track,

						handler: function(e) {
							// https://github.com/Diokuz/baron/issues/121
							if (e.target != track) return;

							var x = e['offset' + self.origin.x],
								xBar = self.bar[self.origin.offsetPos],
								sign = 0;

							if (x < xBar) {
								sign = -1;
							}
							else if (x > xBar + self.bar[self.origin.offset]) {
								sign = 1;
							}

							var y = self.pos() + sign * screen * self.scroller[self.origin.client];
							self.pos(y);
						},

						type: 'mousedown'
					};

					this._eventHandlers.push(event); // For auto-dispose
					this.event(event.element, event.type, event.handler, 'on');
				}
			}
		};

		baron.fn.controls = function(params) {
			var i = 0;

			while (this[i]) {
				controls.call(this[i], params);
				i++;
			}

			return this;
		};
	})(window);

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var $ = __webpack_require__(2);
	var LayoutView = __webpack_require__(21);
	var Template = __webpack_require__(33);
	var StateModel = __webpack_require__(34);
	var ListCollection = __webpack_require__(35);
	var TableListView = __webpack_require__(37);

	var View = LayoutView.extend({

		className: 'vls-gf-view-folder-overview',

		template: Template,

		regions: {
			listPanel: '.vls-gf-list'
		},

		ui: {},

		events: {},

		state: new StateModel(),

		initialize: function(options) {

			this.folderId = options.folderId;

			this.listenTo(this.radio, 'folder:contentChanged', this.onFolderContentChanged);

			this.collection = new ListCollection([], {parentId: this.folderId});
			this.listenTo(this.collection, 'sync', this.onCollectionSync);
			this.collection.fetch();

		},

		onShow: function() {
			this.radio.trigger('global:needAdjustFixedElement', {});
		},

		onCollectionSync: function() {
			this._renderList();
		},

		onFolderContentChanged: function(params) {
			if (this.folderId === params.id) {
				this.collection.fetch();
			}
		},

		_renderList: function() {

			this.$el.find('.vls-gf-empty-message').remove();

			if (this.collection.length === 0) {
				this.listPanel.empty();
				var emptyMessage = $('<div>').addClass('vls-gf-empty-message');
				if (this.folderId === 0) {
					emptyMessage.html(this.l10n.t('rootFolderEmpty'));
				}
				else {
					emptyMessage.html(this.l10n.t('folderEmpty'));
				}
				this.$el.append(emptyMessage);

			}
			else {

				this.listPanel.show(new TableListView({collection: this.collection}));
			}
		}

	});

	module.exports = View;


/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-list">\r\n</div>\r\n\r\n<div class="vls-gf-clear">\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var Backbone = __webpack_require__(3);

	var Model = Backbone.Model.extend({
		defaults: {
			listMode: 'grid',
			sortBy: 'none',
			sortOrder: 'asc'
		}
	});

	module.exports = Model;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var _ = __webpack_require__(5);
	var Backbone = __webpack_require__(3);
	var Model = __webpack_require__(36);

	var Collection = Backbone.Collection.extend({

		model: Model,
		url: 'node_collection',
		parentId: 0,

		initialize: function(models, options) {
			this.type = options.type || 'folder';
			this.parentId = options.parentId;

			this.sortAttribute = 'id';
			this.sortOrder = 'asc';
		},

		fetch: function(options) {

			options = options ? options : {};
			options = _.extend(options, {data: {parent_type: this.type, parent_id: this.parentId, view: 'list_item'}});
			Backbone.Collection.prototype.fetch.call(this, options);

		},

		comparator: function(model) {
			var attribute = this.sortAttribute;
			return ( model.get(attribute) );
		},

		sortByAttribute: function(attribute, order) {
			this.comparator = function(model) {
				return model.get(attribute);
			};

			if (order === 'desc') {

				this.sort({silent: true});
				this.models = this.models.reverse();
				this.trigger('sort', this);
			}
			else {
				this.sort();
			}
		},

		selected: function() {
			return this.filter(function(model) {
				return model.get('selected');
			});
		}

	});

	module.exports = Collection;


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var PersistentModel = __webpack_require__(17);

	var Model = PersistentModel.extend({

		url: 'node',

		toJSON: function() {
			var data = PersistentModel.prototype.toJSON.call(this);
			data.file_size_kb = data.file_size ? Math.round(data.file_size / 1024) : 0;
			return data;
		}

	});

	module.exports = Model;

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var CompositeView = __webpack_require__(26);
	var Template = __webpack_require__(38);
	var ListItemView = __webpack_require__(39);


	var View = CompositeView.extend({


		tagName: 'table',
		className: 'vls-gf-table',

		template: Template,
		templateHelpers: function() {
			return {
				t: {
					name: this.l10n.t('name'),
					caption: this.l10n.t('caption'),
					description: this.l10n.t('description'),
					folderCount: this.l10n.t('folderCount'),
					albumCount: this.l10n.t('albumCount')
				}
			}
		},

		childView: ListItemView,
		childViewContainer: '>tbody',

		initialize: function(options) {
		}

	});

	module.exports = View;


/***/ },
/* 38 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<thead>\r\n<tr>\r\n	<th></th>\r\n	<th>'+
	((__t=( t.name ))==null?'':__t)+
	'</th>\r\n	<th>'+
	((__t=( t.caption ))==null?'':__t)+
	'</th>\r\n	<th>'+
	((__t=( t.description ))==null?'':__t)+
	'</th>\r\n</tr>\r\n</thead>\r\n<tbody></tbody>';
	}
	return __p;
	};


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var ItemView = __webpack_require__(40);
	var EditableTableCellBehavior = __webpack_require__(41);
	var Template = __webpack_require__(42);


	var View = ItemView.extend({

		tagName: 'tr',

		template: Template,

		behaviors: {
			editableTableCell: {
				behaviorClass: EditableTableCellBehavior
			}
		},

		events: {
			'click': 'onBodyClick',
			'dblclick': 'onBodyDoubleClick'
		},

		initialize: function(options) {

			this.isActive = false;

			this.listenTo(this.radio, 'manager:content:itemActivated', this.onItemActivated);
			this.listenTo(this.radio, 'manager:content:bulkSelectModeActivated', this.onBulkSelectModeActivated);
			this.listenTo(this.radio, 'manager:content:bulkSelectModeDeactivated', this.onBulkSelectModeDeactivated);

		},

		onBodyClick: function(e) {

			if (this.isSelectMode) {
				this.toggleSelection(e);
			}
			else {

				this.isActive = true;
				this.$el.addClass('vls-gf-active');
				this.radio.trigger('manager:content:itemActivated', {
					type: this.model.get('type'),
					id: this.model.get('id')
				});

			}
			return false;
		},

		onBodyDoubleClick: function(e) {
			e.preventDefault();

			this.radio.trigger('navigation:requested', {
				type: this.model.get('type'),
				id: this.model.get('id'),
				name: this.model.get('name')
			});

		},

		/**
		 * Deactivates item when another item is activated
		 * @param params
		 */
		onItemActivated: function(params) {
			if (this.isActive && this.model.get('id') !== params.id) {
				this.isActive = false;
				this.$el.removeClass('vls-gf-active');
			}
		},

		onBulkSelectModeActivated: function(params) {
			this.isSelectMode = true;
			this.$el.addClass('vls-gf-selectable');
		},

		onBulkSelectModeDeactivated: function(params) {
			this.isSelectMode = false;
			this.$el.removeClass('vls-gf-selectable');
		},


	});

	module.exports = View;



































/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */

	'use strict';

	var Marionette = __webpack_require__(8);
	var radio = __webpack_require__(13);
	var l10n = __webpack_require__(22);

	var View = Marionette.ItemView.extend({

		l10n: l10n,
		radio: radio

	});

	module.exports = View;



/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var $ = __webpack_require__(2);
	var Marionette = __webpack_require__(8);


	var Behavior = Marionette.Behavior.extend({

		ui: {
			fields: 'td>.vls-gf-editable'
		},

		events: {
			'click @ui.fields': 'onEditableClick',
			'dblclick @ui.fields': 'onEditableDoubleClick'
		},

		onEditableClick: function(e) {

			var view = this.view;

			if (view.inlineEditMode) {
				return false;
			}

			if (view.isSelectMode) {
				return;
			}

			view.inlineEditMode = true;

			var app = $('#vls-gf-app'),
				viewEl = view.$el,
				field = $(e.target),
				attr = field.data('attr'),
				input = $('<input type="text"/>').val(view.model.get(attr));

			viewEl.addClass('vls-gf-edited');
			field.addClass('vls-gf-edited');

			var blurMask = $('<div id="vls-gf-blur-mask"></div>');
			blurMask.on('click touchstart', function(e) {
				input.blur();
				e.preventDefault();
				e.stopPropagation();
			});

			input.on('click dblclick', function(e) {
				e.stopPropagation();
			});

			input.on('change blur', function() {
				var val = $(this).val(),
					model = view.model,
					oldVal = model.get(attr);

				if (val != oldVal) {

					model.save(attr, val, {parse: false, patch: true});

					if (model.get('type') == 'folder') {
						view.radio.trigger('folder:changed', {model: model});
					}
					else if (model.get('type') == 'album') {
						view.radio.trigger('album:changed', {model: model});
					}
					else if (model.get('id')) {
						view.radio.trigger('image:changed', {model: model, source: 'inlineEdit'});
					}
				}

				viewEl.removeClass('vls-gf-edited');
				field.text(val).removeClass('vls-gf-edited');
				view.inlineEditMode = false;
				blurMask.remove();

			});

			app.append(blurMask);
			field.html(input);
			input.focus();

			e.stopPropagation();
			e.preventDefault();

		},

		onEditableDoubleClick: function(e) {
			e.stopPropagation();
		}

	});

	module.exports = Behavior;



/***/ },
/* 42 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<td><i class="vls-gf-icon vls-gf-icon-'+
	((__t=( type ))==null?'':__t)+
	'-b"></i></td>\r\n<td>\r\n	<div class="vls-gf-editable" data-attr="name">'+
	((__t=( name ))==null?'':__t)+
	'</div>\r\n</td>\r\n<td>\r\n	<div class="vls-gf-editable" data-attr="caption">'+
	((__t=( caption ))==null?'':__t)+
	'</div>\r\n</td>\r\n<td>\r\n	<div class="vls-gf-editable" data-attr="description">'+
	((__t=( description ))==null?'':__t)+
	'</div>\r\n</td>';
	}
	return __p;
	};


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var _ = __webpack_require__(5);
	var $ = __webpack_require__(2);
	var LayoutView = __webpack_require__(21);
	var Template = __webpack_require__(44);
	var StateModel = __webpack_require__(45);
	var ImagesCollection = __webpack_require__(46);
	var NodesCollection = __webpack_require__(35);
	var GridListView = __webpack_require__(48);
	var TableListView = __webpack_require__(52);


	var View = LayoutView.extend({

		className: 'vls-gf-view-album-overview',

		template: Template,
		templateHelpers: function() {
			return {
				t: {
					tt: {
						toggleListMode: this.l10n.t('tooltips.toggleListMode'),
						activateBulkSelectMode: this.l10n.t('tooltips.activateBulkSelectMode'),
						cancelSelection: this.l10n.t('tooltips.cancelSelection'),
						selectAll: this.l10n.t('tooltips.selectAll'),
						selectInvert: this.l10n.t('tooltips.selectInvert'),
						selectNone: this.l10n.t('tooltips.selectNone'),
						deleteSelected: this.l10n.t('tooltips.deleteSelected')
					}
				}
			}
		},


		regions: {
			listPanel: '.vls-gf-image-list'
		},

		ui: {
			bulkSelectToolbar: '#vls-gf-album-overview-toolbar-select',

			btnActivateBulkSelectMode: '#vls-gf-album-overview-toolbar-default button.vls-gf-icon-select-b',
			btnCancelBulkSelectMode: '#vls-gf-album-overview-toolbar-select button.vls-gf-icon-close-w',
			btnListModeTable: '#vls-gf-album-overview-toolbar-default button[data-action="list-mode-table"]',
			btnListModeThumbs: '#vls-gf-album-overview-toolbar-default button[data-action="list-mode-thumbs"]',

			btnSelectAll: '#vls-gf-album-overview-toolbar-select button[data-action="select-all"]',
			btnSelectInvert: '#vls-gf-album-overview-toolbar-select button[data-action="select-invert"]',
			btnSelectNone: '#vls-gf-album-overview-toolbar-select button[data-action="select-none"]',
			btnDeleteSelected: '#vls-gf-album-overview-toolbar-select button[data-action="delete-selected"]',

			txtSelectedImages: '#vls-gf-album-overview-toolbar-select > h4'
		},

		events: {
			'click @ui.btnActivateBulkSelectMode': 'onBtnActivateBulkSelectMode',
			'click @ui.btnCancelBulkSelectMode': 'onBtnCancelBulkSelectMode',
			'click @ui.btnListModeTable': 'onBtnToggleListMode',
			'click @ui.btnListModeThumbs': 'onBtnToggleListMode',
			'click @ui.btnSelectAll': 'onBtnSelectAll',
			'click @ui.btnSelectInvert': 'onBtnSelectInvert',
			'click @ui.btnSelectNone': 'onBtnSelectNone',
			'click @ui.btnDeleteSelected': 'onBtnDeleteSelected'
		},

		childEvents: {
			'selection:toggle': 'onSelectionToggle'
		},

		collectionEvents: {},

		state: new StateModel(),

		initialize: function(options) {

			this.type = options.type;
			this.albumId = options.albumId || 0;
			this.bulkSelectMode = false;

			this.listenTo(this.radio, 'manager:content:bulkSelectModeActivated', this.onBulkSelectModeActivated);
			this.listenTo(this.radio, 'manager:content:bulkSelectModeDeactivated', this.onBulkSelectModeDeactivated);
			this.listenTo(this.radio, 'album:contentChanged', this.onAlbumContentChanged);
			this.listenTo(this.radio, 'image:changed', this.onImageChanged);

			this.radio.reply('album:getNeighbourImage', this.getNeighbourImage.bind(this));


			if (this.type === 'all_images' || this.type === 'unsorted_images') {
				this.collection = new ImagesCollection([], {type: this.type});
			}
			else {
				this.collection = new NodesCollection([], {type: this.type, parentId: this.albumId});
			}

			this.listenTo(this.collection, 'sync', this.onCollectionSync);
			this.collection.fetch();


		},

		onRender: function() {
			if (this.state.get('listMode') === 'table') {
				this.ui.btnListModeTable.hide();
			}
			else {
				this.ui.btnListModeThumbs.hide();
			}
		},

		onShow: function() {
			this.radio.trigger('global:needAdjustFixedElement', {});
		},

		onCollectionSync: function() {
			this._renderList();
		},

		onBtnActivateBulkSelectMode: function() {
			this.radio.trigger('manager:content:bulkSelectModeActivated', {});
		},

		onBtnCancelBulkSelectMode: function() {
			this.radio.trigger('manager:content:bulkSelectModeDeactivated', {});
		},

		onBulkSelectModeActivated: function() {

			//this.onSelectionToggle(); //update selection message

			this.bulkSelectMode = true;
			this.ui.txtSelectedImages.html(this.l10n.t('nImagesSelected', 0));
			this.ui.bulkSelectToolbar.css({'display': 'block'});
		},

		onBulkSelectModeDeactivated: function() {
			this.onBtnSelectNone();
			this.bulkSelectMode = false;
			this.ui.bulkSelectToolbar.css({'display': 'none'});
		},

		onSelectionToggle: function(child, params) {

			if (!this.bulkSelectMode) {
				this.radio.trigger('manager:content:bulkSelectModeActivated', {});
			}


			var lastSelectedModel = this.lastSelectedModel,
				selectedModel = child.model;


			if (params.shiftKey && lastSelectedModel && selectedModel !== lastSelectedModel) {

				var inRange = false,
					rangeEnterModel = null;
				this.collection.each(function(model) {
					if (!inRange && (model === selectedModel || model === lastSelectedModel)) {
						rangeEnterModel = model;
						inRange = true;
					}
					if (inRange) {
						model.set('selected', params.selected);
					}
					if (inRange && rangeEnterModel !== model && (model === selectedModel || model === lastSelectedModel)) {
						inRange = false;
					}
				});
			}

			//store last selected model
			this.lastSelectedModel = selectedModel;

			this._updateSelectedCountInfo();
		},

		onBtnToggleListMode: function() {
			var btn,
				mode = this.state.get('listMode');

			if (mode === 'grid') {
				this.state.set('listMode', 'table');

				this.ui.btnListModeTable.hide();

				btn = this.ui.btnListModeThumbs;
				btn.addClass('vls-gf-no-tooltip').show();
				setTimeout(function() {
					btn.removeClass('vls-gf-no-tooltip');
				}, 100);

			}
			else {
				this.state.set('listMode', 'grid');

				this.ui.btnListModeThumbs.hide();

				btn = this.ui.btnListModeTable;
				btn.addClass('vls-gf-no-tooltip').show();
				setTimeout(function() {
					btn.removeClass('vls-gf-no-tooltip');
				}, 100);
			}
			this._renderList();
		},

		onBtnSelectAll: function() {
			this.collection.each(function(item) {
				item.set('selected', true);
			});
			this._updateSelectedCountInfo();
		},

		onBtnSelectInvert: function() {
			this.collection.each(function(item) {
				item.set('selected', !item.get('selected'));
			});
			this._updateSelectedCountInfo();
		},

		onBtnSelectNone: function() {
			this.collection.each(function(item) {
				item.set('selected', false);
			});
			this._updateSelectedCountInfo();
		},

		onBtnDeleteSelected: function() {

			var radio = this.radio,
				selectedCollection = this.collection.selected(),
				albumId = this.albumId,
				selectedIds = [];

			_.each(selectedCollection, function(image) {
				selectedIds.push(image.get('id'));
			});

			//sending delete request to the server
			var ajaxParams;

			if (this.type === 'all_images' || this.type === 'unsorted_images') {
				ajaxParams = {
					action: 'vls_gf_api_image_collection',
					_method: 'DELETE',
					_nonce: vlsGFData.nonce,
					collection: JSON.stringify(selectedIds)
				};
			}
			else {
				ajaxParams = {
					action: 'vls_gf_api_node_collection',
					_method: 'DELETE',
					_nonce: vlsGFData.nonce,
					collection: JSON.stringify(selectedIds)
				};
			}

			$.post(
				ajaxurl,
				ajaxParams,
				function() {
					radio.trigger('manager:content:bulkSelectModeDeactivated', {});
					radio.trigger('album:contentChanged', {id: albumId});
				}
			);

		},

		onAlbumContentChanged: function(params) {
			if (this.albumId === params.id) {
				this.collection.fetch();
			}
		},

		getNeighbourImage: function(params) {
			var collection = this.collection,
				index, curModel;

			curModel = collection.findWhere({'image_id': params.id});

			index = collection.indexOf(curModel);

			if (index < 0) {
				return null;
			}

			if (params.direction == 'next') {
				if (index >= collection.length - 1) {
					index = 0;
				}
				else {
					index = index + 1;
				}
			}
			else {
				if (index <= 0) {
					index = collection.length - 1;
				}
				else {
					index = index - 1;
				}
			}

			var returnModel = collection.at(index);

			return {
				id: returnModel.get('image_id'),
				name: returnModel.get('name')
			}
		},

		onImageChanged: function(params) {

			if (params.source == 'inlineEdit') {
				return;
			}

			var changedId = params.model.get('id');
			var changedModel = this.collection.get(changedId);
			if (changedModel) {

				//force reload thumbnail
				var thumbnail_url = changedModel.get('thumbnail_url');
				var ts = Date.now();
				thumbnail_url = thumbnail_url.replace(/\?\d+$/, '?' + ts);

				changedModel.set({
					name: params.model.get('name'),
					caption: params.model.get('caption'),
					description: params.model.get('description'),
					thumbnail_url: thumbnail_url
				});

				this._renderList();
			}
		},

		_renderList: function() {
			if (this.collection.length === 0) {
				this.listPanel.empty();
				this.$el.find('.vls-gf-empty-message').remove();

				var emptyMessage = $('<div>').addClass('vls-gf-empty-message');
				if (this.type === 'album') {
					emptyMessage.html(this.l10n.t('albumImageListEmpty'));
				}
				else if (this.type === 'all_images') {
					emptyMessage.html(this.l10n.t('allImagesEmpty'));
				}
				else if (this.type === 'unsorted_images') {
					emptyMessage.html(this.l10n.t('unsortedImagesEmpty'));
				}

				this.$el.append(emptyMessage);

			}
			else if (this.state.get('listMode') === 'table') {
				this.$el.find('.vls-gf-empty-message').remove();
				this.listPanel.show(new TableListView({collection: this.collection}));
			}
			else {
				this.$el.find('.vls-gf-empty-message').remove();
				this.listPanel.show(new GridListView({collection: this.collection}));
			}

			//init draggable behavior
			this.$el.find('.vls-gf-image-list>ul>li, table>tbody>tr').draggable({
				delay: 100,
				//cursor: 'none',
				helper: this._getItemDragHelper.bind(this),
				cursorAt: {top: 20, left: 20},
				appendTo: 'body',
				addClasses: false,
				start: this._onItemDragStart.bind(this),
				stop: this._onItemDragStop.bind(this)
			});

		},

		_getItemDragHelper: function(e) {

			var selectedImages = this.collection.selected(),
				draggedImages = [],
				sourceId = this.albumId;


			if (selectedImages.length == 0) {
				var imageId = $(e.target).closest('li,tr').data("vlsGfImageId");
				draggedImages.push(parseInt(imageId));
			}
			else {
				_.each(selectedImages, function(image) {
					draggedImages.push(parseInt(image.get('image_id')));
				});
			}

			var $helper = $('<div id="vls-gf-image-drag-helper">' + draggedImages.length + '</div>');
			$helper.data('draggedImages', draggedImages);
			$helper.data('sourceAlbum', sourceId);
			return $helper;

		},

		_onItemDragStart: function(e, ui) {
			$(e.target).addClass('vls-gf-dragged-image');
			$('#vls-gf-layer-primary .vls-gf-nav-panel').addClass('vls-gf-drop-ready');
		},

		_onItemDragStop: function(e, ui) {
			$(e.target).removeClass('vls-gf-dragged-image');
			$('#vls-gf-layer-primary .vls-gf-nav-panel').removeClass('vls-gf-drop-ready');
		},

		_updateSelectedCountInfo: function() {
			//update selected count info
			var selectedCount = this.collection.selected().length;
			this.ui.txtSelectedImages.html(this.l10n.t('nImagesSelected', selectedCount));
		}

	});

	module.exports = View;


/***/ },
/* 44 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div id="vls-gf-album-overview-toolbar-default" class="vls-gf-secondary-toolbar">\r\n	<ul class="vls-gf-visible">\r\n		<li>\r\n			<button data-action="bulk-select" class="vls-gf-icon vls-gf-icon-select-b"\r\n					data-vls-gf-tooltip="'+
	((__t=( t.tt.activateBulkSelectMode ))==null?'':__t)+
	'" data-vls-gf-position="below"\r\n					data-vls-gf-offset="14"></button>\r\n		</li>\r\n		<li>\r\n			<button data-action="list-mode-table" class="vls-gf-icon vls-gf-icon-list-b"\r\n					data-vls-gf-tooltip="'+
	((__t=( t.tt.toggleListMode ))==null?'':__t)+
	'" data-vls-gf-position="below"\r\n					data-vls-gf-offset="14"></button>\r\n			<button data-action="list-mode-thumbs" class="vls-gf-icon vls-gf-icon-view-comfy-b"\r\n					data-vls-gf-tooltip="'+
	((__t=( t.tt.toggleListMode ))==null?'':__t)+
	'" data-vls-gf-position="below"\r\n					data-vls-gf-offset="14"></button>\r\n		</li>\r\n	</ul>\r\n</div>\r\n\r\n<div id="vls-gf-album-overview-toolbar-select" class="vls-gf-secondary-toolbar">\r\n         <span>\r\n            <button class="vls-gf-icon vls-gf-icon-close-w" data-vls-gf-tooltip="'+
	((__t=( t.tt.cancelSelection ))==null?'':__t)+
	'"\r\n					data-vls-gf-position="below" data-vls-gf-offset="14"></button>\r\n        </span>\r\n	<h4></h4>\r\n	<ul class="vls-gf-visible">\r\n		<li>\r\n			<button data-action="select-all" class="vls-gf-icon vls-gf-icon-select-all-w"\r\n					data-vls-gf-tooltip="'+
	((__t=( t.tt.selectAll ))==null?'':__t)+
	'" data-vls-gf-position="below"\r\n					data-vls-gf-offset="14"></button>\r\n		</li>\r\n		<li>\r\n			<button data-action="select-invert" class="vls-gf-icon vls-gf-icon-select-invert-w"\r\n					data-vls-gf-tooltip="'+
	((__t=( t.tt.selectInvert ))==null?'':__t)+
	'" data-vls-gf-position="below"\r\n					data-vls-gf-offset="14"></button>\r\n		</li>\r\n		<li>\r\n			<button data-action="select-none" class="vls-gf-icon vls-gf-icon-select-none-w"\r\n					data-vls-gf-tooltip="'+
	((__t=( t.tt.selectNone ))==null?'':__t)+
	'" data-vls-gf-position="below"\r\n					data-vls-gf-offset="14"></button>\r\n		</li>\r\n		<li class="vls-gf-spaced">\r\n			<button data-action="delete-selected" class="vls-gf-icon vls-gf-icon-delete-w"\r\n					data-vls-gf-tooltip="'+
	((__t=( t.tt.deleteSelected ))==null?'':__t)+
	'" data-vls-gf-position="below"\r\n					data-vls-gf-offset="14"></button>\r\n		</li>\r\n	</ul>\r\n</div>\r\n\r\n<div class="vls-gf-image-list">\r\n</div>\r\n\r\n<div class="vls-gf-clear">\r\n</div>\r\n';
	}
	return __p;
	};


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var Backbone = __webpack_require__(3);

	var Model = Backbone.Model.extend({
		defaults: {
			listMode: 'grid',
			sortBy: 'none',
			sortOrder: 'asc'
		}
	});

	module.exports = Model;

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	/**
	 * Images overview collection
	 * Collection of images for "All images" and "Unsorted images" lists
	 */

	var _ = __webpack_require__(5);
	var Backbone = __webpack_require__(3);
	var Model = __webpack_require__(47);

	var Collection = Backbone.Collection.extend({

		model: Model,
		url: 'image_collection',

		initialize: function(models, options) {
			this.type = options.type || 'all_images';

			this.sortAttribute = 'id';
			this.sortOrder = 'asc';
		},

		fetch: function(options) {

			options = options ? options : {};
			options = _.extend(options, {data: {collection_type: this.type, view: 'list_item'}});
			Backbone.Collection.prototype.fetch.call(this, options);

		},

		comparator: function(model) {
			var attribute = this.sortAttribute;
			return ( model.get(attribute) );
		},

		sortByAttribute: function(attribute, order) {
			this.comparator = function(model) {
				return model.get(attribute);
			};

			if (order === 'desc') {

				this.sort({silent: true});
				this.models = this.models.reverse();
				this.trigger('sort', this);
			}
			else {
				this.sort();
			}
		},

		selected: function() {
			return this.filter(function(model) {
				return model.get('selected');
			});
		}

	});

	module.exports = Collection;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var PersistentModel = __webpack_require__(17);

	var Model = PersistentModel.extend({

		url: 'image',

		parse: function(data) {
			data.type = 'image_entity';
			data.order_no = 0;
			data.image_id = data.id;
			return data;
		},

		toJSON: function() {
			var data = PersistentModel.prototype.toJSON.call(this);
			data.file_size_kb = data.file_size ? Math.round(data.file_size / 1024) : 0;
			return data;
		}

	});

	module.exports = Model;

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var CollectionView = __webpack_require__(49);
	var ListItemView = __webpack_require__(50);

	var View = CollectionView.extend({

		tagName: 'ul',
		childView: ListItemView

	});

	module.exports = View;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */

	'use strict';

	var Marionette = __webpack_require__(8);
	var radio = __webpack_require__(13);
	var l10n = __webpack_require__(22);

	var View = Marionette.CollectionView.extend({

		l10n: l10n,
		radio: radio

	});

	module.exports = View;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var ItemView = __webpack_require__(40);
	var Radio = __webpack_require__(13);
	var Template = __webpack_require__(51);


	var View = ItemView.extend({

		tagName: 'li',

		template: Template,

		// ui: {
		//     'selectIcon': '> i'
		// },
		// //
		events: {
			'mousedown': 'onBodyMousedown',
			'click': 'onBodyClick', 'touchstart': 'onBodyClick',
			'dblclick': 'onBodyDoubleClick'
		},

		modelEvents: {
			'change:selected': 'onChangeSelected'
		},

		initialize: function(options) {

			this.isActive = false;
			this.isSelectMode = false;

			this.listenTo(this.radio, 'manager:content:itemActivated', this.onItemActivated);
			this.listenTo(this.radio, 'manager:content:bulkSelectModeActivated', this.onBulkSelectModeActivated);
			this.listenTo(this.radio, 'manager:content:bulkSelectModeDeactivated', this.onBulkSelectModeDeactivated);

		},

		onRender: function() {
			//TODO: bad idea, need to get rid of using DOM (image to album drag behavior)
			var imageId = this.model.get('image_id');
			this.$el.data("vlsGfImageId", imageId);
		},

		onBodyMousedown: function(e) {
			//prevent selection with shift button
			if (this.isSelectMode && e.shiftKey) {
				e.preventDefault();
			}
		},

		onBodyClick: function(e) {

			if (this.isSelectMode) {

				this.toggleSelection(e);

			}
			else {
				this.isActive = true;
				this.$el.addClass('vls-gf-active');

				this.radio.trigger('manager:content:itemActivated', {
					type: 'image',
					id: this.model.get('id'),
					imageId: this.model.get('image_id')
				});
			}

			return false;
		},

		onBodyDoubleClick: function(e) {
			e.preventDefault();
			var params = {
				view: 'image',
				id: this.model.get('image_id'),
				name: this.model.get('name')
			};
			if (this.model.get('type') === 'image') {
				params.nodeId = this.model.get('id');
			}

			this.radio.trigger('global:requestRoute', params);
		},

		toggleSelection: function(e) {

			var selected = !this.model.get('selected');
			this.model.set('selected', selected);

			this.triggerMethod('selection:toggle', {
				shiftKey: e.shiftKey,
				selected: selected
			});

		},

		/**
		 * Deactivates item when another item is activated
		 * @param params
		 */
		onItemActivated: function(params) {
			if (this.isActive && this.model.get('imageId') !== params.id) {
				this.isActive = false;
				this.$el.removeClass('vls-gf-active');
			}
		},

		onBulkSelectModeActivated: function(params) {
			this.isSelectMode = true;
			this.$el.addClass('vls-gf-selectable');
		},

		onBulkSelectModeDeactivated: function(params) {
			this.isSelectMode = false;
			this.$el.removeClass('vls-gf-selectable');
		},

		onChangeSelected: function() {
			var selected = this.model.get('selected');
			if (selected) {
				this.$el.addClass('vls-gf-selected');
			}
			else {
				this.$el.removeClass('vls-gf-selected');
			}
		}


	});

	module.exports = View;



































/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<img src="'+
	((__t=( icon_url ))==null?'':__t)+
	'">\r\n<i></i>';
	}
	return __p;
	};


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	var CompositeView = __webpack_require__(26);
	var Template = __webpack_require__(53);
	var ListItemView = __webpack_require__(54);

	var View = CompositeView.extend({

		tagName: 'table',
		className: 'vls-gf-table',
		reorderOnSort: true,

		template: Template,
		templateHelpers: function() {
			return {
				t: {
					name: this.l10n.t('name'),
					caption: this.l10n.t('caption'),
					description: this.l10n.t('description'),
					creationDate: this.l10n.t('creationDate'),
					fileName: this.l10n.t('fileName'),
					fileSize: this.l10n.t('fileSize')
				}
			}
		},

		childView: ListItemView,
		childViewContainer: '>tbody',

		ui: {
			headers: 'thead tr th'
		},

		events: {
			'click @ui.headers': 'sortBy'
		},

		sortBy: function(e) {
			var attribute = this.$(e.target).data('name');

			if (!attribute) {
				return;
			}

			var order = (this.sortOrder === 'desc') ? 'desc' : 'asc';

			if (this.sortAttribute && this.sortAttribute === attribute) {
				order = (order === 'asc') ? 'desc' : 'asc';
			}
			else {
				order = 'asc';
			}
			this.sortAttribute = attribute;
			this.sortOrder = order;

			// // update visual
			this.$el.find('thead tr th').removeClass('vls-gf-sorted-asc vls-gf-sorted-desc');
			this.$el.find('thead tr th[data-name="' + attribute + '"]').addClass('vls-gf-sorted-' + order);

			this.collection.sortByAttribute(attribute, order);
		}
	});

	module.exports = View;


/***/ },
/* 53 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<thead>\r\n<tr>\r\n	<th></th>\r\n	<th></th>\r\n	<th data-name="name"><i></i>'+
	((__t=( t.name ))==null?'':__t)+
	'</th>\r\n	<th data-name="caption"><i></i>'+
	((__t=( t.caption ))==null?'':__t)+
	'</th>\r\n	<th data-name="description"><i></i>'+
	((__t=( t.description ))==null?'':__t)+
	'</th>\r\n	<th data-name="filename"><i></i>'+
	((__t=( t.fileName ))==null?'':__t)+
	'</th>\r\n	<th data-name="created"><i></i>'+
	((__t=( t.creationDate ))==null?'':__t)+
	'</th>\r\n	<th data-name="file_size"><i></i>'+
	((__t=( t.fileSize ))==null?'':__t)+
	'</th>\r\n</tr>\r\n</thead>\r\n<tbody></tbody>';
	}
	return __p;
	};


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var ItemView = __webpack_require__(40);
	var EditableTableCellBehavior = __webpack_require__(41);
	var Template = __webpack_require__(55);

	var View = ItemView.extend({
		tagName: 'tr',

		template: Template,

		behaviors: {
			editableTableCell: {
				behaviorClass: EditableTableCellBehavior
			}
		},

		ui: {
			'selectCheckbox': '.vls-gf-checkbox',
			'name': 'td:nth-child(3)>div'
		},
		//
		events: {
			'mousedown': 'onBodyMousedown',
			'click': 'onBodyClick', 'touchstart': 'onBodyClick',
			'dblclick': 'onBodyDoubleClick',
			'mousedown @ui.selectCheckbox': 'onSelectCheckboxMousedown',
			'click @ui.selectCheckbox': 'onSelectCheckboxClick',
			'click @ui.name': 'onNameClick'
		},

		modelEvents: {
			'change:selected': 'onChangeSelected'
		},

		initialize: function(options) {

			this.isActive = false;
			this.isSelectMode = false;
			this.inlineEditMode = false;

			this.listenTo(this.radio, 'manager:content:itemActivated', this.onItemActivated);
			this.listenTo(this.radio, 'manager:content:bulkSelectModeActivated', this.onBulkSelectModeActivated);
			this.listenTo(this.radio, 'manager:content:bulkSelectModeDeactivated', this.onBulkSelectModeDeactivated);
		},

		onRender: function() {
			//bad idea, need to get rid of using DOM (image to album drag behavior)
			var imageId = this.model.get('image_id');
			this.$el.data("vlsGfImageId", imageId);
		},

		onBodyMousedown: function(e) {
			//prevent selection with shift button
			if (this.isSelectMode && e.shiftKey) {
				e.preventDefault();
			}
		},

		onBodyClick: function(e) {
			if (this.isSelectMode) {
				this.toggleSelection(e);
			}
			else {
				this.isActive = true;
				this.$el.addClass('vls-gf-active');

				// check1
				this.radio.trigger('manager:content:itemActivated', {
					type: this.model.get('type'),
					id: this.model.get('id'),
					imageId: this.model.get('image_id')
				});
			}
		},

		onBodyDoubleClick: function(e) {
			e.preventDefault();

			// check2

			var params = {
				view: 'image',
				id: this.model.get('image_id'),
				name: this.model.get('name')
			};

			if (this.model.get('type') === 'image') {
				params.node_id = this.model.get('id');
			}

			this.radio.trigger('global:requestRoute', params);
		},

		onSelectCheckboxMousedown: function(e) {
			//prevent selection with shift button
			e.preventDefault();
		},

		onSelectCheckboxClick: function(e) {
			e.preventDefault();
			this.toggleSelection(e);
			return false;
		},

		toggleSelection: function(e) {

			var selected = !this.model.get('selected');

			this.model.set('selected', selected);

			this.triggerMethod('selection:toggle', {
				shiftKey: e.shiftKey,
				selected: selected
			});

		},

		/**
		 * Deactivates item when another item is activated
		 * @param params
		 */
		onItemActivated: function(params) {
			if (this.isActive && this.model.get('id') !== params.id) {
				this.isActive = false;
				this.$el.removeClass('vls-gf-active');
			}
		},

		onBulkSelectModeActivated: function(params) {
			this.isSelectMode = true;
			this.$el.addClass('vls-gf-selectable');
		},

		onBulkSelectModeDeactivated: function(params) {
			this.isSelectMode = false;
			this.$el.removeClass('vls-gf-selectable');
		},

		onChangeSelected: function() {
			var selected = this.model.get('selected');
			if (selected) {
				this.$el.addClass('vls-gf-selected');
				this.ui.selectCheckbox.addClass('vls-gf-checked')
			}
			else {
				this.$el.removeClass('vls-gf-selected');
				this.ui.selectCheckbox.removeClass('vls-gf-checked')
			}
		}
	});

	module.exports = View;



































/***/ },
/* 55 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<td>\r\n	<div class="vls-gf-checkbox"></div>\r\n</td>\r\n<td><img src="'+
	((__t=( icon_url ))==null?'':__t)+
	'"></td>\r\n<td>\r\n	<div class="vls-gf-editable" data-attr="name">'+
	((__t=( name ))==null?'':__t)+
	'</div>\r\n</td>\r\n<td>\r\n	<div class="vls-gf-editable" data-attr="caption">'+
	((__t=( caption ))==null?'':__t)+
	'</div>\r\n</td>\r\n<td>\r\n	<div class="vls-gf-editable" data-attr="description">'+
	((__t=( description ))==null?'':__t)+
	'</div>\r\n</td>\r\n<td>'+
	((__t=( filename ))==null?'':__t)+
	'</td>\r\n<td>'+
	((__t=( created ))==null?'':__t)+
	'</td>\r\n<td>'+
	((__t=( file_size_kb ))==null?'':__t)+
	' kB</td>';
	}
	return __p;
	};


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var PersistentModel = __webpack_require__(17);

	var Model = PersistentModel.extend({
		url: 'folder',
		api_view: 'summary'
	});

	module.exports = Model;

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(58);

	var View = ItemView.extend({

		className: 'vls-gf-view-folder-summary',
		template: '<div><div class="vls-gf-progress-lin-ind"></div></div>',
		templateHelpers: function() {
			return {
				t: {
					name: this.l10n.t('name'),
					caption: this.l10n.t('caption'),
					description: this.l10n.t('description')
				}
			}
		},

		ui: {},

		modelEvents: {
			"sync": "renderLoaded"
		},

		initialize: function(options) {
			this.listenTo(this.radio, 'folder:changed', this.onFolderChanged);
			this.model.fetch();
		},

		renderLoaded: function() {
			this.template = Template;
			this.render();
			this.radio.trigger('global:needAdjustFixedElement', {});
		},

		onFolderChanged: function(params) {
			var changedModel = params.model;
			if (this.model.get('id') == changedModel.get('id')) {
				this.model.set('name', changedModel.get('name'));
				if (changedModel.get('caption')) {
					this.model.set('caption', changedModel.get('caption'));
				}
				if (changedModel.get('description')) {
					this.model.set('description', changedModel.get('description'));
				}
				if (changedModel.get('cover_url')) {
					this.model.set('cover_url', changedModel.get('cover_url'));
				}
				this.render();
			}
		}

	});

	module.exports = View;


/***/ },
/* 58 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-scroll-scroller">\r\n	<div class="vls-gf-content">\r\n		\r\n		<img src="'+
	((__t=( cover_url ))==null?'':__t)+
	'">\r\n		\r\n		<div class="vls-gf-form">\r\n			<h4>'+
	((__t=( name ))==null?'':__t)+
	'</h4>\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.caption ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( caption ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro vls-gf-ml">\r\n				<span>'+
	((__t=( t.description ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( description ))==null?'':__t)+
	'</span>\r\n			</div>\r\n		</div>\r\n	\r\n	</div>\r\n	<div class="vls-gf-scroll-bar"></div>\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var PersistentModel = __webpack_require__(17);

	var Model = PersistentModel.extend({
		url: 'folder',
		api_view: 'summary'
	});

	module.exports = Model;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(61);

	var View = ItemView.extend({

		className: 'vls-gf-view-album-summary',
		template: '<div><div class="vls-gf-progress-lin-ind"></div></div>',
		templateHelpers: function() {
			return {
				t: {
					name: this.l10n.t('name'),
					caption: this.l10n.t('caption'),
					description: this.l10n.t('description')
				}
			}
		},

		ui: {},

		modelEvents: {
			"sync": "renderLoaded"
		},

		initialize: function(options) {
			this.listenTo(this.radio, 'album:changed', this.onAlbumChanged);
			this.model.fetch();
		},

		renderLoaded: function() {
			this.template = Template;
			this.render();
			this.radio.trigger('global:needAdjustFixedElement', {});
		},

		onAlbumChanged: function(params) {
			var changedModel = params.model;
			if (this.model.get('id') == changedModel.get('id')) {
				this.model.set('name', changedModel.get('name'));
				if (changedModel.get('caption')) {
					this.model.set('caption', changedModel.get('caption'));
				}
				if (changedModel.get('description')) {
					this.model.set('description', changedModel.get('description'));
				}
				if (changedModel.get('cover_url')) {
					this.model.set('cover_url', changedModel.get('cover_url'));
				}
				this.render();
			}
		}

	});

	module.exports = View;


/***/ },
/* 61 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-scroll-scroller">\r\n	<div class="vls-gf-content">\r\n		\r\n		<img src="'+
	((__t=( cover_url ))==null?'':__t)+
	'">\r\n		\r\n		<div class="vls-gf-form">\r\n			<h4>'+
	((__t=( name ))==null?'':__t)+
	'</h4>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.caption ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( caption ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro vls-gf-ml">\r\n				<span>'+
	((__t=( t.description ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( description ))==null?'':__t)+
	'</span>\r\n			</div>\r\n		\r\n		</div>\r\n	\r\n	</div>\r\n	<div class="vls-gf-scroll-bar"></div>\r\n</div>\r\n';
	}
	return __p;
	};


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var PersistentModel = __webpack_require__(17);

	var Model = PersistentModel.extend({
		url: 'image',
		api_view: 'summary',

		toJSON: function() {
			var data = PersistentModel.prototype.toJSON.call(this);
			data.file_size_kb = Math.round(data.file_size / 1024);

			if (data.image_meta && data.image_meta.shutter_speed) {
				var dec = parseFloat(data.image_meta.shutter_speed);
				if (dec < 1) {
					data.image_meta.shutter_speed_display = '1/' + Math.round(1 / dec);
				}
				else {
					data.image_meta.shutter_speed_display = dec;
				}
			}

			return data;
		}
	});

	module.exports = Model;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var $ = __webpack_require__(2);
	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(64);
	var Baron = __webpack_require__(31);

	var View = ItemView.extend({

		className: 'vls-gf-view-image-summary',
		template: '<div><div class="vls-gf-progress-lin-ind"></div></div>',
		templateHelpers: function() {
			return {
				t: {
					file: this.l10n.t('file'),
					exif: this.l10n.t('exif'),
					name: this.l10n.t('name'),
					caption: this.l10n.t('caption'),
					description: this.l10n.t('description'),
					altText: this.l10n.t('altText'),
					fileName: this.l10n.t('fileName'),
					fileSize: this.l10n.t('fileSize'),
					dimensions: this.l10n.t('dimensions'),
					uploadDate: this.l10n.t('uploadDate'),
					camera: this.l10n.t('camera'),
					lens: this.l10n.t('lens'),
					focalLength: this.l10n.t('focalLength'),
					shutterSpeed: this.l10n.t('shutterSpeed'),
					aperture: this.l10n.t('aperture'),
					iso: this.l10n.t('iso'),
					creationDate: this.l10n.t('creationDate')
				}
			}
		},

		ui: {
			'cover': '> img',
			'btnEdit': 'button.vls-gf-icon-edit-h'
		},

		events: {
			'click @ui.btnEdit': 'onBtnEditClick'
		},

		modelEvents: {
			"sync": "renderLoaded"
		},

		initialize: function(options) {
			this.listenTo(this.radio, 'image:changed', this.onImageChanged);
			this.model.fetch();
		},

		renderLoaded: function() {

			this.template = Template;
			this.render();

			if (this.$el.data('baronVId')) {
				Baron.call(this.$el).dispose();
			}

			var baronParams = {
				$: $,
				scroller: '.vls-gf-scroll-scroller',
				container: '.vls-gf-content',
				bar: '.vls-gf-scroll-bar',
				barOnCls: 'vls-gf-bar-on',
				scrollingCls: 'vls-gf-scrolling',
				cssGuru: true
			};
			Baron.call(this.$el, baronParams);


			this.radio.trigger('global:needAdjustFixedElement', {});
		},

		onBtnEditClick: function(e) {
			e.preventDefault();

			// check3

			this.radio.trigger('global:requestRoute', {
				view: 'image',
				id: this.model.get('id'),
				name: this.model.get('name'),
				nodeId: this.model.get('node_id')
			});
		},

		onImageChanged: function(params) {
			var changedModel = params.model;

			var changedId = params.model.get('imageId');
			if (!changedId) {
				changedId = params.model.get('id')
			}

			if (this.model.get('id') == changedId) {

				if (changedModel.get('name')) {
					this.model.set('name', changedModel.get('name'));
				}
				if (changedModel.get('caption')) {
					this.model.set('caption', changedModel.get('caption'));
				}
				if (changedModel.get('description')) {
					this.model.set('description', changedModel.get('description'));
				}

				this.render();

			}
		}
	});

	module.exports = View;


/***/ },
/* 64 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-scroll-scroller">\r\n	<div class="vls-gf-content">\r\n		\r\n		<img src="'+
	((__t=( cover_url ))==null?'':__t)+
	'">\r\n		<button class="vls-gf-btn-icon vls-gf-icon vls-gf-icon-edit-h" data-vls-gf-tooltip="Edit image"\r\n				data-vls-gf-position="left"></button>\r\n		<div class="vls-gf-form">\r\n			<h4>'+
	((__t=( name ))==null?'':__t)+
	'</h4>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.caption ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( caption ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro vls-gf-ml">\r\n				<span>'+
	((__t=( t.description ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( description ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.altText ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( alt_text ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			\r\n			<h5>'+
	((__t=( t.file ))==null?'':__t)+
	'</h5>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.fileName ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( filename ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.fileSize ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( file_size_kb ))==null?'':__t)+
	' kB</span>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.dimensions ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( width ))==null?'':__t)+
	'&times;'+
	((__t=( height ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.uploadDate ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( created ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			\r\n			<h5>'+
	((__t=( t.exif ))==null?'':__t)+
	'</h5>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.camera ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( image_meta.camera ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.lens ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( image_meta.lens ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.focalLength ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( image_meta.focal_length ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.shutterSpeed ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( image_meta.shutter_speed_display ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.aperture ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( image_meta.aperture ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.iso ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( image_meta.iso ))==null?'':__t)+
	'</span>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.creationDate ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( image_meta.creation_date ))==null?'':__t)+
	'</span>\r\n			</div>\r\n		\r\n		</div>\r\n	\r\n	</div>\r\n	<div class="vls-gf-scroll-bar"></div>\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var Backbone = __webpack_require__(3);

	var PersistentModel = __webpack_require__(17);
	var ImageCollection = __webpack_require__(66);

	var Model = PersistentModel.extend({
		url: 'folder',
		api_view: 'editor',

		parse: function(response) {
			response.items = new ImageCollection(response.items);
			response.view_meta = new Backbone.Model(response.view_meta);
			response.layout_meta = new Backbone.Model(response.layout_meta);
			response.style_meta = new Backbone.Model(response.style_meta);
			return response;
		},

		toJSON: function(options) {
			var json = PersistentModel.prototype.toJSON.call(this, options);

			json.items = json.items ? json.items.toJSON(options) : {};
			json.view_meta = json.view_meta ? json.view_meta.toJSON() : {};
			json.layout_meta = json.layout_meta ? json.layout_meta.toJSON() : {};
			json.style_meta = json.style_meta ? json.style_meta.toJSON() : {};

			// Remove some attributes from the server call data
			if (options && options.mode === 'sync') {
				delete json.cover_url;
			}

			return json;
		}
	});

	module.exports = Model;

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	/*Album images collection for editor (has no its own fetch, constructed by album model*/

	var Backbone = __webpack_require__(3);
	var Model = __webpack_require__(67);

	var Collection = Backbone.Collection.extend({

		model: Model,

		comparator: 'layout_order_no',

		initialize: function(models, options) {
		},

		toCompactedJSON: function(options) {
			return this.map(function(model) {
				return model.toCompactedJSON(options);
			});
		}

	});

	module.exports = Collection;


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var _ = __webpack_require__(5);
	var Backbone = __webpack_require__(3);

	var Model = Backbone.Model.extend({

		setMeta: function(key, newMeta) {
			var meta = this.get(key) || {};
			meta = _.extend(meta, newMeta);
			this.set(key, meta);
		},

		toJSON: function(options) {
			var json = _.clone(this.attributes);
			if (options && options.mode === 'sync') {
				json = _.pick(json, ['id', 'layout_order_no', 'crop_meta', 'layout_meta']);
			}
			return json;
		}
	});

	module.exports = Model;

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	/*global require, module*/

	var LayoutView = __webpack_require__(21);

	var Template = __webpack_require__(69);

	var GeneralTabView = __webpack_require__(70);
	var LayoutTabView = __webpack_require__(72);
	//var StyleTabView = require('views/folderEditor/tabStyle');
	var SettingsTabView = __webpack_require__(88);


	var View = LayoutView.extend({

		className: "vls-gf-view-folder-editor",

		template: Template,
		templateHelpers: function() {
			return {
				t: {
					tabGeneral: this.l10n.t('tabGeneral'),
					tabLayout: this.l10n.t('tabLayout'),
					tabStyle: this.l10n.t('tabStyle'),
					tabSettings: this.l10n.t('tabSettings'),
					tt: {
						saveChanges: this.l10n.t('tooltips.saveChanges')
					}
				}
			}
		},

		regions: {
			content: '.vls-gf-content-wrapper'
		},

		ui: {
			header: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar h3',
			btnBack: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar button.vls-gf-icon-back-w',
			btnSave: '.vls-gf-fixed-wrapper button.vls-gf-fab',
			btnTabGeneral: '.vls-gf-fixed-wrapper .vls-gf-tab-bar li[data-tab="general"]',
			btnTabLayout: '.vls-gf-fixed-wrapper .vls-gf-tab-bar li[data-tab="layout"]',
			//btnTabStyle: '.vls-gf-fixed-wrapper .vls-gf-tab-bar li[data-tab="style"]',
			btnTabSettings: '.vls-gf-fixed-wrapper .vls-gf-tab-bar li[data-tab="settings"]'
		},

		events: {
			'click @ui.btnBack': 'onBtnBack',
			'click @ui.btnSave': 'onBtnSave',
			'click @ui.btnTabGeneral': 'onBtnTabGeneral',
			'click @ui.btnTabLayout': 'onBtnTabLayout',
			//'click @ui.btnTabStyle': 'onBtnTabStyle',
			'click @ui.btnTabSettings': 'onBtnTabSettings'
		},

		modelEvents: {
			'sync': 'onModelSync',
			'change:name': 'onNameChange'
		},

		initialize: function(options) {
			this.currentTab = 'general';
			this.model.fetch();
		},

		onModelSync: function(model, data, options) {
			if (!options.parse) {
				return;
			}

			this.render();
			this._renderTabs();
		},

		onBtnBack: function() {
			this.radio.trigger('global:requestRoute', {view: 'manager'});
		},

		onBtnSave: function() {
			if (this.savingInProgress) return;

			this.savingInProgress = true;
			this.ui.btnSave.addClass('vls-gf-in-progress');

			this.model.save(
				null,
				{
					parse: false,
					patch: true,
					success: this.onSaveSuccess.bind(this)
				}
			);

		},

		onSaveSuccess: function() {
			this.savingInProgress = false;
			if (!this.isDestroyed) {
				this.ui.btnSave.removeClass('vls-gf-in-progress');
			}
			this.radio.trigger('dialog:notification:requested', {message: this.l10n.t('albumSaved')});
			this.radio.trigger('album:changed', {model: this.model});
		},

		onBtnTabGeneral: function() {
			this.currentTab = 'general';
			this._renderTabs();
		},

		onBtnTabLayout: function() {
			this.currentTab = 'layout';
			this._renderTabs();
		},

		// onBtnTabStyle: function () {
		//     this.currentTab = 'style';
		//     this._renderTabs();
		// },

		onBtnTabSettings: function() {
			this.currentTab = 'settings';
			this._renderTabs();
		},

		onNameChange: function() {
			this.ui.header.html(this.model.get('name'));
		},

		_renderTabs: function() {

			if (this.currentTab === 'general') {
				this.ui.btnTabGeneral.addClass('vls-gf-active');
				this.content.show(new GeneralTabView({model: this.model}));
			}
			else {
				this.ui.btnTabGeneral.removeClass('vls-gf-active');
			}

			if (this.currentTab === 'layout') {
				this.ui.btnTabLayout.addClass('vls-gf-active');
				this.content.show(new LayoutTabView({model: this.model}));
			}
			else {
				this.ui.btnTabLayout.removeClass('vls-gf-active');
			}

			// if (this.currentTab === 'style') {
			//     this.ui.btnTabStyle.addClass('vls-gf-active');
			//     this.content.show(new StyleTabView({model: this.model}));
			// } else {
			//     this.ui.btnTabStyle.removeClass('vls-gf-active');
			// }

			if (this.currentTab === 'settings') {
				this.ui.btnTabSettings.addClass('vls-gf-active');
				this.content.show(new SettingsTabView({model: this.model}));
			}
			else {
				this.ui.btnTabSettings.removeClass('vls-gf-active');
			}

			this.radio.trigger('global:needAdjustFixedElement', {});

		}
	});

	module.exports = View;

/***/ },
/* 69 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-fixed-wrapper">\r\n	<div class="vls-gf-primary-toolbar">\r\n        <span>\r\n            <button class="vls-gf-icon vls-gf-icon-back-w"></button>\r\n        </span>\r\n		<h3>'+
	((__t=( name ))==null?'':__t)+
	'</h3>\r\n	</div>\r\n	<div class="vls-gf-tab-bar">\r\n		<ul>\r\n			<li data-tab="general"><span>'+
	((__t=( t.tabGeneral ))==null?'':__t)+
	'</span></li>\r\n			<li data-tab="layout"><span>'+
	((__t=( t.tabLayout ))==null?'':__t)+
	'</span></li>\r\n			<li data-tab="settings"><span>'+
	((__t=( t.tabSettings ))==null?'':__t)+
	'</span></li>\r\n		</ul>\r\n	</div>\r\n	<button class="vls-gf-fab vls-gf-icon vls-gf-icon-done-w" data-vls-gf-tooltip="'+
	((__t=( t.tt.saveChanges ))==null?'':__t)+
	'"\r\n			data-vls-gf-position="below" data-vls-gf-offset="14"></button>\r\n</div>\r\n\r\n<div class="vls-gf-content-wrapper"></div>';
	}
	return __p;
	};


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	/*global require, module */
	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(71);

	var View = ItemView.extend({

		className: 'vls-gf-view-tab-general',

		template: Template,

		templateHelpers: function() {
			return {
				t: {
					name: this.l10n.t('name'),
					slug: this.l10n.t('slug'),
					caption: this.l10n.t('caption'),
					description: this.l10n.t('description'),
					shortcode: this.l10n.t('shortcode'),
					setCoverImage: this.l10n.t('setCoverImage')
				}
			}
		},

		ui: {
			fldName: '#vls-gf-fld-name',
			fldSlug: '#vls-gf-fld-slug',
			fldCaption: '#vls-gf-fld-caption',
			fldDescription: '#vls-gf-fld-description',
			coverElement: '.vls-gf-cover-image',
			coverImage: '.vls-gf-cover-image img'
		},

		events: {
			'change @ui.fldName': 'onFldNameChange',
			'change @ui.fldSlug': 'onFldSlugChange',
			'change @ui.fldCaption': 'onFldCaptionChange',
			'change @ui.fldDescription': 'onFldDescriptionChange',
			'click @ui.coverElement': 'openSelectionModal'
		},

		initialize: function(options) {
			this.listenTo(this.radio, 'dialog:selectImage:confirmed', this.onImageSelected);
		},

		onFldNameChange: function() {
			this.model.set('name', this.ui.fldName.val());
		},

		onFldSlugChange: function() {
			this.model.set('slug', this.ui.fldSlug.val());
		},

		onFldCaptionChange: function() {
			this.model.set('caption', this.ui.fldCaption.val());
		},

		onFldDescriptionChange: function() {
			this.model.set('description', this.ui.fldDescription.val());
		},

		openSelectionModal: function() {
			this.radio.trigger('dialog:selectImage:requested', {id: this.model.get('id')});
		},

		onImageSelected: function(params) {
			this.model.set({
				image_id: params.id,
				cover_url: params.value
			});

			this.ui.coverImage.attr('src', params.value);
		},

		serializeData: function() {
			var data = this.model.toJSON();
			if (!data.cover_url) {
				data.cover_url = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjMyMHB4IiBoZWlnaHQ9IjMyMHB4IiB2aWV3Qm94PSIwIDAgMzIwIDMyMCIgPg0KPHJlY3QgZmlsbD0iI0UyRTJFMiIgd2lkdGg9IjMyMCIgaGVpZ2h0PSIzMjAiLz4NCjxwYXRoIGZpbGw9IiNGM0YzRjMiIGQ9Ik0yNTAsMjMwVjkwYzAtMTEtOS0yMC0yMC0yMEg5MGMtMTEsMC0yMCw5LTIwLDIwdjE0MGMwLDExLDksMjAsMjAsMjBoMTQwQzI0MSwyNTAsMjUwLDI0MSwyNTAsMjMweg0KCSBNMTI1LDE3NWwyNSwzMC4xbDM1LTQ1LjFsNDUsNjBIOTBMMTI1LDE3NXoiLz4NCjwvc3ZnPg==';
			}
			return data;
		}

	});

	module.exports = View;


/***/ },
/* 71 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-main-panel">\r\n	\r\n	<div class="vls-gf-right-col">\r\n		\r\n		<div class="vls-gf-cover-image">\r\n			<img src="'+
	((__t=( cover_url ))==null?'':__t)+
	'">\r\n			<div>\r\n				<div>'+
	((__t=( t.setCoverImage ))==null?'':__t)+
	'</div>\r\n			</div>\r\n		</div>\r\n	\r\n	</div>\r\n	\r\n	<div class="vls-gf-left-col">\r\n		<div class="vls-gf-form">\r\n			\r\n			<div class="vls-gf-row">\r\n				<div class="vls-gf-col-2">\r\n					<div class="vls-gf-field">\r\n						<label for="vls-gf-fld-name">'+
	((__t=( t.name ))==null?'':__t)+
	'</label>\r\n						<input id="vls-gf-fld-name" type="text" value="'+
	((__t=( name ))==null?'':__t)+
	'"/>\r\n					</div>\r\n				</div>\r\n				<div class="vls-gf-col-2">\r\n					<div class="vls-gf-field">\r\n						<label for="vls-gf-fld-slug">'+
	((__t=( t.slug ))==null?'':__t)+
	'</label>\r\n						<input id="vls-gf-fld-slug" type="text" value="'+
	((__t=( slug ))==null?'':__t)+
	'"/>\r\n					</div>\r\n				</div>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field">\r\n				<label for="vls-gf-fld-caption">'+
	((__t=( t.caption ))==null?'':__t)+
	'</label>\r\n				<input id="vls-gf-fld-caption" type="text" value="'+
	((__t=( caption ))==null?'':__t)+
	'"/>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field">\r\n				<label for="vls-gf-fld-description">'+
	((__t=( t.description ))==null?'':__t)+
	'</label>\r\n				<textarea id="vls-gf-fld-description">'+
	((__t=( description ))==null?'':__t)+
	'</textarea>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.shortcode ))==null?'':__t)+
	'</span>\r\n				<span>[vls_gf_album id=&quot;'+
	((__t=( id ))==null?'':__t)+
	'&quot;]</span>\r\n			</div>\r\n		\r\n		</div>\r\n	</div>\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */

	/*Album editor = tab layout*/


	var Marionette = __webpack_require__(8);
	var Radio = __webpack_require__(13);

	var Template = __webpack_require__(73);

	var MainPanelView = __webpack_require__(74);
	var SidePanelView = __webpack_require__(85);


	var View = Marionette.LayoutView.extend({

		className: "vls-gf-view-tab-layout",

		template: Template,

		regions: {
			mainPanel: '.vls-gf-main-panel',
			sidePanel: '.vls-gf-side-panel'
		},

		radio: Radio,

		initialize: function(options) {
		},

		onRender: function(options) {

		},

		onBeforeShow: function() {

			this.mainPanel.show(new MainPanelView({
				collection: this.model.get('items'),
				layoutMeta: this.model.get('layout_meta')
			}));

			this.sidePanel.show(new SidePanelView({model: this.model.get('layout_meta')}));

		}
	});

	module.exports = View;



/***/ },
/* 73 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-main-panel">\r\n</div>\r\n<div class="vls-gf-side-panel">\r\n</div>\r\n';
	}
	return __p;
	};


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var CompositeView = __webpack_require__(26);

	var Template = __webpack_require__(75);
	var TabLayoutImageView = __webpack_require__(76);
	var StateModel = __webpack_require__(78);

	var GridLayoutEditor = __webpack_require__(79);
	var MetroLayoutEditor = __webpack_require__(81);
	var MasonryVLayoutEditor = __webpack_require__(83);

	var View = CompositeView.extend({
		className: 'vls-gf-view-tab-layout-main-panel',
		sort: false,

		template: Template,

		childView: TabLayoutImageView,
		childViewContainer: '>ul',

		ui: {
			btnZoomIn: '.vls-gf-secondary-toolbar .vls-gf-icon-zoom-in-b',
			btnZoomOut: '.vls-gf-secondary-toolbar .vls-gf-icon-zoom-out-b',
			imageList: '>ul'
		},

		events: {
			'click @ui.btnZoomIn': 'onBtnZoomIn',
			'click @ui.btnZoomOut': 'onBtnZoomOut'
		},

		state: new StateModel(),

		initialize: function(options) {
			this.layoutMeta = options.layoutMeta;

			this.childViewOptions = {
				layoutMeta: options.layoutMeta
			};

			this.listenTo(this.layoutMeta, 'change:layout_type', this.onLayoutTypeChange);
			this.listenTo(this.radio, 'global:windowResize', this.onWindowResize);
		},

		onDestroy: function() {
			this.layoutEditor.destroy();

			// Clean up the collection (needed for correct positioning on page switching)
			this.collection.each(function(item) {
				item.set('placement', null, {silent: true});
			});
		},

		onAttach: function() {
			this._initLayoutModule();

			//reveal animation
			var i = 0;
			this.children.each(function(view) {
				var $el = view.$el,
					delay = i * 40;
				setTimeout(function() {
					$el.removeClass('vls-gf-init');
				}, delay);
				i++;
			});
		},

		onWindowResize: function() {
			this._setZoom();
		},

		onLayoutTypeChange: function(val) {
			this._initLayoutModule();
		},

		onBtnZoomIn: function() {
			var zoom = this.state.get('zoom');

			switch (zoom) {
				case 0.75:
					zoom = 1;
					break;
				case 0.5:
					zoom = 0.75;
					break;
				case 0.25:
					zoom = 0.5;
					break;
				case 0.125:
					zoom = 0.25;
					break;
				case 0.0625:
					zoom = 0.125;
					break;
				default:
					zoom = 1;
			}

			this._setZoom(zoom);
		},

		onBtnZoomOut: function() {
			var zoom = this.state.get('zoom');

			switch (zoom) {
				case 1:
					zoom = 0.75;
					break;
				case 0.75:
					zoom = 0.5;
					break;
				case 0.5:
					zoom = 0.25;
					break;
				case 0.25:
					zoom = 0.125;
					break;
				case 0.125:
					zoom = 0.0625;
					break;
				default:
					zoom = 0.0625;
			}

			this._setZoom(zoom);
		},

		_initLayoutModule: function() {
			if (this.layoutEditor) {
				this.layoutEditor.destroy();
			}

			var layoutType = this.layoutMeta.get('layout_type');
			if (layoutType === 'grid') {
				this.layoutEditor = new GridLayoutEditor({
					$el: this.ui.imageList,
					layoutSettings: this.layoutMeta,
					items: this.collection
				});
			}
			else if (layoutType === 'metro') {
				this.layoutEditor = new MetroLayoutEditor({
					$el: this.ui.imageList,
					layoutSettings: this.layoutMeta,
					items: this.collection
				});
			}
			else if (layoutType === 'masonry-v') {
				this.layoutEditor = new MasonryVLayoutEditor({
					$el: this.ui.imageList,
					layoutSettings: this.layoutMeta,
					items: this.collection
				});
			}
			else {
				console.log('Unknown layout type');
				return;
			}

			this._setZoom();
		},

		_setZoom: function(zoom) {

			var viewState = this.state;

			if (!zoom) {
				zoom = viewState.get('zoom');
			}

			viewState.set({
				zoom: zoom
			});

			this.layoutEditor.setZoom(zoom);
			this.layoutEditor.updateLayout();

			// Set ul class (for image styling)
			this.ui.imageList.removeClass('vls-gf-zoom-1 vls-gf-zoom-2 vls-gf-zoom-3 vls-gf-zoom-4 vls-gf-zoom-5 vls-gf-zoom-6');
			switch (zoom) {
				case 1:
					this.ui.imageList.addClass('vls-gf-zoom-1');
					break;
				case 0.75:
					this.ui.imageList.addClass('vls-gf-zoom-2');
					break;
				case 0.5:
					this.ui.imageList.addClass('vls-gf-zoom-3');
					break;
				case 0.25:
					this.ui.imageList.addClass('vls-gf-zoom-4');
					break;
				case 0.125:
					this.ui.imageList.addClass('vls-gf-zoom-5');
					break;
				case 0.0625:
					this.ui.imageList.addClass('vls-gf-zoom-6');
					break;
			}

			// Update button availability
			if (zoom === 1) {
				this.ui.btnZoomIn.addClass('vls-gf-disabled');
			}
			else {
				this.ui.btnZoomIn.removeClass('vls-gf-disabled');
			}

			if (zoom === 0.0625) {
				this.ui.btnZoomOut.addClass('vls-gf-disabled');
			}
			else {
				this.ui.btnZoomOut.removeClass('vls-gf-disabled');
			}
		}
	});

	module.exports = View;


/***/ },
/* 75 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-secondary-toolbar">\r\n	<ul class="vls-gf-visible">\r\n		<li>\r\n			<button class="vls-gf-icon vls-gf-icon-zoom-in-b"></button>\r\n		</li>\r\n		<li>\r\n			<button class="vls-gf-icon vls-gf-icon-zoom-out-b"></button>\r\n		</li>\r\n		<li style="display:none;">\r\n			<button id="vls-gf-btn-toggle-pin-layout" class="vls-gf-icon vls-gf-icon-pin-b"></button>\r\n		</li>\r\n	</ul>\r\n</div>\r\n<ul></ul>\r\n\r\n';
	}
	return __p;
	};


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */

	var Marionette = __webpack_require__(8);
	var Radio = __webpack_require__(13);
	var Template = __webpack_require__(77);

	var View = Marionette.ItemView.extend({

	    template: Template,

	    ui: {},

	    events: {
	        'click': 'onElementClick'
	    },

	    modelEvents: {
	        'change:placement': 'onPlacementChange',
	        'change:crop_meta': 'onCropChange',
	        'change:layout_order_no': 'onLayoutOrderNoChange'
	    },

	    radio: Radio,

	    initialize: function(options) {
	        this.layoutMeta = options.layoutMeta;
	    },

	    onRender: function() {
	        //unwrap element template from extra tag
	        this.$el = this.$el.children();
	        this.$el.unwrap();
	        this.setElement(this.$el);

	        // Append helpers
	        for (var i = 1; i <= 8; i++) {
	            this.$el.append('<span class="vls-gf-resize-helper"></span>');
	        }
	    },

	    onPlacementChange: function() {
	        var placement = this.model.get('placement');
	        this.$el.css({
	            width: placement.width + 'px',
	            height: placement.height + 'px',
	            top: placement.top + 'px',
	            left: placement.left + 'px'
	        });
	    },

	    onCropChange: function() {
	        var self = this;

	        var cropMeta = this.model.get('crop_meta');
	        var imgWidth = this.model.get('image_width');
	        var imgHeight = this.model.get('image_height');

	        if (cropMeta.top || cropMeta.left || cropMeta.width || cropMeta.height) {

	            var top = cropMeta.top || 0;
	            var left = cropMeta.left || 0;
	            var width = cropMeta.width || (imgWidth - left);
	            var height = cropMeta.height || (imgHeight - top);

	            var image = new Image;

	            var url = this.model.get('url');
	            if (!url) return;

	            image.onload = function() {
	                self.updateThumbnailCrop(this, top, left, width, height);
	            };

	            image.src = url;


	            this.model.set('thumbnail_width', width);
	            this.model.set('thumbnail_height', height);
	        }
	        else {
	            this.$el.css({
	                'background-image': 'url(' + this.model.get('thumbnail_url') + ')'
	            });

	            this.model.set('thumbnail_width', imgWidth);
	            this.model.set('thumbnail_height', imgHeight);

	        }

	        this.model.trigger('change:thumbnail_size');
	    },

	    onLayoutOrderNoChange: function() {
	        this.$('.vls-gf-order-no').html(this.model.get('layout_order_no'));
	    },

	    onElementClick: function(e) {
	        if (!this.$el.hasClass('vls-gf-no-click')) {
	            this.radio.trigger('dialog:cropper:requested', {item: this.model});
	        }
	    },

	    updateThumbnailCrop: function(image, top, left, width, height) {

	        var canvas = document.createElement('canvas');
	        var ctx = canvas.getContext('2d');


	        // Calculate the size of the cropped image
	        canvas.width = width;
	        canvas.height = height;

	        // draw source image into the off-screen canvas:
	        ctx.drawImage(image, left, top, width, height, 0, 0, width, height);

	        // encode image to data-uri with base64 version of compressed image
	        var imageData = canvas.toDataURL('image/jpeg', 0.9);

	        this.$el.css({
	            'background-image': 'url(' + imageData + ')'
	        });
	    }
	});

	module.exports = View;



































/***/ },
/* 77 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<li class="vls-gf-init" data-id="'+
	((__t=( id ))==null?'':__t)+
	'" style="background-image:url('+
	((__t=( thumbnail_url ))==null?'':__t)+
	')"></li>\r\n';
	}
	return __p;
	};


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var Backbone = __webpack_require__(3);

	var Model = Backbone.Model.extend({
		defaults: {
			zoom: 1,
			pinLayout: false
		}
	});

	module.exports = Model;

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	var _ = __webpack_require__(5);
	var $ = __webpack_require__(2);
	var Marionette = __webpack_require__(8);
	var Calculator = __webpack_require__(80);

	var Editor = Marionette.Object.extend({

		initialize: function(options) {
			this.$el = options.$el;
			this.pageDividers = [];
			this.layoutSettingsModel = options.layoutSettings;
			this.layoutSettings = this.layoutSettingsModel.toJSON();
			this.items = options.items;
			this.calculator = new Calculator(this.getDraggedItemPosition.bind(this));

			this.listenTo(this.layoutSettingsModel, 'change', this.onLayoutSettingsChange);

			this.$el.find('>li').draggable({
				scroll: true,
				cursor: 'move',
				addClasses: false,
				start: this.dragStart.bind(this),
				drag: _.throttle(this.dragUpdate.bind(this), 100),
				stop: this.dragStop.bind(this)
			});
		},

		onDestroy: function() {
			var $items = this.$el.find('>li');
			$items.draggable('destroy');
		},

		onLayoutSettingsChange: function() {
			this.layoutSettings = this.layoutSettingsModel.toJSON();
			this._zoomSpacings();
			this.updateLayout();
		},

		setZoom: function(zoom) {
			var containerWidth = this.$el.width();
			this.zoom = zoom;
			this.layoutWidth = Math.floor(containerWidth * zoom);
			this.layoutOffset = Math.floor((containerWidth - this.layoutWidth) / 2);
			this._zoomSpacings();
		},

		updateLayout: function() {
			var params = this.layoutSettings;
			params.container_width = this.layoutWidth;

			// Module can only operate simple arrays
			var layoutItems = this._getItemList();
			this.layoutPages = this.calculator.exec(layoutItems, params);
			this._placeItems();
		},

		dragStart: function(event, ui) {
			var itemId = parseInt($(event.currentTarget).data('id'));
			var item = this.items.get(itemId);
			var placement = item.get('placement');

			item.set('placement', null, {silent: true}); // force placement on drop (the change event won't fire otherwise)

			var params = this.layoutSettings;
			params.container_width = this.layoutWidth;
			var columns = this.calculator.getColumns(params);

			var columnWidth = columns[0].width;
			var rowHeight = Math.floor(columns[0].width / params.aspect_ratio);

			this.dragState = {
				id: itemId,
				itemWidth: placement.width,
				itemHeight: placement.height,
				imageWidth: item.get('width'),
				imageHeight: item.get('height'),
				columnWidth: columnWidth,
				rowHeight: rowHeight,
				columns: columns,
				position: {}
			};

			var position = this._calculateNewMovePosition(ui);
			this.dragState.position.page = position.page;
			this.dragState.position.col = position.col;
			this.dragState.position.row = position.row;

			this.imageDropHelper = $('<div class="vls-gf-drop-helper"></div>');
			this.$el.append(this.imageDropHelper);

			this._placeDropHelper();
		},

		dragUpdate: function(event, ui) {
			var dragState = this.dragState;
			if (!dragState) {
				return;
			}

			var newPosition = this._calculateNewMovePosition(ui);

			// If position is changed, move drop helper and update the layout
			if (
				dragState.position.page !== newPosition.page
				|| dragState.position.col !== newPosition.col
				|| dragState.position.row !== newPosition.row
			) {
				dragState.position.page = newPosition.page;
				dragState.position.col = newPosition.col;
				dragState.position.row = newPosition.row;

				this._placeDropHelper();

				this.updateLayout();
			}
		},

		dragStop: function(e) {
			if (this.layoutPages) {
				this._updateItemsOrder(this.layoutPages);
			}

			this.imageDropHelper.remove();
			delete this.dragState;
			delete this.imageDropHelper;

			this.updateLayout();

			delete this.layoutItems;

			// Block click event
			var $item = $(e.target);
			$item.addClass('vls-gf-no-click');
			setTimeout(function() {
				$item.removeClass('vls-gf-no-click');
			}, 100);
		},

		getDraggedItemPosition: function() {
			var dragState = this.dragState;

			if (dragState) {
				return {
					page: dragState.position.page,
					col: dragState.position.col,
					row: dragState.position.row
				}
			}

			return false;
		},

		_zoomSpacings: function() {
			this.layoutSettings.horizontal_spacing = Math.ceil(this.layoutSettingsModel.get('horizontal_spacing') * this.zoom);
			this.layoutSettings.vertical_spacing = Math.ceil(this.layoutSettingsModel.get('vertical_spacing') * this.zoom);
		},

		_getItemList: function() {
			var draggedId = this.dragState ? this.dragState.id : 0;

			var layoutItems = [];
			this.items.each(function(itemModel) {
				layoutItems.push({
					id: itemModel.id,
					width: itemModel.get('thumbnail_width'),
					height: itemModel.get('thumbnail_height'),
					params: itemModel.get('layout_meta'),
					isDragged: (draggedId === itemModel.id),
					placement: {}
				});
			});

			return layoutItems;
		},

		_calculateNewMovePosition: function(ui) {
			var curTop = ui.position.top;
			var curLeft = ui.position.left;
			var params = this.layoutSettings;
			var hSpacing = params.horizontal_spacing;
			var vSpacing = params.vertical_spacing;
			var columnCount = params.column_count;
			var pageSize = params.page_size;

			var dragState = this.dragState;
			var rowHeight = dragState.rowHeight;
			var columnWidth = dragState.columnWidth;
			var columns = dragState.columns;
			var curPage = 1;
			var curPageOffset = 0;
			var col = 0;
			var row = 0;

			// Calculate col position
			var leftCheckpoint = curLeft + Math.floor(columnWidth * 0.5);
			for (var i = 0; i < columns.length; i++) {
				if (leftCheckpoint >= columns[i].left - Math.floor(hSpacing / 2) + this.layoutOffset) {
					col = i;
				}
			}

			// Constrain col position
			if (col < 0) {
				col = 0;
			}
			else if (col > columnCount) {
				col = columnCount;
			}

			var topCheckpoint = curTop + Math.floor(rowHeight * 0.5);

			for (i = 0; i < this.layoutPages.length; i++) {
				var page = this.layoutPages[i];
				if (page.vertOffset < topCheckpoint) {
					curPage = page.no;
					curPageOffset = page.vertOffset;
				}
				else {
					break;
				}
			}

			row = Math.floor((topCheckpoint - curPageOffset + Math.floor(vSpacing / 2)) / (rowHeight + vSpacing));

			if (row < 0) {
				row = 0;
			}

			if (pageSize > 0) {
				if (row > pageSize - 1) {
					row = pageSize - 1;
				}
			}

			return {
				page: curPage,
				col: col,
				row: row
			};
		},

		_placeDropHelper: function() {
			var params = this.layoutSettings;
			var vSpacing = params.vertical_spacing;
			var dragState = this.dragState;
			var columns = dragState.columns;
			var rowHeight = dragState.rowHeight;

			var curPageOffset = this.layoutPages[dragState.position.page - 1].vertOffset;

			// Calculate drop helper position
			var width = columns[dragState.position.col].width;
			var height = rowHeight;
			var top = curPageOffset + (rowHeight + vSpacing) * dragState.position.row;
			var left = columns[dragState.position.col].left + this.layoutOffset;

			this.imageDropHelper.css({
				width: width,
				height: height,
				top: top,
				left: left
			});
		},

		_placeItems: function() {
			var items = this.items;
			var layoutOffset = this.layoutOffset;
			var totalHeight = 0;
			var itemBottom;

			_.each(this.layoutPages[0].items, function(item) {
				var itemModel = items.get(item.id);
				item.placement.left += layoutOffset;

				itemModel.set('placement', item.placement);

				itemBottom = item.placement.top + item.placement.height;
				if (totalHeight < itemBottom) {
					totalHeight = itemBottom;
				}
			});

			this.$el.css('height', totalHeight + this.layoutSettings.vertical_spacing + 600);
		},

		_updateItemsOrder: function(layoutPages) {
			var items = this.items;
			var layoutItems;
			var index = 0;

			_.each(layoutPages, function(page) {

				layoutItems = page.items;

				layoutItems.sort(function(a, b) {
					if (a.placement.row < b.placement.row) {
						return -1;
					}
					if (a.placement.row > b.placement.row) {
						return 1;
					}
					if (a.placement.col < b.placement.col) {
						return -1;
					}
					if (a.placement.col > b.placement.col) {
						return 1;
					}
					return 0; //default return value (no sorting)
				});

				_.each(layoutItems, function(item) {
					var itemModel = items.get(item.id);
					itemModel.set('layout_order_no', index + 1);
					index++;
				});
			});

			this.items.sort();
		}
	});

	module.exports = Editor;

/***/ },
/* 80 */
/***/ function(module, exports) {

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

			//>>IfEditor
			var draggedItemPosition;
			if (this.getDraggedItemPosition) {
				draggedItemPosition = this.getDraggedItemPosition();

				// Update the dragged item in the list
				for (i = 0; i < items.length; i++) {
					item = items[i];
					if (item.isDragged) {
						item.placement.col = draggedItemPosition.col;
						item.placement.row = (draggedItemPosition.page - 1) * pageSize + draggedItemPosition.row;
					}
				}
			}
			//<<IfEditor

			for (i = 0; i < items.length; i++) {
				item = items[i];
				if (item.isDragged) {
					continue;
				}

				//>>IfEditor
				if (
					draggedItemPosition && draggedItemPosition.col === curCol
					&& (draggedItemPosition.page - 1 ) * pageSize + draggedItemPosition.row === curRow
				) {
					i--;
					nextCell();
					continue;
				}
				//<<IfEditor

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

	module.exports = Calculator;

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	var _ = __webpack_require__(5);
	var $ = __webpack_require__(2);
	var Marionette = __webpack_require__(8);
	var Calculator = __webpack_require__(82);

	var Editor = Marionette.Object.extend({

		initialize: function(options) {
			this.$el = options.$el;
			this.layoutSettingsModel = options.layoutSettings;
			this.layoutSettings = this.layoutSettingsModel.toJSON();
			this.items = options.items;
			this.calculator = new Calculator(this.getDraggedItemCells.bind(this));

			this.listenTo(this.layoutSettingsModel, 'change', this.onLayoutSettingsChange);

			this.$el.find('>li').draggable({
				scroll: true,
				cursor: 'move',
				addClasses: false,
				start: this.dragStart.bind(this),
				drag: _.throttle(this.dragUpdate.bind(this), 100),
				stop: this.dragStop.bind(this)
			});

			this.$el.find('>li').resizable({
				handles: 'all',
				autoHide: false,
				minHeight: 43,
				minWidth: 43,
				start: this.dragStart.bind(this),
				resize: _.throttle(this.dragUpdate.bind(this), 100),
				stop: this.dragStop.bind(this)
			});

		},

		onDestroy: function() {
			var $items = this.$el.find('>li');
			$items.draggable('destroy');
			$items.resizable('destroy');
			this.$el.find('.vls-gf-page-divider').remove();
		},

		onLayoutSettingsChange: function() {
			this.layoutSettings = this.layoutSettingsModel.toJSON();
			this._zoomSpacings();
			this.updateLayout();
		},

		setZoom: function(zoom) {
			var containerWidth = this.$el.width();
			this.zoom = zoom;
			this.layoutWidth = Math.floor(containerWidth * zoom);
			this.layoutOffset = Math.floor((containerWidth - this.layoutWidth) / 2);
			this._zoomSpacings();
		},

		updateLayout: function() {
			var params = this.layoutSettings;
			params.container_width = this.layoutWidth;

			// Module can only operate simple arrays
			var layoutItems = this._getItemList();
			this.layoutPages = this.calculator.exec(layoutItems, params);
			this._placeItems();
		},

		dragStart: function(e, ui) {
			var action = ui.size ? 'resize' : 'move';
			var itemId = parseInt($(e.currentTarget).data('id'));
			var item = this.items.get(itemId);
			var placement = item.get('placement');
			var itemLayoutMeta = item.get('layout_meta');

			item.set('placement', null, {silent: true}); // force placement on drop (the change event won't fire otherwise)

			var params = this.layoutSettings;
			params.container_width = this.layoutWidth;
			var columns = this.calculator.getColumns(params);

			var columnWidth = columns[0].width;
			var rowHeight = Math.floor(columns[0].width / params.aspect_ratio);

			var columnCount = params.column_count;
			var hSpan = itemLayoutMeta.h_span || 1;
			hSpan = hSpan < columnCount ? hSpan : columnCount;

			var vSpan = itemLayoutMeta.v_span || 1;

			this.dragState = {
				action: action,
				id: itemId,
				itemWidth: placement.width,
				itemHeight: placement.height,
				imageWidth: item.get('width'),
				imageHeight: item.get('height'),
				columnWidth: columnWidth,
				rowHeight: rowHeight,
				columns: columns,
				origHSpan: hSpan,
				origVSpan: vSpan,
				position: {
					hSpan: hSpan,
					vSpan: vSpan
				}
			};

			var position;
			if (action === 'move') {
				position = this._calculateNewMovePosition(ui);
			}
			else {
				position = this._calculateNewMovePosition(ui);
			}

			this.dragState.position.page = position.page;
			this.dragState.position.col = position.col;
			this.dragState.position.row = position.row;

			this.imageDropHelper = $('<div class="vls-gf-drop-helper"></div>');
			this.$el.append(this.imageDropHelper);

			this._placeDropHelper();
		},

		dragUpdate: function(e, ui) {
			var dragState = this.dragState;
			if (!dragState) return;

			var action = dragState.action;
			var pageSize = this.layoutSettings.page_size;

			var newPosition;
			if (action === 'move') {
				newPosition = this._calculateNewMovePosition(ui);
			}
			else {
				newPosition = this._calculateNewResizePosition(ui);
			}


			// If position is changed, move drop helper and update the layout
			if (
				dragState.position.page !== newPosition.page
				|| dragState.position.col !== newPosition.col
				|| dragState.position.row !== newPosition.row
				|| dragState.position.hSpan !== newPosition.hSpan
				|| dragState.position.vSpan !== newPosition.vSpan
			) {
				dragState.position.page = newPosition.page;
				dragState.position.col = newPosition.col;
				dragState.position.row = newPosition.row;
				dragState.position.hSpan = newPosition.hSpan;
				dragState.position.vSpan = newPosition.vSpan;

				// var item = this.items.get(dragState.id);
				// var itemPlacement = item.get('placement') || {};
				//
				// itemPlacement.col = dragState.position.col;
				// itemPlacement.row = (dragState.position.page - 1 ) * pageSize + dragState.position.row;
				// itemPlacement.hSpan = dragState.position.hSpan;
				// itemPlacement.vSpan = dragState.position.vSpan;
				// item.set('placement', itemPlacement, {silent: true});

				this._placeDropHelper();

				this.updateLayout();
			}
		},

		dragStop: function(e) {
			var dragState = this.dragState;

			// Update span values
			var itemModel = this.items.get(dragState.id);
			var meta = {
				h_span: dragState.position.hSpan,
				v_span: dragState.position.vSpan
			};
			itemModel.set('layout_meta', meta);


			if (this.layoutPages) {
				this._updateItemsOrder(this.layoutPages);
			}

			this.imageDropHelper.remove();
			delete this.dragState;
			delete this.imageDropHelper;

			this.updateLayout();

			// Block click event
			var $item = $(e.target);
			$item.addClass('vls-gf-no-click');
			setTimeout(function() {
				$item.removeClass('vls-gf-no-click');
			}, 100);
		},

		getDraggedItemCells: function() {
			var dragState = this.dragState;

			if (dragState) {
				return {
					page: dragState.position.page,
					col: dragState.position.col,
					row: dragState.position.row,
					hSpan: dragState.position.hSpan,
					vSpan: dragState.position.vSpan
				}
			}

			return false;
		},

		_zoomSpacings: function() {
			this.layoutSettings.horizontal_spacing = Math.ceil(this.layoutSettingsModel.get('horizontal_spacing') * this.zoom);
			this.layoutSettings.vertical_spacing = Math.ceil(this.layoutSettingsModel.get('vertical_spacing') * this.zoom);
		},

		_getItemList: function() {
			var draggedId = this.dragState ? this.dragState.id : 0;
			var params;
			var layoutItems = [];
			this.items.each(function(itemModel) {
				params = itemModel.get('layout_meta');
				layoutItems.push({
					id: itemModel.id,
					width: itemModel.get('thumbnail_width'),
					height: itemModel.get('thumbnail_height'),
					params: {
						h_span: params ? parseInt(params.h_span) : 1,
						v_span: params ? parseInt(params.v_span) : 1
					},
					isDragged: (draggedId === itemModel.id),
					placement: {}
				});
			});

			return layoutItems;
		},

		_calculateNewMovePosition: function(ui) {
			var curTop = ui.position.top;
			var curLeft = ui.position.left;
			var params = this.layoutSettings;
			var hSpacing = params.horizontal_spacing;
			var vSpacing = params.vertical_spacing;
			var columnCount = params.column_count;
			var pageSize = params.page_size;

			var dragState = this.dragState;
			var rowHeight = dragState.rowHeight;
			var columnWidth = dragState.columnWidth;
			var columns = dragState.columns;
			var hSpan = dragState.position.hSpan;
			var vSpan = dragState.origVSpan;
			var curPage = 1;
			var curPageOffset = 0;
			var col = 0;
			var row = 0;
			var i;

			// Restrict item's horizontal span to the column count
			hSpan = hSpan < columnCount ? hSpan : columnCount;

			// Calculate col position
			var leftCheckpoint = curLeft + Math.floor(columnWidth * 0.5);
			col = 0;
			for (i = 0; i < columns.length; i++) {
				if (leftCheckpoint >= columns[i].left - Math.floor(hSpacing / 2) + this.layoutOffset) {
					col = i;
				}
			}

			// Constrain col position
			if (col < 0) {
				col = 0;
			}
			else if (col + hSpan > columnCount) {
				col = columnCount - hSpan;
			}

			// Calculate page & row position
			var topCheckpoint = curTop + Math.floor(rowHeight * 0.5);

			for (i = 0; i < this.layoutPages.length; i++) {
				var page = this.layoutPages[i];
				if (page.vertOffset < topCheckpoint) {
					curPage = page.no;
					curPageOffset = page.vertOffset;
				}
				else {
					break;
				}
			}

			row = Math.floor((topCheckpoint - curPageOffset + Math.floor(vSpacing / 2)) / (rowHeight + vSpacing));

			if (row < 0) {
				row = 0;
			}

			if (pageSize > 0) {
				if (row > pageSize - 1) {
					row = pageSize - 1;
				}
				if (row + vSpan > pageSize) {
					vSpan = pageSize - row;
				}
			}


			return {
				page: curPage,
				hSpan: hSpan,
				vSpan: vSpan,
				col: col,
				row: row
			};

		},

		_calculateNewResizePosition: function(ui) {
			var params = this.layoutSettings;
			var hSpacing = params.horizontal_spacing;
			var vSpacing = params.vertical_spacing;
			var columnCount = params.column_count;
			var pageSize = params.page_size;

			var dragState = this.dragState;
			var columnWidth = dragState.columnWidth;
			var rowHeight = dragState.rowHeight;

			//var curPageOffset = this.layoutPages[dragState.position.page].vertOffset;
			var hSpan, vSpan, col, row, i;

			// Calculate horizontal span and column
			var snapAreaWidth = Math.floor(columnWidth * 0.2 - hSpacing * 0.5);
			hSpan = Math.floor((ui.size.width - snapAreaWidth) / (columnWidth + hSpacing)) + 1;
			hSpan = hSpan < 1 ? 1 : hSpan;

			if (ui.originalPosition.left === ui.position.left) { // the right edge is moved
				//if new span hangs off the canvas (from the right), constrain it
				col = dragState.position.col;
				if (col + hSpan > columnCount) {
					hSpan = columnCount - col;
				}
			}
			else { // the left edge is moved
				//if new span hangs off the canvas (from the left), constrain it
				if (dragState.position.col + dragState.position.hSpan - hSpan < 0) {
					hSpan = dragState.position.col + dragState.position.hSpan;
				}
				col = dragState.position.col + dragState.position.hSpan - hSpan;
			}

			// Calculate vertical span and row
			var snapAreaHeight = Math.floor(rowHeight * 0.2 - vSpacing * 0.5);
			vSpan = Math.floor((ui.size.height - snapAreaHeight) / (rowHeight + vSpacing)) + 1;
			vSpan = vSpan < 1 ? 1 : vSpan;

			if (ui.originalPosition.top === ui.position.top) { // the bottom edge is moved
				row = dragState.position.row;
				// constrain item span to the page boundary
				if (pageSize > 0 && row + vSpan > pageSize) {
					vSpan = pageSize - row;
				}
			}
			else { // the top edge is moved
				//if new span hangs off the canvas (from the top), constrain it
				if (dragState.position.row + dragState.position.vSpan - vSpan < 0) {
					vSpan = dragState.position.row + dragState.position.vSpan;
				}
				row = dragState.position.row + dragState.position.vSpan - vSpan;
				row = row < 0 ? 0 : row;
			}

			return {
				page: dragState.position.page,
				hSpan: hSpan,
				vSpan: vSpan,
				col: col,
				row: row
			};
		},

		_placeDropHelper: function() {
			var params = this.layoutSettings;
			var hSpacing = params.horizontal_spacing;
			var vSpacing = params.vertical_spacing;
			var dragState = this.dragState;
			var columns = dragState.columns;
			var rowHeight = dragState.rowHeight;

			var curPageOffset = this.layoutPages[dragState.position.page - 1].vertOffset;

			// Calculate drop helper position
			var width = 0;
			for (var a = dragState.position.col; a < dragState.position.col + dragState.position.hSpan; a++) {
				width += columns[a].width;
			}
			width += hSpacing * (dragState.position.hSpan - 1);
			var height = rowHeight * dragState.position.vSpan + vSpacing * (dragState.position.vSpan - 1);
			var top = curPageOffset + (rowHeight + vSpacing) * dragState.position.row;
			var left = columns[dragState.position.col].left + this.layoutOffset;

			this.imageDropHelper.css({
				width: width,
				height: height,
				top: top,
				left: left
			});
		},

		_placeItems: function() {
			var page = this.layoutPages[0];
			var items = this.items;
			var layoutOffset = this.layoutOffset;
			var totalHeight = 0;
			var itemBottom;

			_.each(page.items, function(item) {
				var itemModel = items.get(item.id);
				item.placement.left += layoutOffset;

				itemModel.set('placement', item.placement);

				itemBottom = item.placement.top + item.placement.height;
				if (totalHeight < itemBottom) {
					totalHeight = itemBottom;
				}
			});

			this.$el.css('height', totalHeight + this.layoutSettings.vertical_spacing + 600);
		},

		_updateItemsOrder: function(layoutPages) {
			var items = this.items;
			//var dragState = this.dragState;
			var layoutItems;
			var index = 0;

			_.each(layoutPages, function(page) {

				layoutItems = page.items;

				// // Add the dragged item
				// if (dragState.position.page === page.no) {
				//     var item = {
				//         id: dragState.id,
				//         placement: {
				//             page: page.no,
				//             col: dragState.position.col,
				//             row: dragState.position.row
				//         }
				//     };
				//     layoutItems.push(item);
				// }

				layoutItems.sort(function(a, b) {
					if (a.placement.row < b.placement.row)
						return -1;
					if (a.placement.row > b.placement.row)
						return 1;
					if (a.placement.col < b.placement.col)
						return -1;
					if (a.placement.col > b.placement.col)
						return 1;
					return 0; //default return value (no sorting)
				});

				_.each(layoutItems, function(item) {
					var itemModel = items.get(item.id);
					itemModel.set('layout_order_no', index + 1);
					index++;
				});
			});

			this.items.sort();
		}
	});

	module.exports = Editor;

/***/ },
/* 82 */
/***/ function(module, exports) {

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

			//>>IfEditor
			var draggedItemCells;
			if (this.getDraggedItemCells) {
				draggedItemCells = this.getDraggedItemCells();

				if (draggedItemCells) {
					_addOccupiedCells(
						occupiedCells,
						draggedItemCells.hSpan,
						draggedItemCells.vSpan,
						draggedItemCells.col,
						draggedItemCells.row
					);

					// Update the dragged item in the list
					for (i = 0; i < items.length; i++) {
						item = items[i];
						if (item.isDragged) {
							item.placement.hSpan = draggedItemCells.hSpan;
							item.placement.vSpan = draggedItemCells.vSpan;
							item.placement.col = draggedItemCells.col;
							item.placement.row = draggedItemCells.row;
						}
					}
				}
			}
			//<<IfEditor

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

	module.exports = Calculator;

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */
	var _ = __webpack_require__(5);
	var $ = __webpack_require__(2);
	var Marionette = __webpack_require__(8);
	var Calculator = __webpack_require__(84);
	var pageSeparatorHeight = 56;

	var Editor = Marionette.Object.extend({

		initialize: function(options) {
			this.$el = options.$el;
			this.layoutSettingsModel = options.layoutSettings;
			this.layoutSettings = this.layoutSettingsModel.toJSON();
			this.items = options.items;
			this.calculator = new Calculator(this.calculatorCallback.bind(this));

			this.listenTo(this.layoutSettingsModel, 'change', this.onLayoutSettingsChange);
			this.listenTo(this.items, 'change:thumbnail_size', this.updateLayout);

			this.$el.find('>li').draggable({
				scroll: true,
				cursor: 'move',
				addClasses: false,
				start: this.dragStart.bind(this),
				drag: _.throttle(this.dragUpdate.bind(this), 100),
				stop: this.dragStop.bind(this)
			});
		},

		onDestroy: function() {
			this.$el.find('>li').draggable('destroy');
		},

		onLayoutSettingsChange: function() {
			this.layoutSettings = this.layoutSettingsModel.toJSON();
			this._zoomSpacings();
			this.updateLayout();
		},

		setZoom: function(zoom) {
			var containerWidth = this.$el.width();
			this.zoom = zoom;
			this.layoutWidth = Math.floor(containerWidth * zoom);
			this.layoutOffset = Math.floor((containerWidth - this.layoutWidth) / 2);
			this._zoomSpacings();
		},

		updateLayout: function() {
			var params = _.clone(this.layoutSettings);
			params.container_width = this.layoutWidth;

			if (this.dragState) {
				params.interactive_drag_mode = true;
			}

			// Module can only operate simple arrays
			var layoutItems = this._getItemList();
			this.layoutPages = this.calculator.exec(layoutItems, params);
			this._placeItems();
		},

		dragStart: function(e, ui) {
			var itemId = parseInt($(e.currentTarget).data('id'));
			var item = this.items.get(itemId);
			var placement = item.get('placement');
			item.set('placement', null, {silent: true}); // force placement on drop (the change event won't fire otherwise)

			this.dragState = {
				id: itemId,
				itemWidth: placement.width,
				itemHeight: placement.height,
				imageWidth: item.get('thumbnail_width'),
				imageHeight: item.get('thumbnail_height'),
				dropHelperPlaced: false
			};

			this.imageDropHelper = $('<div class="vls-gf-drop-helper"></div>');
			this.$el.append(this.imageDropHelper);
		},

		dragUpdate: function(e, ui) {
			if (!this.dragState) {
				return;
			}

			this.dragState.position = {
				top: ui.position.top + Math.floor(this.dragState.itemHeight / 2),
				left: ui.position.left + Math.floor(this.dragState.itemWidth / 2)
			};
			this.dragState.dropHelperPlaced = false;
			this.updateLayout();
		},

		dragStop: function(e) {
			this._updateItemsOrder();

			this.imageDropHelper.remove();
			delete this.dragState;
			delete this.imageDropHelper;

			this.updateLayout();

			// Block click event
			var $item = $(e.target);
			$item.addClass('vls-gf-no-click');
			setTimeout(function() {
				$item.removeClass('vls-gf-no-click');
			}, 100);
		},

		calculatorCallback: function(index, imageWidth, imageHeight, imageTop, imageLeft, extraPixel, pageNo, pageVertOffset) {
			if (!this.dragState || this.dragState.dropHelperPlaced) {
				return false;
			}

			var layoutOffset = this.layoutOffset;
			var hSpacing = this.layoutSettings.horizontal_spacing;
			var vSpacing = this.layoutSettings.vertical_spacing;

			// Shift area by pagination separators
			imageTop += pageVertOffset + (pageNo - 1) * pageSeparatorHeight;

			// Extend the designated area with spacings
			var areaWidth = imageWidth + hSpacing;
			var areaHeight = imageHeight + vSpacing;
			var areaTop = imageTop - Math.floor(vSpacing / 2);
			var areaLeft = imageLeft - Math.floor(hSpacing / 2) + layoutOffset;


			var dragPos = this.dragState.position;

			if (
				dragPos.top >= areaTop && dragPos.top <= areaTop + areaHeight
				&& dragPos.left >= areaLeft && dragPos.left <= areaLeft + areaWidth
			) {
				var dropHelperHeight = Math.floor(this.dragState.imageHeight / this.dragState.imageWidth * imageWidth);

				this._placeDropHelper(imageWidth + extraPixel, dropHelperHeight, imageTop, imageLeft + layoutOffset);
				this.dragState.newIndex = index;

				return {
					height: dropHelperHeight
				};
			}

			return false;
		},

		_zoomSpacings: function() {
			this.layoutSettings.horizontal_spacing = Math.ceil(this.layoutSettingsModel.get('horizontal_spacing') * this.zoom);
			this.layoutSettings.vertical_spacing = Math.ceil(this.layoutSettingsModel.get('vertical_spacing') * this.zoom);
		},

		_getItemList: function() {
			var draggedId = this.dragState ? this.dragState.id : 0;

			var layoutItems = [];
			this.items.each(function(itemModel) {

				// Skip the dragged item
				if (draggedId === itemModel.id) {
					return;
				}

				layoutItems.push({
					id: itemModel.id,
					thumbnail_width: itemModel.get('thumbnail_width'),
					thumbnail_height: itemModel.get('thumbnail_height')
				});
			});

			return layoutItems;
		},

		_placeDropHelper: function(width, height, top, left) {
			this.imageDropHelper.css({
				width: width,
				height: height,
				top: top,
				left: left
			});
			this.dragState.dropHelperPlaced = true;
		},

		_placeItems: function() {

			var page = this.layoutPages[0];
			var items = this.items;
			var layoutOffset = this.layoutOffset;
			var totalHeight = 0;
			var itemBottom;

			_.each(page.items, function(item) {
				item.placement.left += layoutOffset;

				if (!item.isDragged) {
					var itemModel = items.get(item.id);
					itemModel.set('placement', item.placement);
				}

				itemBottom = item.placement.top + item.placement.height;
				if (totalHeight < itemBottom) {
					totalHeight = itemBottom;
				}
			});


			this.$el.css('height', totalHeight + this.layoutSettings.vertical_spacing + 600);
		},

		/**
		 * Insert the dragged item in the new position, reorder the collection
		 * @private
		 */
		_updateItemsOrder: function() {
			var newIndex = this.dragState.newIndex;
			var draggedId = this.dragState.id;

			var curIndex = 0;
			this.items.each(function(item) {
				if (draggedId === item.id) {
					item.set('layout_order_no', newIndex + 1);
				}
				else {
					if (curIndex === newIndex) {
						curIndex++;
					}
					item.set('layout_order_no', curIndex + 1);
					curIndex++;
				}

			});
			this.items.sort();
		}
	});

	module.exports = Editor;

/***/ },
/* 84 */
/***/ function(module, exports) {

	var Calculator = function(editorCallback) {
		this.editorCallback = editorCallback;
	};

	Calculator.prototype.exec = function(items, params) {
		var vSpacing = params.vertical_spacing;
		var alignBottom = params.align_bottom;

		//>>IfEditor
		if (params.interactive_drag_mode) {
			alignBottom = false;
		}
		//<<IfEditor

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

			//>>IfEditor
			var editorData;
			if (this.editorCallback) {
				editorData = this.editorCallback(index, itemWidth, itemHeight, itemTop, itemLeft, extraPixel, pageNo, pageVertOffset);
			}

			if (editorData) {
				itemHeight = editorData.height;

				item = {
					isDragged: true,
					placement: {
						pageNo: pageNo,
						width: itemWidth + extraPixel,
						height: itemHeight,
						top: itemTop,
						left: itemLeft,
						col: placementColumn.no
					}
				};

				items.push(item);

				i--; // rollback the current item to push it to the next position
			}
			else {
				//<<IfEditor
				item.placement = {
					pageNo: pageNo,
					width: itemWidth + extraPixel,
					height: itemHeight,
					top: itemTop,
					left: itemLeft,
					col: placementColumn.no
				};
				//>>IfEditor
			}
			//<<IfEditor

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

	module.exports = Calculator;

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	var ItemView = __webpack_require__(40);
	var enums = __webpack_require__(86);
	var Template = __webpack_require__(87);


	var View = ItemView.extend({

		className: 'vls-gf-view-layout-settings',

		template: Template,
		templateHelpers: function() {
			return {
				t: {
					layoutType: this.l10n.t('layoutType'),
					columnCount: this.l10n.t('columnCount'),
					columnCountXs: this.l10n.t('columnCountXs'),
					aspectRatio: this.l10n.t('aspectRatio'),
					horizontalSpacing: this.l10n.t('horizontalSpacing'),
					verticalSpacing: this.l10n.t('verticalSpacing'),
					alignBottom: this.l10n.t('alignBottom')
				},
				enums: this.enums
			}
		},

		ui: {
			fldLayoutType: '#vls-gf-fld-layout-type',
			fldColumnCount: '#vls-gf-fld-column-count',
			fldAspectRatio: '#vls-gf-fld-aspect-ratio',
			fldHorizontalSpacing: '#vls-gf-fld-horizontal-spacing',
			fldVerticalSpacing: '#vls-gf-fld-vertical-spacing',
			fldAlignBottom: '#vls-gf-fld-align-bottom'
		},

		events: {
			'change @ui.fldLayoutType': 'onFldLayoutTypeChange',
			'change @ui.fldColumnCount': 'onFldColumnCountChange',
			'change @ui.fldAspectRatio': 'onFldAspectRatioChange',
			'change @ui.fldHorizontalSpacing': 'onFldHorizontalSpacingChange',
			'change @ui.fldVerticalSpacing': 'onFldVerticalSpacingChange',
			'change @ui.fldAlignBottom': 'onFldAlignBottomChange'
		},

		enums: enums,

		onRender: function() {
			this._updateParamsVisibility(this.model.get('layout_type'));
		},

		onFldLayoutTypeChange: function() {
			var type = this.ui.fldLayoutType.val();
			this.model.set('layout_type', type);
			this._updateParamsVisibility(type);
		},

		onFldColumnCountChange: function() {
			this.model.set('column_count', parseInt(this.ui.fldColumnCount.val()));
		},

		onFldAspectRatioChange: function() {

			var aspectRatioStr = this.ui.fldAspectRatio.val();

			aspectRatioStr = aspectRatioStr.replace(',', '.');
			aspectRatioStr = aspectRatioStr.replace(':', '/');
			aspectRatioStr = aspectRatioStr.replace('-', '/');
			var arr = aspectRatioStr.split('/');
			var aspectRatio = parseFloat(arr[0]);
			if (arr.length > 1) {
				aspectRatio = Math.round(aspectRatio / parseFloat(arr[1]) * 1000) / 1000;
			}

			//apply limits
			if (!aspectRatio) {
				aspectRatio = 1;
			}
			else if (aspectRatio < 0.25) {
				aspectRatio = 0.25;
			}
			else if (aspectRatio > 4) {
				aspectRatio = 4;
			}

			this.ui.fldAspectRatio.val(aspectRatio);
			this.model.set('aspect_ratio', aspectRatio);


		},

		onFldHorizontalSpacingChange: function() {

			var horizontalSpacing = parseInt(this.ui.fldHorizontalSpacing.val());

			//apply limits
			if (!horizontalSpacing || horizontalSpacing < 0) {
				horizontalSpacing = 0;
			}
			else if (horizontalSpacing > 100) {
				horizontalSpacing = 100;
			}

			this.ui.fldHorizontalSpacing.val(horizontalSpacing);
			this.model.set('horizontal_spacing', horizontalSpacing);

		},

		onFldVerticalSpacingChange: function() {

			var verticalSpacing = parseInt(this.ui.fldVerticalSpacing.val());

			//apply limits
			if (!verticalSpacing || verticalSpacing < 0) {
				verticalSpacing = 0;
			}
			else if (verticalSpacing > 100) {
				verticalSpacing = 100;
			}

			this.ui.fldVerticalSpacing.val(verticalSpacing);
			this.model.set('vertical_spacing', verticalSpacing);
		},

		onFldAlignBottomChange: function() {
			var val = (this.ui.fldAlignBottom.prop("checked") === true);
			this.model.set('align_bottom', val);
		},

		_updateParamsVisibility: function(type) {
			if (type === 'grid') {
				this.ui.fldAspectRatio.closest('.vls-gf-field').show();
				this.ui.fldAlignBottom.closest('.vls-gf-field-check').hide();
			}
			else if (type === 'metro') {
				this.ui.fldAspectRatio.closest('.vls-gf-field').show();
				this.ui.fldAlignBottom.closest('.vls-gf-field-check').hide();
			}
			else if (type === 'masonry-v') {
				this.ui.fldAspectRatio.closest('.vls-gf-field').hide();
				this.ui.fldAlignBottom.closest('.vls-gf-field-check').show();
			}
		}

	});

	module.exports = View;


/***/ },
/* 86 */
/***/ function(module, exports) {

	/* global require */

	module.exports = window.vlsGFData.enumerations;

/***/ },
/* 87 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-form">\n	\n	<div class="vls-gf-field vls-gf-field-select">\n		<label for="vls-gf-fld-layout-type">'+
	((__t=( t.layoutType ))==null?'':__t)+
	'</label>\n		<select id="vls-gf-fld-layout-type">\n			';
	 for(var opt in enums.layoutType) { 
	__p+='\n			<option value="'+
	((__t=( enums.layoutType[opt].value ))==null?'':__t)+
	'"\n			';
	 if (layout_type == enums.layoutType[opt].value) { 
	__p+='selected';
	 } 
	__p+='>\n			'+
	((__t=( enums.layoutType[opt].text ))==null?'':__t)+
	'\n			</option>\n			';
	 } 
	__p+='\n		</select>\n	</div>\n	\n	<div class="vls-gf-field vls-gf-field-select">\n		<label for="vls-gf-fld-column-count">'+
	((__t=( t.columnCount ))==null?'':__t)+
	'</label>\n		<select id="vls-gf-fld-column-count">\n			';
	 for(var opt in enums.layoutColumnCount) { 
	__p+='\n			<option\n					value="'+
	((__t=( enums.layoutColumnCount[opt].value ))==null?'':__t)+
	'"\n			';
	 if (column_count == enums.layoutColumnCount[opt].value) { 
	__p+='selected';
	 } 
	__p+='>'+
	((__t=(
				enums.layoutColumnCount[opt].text ))==null?'':__t)+
	'\n			</option>\n			';
	 } 
	__p+='\n		</select>\n	\n	</div>\n	\n	<div class="vls-gf-field">\n		<label for="vls-gf-fld-aspect-ratio">'+
	((__t=( t.aspectRatio ))==null?'':__t)+
	'</label>\n		<input id="vls-gf-fld-aspect-ratio" type="text" value="'+
	((__t=( aspect_ratio ))==null?'':__t)+
	'"/>\n	</div>\n	\n	<div class="vls-gf-field">\n		<label for="vls-gf-fld-horizontal-spacing">'+
	((__t=( t.horizontalSpacing ))==null?'':__t)+
	'</label>\n		<input id="vls-gf-fld-horizontal-spacing" type="text" value="'+
	((__t=( horizontal_spacing ))==null?'':__t)+
	'"/>\n	</div>\n	\n	<div class="vls-gf-field">\n		<label for="vls-gf-fld-vertical-spacing">'+
	((__t=( t.verticalSpacing ))==null?'':__t)+
	'</label>\n		<input id="vls-gf-fld-vertical-spacing" type="text" value="'+
	((__t=( vertical_spacing ))==null?'':__t)+
	'"/>\n	</div>\n	\n	<div class="vls-gf-field-check">\n		<label for="vls-gf-fld-align-bottom">'+
	((__t=( t.alignBottom ))==null?'':__t)+
	'</label>\n		<input id="vls-gf-fld-align-bottom" type="checkbox" value="1" ';
	 if (align_bottom == 1) {
			
	__p+='checked="checked"';
	 } 
	__p+='>\n	</div>\n\n</div>';
	}
	return __p;
	};


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */

	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(89);
	var enums = __webpack_require__(86);

	var View = ItemView.extend({

		className: 'vls-gf-view-tab-settings',

		template: Template,

		templateHelpers: function() {
			return {
				t: {
					appendNewImagesTo: this.l10n.t('appendNewImagesTo'),
					displayImageInfoOnHover: this.l10n.t('displayImageInfoOnHover')
				},
				enums: this.enums
			}
		},

		//childView: ListItemView,
		//childViewContainer: 'ul',

		ui: {
			fldAppendNewImagesTo: '#vls-gf-fld-append-new-images-to',
			fldDisplayImageInfoOnHover: '#vls-gf-fld-display-image-info-on-hover'
		},

		events: {
			'change @ui.fldAppendNewImagesTo': 'onFldAppendNewImagesToChange',
			'change @ui.fldDisplayImageInfoOnHover': 'onFldDisplayImageInfoOnHoverChange'
		},

		enums: enums,

		onFldAppendNewImagesToChange: function() {
			this.model.set('add_items_at', this.ui.fldAppendNewImagesTo.val());
		},

		onFldDisplayImageInfoOnHoverChange: function() {
			this.model.get('style_meta').set('display_image_info_on_hover', this.ui.fldDisplayImageInfoOnHover.val());
		}
	});

	module.exports = View;

/***/ },
/* 89 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-main-panel">\n	\n	<div class="vls-gf-form">\n		\n		';
	 if (type == 'album') { 
	__p+='\n		<div class="vls-gf-field vls-gf-field-select vls-gf-half-width">\n			<label for="vls-gf-fld-append-new-images-to">'+
	((__t=( t.appendNewImagesTo ))==null?'':__t)+
	'</label>\n			<select id="vls-gf-fld-append-new-images-to">\n				';
	 for(var opt in enums.appendNewImagesTo) { 
	__p+='\n				<option value="'+
	((__t=( enums.appendNewImagesTo[opt].value ))==null?'':__t)+
	'"\n				';
	 if (add_items_at == enums.appendNewImagesTo[opt].value) { 
	__p+='selected';
	 } 
	__p+='>'+
	((__t=(
					enums.appendNewImagesTo[opt].text ))==null?'':__t)+
	'\n				</option>\n				';
	 } 
	__p+='\n			</select>\n		</div>\n		';
	 } 
	__p+='\n		\n		<div class="vls-gf-field vls-gf-field-select vls-gf-half-width">\n			<label for="vls-gf-fld-display-image-info-on-hover">'+
	((__t=( t.displayImageInfoOnHover ))==null?'':__t)+
	'</label>\n			<select id="vls-gf-fld-display-image-info-on-hover">\n				';
	 for(var opt in enums.displayImageInfoOnHover) { 
	__p+='\n				<option\n						value="'+
	((__t=( enums.displayImageInfoOnHover[opt].value ))==null?'':__t)+
	'"\n				';
	 if (style_meta.display_image_info_on_hover == enums.displayImageInfoOnHover[opt].value) {
					
	__p+='selected';
	 } 
	__p+='>'+
	((__t=(
					enums.displayImageInfoOnHover[opt].text ))==null?'':__t)+
	'\n				</option>\n				';
	 } 
	__p+='\n			</select>\n		</div>\n	\n	</div>\n</div>';
	}
	return __p;
	};


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var PersistentModel = __webpack_require__(17);

	var Model = PersistentModel.extend({
		url: 'image',
		api_view: 'editor',

		toJSON: function() {
			var data = PersistentModel.prototype.toJSON.call(this);
			data.file_size_kb = Math.round(data.file_size / 1024);

			if (data.image_meta && data.image_meta.shutter_speed) {
				var dec = parseFloat(data.image_meta.shutter_speed);
				if (dec < 1) {
					data.image_meta.shutter_speed_display = '1/' + Math.round(1 / dec);
				}
				else {
					data.image_meta.shutter_speed_display = dec;
				}
			}

			return data;
		}
	});

	module.exports = Model;

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(2);
	var LayoutView = __webpack_require__(21);

	var Template = __webpack_require__(92);

	var GeneralTabView = __webpack_require__(93);
	var MetadataTabView = __webpack_require__(95);
	var PreviewTabView = __webpack_require__(97);

	var View = LayoutView.extend({
		className: "vls-gf-view-image-editor",

		template: Template,
		templateHelpers: function() {
			return {
				t: {
					tabGeneral: this.l10n.t('tabGeneral'),
					tabPreview: this.l10n.t('tabPreview'),
					tabMetadata: this.l10n.t('tabMetadata'),
					tabSettings: this.l10n.t('tabSettings'),
					tt: {
						saveChanges: this.l10n.t('tooltips.saveChanges'),
						prevImage: this.l10n.t('tooltips.prevImage'),
						nextImage: this.l10n.t('tooltips.nextImage')
					}
				}
			}
		},

		regions: {
			content: '.vls-gf-content-wrapper'
		},

		ui: {
			header: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar h3',
			btnBack: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar button.vls-gf-icon-back-w',
			btnSave: '.vls-gf-fixed-wrapper button.vls-gf-fab',
			btnNextImage: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar button[data-action="next-image"]',
			btnPrevImage: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar button[data-action="prev-image"]',
			btnTabGeneral: '.vls-gf-fixed-wrapper .vls-gf-tab-bar li[data-tab="general"]',
			btnTabMetadata: '.vls-gf-fixed-wrapper .vls-gf-tab-bar li[data-tab="metadata"]',
			btnTabPreview: '.vls-gf-fixed-wrapper .vls-gf-tab-bar li[data-tab="preview"]'
		},

		events: {
			'click @ui.btnBack': 'onBtnBack',
			'click @ui.btnSave': 'onBtnSave',
			'click @ui.btnNextImage': 'onBtnNextImage',
			'click @ui.btnPrevImage': 'onBtnPrevImage',
			'click @ui.btnTabGeneral': 'onBtnTabGeneral',
			'click @ui.btnTabMetadata': 'onBtnTabMetadata',
			'click @ui.btnTabPreview': 'onBtnTabPreview'
		},

		modelEvents: {
			"sync": 'renderLoaded',
			'change:name': 'onNameChange'
		},

		initialize: function(options) {
			this.currentTab = 'general';

			var fetchOptions = {};
			var node_id = this.model.get('node_id');
			if (node_id) {
				fetchOptions.data = {node_id: node_id};
			}
			this.model.fetch(fetchOptions);
		},

		onRender: function() {
			var node_id = this.model.get('node_id');
			if (!node_id) {
				this.ui.btnTabSettings.hide();
			}
		},

		renderLoaded: function(model, resp, options) {
			$('.vls-gf-tooltip').remove();
			this.render();
			this._renderTabs();
		},

		onBtnBack: function() {
			this.radio.trigger('global:requestRoute', {view: 'manager'});
		},

		onBtnSave: function() {
			if (this.savingInProgress) return;

			this.savingInProgress = true;
			this.ui.btnSave.addClass('vls-gf-in-progress');

			//don't need to update view's model with server reply
			//var saveModel = this.model.clone();
			this.model.save(
				null,
				{
					parse: false,
					patch: true,
					success: this.onSaveSuccess.bind(this)
				}
			);
		},

		onSaveSuccess: function() {
			this.savingInProgress = false;
			if (!this.isDestroyed) {
				this.ui.btnSave.removeClass('vls-gf-in-progress');
			}
			this.radio.trigger('dialog:notification:requested', {message: this.l10n.t('imageSaved')});
			this.radio.trigger('image:changed', {model: this.model});
		},

		onBtnNextImage: function() {
			var nextImageData = this.radio.request('album:getNeighbourImage', {
				direction: 'next',
				id: this.model.get('id')
			});

			if (nextImageData) {
				this.model.set({
					id: nextImageData.id,
					name: nextImageData.name
				});
				this.model.fetch();
			}
		},

		onBtnPrevImage: function() {
			var nextImageData = this.radio.request('album:getNeighbourImage', {
				direction: 'prev',
				id: this.model.get('id')
			});

			if (nextImageData) {
				this.model.set({
					id: nextImageData.id,
					name: nextImageData.name
				});
				this.model.fetch();
			}
		},

		onBtnTabGeneral: function() {
			this.currentTab = 'general';
			this._renderTabs();
		},

		onBtnTabPreview: function() {
			this.currentTab = 'preview';
			this._renderTabs();
		},

		onBtnTabMetadata: function() {
			this.currentTab = 'metadata';
			this._renderTabs();
		},

		onNameChange: function() {
			this.ui.header.html(this.model.get('name'));
		},

		_renderTabs: function() {

			if (this.currentTab === 'general') {
				this.ui.btnTabGeneral.addClass('vls-gf-active');
				this.content.show(new GeneralTabView({model: this.model}));
			}
			else {
				this.ui.btnTabGeneral.removeClass('vls-gf-active');
			}

			if (this.currentTab === 'metadata') {
				this.ui.btnTabMetadata.addClass('vls-gf-active');
				this.content.show(new MetadataTabView({model: this.model}));
			}
			else {
				this.ui.btnTabMetadata.removeClass('vls-gf-active');
			}

			if (this.currentTab === 'preview') {
				this.ui.btnTabPreview.addClass('vls-gf-active');
				this.content.show(new PreviewTabView({model: this.model}));
			}
			else {
				this.ui.btnTabPreview.removeClass('vls-gf-active');
			}

			this.radio.trigger('global:needAdjustFixedElement', {});

		}
	});

	module.exports = View;


/***/ },
/* 92 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-fixed-wrapper">\n	<div class="vls-gf-primary-toolbar">\n        <span>\n            <button class="vls-gf-icon vls-gf-icon-back-w"></button>\n        </span>\n		<h3>'+
	((__t=( name ))==null?'':__t)+
	'</h3>\n		<ul class="vls-gf-actions">\n			<li>\n				<button data-action="prev-image" class="vls-gf-icon vls-gf-icon-navigate-before-w"\n						data-vls-gf-tooltip="'+
	((__t=( t.tt.prevImage ))==null?'':__t)+
	'" data-vls-gf-position="below"\n						data-vls-gf-offset="0"></button>\n			</li>\n			<li>\n				<button data-action="next-image" class="vls-gf-icon vls-gf-icon-navigate-next-w"\n						data-vls-gf-tooltip="'+
	((__t=( t.tt.nextImage ))==null?'':__t)+
	'" data-vls-gf-position="below"\n						data-vls-gf-offset="0"></button>\n			</li>\n		</ul>\n	</div>\n	<div class="vls-gf-tab-bar">\n		<ul>\n			<li data-tab="general"><span>'+
	((__t=( t.tabGeneral ))==null?'':__t)+
	'</span></li>\n			<li data-tab="metadata"><span>'+
	((__t=( t.tabMetadata ))==null?'':__t)+
	'</span></li>\n			<li data-tab="preview"><span>'+
	((__t=( t.tabPreview ))==null?'':__t)+
	'</span></li>\n		</ul>\n	</div>\n	<button class="vls-gf-fab vls-gf-icon vls-gf-icon-done-w" data-vls-gf-tooltip="'+
	((__t=( t.tt.saveChanges ))==null?'':__t)+
	'"\n			data-vls-gf-position="below" data-vls-gf-offset="14"></button>\n</div>\n\n<div class="vls-gf-content-wrapper">\n\n</div>';
	}
	return __p;
	};


/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	/*global module */

	'use strict';

	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(94);

	var View = ItemView.extend({

		className: 'vls-gf-view-tab-general',

		template: Template,

		templateHelpers: function() {
			return {
				t: {
					name: this.l10n.t('name'),
					caption: this.l10n.t('caption'),
					description: this.l10n.t('description'),
					altText: this.l10n.t('altText'),
					url: this.l10n.t('url')
				}
			}
		},

		ui: {
			fldName: '#vls-gf-fld-name',
			fldCaption: '#vls-gf-fld-caption',
			fldDescription: '#vls-gf-fld-description',
			fldAltText: '#vls-gf-fld-alt-text'
		},

		events: {
			'change @ui.fldName': 'onFldNameChange',
			'change @ui.fldCaption': 'onFldCaptionChange',
			'change @ui.fldDescription': 'onFldDescriptionChange',
			'change @ui.fldAltText': 'onFldAltTextChange'
		},

		onFldNameChange: function() {
			this.model.set('name', this.ui.fldName.val());
		},

		onFldCaptionChange: function() {
			this.model.set('caption', this.ui.fldCaption.val());
		},

		onFldDescriptionChange: function() {
			this.model.set('description', this.ui.fldDescription.val());
		},

		onFldAltTextChange: function() {
			this.model.set('alt_text', this.ui.fldAltText.val());
		}

	});

	module.exports = View;

/***/ },
/* 94 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-main-panel">\r\n	\r\n	<div class="vls-gf-right-col">\r\n		\r\n		<div class="vls-gf-cover-image">\r\n			<img src="'+
	((__t=( cover_url ))==null?'':__t)+
	'">\r\n			<div>\r\n				<div>'+
	((__t=( t.setCoverImage ))==null?'':__t)+
	'</div>\r\n			</div>\r\n		</div>\r\n	\r\n	</div>\r\n	\r\n	<div class="vls-gf-left-col">\r\n		\r\n		<div class="vls-gf-form">\r\n			\r\n			<div class="vls-gf-field">\r\n				<label for="vls-gf-fld-name">'+
	((__t=( t.name ))==null?'':__t)+
	'</label>\r\n				<input id="vls-gf-fld-name" type="text" value="'+
	((__t=( name ))==null?'':__t)+
	'"/>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field">\r\n				<label for="vls-gf-fld-caption">'+
	((__t=( t.caption ))==null?'':__t)+
	'</label>\r\n				<input id="vls-gf-fld-caption" type="text" value="'+
	((__t=( caption ))==null?'':__t)+
	'"/>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field">\r\n				<label for="vls-gf-fld-description">'+
	((__t=( t.description ))==null?'':__t)+
	'</label>\r\n				<textarea id="vls-gf-fld-description">'+
	((__t=( description ))==null?'':__t)+
	'</textarea>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field">\r\n				<label for="vls-gf-fld-alt-text">'+
	((__t=( t.altText ))==null?'':__t)+
	'</label>\r\n				<input id="vls-gf-fld-alt-text" type="text" value="'+
	((__t=( alt_text ))==null?'':__t)+
	'"/>\r\n			</div>\r\n			\r\n			<div class="vls-gf-field-ro">\r\n				<span>'+
	((__t=( t.url ))==null?'':__t)+
	'</span>\r\n				<span>'+
	((__t=( url ))==null?'':__t)+
	'</span>\r\n			</div>\r\n		\r\n		</div>\r\n	\r\n	</div>\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	/*global module */

	'use strict';

	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(96);

	var View = ItemView.extend({

		className: 'vls-gf-view-tab-metadata',

		template: Template,

		templateHelpers: function() {
			return {
				t: {
					file: this.l10n.t('file'),
					exif: this.l10n.t('exif'),
					fileName: this.l10n.t('fileName'),
					fileType: this.l10n.t('fileType'),
					fileSize: this.l10n.t('fileSize'),
					dimensions: this.l10n.t('dimensions'),
					uploadDate: this.l10n.t('uploadDate'),
					uploadedBy: this.l10n.t('uploadedBy'),
					camera: this.l10n.t('camera'),
					lens: this.l10n.t('lens'),
					focalLength: this.l10n.t('focalLength'),
					shutterSpeed: this.l10n.t('shutterSpeed'),
					aperture: this.l10n.t('aperture'),
					iso: this.l10n.t('iso'),
					creationDate: this.l10n.t('creationDate'),
					author: this.l10n.t('author'),
					copyright: this.l10n.t('copyright'),
					tags: this.l10n.t('tags')
				}
			}
		}

	});

	module.exports = View;


/***/ },
/* 96 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-main-panel">\r\n	\r\n	<div class="vls-gf-form">\r\n		\r\n		<h5>'+
	((__t=( t.file ))==null?'':__t)+
	'</h5>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.fileName ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( filename ))==null?'':__t)+
	'</span>\r\n		</div>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.fileSize ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( file_size_kb ))==null?'':__t)+
	' kB</span>\r\n		</div>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.dimensions ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( width ))==null?'':__t)+
	'&times;'+
	((__t=( height ))==null?'':__t)+
	'</span>\r\n		</div>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.uploadDate ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( created ))==null?'':__t)+
	'</span>\r\n		</div>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.uploadedBy ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( created_by ))==null?'':__t)+
	'</span>\r\n		</div>\r\n		\r\n		<h5>'+
	((__t=( t.exif ))==null?'':__t)+
	'</h5>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.camera ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( image_meta.camera ))==null?'':__t)+
	'</span>\r\n		</div>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.lens ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( image_meta.lens ))==null?'':__t)+
	'</span>\r\n		</div>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.focalLength ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( image_meta.focalLength ))==null?'':__t)+
	'</span>\r\n		</div>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.shutterSpeed ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( image_meta.shutter_speed_display ))==null?'':__t)+
	'</span>\r\n		</div>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.aperture ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( image_meta.aperture ))==null?'':__t)+
	'</span>\r\n		</div>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.iso ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( image_meta.iso ))==null?'':__t)+
	'</span>\r\n		</div>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.creationDate ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( image_meta.creation_date ))==null?'':__t)+
	'</span>\r\n		</div>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.author ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( image_meta.author ))==null?'':__t)+
	'</span>\r\n		</div>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.copyright ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( image_meta.copyright ))==null?'':__t)+
	'</span>\r\n		</div>\r\n		\r\n		<div class="vls-gf-field-ro">\r\n			<span>'+
	((__t=( t.tags ))==null?'':__t)+
	'</span>\r\n			<span>'+
	((__t=( image_meta.tags ))==null?'':__t)+
	'</span>\r\n		</div>\r\n	\r\n	</div>\r\n\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	/*global module */

	'use strict';

	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(98);

	var View = ItemView.extend({

		className: 'vls-gf-view-tab-thumbnail',

		template: Template
	});

	module.exports = View;


/***/ },
/* 98 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-main-panel">\r\n	<div class="vls-gf-image-wrapper">\r\n		<img src="'+
	((__t=( url ))==null?'':__t)+
	'"/>\r\n	</div>\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var PersistentModel = __webpack_require__(17);

	var Model = PersistentModel.extend({
		url: 'settings',
		defaults: {
			id: 0 // the only entity on the server, use patch to update
		}
	});

	module.exports = Model;

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(2);
	var LayoutView = __webpack_require__(21);

	var Template = __webpack_require__(101);
	var GeneralTabView = __webpack_require__(102);

	var View = LayoutView.extend({

		className: "vls-gf-view-settings",

		template: Template,
		templateHelpers: function() {
			return {
				t: {
					settings: this.l10n.t('settings'),
					tabGeneral: this.l10n.t('tabGeneral'),
					tt: {
						saveChanges: this.l10n.t('tooltips.saveChanges')
					}
				}
			}
		},

		regions: {
			content: '.vls-gf-content-wrapper'
		},

		ui: {
			btnTabGeneral: '.vls-gf-fixed-wrapper .vls-gf-tab-bar li[data-tab="general"]',
			btnBack: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar button.vls-gf-icon-back-w',
			btnSave: '.vls-gf-fixed-wrapper button.vls-gf-fab'
		},

		events: {
			'click @ui.btnTabGeneral': 'onBtnTabGeneral',
			'click @ui.btnBack': 'onBtnBack',
			'click @ui.btnSave': 'onBtnSave'
		},

		modelEvents: {
			"sync": 'renderLoaded'
		},

		initialize: function(options) {
			this.currentTab = 'general';
			this.model.fetch();
		},

		renderLoaded: function(model, resp, options) {
			$('.vls-gf-tooltip').remove();
			this.render();
			this._renderTabs();
		},

		onBtnBack: function() {
			this.radio.trigger('global:requestRoute', {view: 'manager'});
		},

		onBtnSave: function() {
			if (this.savingInProgress) return;

			this.savingInProgress = true;
			this.ui.btnSave.addClass('vls-gf-in-progress');

			this.model.save(
				null,
				{
					parse: false,
					patch: true,
					success: this.onSaveSuccess.bind(this)
				}
			);
		},

		onSaveSuccess: function() {
			this.savingInProgress = false;
			this.ui.btnSave.removeClass('vls-gf-in-progress');
			this.radio.trigger('dialog:notification:requested', {message: this.l10n.t('settingsSaved')});
		},

		onBtnTabGeneral: function() {
			this.currentTab = 'general';
			this._renderTabs();
		},

		_renderTabs: function() {
			if (this.currentTab === 'general') {
				this.ui.btnTabGeneral.addClass('vls-gf-active');
				this.content.show(new GeneralTabView({model: this.model}));
			}
			else {
				this.ui.btnTabGeneral.removeClass('vls-gf-active');
			}

			this.radio.trigger('global:needAdjustFixedElement', {});

		}
	});

	module.exports = View;


/***/ },
/* 101 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-fixed-wrapper">\n	<div class="vls-gf-primary-toolbar">\n        <span>\n            <button class="vls-gf-icon vls-gf-icon-back-w"></button>\n        </span>\n		<h3>'+
	((__t=( t.settings ))==null?'':__t)+
	'</h3>\n	</div>\n	<div class="vls-gf-tab-bar">\n		<ul>\n			<li data-tab="general"><span>'+
	((__t=( t.tabGeneral ))==null?'':__t)+
	'</span></li>\n		</ul>\n	</div>\n	<button class="vls-gf-fab vls-gf-icon vls-gf-icon-done-w" data-vls-gf-tooltip="'+
	((__t=( t.tt.saveChanges ))==null?'':__t)+
	'"\n			data-vls-gf-position="below" data-vls-gf-offset="14"></button>\n</div>\n\n<div class="vls-gf-content-wrapper">\n\n</div>\n';
	}
	return __p;
	};


/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	/*global module */

	'use strict';

	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(103);
	var enums = __webpack_require__(86);

	var View = ItemView.extend({

		className: 'vls-gf-view-tab-general',

		template: Template,

		templateHelpers: function() {
			return {
				t: {
					globalLightbox: this.l10n.t('globalLightbox'),
					globalDisplayImageInfoOnHover: this.l10n.t('globalDisplayImageInfoOnHover'),
					globalThumbnailDimensions: this.l10n.t('globalThumbnailDimensions'),
					tt: {
						globalLightbox: this.l10n.t('tooltips.globalLightbox'),
						globalDisplayImageInfoOnHover: this.l10n.t('tooltips.globalDisplayImageInfoOnHover'),
						globalThumbnailDimensions: this.l10n.t('tooltips.globalThumbnailDimensions')
					}

				},
				enums: enums
			}
		},

		ui: {
			fldLightbox: '#vls-gf-fld-lightbox',
			fldDisplayImageInfoOnHover: '#vls-gf-fld-display-image-info-on-hover',
			fldThumbnailWidth: '#vls-gf-fld-thumbnail-width',
			fldThumbnailHeight: '#vls-gf-fld-thumbnail-height'
		},

		events: {
			'change @ui.fldLightbox': 'onFldLightboxChange',
			'change @ui.fldDisplayImageInfoOnHover': 'onFldDisplayImageInfoOnHoverChange',
			'change @ui.fldThumbnailWidth': 'onFldThumbnailWidthChange',
			'change @ui.fldThumbnailHeight': 'onFldThumbnailHeightChange'
		},

		enums: enums,

		onFldLightboxChange: function() {
			this.model.get('general').lightbox = this.ui.fldLightbox.val();
		},

		onFldDisplayImageInfoOnHoverChange: function() {
			this.model.get('general').display_image_info_on_hover = this.ui.fldDisplayImageInfoOnHover.val();
		},

		onFldThumbnailWidthChange: function() {
			this.model.get('general').thumbnail_width = this.ui.fldThumbnailWidth.val();
		},

		onFldThumbnailHeightChange: function() {
			this.model.get('general').thumbnail_height = this.ui.fldThumbnailHeight.val();
		}
	});

	module.exports = View;


/***/ },
/* 103 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-main-panel">\n	<div class="vls-gf-form">\n		\n		<div class="vls-gf-row">\n			<div class="vls-gf-col-2">\n				<div class="vls-gf-field vls-gf-field-select">\n					<label for="vls-gf-fld-lightbox">'+
	((__t=( t.globalLightbox ))==null?'':__t)+
	'</label>\n					<select id="vls-gf-fld-lightbox">\n						';
	 for(var opt in enums.globalLightbox) { 
	__p+='\n						<option\n								value="'+
	((__t=( enums.globalLightbox[opt].value ))==null?'':__t)+
	'"\n						';
	 if (general.lightbox == enums.globalLightbox[opt].value) { 
	__p+='selected';
	 } 
	__p+='>'+
	((__t=(
							enums.globalLightbox[opt].text ))==null?'':__t)+
	'\n						</option>\n						';
	 } 
	__p+='\n					</select>\n				</div>\n			</div>\n			<div class="vls-gf-col-2">\n				<span>'+
	((__t=( t.tt.globalLightbox ))==null?'':__t)+
	'</span>\n			</div>\n		</div>\n		\n		<div class="vls-gf-row">\n			<div class="vls-gf-col-2">\n				<div class="vls-gf-field vls-gf-field-select">\n					<label for="vls-gf-fld-display-image-info-on-hover">'+
	((__t=( t.globalDisplayImageInfoOnHover ))==null?'':__t)+
	'</label>\n					<select id="vls-gf-fld-display-image-info-on-hover">\n						';
	 for(var opt in enums.globalDisplayImageInfoOnHover) { 
	__p+='\n						<option\n								value="'+
	((__t=( enums.globalDisplayImageInfoOnHover[opt].value ))==null?'':__t)+
	'"\n						';
	 if (general.display_image_info_on_hover == enums.globalDisplayImageInfoOnHover[opt].value) {
							
	__p+='selected';

							}
							
	__p+='>'+
	((__t=(
							enums.globalDisplayImageInfoOnHover[opt].text ))==null?'':__t)+
	'\n						</option>\n						';
	 } 
	__p+='\n					</select>\n				</div>\n			</div>\n			<div class="vls-gf-col-2">\n				<span>'+
	((__t=( t.tt.globalDisplayImageInfoOnHover ))==null?'':__t)+
	'</span>\n			</div>\n		</div>\n		\n		<div class="vls-gf-row">\n			<div class="vls-gf-col-2">\n				<div class="vls-gf-field vls-gf-dimensions">\n					<label for="vls-gf-fld-thumbnail-width">'+
	((__t=( t.globalThumbnailDimensions ))==null?'':__t)+
	'</label>\n					<input id="vls-gf-fld-thumbnail-width" type="text" value="'+
	((__t=( general.thumbnail_width ))==null?'':__t)+
	'"/>\n					<span>&times;</span>\n					<input id="vls-gf-fld-thumbnail-height" type="text" value="'+
	((__t=( general.thumbnail_height ))==null?'':__t)+
	'"/>\n				</div>\n			</div>\n			<div class="vls-gf-col-2">\n				<span>'+
	((__t=( t.tt.globalThumbnailDimensions ))==null?'':__t)+
	'</span>\n			</div>\n		</div>\n	\n	</div>\n</div>';
	}
	return __p;
	};


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	/*global module*/
	/*Image editor layout*/


	var $ = __webpack_require__(2);
	var LayoutView = __webpack_require__(21);

	var Template = __webpack_require__(105);

	var ToolsModel = __webpack_require__(106);
	var RegenerateThumbnailsTabView = __webpack_require__(107);
	var ImportWPMediaTabView = __webpack_require__(109);
	var ImportNextGenTabView = __webpack_require__(111);

	var View = LayoutView.extend({

		className: "vls-gf-view-tools",

		template: Template,
		templateHelpers: function() {
			return {
				t: {
					tools: this.l10n.t('tools'),
					tabThumbnailRegeneration: this.l10n.t('tabThumbnailRegeneration'),
					tabImportFromWPMedia: this.l10n.t('tabImportFromWPMedia'),
					tabImportFromNextGenGallery: this.l10n.t('tabImportFromNextGenGallery')
				}
			}
		},

		regions: {
			content: '.vls-gf-content-wrapper'
		},

		ui: {
			btnBack: '.vls-gf-fixed-wrapper .vls-gf-primary-toolbar button.vls-gf-icon-back-w',
			btnTabRegenThumbnails: '.vls-gf-fixed-wrapper .vls-gf-tab-bar li[data-tab="regenerate-thumbnails"]',
			btnTabImportWPMedia: '.vls-gf-fixed-wrapper .vls-gf-tab-bar li[data-tab="import-wp-media"]',
			btnTabImportNextGen: '.vls-gf-fixed-wrapper .vls-gf-tab-bar li[data-tab="import-nextgen"]'
		},

		events: {
			'click @ui.btnBack': 'onBtnBack',
			'click @ui.btnTabRegenThumbnails': 'onBtnTabRegenThumbnails',
			'click @ui.btnTabImportWPMedia': 'onBtnTabImportWPMedia',
			'click @ui.btnTabImportNextGen': 'onBtnTabImportNextGen'
		},

		modelEvents: {
			"sync": 'renderLoaded'
		},

		initialize: function(options) {
			this.currentTab = 'regenerate-thumbnails';
			this.model = new ToolsModel();
		},

		onRender: function() {
			this._renderTabs();
		},

		onBtnBack: function() {
			this.radio.trigger('global:requestRoute', {view: 'manager'});
		},

		onBtnTabRegenThumbnails: function() {
			this.currentTab = 'regenerate-thumbnails';
			this._renderTabs();
		},

		onBtnTabImportWPMedia: function() {
			this.currentTab = 'import-wp-media';
			this._renderTabs();
		},

		onBtnTabImportNextGen: function() {
			this.currentTab = 'import-nextgen';
			this._renderTabs();
		},

		_renderTabs: function() {

			if (this.currentTab === 'regenerate-thumbnails') {
				this.ui.btnTabRegenThumbnails.addClass('vls-gf-active');
				this.content.show(new RegenerateThumbnailsTabView({model: this.model}));
			}
			else {
				this.ui.btnTabRegenThumbnails.removeClass('vls-gf-active');
			}

			if (this.currentTab === 'import-wp-media') {
				this.ui.btnTabImportWPMedia.addClass('vls-gf-active');
				this.content.show(new ImportWPMediaTabView({model: this.model}));
			}
			else {
				this.ui.btnTabImportWPMedia.removeClass('vls-gf-active');
			}

			if (this.currentTab === 'import-nextgen') {
				this.ui.btnTabImportNextGen.addClass('vls-gf-active');
				this.content.show(new ImportNextGenTabView({model: this.model}));
			}
			else {
				this.ui.btnTabImportNextGen.removeClass('vls-gf-active');
			}

			this.radio.trigger('global:needAdjustFixedElement', {});

		}

	});

	module.exports = View;


/***/ },
/* 105 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-fixed-wrapper">\r\n	<div class="vls-gf-primary-toolbar">\r\n        <span>\r\n            <button class="vls-gf-icon vls-gf-icon-back-w"></button>\r\n        </span>\r\n		<h3>'+
	((__t=( t.tools ))==null?'':__t)+
	'</h3>\r\n	</div>\r\n	<div class="vls-gf-tab-bar">\r\n		<ul>\r\n			<li data-tab="regenerate-thumbnails"><span>'+
	((__t=( t.tabThumbnailRegeneration ))==null?'':__t)+
	'</span></li>\r\n			<li data-tab="import-wp-media"><span>'+
	((__t=( t.tabImportFromWPMedia ))==null?'':__t)+
	'</span></li>\r\n			<li data-tab="import-nextgen"><span>'+
	((__t=( t.tabImportFromNextGenGallery ))==null?'':__t)+
	'</span></li>\r\n		</ul>\r\n	</div>\r\n</div>\r\n\r\n<div class="vls-gf-content-wrapper">\r\n\r\n</div>\r\n';
	}
	return __p;
	};


/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var Backbone = __webpack_require__(3);

	var Model = Backbone.Model.extend({
		defaults: {}
	});

	module.exports = Model;

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	/*global module */

	'use strict';

	var $ = __webpack_require__(2);
	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(108);

	var View = ItemView.extend({

		className: 'vls-gf-view-tab-regenerate-thumbnails',

		template: Template,

		templateHelpers: function() {
			return {
				t: {
					regenerateThumbnailsDescription: this.l10n.t('regenerateThumbnailsDescription'),
					regenerateThumbnails: this.l10n.t('regenerateThumbnails')
				}
			}
		},

		ui: {
			btnImport: 'button.vls-gf-button-raised',
			progressCard: '.vls-gf-progress-card',
			progressMessage: '.vls-gf-progress-card>span',
			progressIndicator: '.vls-gf-progress-lin-det',
			progressValue: '.vls-gf-progress-lin-det>span'
		},

		events: {
			'click @ui.btnImport': 'onBtnRun'
		},

		initialize: function() {
			this.totalBatches = 0;
		},

		onRender: function() {
			if (this.model.get('actionInProgress')) {
				this.ui.btnImport.hide();
			}
		},

		onBtnRun: function() {

			this.model.set('actionInProgress', true);
			this.ui.progressMessage.html(this.l10n.t('regenerateThumbnailsProgressMessage'));
			this.ui.btnImport.hide();
			this.ui.progressCard.show();

			this.importBatch(1);

		},

		importBatch: function(batchNo) {
			var self = this;
			$.post(
				ajaxurl,
				{
					action: 'vls_gf_regenerate_thumbnails_batch',
					_nonce: vlsGFData.nonce,
					batch_no: batchNo
				},
				this.onImportResponse.bind(this),
				'json'
				)
				.fail(function() {
					self.onImportResponse({success: false, message: 'Unknown error occurred'});
				});
		},

		onImportResponse: function(response) {

			if (response.success && response.result == "progress") {
				if (response.total_batches) {
					this.totalBatches = response.total_batches;
				}
				this.ui.progressValue.css({
					width: (response.batch_no / this.totalBatches * 100) + "%"
				});
				this.importBatch(response.batch_no + 1);
			}
			else if (response.success && response.result == "complete") {
				this.ui.progressIndicator.addClass('vls-gf-done');
				this.ui.progressMessage.html(this.l10n.t('completed'));
				this.totalBatches = 0;
			}
			else {
				this.ui.progressIndicator.addClass('vls-gf-failed');
				this.ui.progressMessage.html(response.message);
			}
		}

	});

	module.exports = View;


/***/ },
/* 108 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-main-panel">\r\n	\r\n	<p>'+
	((__t=( t.regenerateThumbnailsDescription ))==null?'':__t)+
	'</p>\r\n	\r\n	<button class="vls-gf-button-raised">'+
	((__t=( t.regenerateThumbnails ))==null?'':__t)+
	'</button>\r\n	\r\n	<div class="vls-gf-progress-card">\r\n		<span></span>\r\n		<div class="vls-gf-progress-lin-det"><span></span></div>\r\n	</div>\r\n\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	/*global module */

	'use strict';

	var $ = __webpack_require__(2);
	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(110);

	var View = ItemView.extend({

		className: 'vls-gf-view-tab-import-wp-media',

		template: Template,

		templateHelpers: function() {
			return {
				t: {
					importWPMediaDescription1: this.l10n.t('importWPMediaDescription1'),
					importWPMediaDescription2: this.l10n.t('importWPMediaDescription2'),
					importWPMedia: this.l10n.t('importWPMedia')
				}
			}
		},

		ui: {
			btnImport: 'button.vls-gf-button-raised',
			progressCard: '.vls-gf-progress-card',
			progressMessage: '.vls-gf-progress-card>span',
			progressIndicator: '.vls-gf-progress-lin-det',
			progressValue: '.vls-gf-progress-lin-det>span'
		},

		events: {
			'click @ui.btnImport': 'onBtnImport'
		},

		initialize: function() {
			this.totalBatches = 0;
		},

		onRender: function() {
			if (this.model.get('actionInProgress')) {
				this.ui.btnImport.hide();
			}
		},

		onBtnImport: function() {
			this.model.set('actionInProgress', true);
			this.ui.progressMessage.html(this.l10n.t('importWPMediaProgressMessage'));
			this.ui.btnImport.hide();
			this.ui.progressCard.show();

			this.importBatch(1);
		},

		importBatch: function(batchNo) {
			$.post(
				ajaxurl,
				{
					action: 'vls_gf_import_wp_media_batch',
					_nonce: window.vlsGFData.nonce,
					batch_no: batchNo
				},
				this.onImportResponse.bind(this),
				'json'
			);
		},

		onImportResponse: function(response) {
			if (response.success && response.result == "progress") {
				if (response.total_batches) {
					this.totalBatches = response.total_batches;
				}
				this.ui.progressValue.css({
					width: (response.batch_no / this.totalBatches * 100) + "%"
				});
				this.importBatch(response.batch_no + 1);
			}
			else if (response.success && response.result == "complete") {
				this.ui.progressIndicator.addClass('vls-gf-done');
				this.ui.progressMessage.html(this.l10n.t('completed'));
				this.radio.trigger('folder:contentChanged', {id: 0});
				this.totalBatches = 0;
			}
			else {
				this.ui.progressIndicator.addClass('vls-gf-failed');
				this.ui.progressMessage.html(response.message);
			}
		}

	});

	module.exports = View;


/***/ },
/* 110 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-main-panel">\r\n	\r\n	<p>'+
	((__t=( t.importWPMediaDescription1 ))==null?'':__t)+
	'</p>\r\n	<p>'+
	((__t=( t.importWPMediaDescription2 ))==null?'':__t)+
	'</p>\r\n	\r\n	<button class="vls-gf-button-raised">'+
	((__t=( t.importWPMedia ))==null?'':__t)+
	'</button>\r\n	\r\n	<div class="vls-gf-progress-card">\r\n		<span></span>\r\n		<div class="vls-gf-progress-lin-det"><span></span></div>\r\n	</div>\r\n\r\n\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	/*global module */

	'use strict';

	var $ = __webpack_require__(2);
	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(112);

	var View = ItemView.extend({

		className: 'vls-gf-view-tab-import-nextgen',

		template: Template,

		templateHelpers: function() {
			return {
				t: {
					createNextGenFolder: this.l10n.t('createNextGenFolder'),
					importNextGenDescription1: this.l10n.t('importNextGenDescription1'),
					importNextGenDescription2: this.l10n.t('importNextGenDescription2'),
					importNextGen: this.l10n.t('importNextGen')
				}
			}
		},

		ui: {
			fldCreateFolder: '#vls-gf-fld-create-folder',
			btnImport: 'button.vls-gf-button-raised',
			progressCard: '.vls-gf-progress-card',
			progressMessage: '.vls-gf-progress-card>span',
			progressIndicator: '.vls-gf-progress-card > .vls-gf-progress-lin-ind'
		},

		events: {
			'click @ui.btnImport': 'onBtnImport'
		},

		onRender: function() {
			if (this.model.get('actionInProgress')) {
				this.ui.btnImport.hide();
			}
		},

		onBtnImport: function() {
			this.model.set('actionInProgress', true);
			this.ui.progressMessage.html(this.l10n.t('importNextGenProgressMessage'));
			this.ui.btnImport.hide();
			this.ui.progressCard.show();

			$.post(
				ajaxurl,
				{
					action: 'vls_gf_import_nextgen',
					_nonce: window.vlsGFData.nonce,
					create_folder: this.ui.fldCreateFolder[0].checked
				},
				this.onImportResponse.bind(this),
				'json'
			);

		},

		onImportResponse: function(response) {
			if (response.success) {
				this.ui.progressIndicator.addClass('vls-gf-done');
				this.ui.progressMessage.html(this.l10n.t('completed'));
				this.radio.trigger('folder:contentChanged', {id: 0});
			}
			else {
				this.ui.progressIndicator.addClass('vls-gf-failed');
				this.ui.progressMessage.html(response.message);
			}
		}

	});

	module.exports = View;


/***/ },
/* 112 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-main-panel">\r\n	\r\n	<p>'+
	((__t=( t.importNextGenDescription1 ))==null?'':__t)+
	'</p>\r\n	<p>'+
	((__t=( t.importNextGenDescription2 ))==null?'':__t)+
	'</p>\r\n	\r\n	<div class="vls-gf-field-check">\r\n		<input id="vls-gf-fld-create-folder" type="checkbox" value="true">\r\n		<label for="vls-gf-fld-create-folder">'+
	((__t=( t.createNextGenFolder ))==null?'':__t)+
	'</label>\r\n	</div>\r\n	\r\n	<button class="vls-gf-button-raised">'+
	((__t=( t.importNextGen ))==null?'':__t)+
	'</button>\r\n	\r\n	<div class="vls-gf-progress-card">\r\n		<span></span>\r\n		<div class="vls-gf-progress-lin-ind"></div>\r\n	</div>\r\n\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(2);
	var LayoutView = __webpack_require__(21);
	var ServerData = __webpack_require__(114);
	var Plupload = __webpack_require__(115);

	var Template = __webpack_require__(116);
	var DialogModel = __webpack_require__(117);
	var DialogView = __webpack_require__(118);

	var View = LayoutView.extend({

		el: '#vls-gf-layer-uploader',
		template: Template,

		regions: {
			dialogContainer: '#vls-gf-uploader-dialog-container'
		},

		ui: {
			dropzone: '#vls-gf-uploader-dropzone',
			browseButton: '#vls-gf-uploader-btn-browse'
		},

		events: {
			'drop @ui.dropzone': 'onDropzoneDrop'
	//        'click @ui.btnFolderEdit, @ui.btnAlbumEdit': 'onEditClick',
		},

		modelEvents: {
			//"sync": "renderLoaded"
		},

		childEvents: {
			'dialog:stop': 'onDialogStop',
			'dialog:close': 'onDialogClose'
		},

		plupload: null,
		dialogModel: null,

		initialize: function(options) {

			this.state = {
				uploadEnabled: false,
				dropzoneActive: false,
				uploadingToAlbumId: false,
				currentItem: {}
			};

			this.dragTimer = null;
			this.fadeTimer = null;

			this.pluploadMultipartParams = {
				action: 'vls_gf_api_image_upload',
				_nonce: ServerData.plupload.nonce,
				album_id: 0
			};

			this.pluploadSettings = {
				container: 'vls-gf-uploader-dropzone',
				drop_element: 'vls-gf-uploader-dropzone',
				browse_button: 'vls-gf-uploader-btn-browse',
				file_data_name: 'async-upload',
				dragdrop: true,
				autostart: true,
				filters: {
					max_file_size: ServerData.plupload.maxFileSize
				},
				multipart_params: this.pluploadMultipartParams,
				url: ServerData.plupload.url,
				flash_swf_url: ServerData.plupload.flashSwfUrl,
				silverlight_xap_url: ServerData.plupload.silverlightXapUrl
			};

			this.render();

			this.initPlupload();

			this.listenTo(this.radio, 'navigation:itemActivated', this.onManagerItemNavigated);
			this.listenTo(this.radio, 'manager:uploadBrowseRequested', this.onBrowseRequested);

		},

		onRender: function() {

		},

		onShow: function() {

		},

		initPlupload: function() {
			this.plupload = new Plupload.Uploader(this.pluploadSettings);
			this.plupload.bind('Error', this.onUploadError, this);
			this.plupload.init();
			this.plupload.bind('StateChanged', this.onUploadStateChanged, this);
			this.plupload.bind('FilesAdded', this.onUploadFilesAdded, this);
			this.plupload.bind('UploadFile', this.onUploadUploadFile, this);
			this.plupload.bind('FileUploaded', this.onUploadFileUploaded, this);
			this.plupload.bind('UploadProgress', this.onUploadUploadProgress, this);

		},

		showDialog: function() {
			if (!this.dialogModel) {
				this.dialogModel = new DialogModel({
					target: this.state.currentItem.name,
					totalCount: this.plupload.files.length,
					state: 'uploading'
				});
				this.dialogContainer.show(new DialogView({model: this.dialogModel}));
			}
			// reuse the already opened dialog
			else {
				this.dialogModel.set({
					target: this.state.currentItem.name,
					totalCount: this.plupload.files.length,
					state: 'uploading'
				})
			}
		},

		onDragEnter: function(e) {
			if (this.dragTimer) {
				clearTimeout(this.dragTimer);
			}

			if (this.fadeTimer) {
				clearTimeout(this.fadeTimer);
			}

			if (this.state.dropzoneActive) {
				return;
			}
			this.state.dropzoneActive = true;

			var dz = this.ui.dropzone;
			dz.show();
			setTimeout(function() {
				dz.addClass('vls-gf-visible');
			}, 0);
		},

		onDragLeave: function(e) {
			var self = this;

			if (this.dragTimer) {
				clearTimeout(this.dragTimer);
			}

			this.dragTimer = setTimeout(function() {

				self.state.dropzoneActive = false;

				var dz = self.ui.dropzone;
				dz.removeClass('vls-gf-visible');

				self.fadeTimer = setTimeout(function() {
					if (self.state.dropzoneActive === false) {
						dz.hide();
					}
				}, 600);

			}, 10);

			//block the dropzone if current uploading is in progress and it uploads to another album
			if (this.state.uploadingToAlbumId !== false && this.state.uploadingToAlbumId !== this.state.currentItem.id) {
				e.preventDefault();
				e.stopImmediatePropagation();
				e.stopPropagation();
			}
		},

		onUploadError: function(up, err) {
			this.showDialog();
			this.dialogModel.set({
				state: 'error',
				error_message: err.response || err.message
			});

			this.plupload.stop();
			this.plupload.splice(); //clear queue
		},

		onUploadStateChanged: function() {

			var up = this.plupload;

			if (up.state === Plupload.STARTED) {
				//show upload dialog
				this.state.uploadingToAlbumId = this.state.currentItem.id;
				this.showDialog();
			}
			else {
				if (this.dialogModel.get('state') !== 'cancelled' && this.dialogModel.get('state') !== 'error') {
					this.plupload.splice(); //clear queue
					this.dialogModel.set({
						progress: 100,
						state: 'done'
					});
				}
				this.radio.trigger('album:contentChanged', {id: this.state.uploadingToAlbumId});
				this.state.uploadingToAlbumId = false;
			}
		},

		onUploadFilesAdded: function(up, files) {

			var self = this;

			// set a little delay to make sure that QueueChanged triggered by the core has time to complete
			setTimeout(function() {
				self.plupload.start();
			}, 10);

		},

		onUploadUploadFile: function(up, file) {
		},

		onUploadFileUploaded: function(up, file) {
		},

		onUploadUploadProgress: function() {
			var up = this.plupload;

			//update dialog model
			this.dialogModel.set({
				progress: up.total.percent,
				totalCount: up.files.length,
				uploadedCount: up.total.uploaded
			});
		},

		onDialogStop: function() {
			this.dialogModel.set({
				state: 'cancelled'
			});
			this.plupload.stop();
			this.plupload.splice(); //clear queue
		},

		onDialogClose: function() {
			delete this.dialogModel;
			this.plupload.refresh();
		},

		onManagerItemNavigated: function(params) {

			this.state.currentItem = {
				type: params.type,
				id: params.id,
				name: params.name
			};

			if (params.type === 'all_images' || params.type === 'unsorted_images') {
				this.state.currentItem.name = this.l10n.t('imageLibrary');
			}

			this.pluploadMultipartParams.album_id = this.state.currentItem.id;
			this.plupload.setOption('multipart_params', this.pluploadMultipartParams);

			//activate/deactivate drag-n-drop
			if (params.type === 'all_images' || params.type === 'unsorted_images' || params.type === 'album') {
				this.state.uploadEnabled = true;
				$(document).on('dragover.vls-gf', this.onDragEnter.bind(this));
				this.ui.dropzone.on('dragover.vls-gf', this.onDragEnter.bind(this));
				$(document).on('dragleave.vls-gf, drop.vls-gf', this.onDragLeave.bind(this));
				this.ui.dropzone.on('dragleave.vls-gf, drop.vls-gf', this.onDragLeave.bind(this));
			}
			else {
				this.state.uploadEnabled = false;
				$(document).off('dragover.vls-gf');
				this.ui.dropzone.off('dragover.vls-gf');
				$(document).off('dragleave.vls-gf, drop.vls-gf');
				this.ui.dropzone.off('dragleave.vls-gf, drop.vls-gf');
			}

		},

		onBrowseRequested: function() {
			this.ui.browseButton[0].click();
		},

		onDestroy: function() {
			$(document).off('dragover.vls-gf, dragleave.vls-gf, drop.vls-gf');
		}


	});

	module.exports = View;

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	/* global require */

	var _ = __webpack_require__(5),
		data = _.omit(window.vlsGFData, ['localization', 'enumerations']);

	module.exports = data;

/***/ },
/* 115 */
/***/ function(module, exports) {

	/* global require, window */

	module.exports = window.plupload;

/***/ },
/* 116 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div id="vls-gf-uploader-dropzone">\r\n	<div class="vls-gf-uploader-dropzone-content">\r\n		<h3>Drop files to upload</h3>\r\n	</div>\r\n</div>\r\n<div id="vls-gf-uploader-dialog-container"></div>\r\n<a id="vls-gf-uploader-btn-browse" href="#" style="display:none;"></a>';
	}
	return __p;
	};


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var Backbone = __webpack_require__(3);

	var Model = Backbone.Model.extend({

		defaults: {
			target: '',
			progress: 0.0,
			totalCount: 0,
			uploadedCount: 0,
			state: ''
		}

	});

	module.exports = Model;

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(119);

	var View = ItemView.extend({
		className: 'vls-gf-dialog',
		template: Template,
		templateHelpers: function() {
			return {
				l10n: {
					uploadingTo: this.l10n.t('uploadingTo'),
					stop: this.l10n.t('buttons.stop'),
					close: this.l10n.t('buttons.close')
				}
			}
		},

		ui: {
			targetText: '.vls-gf-target',
			progressText: '.vls-gf-progress-text',
			progressBarValue: '.vls-gf-progressbar>div',
			btnStop: 'button.vls-gf-btn-stop',
			btnClose: 'button.vls-gf-btn-close'
		},

		events: {
			'click @ui.btnStop': 'onBtnStop',
			'click @ui.btnClose': 'onBtnClose'
		},

		modelEvents: {
			'change': 'onModelChange'
		},

		onRender: function() {
			var totalCount = this.model.get('totalCount');
			this.ui.progressText.html(this.l10n.t('nOfN', {1: 0, 2: totalCount}));
		},

		onShow: function() {
			this.$el.addClass('vls-gf-visible');
		},

		onModelChange: function() {
			var self = this;
			var state = this.model.get('state');
			var progress = this.model.get('progress');
			var totalCount = this.model.get('totalCount');
			var uploadedCount = this.model.get('uploadedCount');

			if (this.autocloseTimeout) {
				clearTimeout(this.autocloseTimeout);
			}

			this.ui.targetText.html(this.model.get('target'));

			if (state == 'error') {
				this.ui.progressText.html(this.l10n.t('uploaderError'));
				this.ui.btnStop.css('display', 'none');
				this.ui.btnClose.css('display', 'inline-block');
			}
			else if (state == 'done') {
				this.ui.progressText.html(this.l10n.t('done'));
				this.ui.btnStop.css('display', 'none');
				this.ui.btnClose.css('display', 'inline-block');

				this.autocloseTimeout = setTimeout(function() {
					self.onBtnClose();
				}, 6000);
			}
			else if (state == 'cancelled') {
				this.ui.progressText.html(this.l10n.t('cancelled'));
				this.ui.btnStop.css('display', 'none');
				this.ui.btnClose.css('display', 'inline-block');
			}
			else {
				this.ui.progressText.html(this.l10n.t('nOfN', {1: uploadedCount, 2: totalCount}));
			}

			this.ui.progressBarValue.css('width', progress + '%');

		},

		onBtnStop: function() {
			this.triggerMethod('dialog:stop');
		},

		onBtnClose: function() {
			var self = this;
			if (!self.$el.hasClass('vls-gf-visible')) {
				return;
			}
			self.$el.removeClass('vls-gf-visible');
			setTimeout(function() {
				self.destroy();
			}, 600);

			this.triggerMethod('dialog:close');
		}

	});

	module.exports = View;



































/***/ },
/* 119 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-message">'+
	((__t=( l10n.uploadingTo ))==null?'':__t)+
	'</div>\r\n<div class="vls-gf-target">'+
	((__t=( target ))==null?'':__t)+
	'</div>\r\n<div class="vls-gf-progress-text"></div>\r\n<div class="vls-gf-progressbar">\r\n	<div></div>\r\n</div>\r\n<div class="vls-gf-actions">\r\n	<button class="vls-gf-btn-flat vls-gf-btn-stop">'+
	((__t=( l10n.stop ))==null?'':__t)+
	'</button>\r\n	<button class="vls-gf-btn-flat vls-gf-btn-close" style="display:none;">'+
	((__t=( l10n.close ))==null?'':__t)+
	'</button>\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var $ = __webpack_require__(2);
	var LayoutView = __webpack_require__(21);
	var Backbone = __webpack_require__(3);
	var Template = __webpack_require__(121);

	var ConfirmationRequestView = __webpack_require__(122);
	var InputRequestView = __webpack_require__(124);
	var SelectImageView = __webpack_require__(126);
	var CropperView = __webpack_require__(130);

	var DescendantImagesCollection = __webpack_require__(132);

	var View = LayoutView.extend({

		el: '#vls-gf-layer-dialog',

		template: Template,

		regions: {
			dialogContainer: '.vls-gf-dialog-wrapper'
		},

		ui: {
			backdrop: '.vls-gf-dialog-wrapper'
		},

		childEvents: {
			'dialog:cancelled': 'onDialogCancelled',
			'dialog:confirmed': 'onDialogConfirmed'
		},

		initialize: function(options) {
			this.state = {
				opened: false,
				dialogType: ''
			};

			this.dialogModel = {};

			this.render();

			this.listenTo(this.radio, 'dialog:newFolder:requested', this.onNewFolderDialogRequested);
			this.listenTo(this.radio, 'dialog:newAlbum:requested', this.onNewAlbumDialogRequested);
			this.listenTo(this.radio, 'dialog:deleteFolder:requested', this.onDeleteFolderDialogRequested);
			this.listenTo(this.radio, 'dialog:deleteAlbum:requested', this.onDeleteAlbumDialogRequested);
			this.listenTo(this.radio, 'dialog:selectImage:requested', this.onSelectImageDialogRequested);
			this.listenTo(this.radio, 'dialog:cropper:requested', this.onCropperDialogRequested);

			this.listenTo(this.radio, 'dialog:notification:requested', this.onNotificationRequested);
		},

		onRender: function() {

		},

		onNewFolderDialogRequested: function(params) {

			this.dialogType = 'newFolder';
			this.dialogModel = new Backbone.Model({
				header: this.l10n.t('enterNewFolderNameHeader'),
				btnCancel: this.l10n.t('buttons.cancel'),
				btnCreate: this.l10n.t('buttons.create'),
				value: '',
				parentId: params.parentId
			});

			this._showDialog(new InputRequestView({model: this.dialogModel}));


		},

		onNewAlbumDialogRequested: function(params) {

			this.dialogType = 'newAlbum';
			this.dialogModel = new Backbone.Model({
				header: this.l10n.t('enterNewAlbumNameHeader'),
				btnCancel: this.l10n.t('buttons.cancel'),
				btnCreate: this.l10n.t('buttons.create'),
				value: '',
				parentId: params.parentId
			});

			this._showDialog(new InputRequestView({model: this.dialogModel}));


		},

		onDeleteFolderDialogRequested: function(params) {

			this.dialogType = 'deleteFolder';
			this.dialogModel = new Backbone.Model({
				id: params.id,
				header: this.l10n.t('confirmFolderDeleteHeader'),
				text: this.l10n.t('confirmFolderDeleteText', {name: params.name}),
				btnCancel: this.l10n.t('buttons.cancel'),
				btnConfirm: this.l10n.t('buttons.delete'),
				parentId: params.parentId
			});

			this._showDialog(new ConfirmationRequestView({model: this.dialogModel}));


		},

		onDeleteAlbumDialogRequested: function(params) {

			this.dialogType = 'deleteAlbum';
			this.dialogModel = new Backbone.Model({
				id: params.id,
				header: this.l10n.t('confirmAlbumDeleteHeader'),
				text: this.l10n.t('confirmAlbumDeleteText', {name: params.name}),
				btnCancel: this.l10n.t('buttons.cancel'),
				btnConfirm: this.l10n.t('buttons.delete'),
				parentId: params.parentId
			});

			this._showDialog(new ConfirmationRequestView({model: this.dialogModel}));


		},

		onSelectImageDialogRequested: function(params) {
			this.dialogType = 'selectImage';
			this.dialogModel = new Backbone.Model({
				id: params.id,
				header: this.l10n.t('selectCoverImage'),
				text: '',
				btnCancel: this.l10n.t('buttons.cancel')
			});

			var dialogCollection = new DescendantImagesCollection([], {parent_id: params.id});
			dialogCollection.fetch();

			this._showDialog(new SelectImageView({model: this.dialogModel, collection: dialogCollection}));
		},

		onCropperDialogRequested: function(params) {
			this.dialogType = 'cropper';
			this.dialogModel = new Backbone.Model({
				header: this.l10n.t('thumbnailCrop'),
				btnSave: this.l10n.t('buttons.save'),
				btnCancel: this.l10n.t('buttons.cancel'),
				item: params.item
			});

			this._showDialog(new CropperView({model: this.dialogModel}));
		},

		onDialogCancelled: function() {
			this._closeDialog();
		},

		onDialogConfirmed: function() {
			this._closeDialog();
			this.radio.trigger('dialog:' + this.dialogType + ':confirmed', {
				id: this.dialogModel.get('id'),
				parentId: this.dialogModel.get('parentId'),
				value: this.dialogModel.get('value')
			});
		},

		onNotificationRequested: function(params) {
			var $el = this.$el,
				$notification = $('<div class="vls-gf-notification"></div>').html(params.message);

			$el.append($notification);
			$el.show();

			setTimeout(function() {
				$notification.addClass('vls-gf-visible');
			}, 10);

			setTimeout(function() {
				$notification.addClass('vls-gf-anim-out').removeClass('vls-gf-visible');
				setTimeout(function() {
					//$notification.remove();
					//$el.hide();
				}, 300);
			}, 2000);
		},

		_showDialog: function(dialogView) {

			var $backdrop = this.ui.backdrop;
			$backdrop.show();
			this.dialogContainer.show(dialogView);

			setTimeout(function() {
				$backdrop.css('opacity', '1');
			}, 10);

		},

		_closeDialog: function() {
			var $backdrop = this.ui.backdrop,
				dialogContainer = this.dialogContainer;
			$backdrop.css('opacity', '0');
			setTimeout(function() {
				dialogContainer.empty();
				$backdrop.hide();
			}, 500);
		}

	});

	module.exports = View;

/***/ },
/* 121 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-dialog-wrapper"></div>';
	}
	return __p;
	};


/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(123);

	var View = ItemView.extend({

		className: 'vls-gf-dialog vls-gf-x8',
		template: Template,

		ui: {
			field: '.vls-gf-field',
			input: '#vls-gf-dialog-input',
			btnCancel: '.vls-gf-actions>button[data-action="cancel"]',
			btnConfirm: '.vls-gf-actions>button[data-action="confirm"]'
		},

		triggers: {
			'click @ui.btnCancel': 'dialog:cancelled',
			'click @ui.btnConfirm': 'dialog:confirmed'
		},

		events: {}

	});

	module.exports = View;



































/***/ },
/* 123 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-header">'+
	((__t=( header ))==null?'':__t)+
	'</div>\r\n<div class="vls-gf-content">\r\n	<p>'+
	((__t=( text ))==null?'':__t)+
	'</p>\r\n</div>\r\n<div class="vls-gf-actions">\r\n	<button data-action="cancel" class="vls-gf-btn-flat">'+
	((__t=( btnCancel ))==null?'':__t)+
	'</button>\r\n	<button data-action="confirm" class="vls-gf-btn-flat">'+
	((__t=( btnConfirm ))==null?'':__t)+
	'</button>\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(125);

	var View = ItemView.extend({

		className: 'vls-gf-dialog vls-gf-x8',
		template: Template,

		ui: {
			field: '.vls-gf-field',
			input: '#vls-gf-dialog-input',
			btnCancel: '.vls-gf-actions>button[data-action="cancel"]',
			btnConfirm: '.vls-gf-actions>button[data-action="confirm"]'
		},

		triggers: {
			'click @ui.btnCancel': 'dialog:cancelled',
			'click @ui.btnConfirm': 'dialog:confirmed'
		},

		events: {
			'change @ui.input': 'onInputChange'
		},

		initialize: function(options) {
		},

		onRender: function() {
			var self = this;
			// Submit the input on enter key
			this.ui.input.keydown(function(e) {
				if (e.which == 13) {
					self.ui.input.blur();
					self.triggerMethod('dialog:confirmed');
				}
			});
		},

		onShow: function() {
			this.ui.input.focus();
		},

		onInputChange: function() {
			this.model.set('value', this.ui.input.val());
		}


	});

	module.exports = View;



































/***/ },
/* 125 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-header">'+
	((__t=( header ))==null?'':__t)+
	'</div>\r\n<div class="vls-gf-content vls-gf-form">\r\n	<div class="vls-gf-field">\r\n		<input id="vls-gf-dialog-input" type="text" value=""/>\r\n	</div>\r\n</div>\r\n<div class="vls-gf-actions">\r\n	<button data-action="cancel" class="vls-gf-btn-flat">'+
	((__t=( btnCancel ))==null?'':__t)+
	'</button>\r\n	<button data-action="confirm" class="vls-gf-btn-flat vls-gf-btn-cl">'+
	((__t=( btnCreate ))==null?'':__t)+
	'</button>\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var $ = __webpack_require__(2);
	var CompositeView = __webpack_require__(26);
	var Template = __webpack_require__(127);
	var ItemView = __webpack_require__(128);
	var Baron = __webpack_require__(31);

	var View = CompositeView.extend({

		className: 'vls-gf-dialog vls-gf-fullscreen vls-gf-dialog-select-image',
		template: Template,
		childView: ItemView,
		childViewContainer: '.vls-gf-image-list',

		ui: {
			content: '.vls-gf-content',
			btnCancel: '.vls-gf-actions>button[data-action="cancel"]'
		},

		triggers: {
			'click @ui.btnCancel': 'dialog:cancelled'
		},

		childEvents: {
			'image:selected': 'onImageSelected'
		},

		onAttach: function() {
			var baronParams = {
				$: $,
				scroller: '.vls-gf-scroll-scroller',
				container: '.vls-gf-content',
				bar: '.vls-gf-scroll-bar',
				barOnCls: 'vls-gf-bar-on',
				scrollingCls: 'vls-gf-scrolling',
				cssGuru: true
			};
			Baron.call(this.ui.content, baronParams);
		},

		onImageSelected: function(childView, params) {

			this.model.set('id', childView.model.get('id'));
			this.model.set('value', childView.model.get('cover_url'));
			this.triggerMethod('dialog:confirmed');

		}
	});

	module.exports = View;



































/***/ },
/* 127 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-header">'+
	((__t=( header ))==null?'':__t)+
	'</div>\r\n<div class="vls-gf-content">\r\n	<div class="vls-gf-scroll-scroller">\r\n		<div class="vls-gf-image-list">\r\n		</div>\r\n	</div>\r\n	<div class="vls-gf-scroll-bar"></div>\r\n</div>\r\n<div class="vls-gf-actions">\r\n	<button data-action="cancel" class="vls-gf-btn-flat">'+
	((__t=( btnCancel ))==null?'':__t)+
	'</button>\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */


	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(129);

	var View = ItemView.extend({

		className: 'vls-gf-image',
		template: Template,

		triggers: {
			'click': 'image:selected'
		}

	});

	module.exports = View;



































/***/ },
/* 129 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<img src="'+
	((__t=( icon_url ))==null?'':__t)+
	'">';
	}
	return __p;
	};


/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	var _ = __webpack_require__(5);
	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(131);

	var DIALOG_MARGIN = 96;
	var DIALOG_CONTENT_PADDING_H = 48;
	var DIALOG_CONTENT_PADDING_V = 112;

	var View = ItemView.extend({

		className: 'vls-gf-dialog vls-gf-fullscreen vls-gf-dialog-cropper',
		template: Template,

		ui: {
			imageWrapper: '.vls-gf-image-wrapper',
			cropRegion: '.vls-gf-crop-region',
			btnSave: '.vls-gf-actions>button[data-action="save"]',
			btnCancel: '.vls-gf-actions>button[data-action="cancel"]'
		},

		triggers: {
			'click @ui.btnCancel': 'dialog:cancelled'
		},

		events: {
			'click @ui.btnSave': 'onBtnSave'
		},

		initialize: function() {
			this.listenTo(this.radio, 'global:windowResize', this.adjustDialogPosition);
			this.image = this.model.get('item');
			this.cropMeta = _.extend({}, this.image.get('crop_meta'));
		},

		onShow: function() {
			this.adjustDialogPosition();

			this.ui.cropRegion.resizable({
				containment: this.ui.imageWrapper,
				handles: 'all',
				autoHide: false,
				minHeight: 43,
				minWidth: 43,
				stop: this.onCropRegionDragResize.bind(this)
			});

			this.ui.cropRegion.draggable({
				containment: this.ui.imageWrapper,
				distance: 2,
				addClasses: false,
				cursor: 'move',
				stop: this.onCropRegionDragResize.bind(this)
			});

		},

		adjustDialogPosition: function(params) {

			var $screen = this.$el.parent();
			var screenWidth = $screen.width();
			var screenHeight = $screen.height();
			var wrapperWidth = screenWidth - DIALOG_MARGIN - DIALOG_CONTENT_PADDING_H;
			var wrapperHeight = screenHeight - DIALOG_MARGIN - DIALOG_CONTENT_PADDING_V;

			var imgWidth = this.image.get('image_width');
			var imgHeight = this.image.get('image_height');


			var imgAspect = imgWidth / imgHeight;
			var wrapperAspect = wrapperWidth / wrapperHeight;

			if (imgAspect > wrapperAspect) {
				wrapperHeight = Math.round(wrapperWidth / imgAspect);
			}
			else {
				wrapperWidth = Math.round(wrapperHeight * imgAspect);
			}

			var dialogWidth = wrapperWidth + DIALOG_CONTENT_PADDING_H;
			var dialogHeight = wrapperHeight + DIALOG_CONTENT_PADDING_V;

			this.$el.css({
				top: Math.ceil((screenHeight - dialogHeight) / 2),
				bottom: screenHeight - dialogHeight - Math.ceil((screenHeight - dialogHeight) / 2),
				left: Math.ceil((screenWidth - dialogWidth) / 2),
				right: screenWidth - dialogWidth - Math.ceil((screenWidth - dialogWidth) / 2)
			});

			//position crop region
			var cropMeta = this.cropMeta;
			var cropTop = cropMeta.top || 0;
			var cropLeft = cropMeta.left || 0;
			var cropWidth = cropMeta.width || imgWidth;
			var cropHeight = cropMeta.height || imgHeight;

			this.ui.cropRegion.css({
				top: Math.round(cropTop / imgHeight * wrapperHeight) + 'px',
				left: Math.round(cropLeft / imgWidth * wrapperWidth) + 'px',
				width: Math.round(cropWidth / imgWidth * wrapperWidth) + 'px',
				height: Math.round(cropHeight / imgHeight * wrapperHeight) + 'px'
			});

		},

		onCropRegionDragResize: function(event, ui) {
			var imgWidth = this.image.get('image_width');
			var imgHeight = this.image.get('image_height');
			var cropRegion = this.ui.cropRegion;
			var wrapper = this.ui.imageWrapper;
			var cropPos = cropRegion.position();
			var cropW = cropRegion.width();
			var cropH = cropRegion.height();
			var wrapperWidth = wrapper.width();
			var wrapperHeight = wrapper.height();

			this.cropMeta = {
				top: Math.round(cropPos.top / wrapperHeight * imgHeight),
				left: Math.round(cropPos.left / wrapperWidth * imgWidth),
				width: Math.round(cropW / wrapperWidth * imgWidth),
				height: Math.round(cropH / wrapperHeight * imgHeight)
			};
		},

		onBtnSave: function() {
			var imgWidth = this.image.get('image_width');
			var imgHeight = this.image.get('image_height');

			if (!this.cropMeta.top > 0 && !this.cropMeta.left > 0 && this.cropMeta.width === imgWidth && this.cropMeta.height === imgHeight) {
				this.cropMeta = {};
			}

			this.image.set('crop_meta', this.cropMeta);
			this.triggerMethod('dialog:cancelled');
		},

		serializeData: function() {
			var data = ItemView.prototype.serializeData.call(this);
			data.url = data.item.get('url');
			return data;
		}

	});

	module.exports = View;



































/***/ },
/* 131 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<div class="vls-gf-header">'+
	((__t=( header ))==null?'':__t)+
	'</div>\r\n<div class="vls-gf-content">\r\n	<div class="vls-gf-image-wrapper" style="background-image: url('+
	((__t=( url ))==null?'':__t)+
	'); background-size: cover;">\r\n		<!--<img src="'+
	((__t=( url ))==null?'':__t)+
	'"/>-->\r\n		<div class="vls-gf-crop-region">\r\n			<span class="vls-gf-resize-helper"></span>\r\n			<span class="vls-gf-resize-helper"></span>\r\n			<span class="vls-gf-resize-helper"></span>\r\n			<span class="vls-gf-resize-helper"></span>\r\n			<span class="vls-gf-resize-helper"></span>\r\n			<span class="vls-gf-resize-helper"></span>\r\n			<span class="vls-gf-resize-helper"></span>\r\n			<span class="vls-gf-resize-helper"></span>\r\n		</div>\r\n	</div>\r\n</div>\r\n<div class="vls-gf-actions">\r\n	<button data-action="cancel" class="vls-gf-btn-flat">'+
	((__t=( btnCancel ))==null?'':__t)+
	'</button>\r\n	<button data-action="save" class="vls-gf-btn-flat">'+
	((__t=( btnSave ))==null?'':__t)+
	'</button>\r\n</div>';
	}
	return __p;
	};


/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	var _ = __webpack_require__(5);
	var Backbone = __webpack_require__(3);
	var Model = __webpack_require__(47);

	var Collection = Backbone.Collection.extend({

		model: Model,
		url: 'image_collection_descendant',

		initialize: function(models, options) {
			this.parent_id = options.parent_id;

			this.sortAttribute = 'id';
			this.sortOrder = 'asc';
		},

		fetch: function(options) {

			options = options ? options : {};
			options = _.extend(options, {data: {parent_id: this.parent_id}});
			Backbone.Collection.prototype.fetch.call(this, options);

		},

		comparator: function(model) {
			var attribute = this.sortAttribute;
			return ( model.get(attribute) );
		},

		sortByAttribute: function(attribute, order) {
			this.comparator = function(model) {
				return model.get(attribute);
			};
			if (order === 'desc') {
				this.sort({silent: true});
				this.models = this.models.reverse();
				this.trigger('sort', this);
			}
			else {
				this.sort();
			}
		}
	});

	module.exports = Collection;

/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */

	'use strict';

	var $ = __webpack_require__(2);
	var ItemView = __webpack_require__(40);
	var Template = __webpack_require__(134);

	var View = ItemView.extend({

		el: '#vls-gf-layer-tutorial',

		template: Template,
		templateHelpers: function() {
			return {
				t: {
					continue: this.l10n.t('tutorial.continue'),
					skipTutorial: this.l10n.t('tutorial.skipTutorial')
				}
			}
		},

		ui: {
			wrapper: '.vls-gf-wrapper',
			overlay: '.vls-gf-overlay',
			btnNext: 'button.vls-gf-btn-next',
			btnSkip: 'button.vls-gf-btn-skip'
		},

		events: {
			'click @ui.btnNext': 'onBtnNext',
			'click @ui.btnSkip': 'onBtnSkip'
		},

		modelEvents: {
			'change:currentView': 'onCurrentViewChange'
		},

		initialize: function(options) {
			this.page = '';
			this.step = 0;
			this.frame;
			this.render();
		},

		onRender: function() {
			this.ui.overlay.on('wheel mousewheel touchmove', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});
		},

		onCurrentViewChange: function() {
			var currentView = this.model.get('currentView');

			setTimeout(function(self) {
				return function() {
					//if there is a script for the current page and tutorial is not completed, run tutorial
					if (self.script[currentView] && (vlsGFData.tutorialStatus[currentView] === false)) {
						self.page = currentView;
						self.step = 1;
						self._showTutorial();
						self._showNextStep();
					}
				};
			}(this), 1000);

			//if there is a script for the current page, run tutorial
			// if (this.script[currentView]) {
			//     this.page = currentView;
			//     this.step = 1;
			//     this._showTutorial();
			//     this._showNextStep();
			// }


			// <div class="vls-gf-message">Grand Jedi Master Yoda is among the oldest and most powerful known Jedi Masters in the Star
			// Wars universe. He was once on the Jedi Council. Series creator George Lucas opted to have many details of the
			// character's life history remain unknown.
			// </div>
			// <
		},

		onBtnNext: function() {

			this._showNextStep();


			// if (this.step == 0) {
			//     this.$el.find('.vls-gf-message').css({
			//         top: '40%',
			//         right: '30%',
			//         bottom: '',
			//         left: '30%'
			//     });
			//     this.step = 1;
			//
			// } else if (this.step == 1) {
			//     this.$el.find('.vls-gf-focus').css({
			//         display: 'block',
			//         top: '96px',
			//         right: '',
			//         bottom: '0',
			//         left: '160px',
			//         width: '260px',
			//         height: ''
			//     });
			//
			//     this.$el.find('.vls-gf-message').css({
			//         top: '50%',
			//         right: '200px',
			//         bottom: '',
			//         left: '500px',
			//         width: ''
			//     });
			//
			//     this.step = 2;
			//
			// } else if (this.step == 2) {
			//     this.$el.find('.vls-gf-focus').css({
			//         display: 'block',
			//         top: '96px',
			//         right: '0',
			//         bottom: '0',
			//         left: '420px',
			//         width: '',
			//         height: ''
			//     });
			//
			//     this.$el.find('.vls-gf-message').css({
			//         top: '36%',
			//         right: '',
			//         bottom: '',
			//         left: '48px',
			//         width: '350px'
			//     });
			//
			//     this.step = 3;
			//
			// } else if (this.step == 3) {
			//     this.$el.find('.vls-gf-focus').css({
			//         display: 'block',
			//         top: '',
			//         right: '8px',
			//         bottom: '8px',
			//         left: '',
			//         width: '88px',
			//         height: '88px'
			//     }).addClass('vls-gf-circle');
			//
			//     this.$el.find('.vls-gf-message').css({
			//         top: '',
			//         right: '48px',
			//         bottom: '100px',
			//         left: '',
			//         width: '400px'
			//     });
			//
			// }

		},

		onBtnSkip: function() {
			this._closeTutorial();
		},

		/**
		 * Tutorial script
		 */
		script: {
			manager: {

				//welcome
				1: function(frame) {

					var message = $('<div>')
						.append('<h1 style="margin-bottom: 16px;">' + this.l10n.t('tutorial.manager.step1h') + '</h1>')
						.append('<p>' + this.l10n.t('tutorial.manager.step1t') + '</p>');

					var messageWrapper = $('<div>')
						.addClass('vls-gf-message-wrapper')
						.css({
							top: '45%',
							left: '50%',
							'max-width': '500px',
							'transform': 'translate(-50%, -50%)'
						})
						.append(message)
						.appendTo(frame);

					var focus = $('<div class="vls-gf-focus-wrapper"><div class="vls-gf-focus"></div></div>')
						.appendTo(frame);

					this.onStepWipe = null;

				},

				2: function(frame) {

					var $window = $(window);
					var navPanel = $('#vls-gf-layer-primary .vls-gf-content-wrapper .vls-gf-nav-panel');
					var sidePanel = $('#vls-gf-layer-primary .vls-gf-content-wrapper .vls-gf-side-panel');

					var line1 = $('<div class="vls-gf-v-line"></div>').css({
						top: '30px',
						left: (navPanel.offset().left + navPanel.outerWidth()) - 2 + 'px',
						bottom: '270px'
					}).appendTo(frame);

					var line2 = $('<div class="vls-gf-v-line"></div>').css({
						top: '30px',
						right: (sidePanel.outerWidth() - 2) + 'px',
						bottom: '270px'
					}).appendTo(frame);


					var messageA = $('<div>')
						.append('<h1>' + this.l10n.t('tutorial.manager.step2ah') + '</h1>')
						.append('<p>' + this.l10n.t('tutorial.manager.step2at') + '</p>');

					var messageAWrapper = $('<div>')
						.addClass('vls-gf-message-wrapper vls-gf-anim-in')
						.css({
							top: '144px',
							left: (navPanel.offset().left + 24 ) + 'px',
							width: (navPanel.outerWidth() - 48) + 'px'
						})
						.append(messageA)
						.appendTo(frame);

					var messageB = $('<div>')
						.append('<h1>' + this.l10n.t('tutorial.manager.step2bh') + '</h1>')
						.append('<p>' + this.l10n.t('tutorial.manager.step2bt') + '</p>');

					var messageBWrapper = $('<div>')
						.addClass('vls-gf-message-wrapper vls-gf-anim-in')
						.css({
							top: '144px',
							left: (navPanel.offset().left + navPanel.outerWidth() + 112) + 'px',
							right: ($window.width() - sidePanel.offset().left + 112) + 'px'
						})
						.append(messageB)
						.appendTo(frame);

					var messageC = $('<div>')
						.append('<h1>' + this.l10n.t('tutorial.manager.step2ch') + '</h1>')
						.append('<p>' + this.l10n.t('tutorial.manager.step2ct') + '</p>');

					var messageCWrapper = $('<div>')
						.addClass('vls-gf-message-wrapper vls-gf-anim-in')
						.css({
							top: '144px',
							right: '24px',
							width: (sidePanel.outerWidth() - 48) + 'px'
						})
						.append(messageC)
						.appendTo(frame);

					var messageD = $('<div>')
						.append('<h1>' + this.l10n.t('tutorial.manager.step2dh') + '</h1>')
						.append('<p>' + this.l10n.t('tutorial.manager.step2dt') + '</p>');

					var messageDWrapper = $('<div>')
						.addClass('vls-gf-message-wrapper vls-gf-anim-in')
						.css({
							right: '144px',
							bottom: '120px',
							'max-width': '412px'
						})
						.append(messageD)
						.appendTo(frame);


					var focus = $('<div class="vls-gf-focus"></div>')
						.css({
							display: 'block',
							right: '8px',
							bottom: '8px',
							width: '88px',
							height: '88px',
							'border-radius': '44px'
						});
					var focusWrapper = $('<div class="vls-gf-focus-wrapper"></div>')
						.append(focus)
						.appendTo(frame);

					var backdrop = $('<div>').addClass('vls-gf-backdrop')
						.css({
							right: '8px',
							bottom: '8px',
							width: '88px',
							height: '88px',
							'border-radius': '44px',
							'background-color': '#f7f7f7'
						})
						.appendTo(frame);

					$('#vls-gf-app .vls-gf-view-gallery-manager .vls-gf-fab-wrapper').css('z-index', 100130);

					this.onStepWipe = function($) {
						$('#vls-gf-app .vls-gf-view-gallery-manager .vls-gf-fab-wrapper').css('z-index', '');
					};


					//<svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 113 84"><path  d="M113,68c-8.7-2.5-19.6-7.2-26.5-12.4L92,67.9c-46.9-1.5-80.7-35.1-89-66.7c-0.2-0.8-1-1.3-1.8-1.1C0.3,0.3-0.2,1.1,0,1.9c8.6,32.8,43.7,67.6,92.2,69L88.6,84C94.7,77.8,104.8,71.7,113,68z"/></svg>
					var arrow1 = $('<div>').addClass('vls-gf-arrow vls-gf-anim-in')
						.css({
							bottom: '32px',
							right: '131px',
							width: '113px',
							height: '84px',
							'background-image': 'url("data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTMgODQiPjxwYXRoICBkPSJNMTEzLDY4Yy04LjctMi41LTE5LjYtNy4yLTI2LjUtMTIuNEw5Miw2Ny45Yy00Ni45LTEuNS04MC43LTM1LjEtODktNjYuN2MtMC4yLTAuOC0xLTEuMy0xLjgtMS4xQzAuMywwLjMtMC4yLDEuMSwwLDEuOWM4LjYsMzIuOCw0My43LDY3LjYsOTIuMiw2OUw4OC42LDg0Qzk0LjcsNzcuOCwxMDQuOCw3MS43LDExMyw2OHoiLz48L3N2Zz4=")'
						})
						.appendTo(frame);


					//animate messages reveal
					setTimeout(function() {
						messageAWrapper.removeClass('vls-gf-anim-in')
					}, 200);
					setTimeout(function() {
						messageBWrapper.removeClass('vls-gf-anim-in')
					}, 400);
					setTimeout(function() {
						messageCWrapper.removeClass('vls-gf-anim-in')
					}, 600);
					setTimeout(function() {
						messageDWrapper.removeClass('vls-gf-anim-in')
					}, 1000);
					setTimeout(function() {
						arrow1.removeClass('vls-gf-anim-in')
					}, 1000);

				},

				3: function(frame) {

					var btnMenu = $('#vls-gf-layer-primary .vls-gf-fixed-wrapper .vls-gf-more-menu');
					var mainHeader = $('#vls-gf-layer-primary .vls-gf-fixed-wrapper .vls-gf-main h3');
					var folderItem = $('#vls-gf-layer-primary .vls-gf-navigation-tree .vls-gf-folder').first();
					//var contentItem = $('#vls-gf-layer-primary .vls-gf-content-wrapper .vls-gf-list table>tbody>tr').last();
					var mainPanelHeader = $('#vls-gf-layer-primary .vls-gf-fixed-wrapper .vls-gf-primary-toolbar .vls-gf-main');

					//switch to the folder
					folderItem.find('>div').trigger('click');

					//var sidePanel = $('#vls-gf-layer-primary .vls-gf-content-wrapper .vls-gf-side-panel' );

					var messageA = $('<div>')
						.append('<p>' + this.l10n.t('tutorial.manager.step3a') + '</p>');

					var messageAWrapper = $('<div>')
						.addClass('vls-gf-message-wrapper vls-gf-anim-in')
						.css({
							top: '172px',
							left: (mainHeader.offset().left + 60 ) + 'px',
							width: '280px'
						})
						.append(messageA)
						.appendTo(frame);


					var messageB = $('<div>')
						.append('<p style="text-align:right;">' + this.l10n.t('tutorial.manager.step3b') + '</p>');

					var messageBWrapper = $('<div>')
						.addClass('vls-gf-message-wrapper vls-gf-anim-in')
						.css({
							top: '66px',
							right: '280px',
							width: '300px'
						})
						.append(messageB)
						.appendTo(frame);


					var messageC = $('<div>')
						.append('<p style="text-align:center;">' + this.l10n.t('tutorial.manager.step3c') + '</p>');

					var messageCWrapper = $('<div>')
						.addClass('vls-gf-message-wrapper vls-gf-anim-in')
						.css({
							top: '180px',
							right: '46px',
							width: '200px'
						})
						.append(messageC)
						.appendTo(frame);

					var messageD = $('<div>')
						.append('<p style="text-align:center;">' + this.l10n.t('tutorial.manager.step3d') + '</p>');

					var messageDWrapper = $('<div>')
						.addClass('vls-gf-message-wrapper vls-gf-anim-in')
						.css({
							top: '488px',
							left: '50%',
							width: '400px',
							transform: 'translateX(-50%)'
						})
						.append(messageD)
						.appendTo(frame);


					var focusA = $('<div class="vls-gf-focus"></div>')
						.css({
							display: 'block',
							top: (mainHeader.offset().top) + 'px',
							left: (mainHeader.offset().left - 24) + 'px',
							width: (mainHeader.outerWidth() + 48) + 'px',
							height: '64px'
						});
					var focusAWrapper = $('<div class="vls-gf-focus-wrapper"></div>')
						.css({right: '200px', height: '100px'})
						.append(focusA)
						.appendTo(frame);


					var focusB = $('<div class="vls-gf-focus"></div>')
						.css({
							display: 'block',
							top: btnMenu.offset().top + 'px',
							right: '50px',
							width: '112px',
							height: '48px',
							'border-radius': '4px'
						});
					var focusBWrapper = $('<div class="vls-gf-focus-wrapper"></div>')
						.css({
							right: 0,
							left: 'auto',
							bottom: 'auto',
							width: '200px',
							height: '100px'
						})
						.append(focusB)
						.appendTo(frame);


					var focusC = $('<div class="vls-gf-focus"></div>')
						.css({
							display: 'block',
							top: (folderItem.offset().top - 100) + 'px',
							left: (folderItem.offset().left) + 'px',
							width: folderItem.outerWidth() + 'px',
							height: folderItem.outerHeight() + 'px'
						});
					var focusCWrapper = $('<div class="vls-gf-focus-wrapper"></div>')
						.css({
							top: '100px',
							bottom: 'auto',
							height: '200px'
						})
						.append(focusC)
						.appendTo(frame);


					var focusD = $('<div class="vls-gf-focus"></div>')
						.css({
							display: 'block',
							top: '35px',
							left: (mainPanelHeader.offset().left) + 'px',
							right: '320px',
							height: '48px'
						});
					var focusDWrapper = $('<div class="vls-gf-focus-wrapper"></div>')
						.css({top: '300px'})
						.append(focusD)
						.appendTo(frame);


					//to nav item
					//<svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 116"><path d="M97.2,41.6C83.6,22.5,57.9,12.9,20.8,12.9l4-12.9C18.6,6,8.3,11.8,0,15.4c8.6,2.7,19.4,7.5,26.2,12.9L21,15.9c36,0,60.8,9.2,73.8,27.4c16.8,23.6,9.2,55.1,3.1,71.7l2.8,1C107,98.8,114.9,66.2,97.2,41.6z"/></svg>

					var arrow1 = $('<div>').addClass('vls-gf-arrow vls-gf-anim-in')
						.css({
							top: (mainHeader.offset().top) + 16 + 'px',
							left: (mainHeader.offset().left + mainHeader.outerWidth() + 34) + 'px',
							width: '108px',
							height: '116px',
							'background-image': 'url("data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDggMTE2Ij48cGF0aCBkPSJNOTcuMiw0MS42QzgzLjYsMjIuNSw1Ny45LDEyLjksMjAuOCwxMi45bDQtMTIuOUMxOC42LDYsOC4zLDExLjgsMCwxNS40YzguNiwyLjcsMTkuNCw3LjUsMjYuMiwxMi45TDIxLDE1LjljMzYsMCw2MC44LDkuMiw3My44LDI3LjRjMTYuOCwyMy42LDkuMiw1NS4xLDMuMSw3MS43bDIuOCwxQzEwNyw5OC44LDExNC45LDY2LjIsOTcuMiw0MS42eiIvPjwvc3ZnPg==")'
						})
						.appendTo(frame);

					//to header
					//<svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 165 67"><path d="M88.4,0.5C55.3,3.4,27.3,20.3,9.1,48L0,38c1.9,8.4,1.7,20.1,0.5,29C7.3,61,17,54.3,25.1,51.3l-13.4-1.9C29.4,22.6,56.6,6.3,88.7,3.4c32.8-2.9,62.1,8.9,74.1,22l2.2-2C150.2,7.2,118.7-2.3,88.4,0.5z"/></svg>
					var arrow2 = $('<div>').addClass('vls-gf-arrow vls-gf-anim-in')
						.css({
							top: '130px',
							left: (mainHeader.offset().left - 70 ) + 'px',
							width: '165px',
							height: '67px',
							'background-image': 'url("data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNjUgNjciPjxwYXRoIGQ9Ik04OC40LDAuNUM1NS4zLDMuNCwyNy4zLDIwLjMsOS4xLDQ4TDAsMzhjMS45LDguNCwxLjcsMjAuMSwwLjUsMjlDNy4zLDYxLDE3LDU0LjMsMjUuMSw1MS4zbC0xMy40LTEuOUMyOS40LDIyLjYsNTYuNiw2LjMsODguNywzLjRjMzIuOC0yLjksNjIuMSw4LjksNzQuMSwyMmwyLjItMkMxNTAuMiw3LjIsMTE4LjctMi4zLDg4LjQsMC41eiIvPjwvc3ZnPg==")'
						})
						.appendTo(frame);


					//to edit
					// <svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 30">
					//     <path  d="M66,14c-8.5-3.1-19.1-8.3-25.7-14l4.8,12.8c-10.8,1.4-26.6,5-44.3,14.4c-0.7,0.4-1,1.3-0.6,2
					// C0.4,29.7,1,30,1.5,30c0.2,0,0.5-0.1,0.7-0.2C19.3,20.7,34.4,17.1,45,15.8l-4.4,12.6C47,22.6,57.5,17.2,66,14z"/>
					// </svg>
					var arrow3 = $('<div>').addClass('vls-gf-arrow vls-gf-anim-in')
						.css({
							top: '48px',
							right: '186px',
							width: '66px',
							height: '30px',
							'background-image': 'url("data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NiAzMCI+DQo8cGF0aCAgZD0iTTY2LDE0Yy04LjUtMy4xLTE5LjEtOC4zLTI1LjctMTRsNC44LDEyLjhjLTEwLjgsMS40LTI2LjYsNS00NC4zLDE0LjRjLTAuNywwLjQtMSwxLjMtMC42LDINCglDMC40LDI5LjcsMSwzMCwxLjUsMzBjMC4yLDAsMC41LTAuMSwwLjctMC4yQzE5LjMsMjAuNywzNC40LDE3LjEsNDUsMTUuOGwtNC40LDEyLjZDNDcsMjIuNiw1Ny41LDE3LjIsNjYsMTR6Ii8+DQo8L3N2Zz4=")'
						})
						.appendTo(frame);

					//to delete
					// <svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 70">
					//     <path d="M44,27.6C39.5,20.2,36.1,8.9,34.5,0c-4.6,7.8-11.8,17.1-18.6,22.5l13.3-2.2c-4.2,15.4-12.4,35-28.6,47
					// c-0.7,0.5-0.8,1.4-0.3,2.1C0.6,69.8,1,70,1.5,70c0.3,0,0.6-0.1,0.9-0.3c17-12.6,25.5-33,29.8-48.9L44,27.6z"/>
					// </svg>
					var arrow4 = $('<div>').addClass('vls-gf-arrow vls-gf-anim-in')
						.css({
							top: '104px',
							right: '76px',
							width: '44px',
							height: '70px',
							'background-image': 'url("data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NCA3MCI+DQo8cGF0aCBkPSJNNDQsMjcuNkMzOS41LDIwLjIsMzYuMSw4LjksMzQuNSwwYy00LjYsNy44LTExLjgsMTcuMS0xOC42LDIyLjVsMTMuMy0yLjJjLTQuMiwxNS40LTEyLjQsMzUtMjguNiw0Nw0KCWMtMC43LDAuNS0wLjgsMS40LTAuMywyLjFDMC42LDY5LjgsMSw3MCwxLjUsNzBjMC4zLDAsMC42LTAuMSwwLjktMC4zYzE3LTEyLjYsMjUuNS0zMywyOS44LTQ4LjlMNDQsMjcuNnoiLz4NCjwvc3ZnPg==")'
						})
						.appendTo(frame);

					//to content line
					// <svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 74">
					//     <path d="M27,18.7C19.2,14.7,10.2,6.8,4.1,0C4.2,9.1,3,20.9,0,29.1l10.4-8.9c6.5,18.8,8.9,34.1,8.4,53.8l3,0.1
					// c0.5-20.1-1.9-35.7-8.6-55L27,18.7z"/>
					// </svg>
					var arrow5 = $('<div>').addClass('vls-gf-arrow vls-gf-anim-in')
						.css({
							top: '400px',
							left: '50%',
							width: '27px',
							height: '74px',
							transform: 'translateX(-80%)',
							'background-image': 'url("data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNyA3NCI+DQo8cGF0aCBkPSJNMjcsMTguN0MxOS4yLDE0LjcsMTAuMiw2LjgsNC4xLDBDNC4yLDkuMSwzLDIwLjksMCwyOS4xbDEwLjQtOC45YzYuNSwxOC44LDguOSwzNC4xLDguNCw1My44bDMsMC4xDQoJYzAuNS0yMC4xLTEuOS0zNS43LTguNi01NUwyNywxOC43eiIvPg0KPC9zdmc+")'
						})
						.appendTo(frame);


					this.onStepWipe = null;

					//animate messages reveal
					setTimeout(function() {
						messageAWrapper.removeClass('vls-gf-anim-in');
						arrow1.removeClass('vls-gf-anim-in');
						arrow2.removeClass('vls-gf-anim-in');
					}, 200);

					setTimeout(function() {
						messageBWrapper.removeClass('vls-gf-anim-in');
						arrow3.removeClass('vls-gf-anim-in');
					}, 400);

					setTimeout(function() {
						messageCWrapper.removeClass('vls-gf-anim-in');
						arrow4.removeClass('vls-gf-anim-in');
					}, 600);

					setTimeout(function() {
						messageDWrapper.removeClass('vls-gf-anim-in');
						arrow5.removeClass('vls-gf-anim-in');
					}, 800);


				},

				4: function(frame) {

					var navPanel = $('#vls-gf-layer-primary .vls-gf-content-wrapper .vls-gf-nav-panel').first();


					//switch to the album
					$('#vls-gf-layer-primary .vls-gf-navigation-tree .vls-gf-album').first().find('>div').trigger('click');

					//activate image
					setTimeout(function() {
						$('#vls-gf-layer-primary .vls-gf-image-list li').first().trigger('click');
					}, 200);


					var messageA = $('<div>')
						.append('<p style="text-align:center;">' + this.l10n.t('tutorial.manager.step4a') + '</p>');

					var messageAWrapper = $('<div>')
						.addClass('vls-gf-message-wrapper vls-gf-anim-in')
						.css({
							top: '196px',
							right: '376px',
							width: '440px'
						})
						.append(messageA)
						.appendTo(frame);

					// <svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 102 69">
					//     <path d="M75.1,0L81,12.2c-37.8,6.1-65,24.4-80.8,54.6c-0.4,0.7-0.1,1.6,0.6,2C1,68.9,1.3,69,1.5,69
					// c0.5,0,1.1-0.3,1.3-0.8c15.3-29.2,41.7-47,78.4-53l-3.3,13c6-6.3,15.9-12.7,24.1-16.6C93.2,9.3,82.2,5,75.1,0z"/>
					// </svg>
					var arrow1 = $('<div>').addClass('vls-gf-arrow vls-gf-anim-in')
						.css({
							top: '118px',
							right: '456px',
							width: '102px',
							height: '69px',
							'background-image': 'url("data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDIgNjkiPg0KPHBhdGggZD0iTTc1LjEsMEw4MSwxMi4yYy0zNy44LDYuMS02NSwyNC40LTgwLjgsNTQuNmMtMC40LDAuNy0wLjEsMS42LDAuNiwyQzEsNjguOSwxLjMsNjksMS41LDY5DQoJYzAuNSwwLDEuMS0wLjMsMS4zLTAuOGMxNS4zLTI5LjIsNDEuNy00Nyw3OC40LTUzbC0zLjMsMTNjNi02LjMsMTUuOS0xMi43LDI0LjEtMTYuNkM5My4yLDkuMyw4Mi4yLDUsNzUuMSwweiIvPg0KPC9zdmc+")'
						})
						.appendTo(frame);

					var messageB = $('<div>')
						.append('<p style="text-align:center;">' + this.l10n.t('tutorial.manager.step4b') + '</p>');

					var messageBWrapper = $('<div>')
						.addClass('vls-gf-message-wrapper vls-gf-anim-in')
						.css({
							top: '196px',
							right: '52px',
							width: '300px'
						})
						.append(messageB)
						.appendTo(frame);


					// <svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 79 62">
					//     <path d="M78.9,60C67.4,28.6,36.3,16.2,20.8,11.9L27.5,0C20.1,4.5,8.9,8.1,0,9.8C7.9,14.3,17.4,21.3,22.9,28
					// l-2.4-13.1C35.5,19.1,65.2,31.1,76.1,61c0.2,0.6,0.8,1,1.4,1c0.2,0,0.3,0,0.5-0.1C78.8,61.6,79.2,60.8,78.9,60z"/>
					// </svg>
					var arrow2 = $('<div>').addClass('vls-gf-arrow vls-gf-anim-in')
						.css({
							top: '120px',
							right: '226px',
							width: '79px',
							height: '62px',
							'background-image': 'url("data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3OSA2MiI+DQo8cGF0aCBkPSJNNzguOSw2MEM2Ny40LDI4LjYsMzYuMywxNi4yLDIwLjgsMTEuOUwyNy41LDBDMjAuMSw0LjUsOC45LDguMSwwLDkuOEM3LjksMTQuMywxNy40LDIxLjMsMjIuOSwyOA0KCWwtMi40LTEzLjFDMzUuNSwxOS4xLDY1LjIsMzEuMSw3Ni4xLDYxYzAuMiwwLjYsMC44LDEsMS40LDFjMC4yLDAsMC4zLDAsMC41LTAuMUM3OC44LDYxLjYsNzkuMiw2MC44LDc4LjksNjB6Ii8+DQo8L3N2Zz4=")'
						})
						.appendTo(frame);


					//region how to edit image

					var mainPanel = $('#vls-gf-layer-primary .vls-gf-view-album-overview');
					var lastCol = Math.floor((mainPanel.outerWidth() - 48) / 168);
					var thumbnailOffset = (mainPanel.offset().left + 28 + (lastCol - 1) * 168);

					var focusB = $('<div class="vls-gf-focus"></div>')
						.css({
							display: 'block',
							top: '156px',
							left: thumbnailOffset + 'px',
							width: '160px',
							height: '160px'
						});
					var focusBWrapper = $('<div class="vls-gf-focus-wrapper"></div>')
						.css({top: '200px', right: '320px'})
						.append(focusB)
						.appendTo(frame);


					var messageC = $('<div>')
						.append('<p style="text-align:center;">' + this.l10n.t('tutorial.manager.step4c') + '</p>');


					var messageCWrapper = $('<div>')
						.addClass('vls-gf-message-wrapper vls-gf-anim-in')
						.css({
							top: '540px',
							left: (thumbnailOffset + 200 ) + 'px',
							right: '100px'
						})
						.append(messageC)
						.appendTo(frame);


					// <svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 96">
					//     <path d="M100,94.3C95,57.9,65.7,17.6,20.8,13l4.3-13C18.7,5.9,8.4,11.6,0,15c8.6,2.9,19.2,7.9,25.9,13.4L21,16
					// c43.1,4.7,71.2,43.6,76,78.7c0.1,0.7,0.7,1.3,1.5,1.3c0.1,0,0.1,0,0.2,0C99.5,95.9,100.1,95.1,100,94.3z"/>
					// </svg>
					var arrow3 = $('<div>').addClass('vls-gf-arrow vls-gf-anim-in')
						.css({
							top: '420px',
							left: (thumbnailOffset + 194 ) + 'px',
							width: '100px',
							height: '96px',
							'background-image': 'url("data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgOTYiPg0KCTxwYXRoIGQ9Ik0xMDAsOTQuM0M5NSw1Ny45LDY1LjcsMTcuNiwyMC44LDEzbDQuMy0xM0MxOC43LDUuOSw4LjQsMTEuNiwwLDE1YzguNiwyLjksMTkuMiw3LjksMjUuOSwxMy40TDIxLDE2DQoJYzQzLjEsNC43LDcxLjIsNDMuNiw3Niw3OC43YzAuMSwwLjcsMC43LDEuMywxLjUsMS4zYzAuMSwwLDAuMSwwLDAuMiwwQzk5LjUsOTUuOSwxMDAuMSw5NS4xLDEwMCw5NC4zeiIvPg0KPC9zdmc+")'
						})
						.appendTo(frame);

					// <svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 96">
					// <path d="M0,94.3C5,57.9,34.3,17.6,79.2,13L74.9,0c6.3,5.9,16.7,11.6,25.1,15c-8.6,2.9-19.2,7.9-25.9,13.4L79,16
					// C35.9,20.8,7.8,59.6,3,94.7C2.9,95.5,2.2,96,1.5,96c-0.1,0-0.1,0-0.2,0C0.5,95.9-0.1,95.1,0,94.3z"/>
					// </svg>
					var arrow4 = $('<div>').addClass('vls-gf-arrow vls-gf-anim-in')
						.css({
							top: '430px',
							right: '76px',
							width: '100px',
							height: '96px',
							'background-image': 'url("data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgOTYiPg0KCTxwYXRoIGQ9Ik0wLDk0LjNDNSw1Ny45LDM0LjMsMTcuNiw3OS4yLDEzTDc0LjksMGM2LjMsNS45LDE2LjcsMTEuNiwyNS4xLDE1Yy04LjYsMi45LTE5LjIsNy45LTI1LjksMTMuNEw3OSwxNg0KCUMzNS45LDIwLjgsNy44LDU5LjYsMyw5NC43QzIuOSw5NS41LDIuMiw5NiwxLjUsOTZjLTAuMSwwLTAuMSwwLTAuMiwwQzAuNSw5NS45LTAuMSw5NS4xLDAsOTQuM3oiLz4NCjwvc3ZnPg==")'
						})
						.appendTo(frame);


					//endregion

					var messageD = $('<div>')
						.append('<p style="text-align:center;">' + this.l10n.t('tutorial.manager.step4d') + '</p>');

					var messageDWrapper = $('<div>')
						.addClass('vls-gf-message-wrapper vls-gf-anim-in')
						.css({
							top: '420px',
							left: (navPanel.offset().left + navPanel.outerWidth() - 10 ) + 'px',
							width: '240px'
						})
						.append(messageD)
						.appendTo(frame);

					// <svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 207">
					//     <path  d="M245,185c-5.5,0-10,4-10.8,9.3c-90.4-5-193.7-69.3-219.6-174.1L28,22.4C21.1,17.1,13.8,7.7,9.1,0
					//C7.6,8.9,4.4,20.3,0,27.8l11.6-6.9c16.1,65.3,58.8,106.7,92.1,129.9c39.3,27.4,86.2,44.1,130.4,46.6c0.7,5.4,5.3,9.7,10.9,9.7
					//c6.1,0,11-4.9,11-11S251.1,185,245,185z"/>
					// </svg>
					var arrow5 = $('<div>').addClass('vls-gf-arrow vls-gf-anim-in')
						.css({
							top: '408px',
							left: (navPanel.offset().left + 120 ) + 'px',
							width: '256px',
							height: '207px',
							'background-image': 'url("data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjA3Ij4NCiAgICA8cGF0aCBkPSJNMjQ1LDE4NWMtNS41LDAtMTAsNC0xMC44LDkuM2MtOTAuNC01LTE5My43LTY5LjMtMjE5LjYtMTc0LjFMMjgsMjIuNEMyMS4xLDE3LjEsMTMuOCw3LjcsOS4xLDANCiAgICAgICAgICAgICAgICBDNy42LDguOSw0LjQsMjAuMywwLDI3LjhsMTEuNi02LjljMTYuMSw2NS4zLDU4LjgsMTA2LjcsOTIuMSwxMjkuOWMzOS4zLDI3LjQsODYuMiw0NC4xLDEzMC40LDQ2LjZjMC43LDUuNCw1LjMsOS43LDEwLjksOS43DQogICAgICAgICAgICAgICAgYzYuMSwwLDExLTQuOSwxMS0xMVMyNTEuMSwxODUsMjQ1LDE4NXoiLz4NCjwvc3ZnPg==")'
						})
						.appendTo(frame);


					var focusA = $('<div class="vls-gf-focus"></div>')
						.css({
							display: 'block',
							top: '105px',
							right: '325px',
							width: '112px',
							height: '48px',
							'border-radius': '4px'
						});
					var focusAWrapper = $('<div class="vls-gf-focus-wrapper"></div>')
						.css({bottom: 'auto', height: '200px'})
						.append(focusA)
						.appendTo(frame);


					var focusC = $('<div class="vls-gf-focus"></div>')
						.css({
							display: 'block',
							'border-radius': '24px'
						});
					var focusCWrapper = $('<div class="vls-gf-focus-wrapper"></div>')
						.css({top: '200px', right: '0', left: 'auto', width: '320px'})
						.append(focusC)
						.appendTo(frame);


					//need timeout to let the sidebar render
					setTimeout(function() {
						var editButton = $('#vls-gf-layer-primary .vls-gf-content-wrapper .vls-gf-side-panel .vls-gf-icon-edit-h');
						focusC.css({
							top: (editButton.offset().top - 200) + 'px',
							right: '8px',
							width: '48px',
							height: '48px'
						});
					}, 600);


					//animate messages reveal
					setTimeout(function() {
						messageAWrapper.removeClass('vls-gf-anim-in');
						arrow1.removeClass('vls-gf-anim-in');
					}, 200);
					setTimeout(function() {
						messageBWrapper.removeClass('vls-gf-anim-in');
						arrow2.removeClass('vls-gf-anim-in');
					}, 400);
					setTimeout(function() {
						messageCWrapper.removeClass('vls-gf-anim-in');
						arrow3.removeClass('vls-gf-anim-in');
						arrow4.removeClass('vls-gf-anim-in');
					}, 600);
					setTimeout(function() {
						messageDWrapper.removeClass('vls-gf-anim-in');
						arrow5.removeClass('vls-gf-anim-in');
					}, 800);


					this.onStepWipe = null;

				}

			}
		},

		/**
		 * Routes the calls to tutorial functions, depending on the current page
		 * @private
		 */
		_showNextStep: function() {

			var f = this.script[this.page][this.step];

			if (f) {
				this._wipeCurrentFrame();

				this._showNewFrame();
				f.call(this, this.frame);

				this.step++;
			}
			else {
				this._closeTutorial();
			}

		},

		_showNewFrame: function() {

			var frame = $('<div>').addClass('vls-gf-frame vls-gf-anim-in');
			this.ui.wrapper.append(frame);
			this.frame = frame;

			setTimeout(function() {
				frame.removeClass('vls-gf-anim-in');
			}, 20);

		},

		_wipeCurrentFrame: function() {
			if (!this.frame) return;

			var frame = this.frame;
			this.frame = null;
			frame.addClass('vls-gf-anim-out');

			if (this.onStepWipe) {
				this.onStepWipe.call(this, $);
			}

			setTimeout(function() {
				frame.remove();
			}, 2000);

		},

		_showTutorial: function() {
			if (!this.model.get('tutorialActive')) {
				this.model.set('tutorialActive', true);
				this.$el.show();
			}
		},

		_closeTutorial: function() {
			if (this.model.get('tutorialActive')) {
				this._wipeCurrentFrame();

				this.model.set('tutorialActive', false);

				this.$el.hide();

				var page = this.page;

				//sending move request to the server
				var model = {};
				model[this.page] = true;

				$.post(
					ajaxurl,
					{
						action: 'vls_gf_api_user_onboarding',
						_method: 'PATCH',
						nonce: vlsGFData.nonce,
						model: JSON.stringify(model)
					},
					function() {
						vlsGFData.tutorialStatus[page] = true;
						if (page == 'manager') {
							location.reload(true);
						}
					}
				);

			}
		}

	});

	module.exports = View;



































/***/ },
/* 134 */
/***/ function(module, exports) {

	module.exports = function(obj){
	var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
	with(obj||{}){
	__p+='<!--<div class="vls-gf-focus"></div>-->\r\n<div class="vls-gf-scrim"></div>\r\n\r\n<div class="vls-gf-wrapper">\r\n\r\n</div>\r\n\r\n<div class="vls-gf-overlay"></div>\r\n\r\n<div class="vls-gf-nav">\r\n	<button class="vls-gf-btn-next">'+
	((__t=( t.continue ))==null?'':__t)+
	'</button>\r\n	<button class="vls-gf-btn-skip">'+
	((__t=( t.skipTutorial ))==null?'':__t)+
	'</button>\r\n</div>\r\n';
	}
	return __p;
	};


/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	/*global require */
	'use strict';

	var l10n = __webpack_require__(22);
	var NavigationTreeCollection = __webpack_require__(28);
	var FolderOverviewCollection = __webpack_require__(35);
	var AlbumSummaryModel = __webpack_require__(59);
	var ImageSummaryModel = __webpack_require__(62);

	var overrideNavigationTreeCollection = function() {

		NavigationTreeCollection.prototype.fetch = function(options) {
			var self = this,
				resp;

			if (this.parentId == 0) {
				resp = [
					{id: 1, type: 'folder', name: l10n.t('tutorial.sampleFolder', {n: 1})},
					{id: 2, type: 'folder', name: l10n.t('tutorial.sampleFolder', {n: 2})},
					{id: 3, type: 'folder', name: l10n.t('tutorial.sampleFolder', {n: 3})},
					{id: 4, type: 'folder', name: l10n.t('tutorial.sampleFolder', {n: 4})},
					{id: 5, type: 'folder', name: l10n.t('tutorial.sampleFolder', {n: 5})},
					{id: 6, type: 'album', name: l10n.t('tutorial.sampleAlbum', {n: 1})}
				];
			}
			else if (this.parentId == 1) {
				resp = [
					{id: 11, type: 'folder', name: l10n.t('tutorial.sampleFolder', {n: 6})},
					{id: 12, type: 'folder', name: l10n.t('tutorial.sampleFolder', {n: 7})},
					{id: 13, type: 'album', name: l10n.t('tutorial.sampleAlbum', {n: 2})},
					{id: 14, type: 'album', name: l10n.t('tutorial.sampleAlbum', {n: 3})},
					{id: 15, type: 'album', name: l10n.t('tutorial.sampleAlbum', {n: 4})}
				];
			}
			else {
				resp = [];
			}

			setTimeout(function() {
				self.reset(resp, {});
				self.trigger('sync', self, resp, {});
			}, 100);
		}

	};

	var overrideFolderOverviewCollection = function() {

		FolderOverviewCollection.prototype.fetch = function(options) {
			var self = this,
				resp;


			if (this.type === 'folder' && this.parentId == 0) {
				resp = [
					{
						id: 1,
						type: 'folder',
						name: l10n.t('tutorial.sampleFolder', {n: 1}),
						caption: '',
						description: ''
					},
					{
						id: 2,
						type: 'folder',
						name: l10n.t('tutorial.sampleFolder', {n: 2}),
						caption: '',
						description: ''
					},
					{
						id: 3,
						type: 'folder',
						name: l10n.t('tutorial.sampleFolder', {n: 3}),
						caption: '',
						description: ''
					},
					{
						id: 4,
						type: 'folder',
						name: l10n.t('tutorial.sampleFolder', {n: 4}),
						caption: '',
						description: ''
					},
					{
						id: 5,
						type: 'folder',
						name: l10n.t('tutorial.sampleFolder', {n: 5}),
						caption: '',
						description: ''
					},
					{
						id: 6,
						type: 'album',
						name: l10n.t('tutorial.sampleAlbum', {n: 1}),
						caption: '',
						description: ''
					}
				];
			}
			else if (this.type === 'folder' && this.parentId == 1) {
				resp = [
					{
						id: 11,
						type: 'folder',
						name: l10n.t('tutorial.sampleFolder', {n: 6}),
						caption: '',
						description: ''
					},
					{
						id: 12,
						type: 'folder',
						name: l10n.t('tutorial.sampleFolder', {n: 7}),
						caption: '',
						description: '',
						folder_count: 0,
						album_count: 0
					},
					{
						id: 13,
						type: 'album',
						name: l10n.t('tutorial.sampleAlbum', {n: 2}),
						caption: '',
						description: ''
					},
					{
						id: 14,
						type: 'album',
						name: l10n.t('tutorial.sampleAlbum', {n: 3}),
						caption: '',
						description: ''
					},
					{
						id: 15,
						type: 'album',
						name: l10n.t('tutorial.sampleAlbum', {n: 4}),
						caption: '',
						description: ''
					}
				];
			}
			else if (this.type === 'album' && this.parentId == 6) {
				resp = [];
				for (var i = 1; i < 60; i++) {
					resp.push(
						{
							id: 1000 + i,
							image_id: 2000 + i,
							icon_url: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0yNCwyMlY4YzAtMS4xLTAuOS0yLTItMkg4QzYuOSw2LDYsNi45LDYsOHYxNGMwLDEuMSwwLjksMiwyLDJoMTRDMjMuMSwyNCwyNCwyMy4xLDI0LDIyeiBNMTEuNSwxNi41bDIuNSwzDQoJbDMuNS00LjVsNC41LDZIOEwxMS41LDE2LjV6Ii8+DQo8L3N2Zz4NCg=='
						});
				}
			}
			else {
				resp = [];
			}

			setTimeout(function() {
				self.reset(resp, {});
				self.trigger('sync', self, resp, {});
			}, 100);
		}

	};


	var overrideAlbumSummaryModel = function() {

		AlbumSummaryModel.prototype.fetch = function(options) {

			var model = this;

			var resp = {
				name: 'Sample album',
				caption: 'Sample album',
				description: 'The description of the sample album'
			};

			setTimeout(function() {
				model.set(resp, {});
				model.trigger('sync', model, resp, {});
			}, 100);

		};

	};

	var overrideImageSummaryModel = function() {

		ImageSummaryModel.prototype.fetch = function(options) {

			var model = this;

			var resp = {
				name: 'Image',
				caption: 'Sample image',
				description: 'The description of the sample image',
				cover_url: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCjxwYXRoIGQ9Ik0yNCwyMlY4YzAtMS4xLTAuOS0yLTItMkg4QzYuOSw2LDYsNi45LDYsOHYxNGMwLDEuMSwwLjksMiwyLDJoMTRDMjMuMSwyNCwyNCwyMy4xLDI0LDIyeiBNMTEuNSwxNi41bDIuNSwzDQoJbDMuNS00LjVsNC41LDZIOEwxMS41LDE2LjV6Ii8+DQo8L3N2Zz4NCg==',
				created: '',
				alt_text: 'sample image',
				filename: 'filename.jpg',
				file_size: 340000,
				width: 3000,
				height: 2000,
				image_meta: {
					camera: '',
					lens: '',
					focal_length: '',
					shutter_speed: '',
					aperture: '',
					iso: '',
					creation_date: ''
				}
			};

			setTimeout(function() {
				model.set(resp, {});
				model.trigger('sync', model, resp, {});
			}, 100);

		};

	};

	var TutorialMockupData = {
		setup: function() {
			overrideNavigationTreeCollection();
			overrideFolderOverviewCollection();
			overrideAlbumSummaryModel();
			overrideImageSummaryModel();
		}
	};

	module.exports = TutorialMockupData;

/***/ }
/******/ ]);