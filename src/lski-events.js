/* global define */
(function(root, factory) {

	"use strict";

	if (typeof define === 'function' && define.amd) {

		define([], function() {
			return (root.lski = root.lski || {}).events = factory();
		});
	}
	else if (typeof module === 'object' && module.exports) {

		module.exports = factory();
	}
	else {
		(root.lski = root.lski || {}).events = factory();
	}

} (this, function() {

	"use strict";

	var events = {
		add: add,
		on: add,
		once: once,
		one: once,
		remove: remove,
		off: remove,
		fire: fire,
		trigger: fire,
		query: query
	};

	/**
	 * Attaches an event listener to the passed in element. It can be run either directly by attaching a listener to an element, very similar to addEventlistener or it can be given an extra selector where it can be placed in a parent element and used to listen to events fired from children matching that selector.
	 * 
	 * elements, events, handler
	 * or
	 * elements, events, filter, handler
	 * 
	 * @param {string|Element|NodeList|Array} element Accepts different types, a single Element or 'array like' (e.g. NodeList) list of Elements that the listener will be added too. But also accepts a string, which is used as a selector to query the dom for Elements.
	 * @param {string|Array} events Either a space separated list of event names or an array of event names e.g. 'click' or 'click dblclick' or ['click','dblclick']
	 * @param {string} [selector] If supplied will watch the events fired by the children of the Elements the listener is attached too. If the child Element matches the selector it will fire the callback handler.
	 * @param {function} handler The call back function to run when the event has occurred.
	 */
	function add() {

		//elements, eventName, handler (or element, eventName, NULL, handler)
		if (arguments.length === 3 || (arguments.length === 4 && arguments[2] == null)) {

			return _addDirect(arguments[0], arguments[1], (arguments.length === 4 ? arguments[3] : arguments[2]));
		}
		//elements, eventName, selector, handler
		else if (arguments.length === 4) {

			return _addDelegated.apply(this, arguments);
		}
	}
	
	function _addDirect(elements, events, handler) {

		var eventNames = _mapAndFilterEvents(events);

		return _forEachElements(elements, function(element) {

			var wrapper = function(event) {

				// Add for basic compatibility with jquery api
				event.delegateTarget = event.currentTarget;

				handler.apply(element, arguments);
			};

			for (var i = 0, n = eventNames.length; i < n; i++) {
				_listeners.add(element, eventNames[i], handler, wrapper);
				element.addEventListener(eventNames[i], wrapper, false);
			}

			return element;
		});
	}

	function _addDelegated(elements, events, selector, handler) {

		var eventNames = _mapAndFilterEvents(events);

		return _forEachElements(elements, function(element) {

			var wrapper = function(event) {

				// Add for basic compatibility with jquery api
				event.delegateTarget = event.currentTarget;

				var target = event.target || event.srcElement,
					match = _bubbleCheck(element, target, selector);

				if (!match) {
					return;
				}

				handler.apply(match, arguments);
			};

			for (var i = 0, n = eventNames.length; i < n; i++) {

				_listeners.add(element, eventNames[i], handler, wrapper);
				// We need to wrap the handler so we can capture and test the element that fired it to see if it matches the selector
				element.addEventListener(eventNames[i], wrapper, false);
			}
		});
	}

	/**
	 * Runs a listener a max of one time only. It then removes itself.
	 *
	 * @param {string|Element|NodeList|Array} element Accepts different types, a single Element or 'array like' (e.g. NodeList) list of Elements that the listener will be added too. But also accepts a string, which is used as a selector to query the dom for Elements.
	 * @param {string|Array} events Either a space separated list of event names or an array of event names e.g. 'click' or 'click dblclick' or ['click','dblclick']
	 * @param {function} handler The call back function to run when the event has occurred, 'this' = the element fired against
	 */
	function once(elements, event, handler) {

		var eventNames = _mapAndFilterEvents(event);

		return _forEachElements(elements, function(element) {

			var wrapper = function() {
				handler.apply(this, arguments);
				events.off(element, event, wrapper);
			};

			for (var i = 0; i < eventNames.length; i++) {
				_listeners.add(element, eventNames[i], handler, wrapper);
				element.addEventListener(eventNames[i], wrapper, false);
			}
		});
	}

	/**
	 * Remove a handler from the element, that matches the function and the event name
	 * 
	 * @param {string|Element|NodeList|Array} element Accepts different types, a single Element or 'array like' (e.g. NodeList) list of Elements that the listener will be added too. But also accepts a string, which is used as a selector to query the dom for Elements.
	 * @param {string|Array} events Either a space separated list of event names or an array of event names e.g. 'click' or 'click dblclick' or ['click','dblclick']
	 * @param {function} handler The call back function to run when the event has occurred, 'this' = the element fired against
	 */
	function remove(elements, events, handler) {

		var eventNames = _mapAndFilterEvents(events);

		return _forEachElements(elements, function(element) {

			for (var i = 0; i < eventNames.length; i++) {
				
				var listener = _listeners.find(element, eventNames[i], handler);
				
				if(listener) {
					element.removeEventListener(eventNames[i], listener.wrapper, false);
					_listeners.remove(listener);
				}
				else {
					element.removeEventListener(eventNames[i], handler, false);
				}
			}
		});
	}

	/**
	 * Fire an event attached to an element
	 * 
	 * @param {string|Element|NodeList|Array} element Accepts different types, a single Element or 'array like' (e.g. NodeList) list of Elements that the listener will be added too. But also accepts a string, which is used as a selector to query the dom for Elements.
	 * @param {string|Array} eventNames Either a space separated list of event names or an array of event names e.g. 'click' or 'click dblclick' or ['click','dblclick']
	 */
	function fire(elements, eventNames) {

		var events = (typeof eventNames !== 'string') ? [eventNames] : _mapAndFilterEvents(eventNames, function(evtName) {
			return _createEvent(evtName);
		});

		return _forEachElements(elements, function(element) {

			for (var i = 0; i < events.length; i++) {
				element.dispatchEvent(events[i]);
			}
		});
	}

	/**
	 * Exposes the DOM selector query method, so that a user can change method the method for different behavior (other than browser default). 
	 * It just needs to have the same footprint.
	 * 
	 * @param {string} selector The selector used to query the DOM
	 * @param {Element|Document} [scoped] Optional set the scope of the query, e.g. Element.querySelectorAll vs document.querySelectorAll etc
	 * @returns {NodeList}
	 */
	function query(selector, scoped) {
		return (scoped || document).querySelectorAll(selector);
	}

	/**
	 * Cross browser function for creating an event object to be dispatched
	 */
	function _createEvent(name, options) {

		options = options || { bubbles: true, "cancelable": true };

		if (typeof window.CustomEvent === "function") {
			try {
				return new CustomEvent(name, options);
			}
			catch (e) {	/*Allow to fall through*/ }
		}

		if (document.createEvent) {

			var evt = document.createEvent('Event');
			evt.initEvent(name, true, true);
			return evt;
		}

		var evt = document.createEventObject();
		evt.eventName = evt.type = name;
		return evt;
	}

	/**
	 * Loops through the events and passes the trimmed eventName to the callback each loop and after processing if there is a empty name its discarded.
	 * @param {Array|String} events can either be a space separated list of event names in a string, or an array of event names
	 */
	function _mapAndFilterEvents(events, cb) {

		var eventNames = (typeof events === "string" ? events.split(" ") : events),
			isFunc = (typeof cb === 'function'),
			result = [];

		for (var i = 0, n = eventNames.length; i < n; i++) {

			var eventName = eventNames[i];

			if (typeof eventName === "string") {
				eventName = eventName.trim();
			}

			if (!eventName) {
				continue;
			}

			if (isFunc) {
				eventName = cb(eventName, i, eventNames);
			}

			if (eventName) {
				result.push(eventName);
			}
		}

		return result;
	}

	/**
	 * Loops through each element and passes it to the callback
	 * 
	 * @param {mixed} element Can be a string selector, that gets run through document.querySelectorAll, a single element returned wrapped in an array or an existing array of elements
	 * @param {function} [cb] if supplied will run through the list of elements an call the call function with the element and the index in the list. If not supplied no loop is performed.
	 * @returns {Array} returns an 'array like' object (NodeList if a string it supplied otherwise an array)
	 */
	function _forEachElements(element, cb) {

		var elements = (typeof element === 'string')
			? query(element)
			: (element.length)
				? element
				: [element];

		var isFunc = (typeof cb === 'function');

		if (isFunc) {
			
			for (var i = 0, n = elements.length; i < n; i++) {

				cb(elements[i], i);
			}
		}

		return elements;
	}

	/**
	 * shim for Element.matches
	 */
	var _matches = (function() {

		var _proto = Element.prototype,
			_matches = _proto.matches || _proto.webkitMatchesSelector || _proto.mozMatchesSelector || _proto.msMatchesSelector || function matches(selector) {

				var element = this,
					// potential matches against a node above the current element as if against the current element version it wont be in the found list obviously
					potentialMatches = query(selector, element.parentNode), /*element.parentNode.querySelectorAll(selector),*/
					i = potentialMatches.length;

				// Loop back through each item found and match it against the element being checked
				while (--i >= 0 && potentialMatches.item(i) !== element);

				return (i > -1);
			};

		return function matches(element, selector) {
			return _matches.call(element, selector);
		};

	})();

	/**
	 * Recursively 'bubbles' up through the element chain checking parent elements to see if they are a match to the selector. 
	 * Stops if it reaches the root element (which can be document) with finding a match.
	 * 
	 * @param {Element|Document} The top level Element, that if it reaches, we know it hasnt found a match
	 * @param {Element} The current Element we are checking against the selector, if its false then the method is called again with targets parent
	 * @param {string} The DOM query selector to test against the target
	 * @returns {Element|null} If finds a match it will return the element that matched, otherwise will return null
	 */
	function _bubbleCheck(rootElement, targetElement, selector) {

		// Gone too far as we have reached the wrapping element
		if (rootElement == targetElement) {
			return null;
		}

		var match = _matches(targetElement, selector);

		// if found then return this element, otherwise check the parent of this element, if there is one and if not return null.
		if(match) {
			return targetElement;
		}
		
		if(targetElement.parentElement) {
			return _bubbleCheck(rootElement, targetElement.parentElement, selector);
		}
		
		return null;
	}
	
	// To be able to remove listeners that have wrapped the callbacks
	var _listeners = (function() {
		
		function Listeners() {
			this._listeners = [];
		}
		Listeners.prototype.add = add;
		Listeners.prototype.remove = remove;
		Listeners.prototype.find = find;
		
		return new Listeners();
		
		function add(element, eventName, original, wrapper) {
			return this._listeners.push({ element: element, eventName: eventName, wrapper: wrapper, original: original});
		}
		
		function remove(listener) {
			
			for (var i = 0, n = this._listeners.length; i < n; i++) {

				if(listener === this._listeners[i]) {
					this._listeners.splice(i,1);
					return true;
				}
			}
			
			return false;
		}
		
		function find(element, eventName, original) {
			
			for (var i = 0, n = this._listeners.length; i < n; i++) {

				var l = this._listeners[i];

				if(l.element === element && l.eventName === eventName && l.original === original) {
					return l;
				}
			}
			
			return null;
		}
		
	})();

	// Just in case the trim method isnt implemented
	if (!String.prototype.trim) {
		String.prototype.trim = function() {
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		};
	}

	return events;
}));