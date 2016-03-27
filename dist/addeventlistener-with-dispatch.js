(function() {

	"use strict;"

	if (!Event.prototype.preventDefault) {

		Event.prototype.preventDefault = function() {
			this.returnValue = false;
		};
	}

	if (!Event.prototype.stopPropagation) {

		Event.prototype.stopPropagation = function() {
			this.cancelBubble = true;
		};
	}

	if (!Element.prototype.addEventListener) {

		var eventListeners = [];

		Element.prototype.addEventListener = HTMLDocument.prototype.addEventListener = Window.prototype.addEventListener = addEventListener;
		Element.prototype.removeEventListener = HTMLDocument.prototype.removeEventListener = Window.prototype.removeEventListener = removeEventListener;
		Element.prototype.dispatchEvent = HTMLDocument.prototype.dispatchEvent = Window.prototype.dispatchEvent = dispatchEvent;

		// list of real events
		var htmlEvents = {
			//<body> and <frameset> Events
			onload: 1,
			onunload: 1,
			//Form Events
			onblur: 1,
			onchange: 1,
			onfocus: 1,
			onreset: 1,
			onselect: 1,
			onsubmit: 1,
			//Image Events
			onabort: 1,
			//Keyboard Events
			onkeydown: 1,
			onkeypress: 1,
			onkeyup: 1,
			//Mouse Events
			onclick: 1,
			ondblclick: 1,
			onmousedown: 1,
			onmousemove: 1,
			onmouseout: 1,
			onmouseover: 1,
			onmouseup: 1
		};

		function dispatchEvent(event) {

			var self = this,
				eventName = event.type;

			// fireEvent can trigger only real event (e.g. 'click')
			if (self.fireEvent && htmlEvents['on' + eventName]) {

				self.fireEvent('on' + eventName, event);
			}
			else if (self[eventName] && typeof self[eventName] === 'function') {

				self[eventName](event);
			}
			else if (self['on' + eventName] && typeof self['on' + eventName] === 'function') {

				self['on' + eventName](event);
			}
			else {

				// hasnt been found to be linked elsewhere, so a custom event, simply fire the handler for that event if one found
				for (var i = 0, n = eventListeners.length; i < n; i++) {

					var e = eventListeners[i];

					if (this === e.object && e.type === eventName) {

						// Call the handler
						e.wrapper.call(self, event);
						break;
					}
				}

			}

		};

		function addEventListener(type, listener /*, useCapture (will be ignored) */) {

			var _thisElement = this;

			// To normalise the event object slightly before firing the listener wrap it to perform the cleanup then call the originally listener
			var wrapper = function(e) {

				// Normalize the event
				e.target = e.srcElement;
				e.currentTarget = _thisElement;

				// Just in case there is a handleEvent function attached to
				if (listener.handleEvent) {
					listener.handleEvent(e);
				}
				else {
					listener.call(_thisElement, e);
				}
			};

			// Polyfill DOMContentLoaded
			if (type == "DOMContentLoaded") {

				// To polyfill we watch the onreadystatechange event, however this fires on multiple page states
				// So we wrap the already wrapper listener to check it is the complete state before calling the wrapped listener
				var documentCompleteWrapper = function documentCompleteWrapper(e) {

					// Using interactive, although there is an issue in IE9/10 that means interactive fires too early, this isnt an issue in IE8
					// As we are not shimming above 8 because this is an addEventListener polyfill thats already present in IE9 we dont need to worry
					if (document.readyState === "interactive") {
						wrapper(e);
					}
				};

				// Test at the latest possible moment its loaded
				if (!/interactive|complete|loaded/.test(document.readyState)) {
					document.attachEvent("onreadystatechange", documentCompleteWrapper);
					eventListeners.push({ object: _thisElement, type: type, listener: listener, wrapper: documentCompleteWrapper });
				}

			}
			else {
				_thisElement.attachEvent("on" + type, wrapper);
				eventListeners.push({ object: _thisElement, type: type, listener: listener, wrapper: wrapper });
			}
		};



		function removeEventListener(type, listener /*, useCapture (will be ignored) */) {

			var counter = 0;

			while (counter < eventListeners.length) {

				var eventListener = eventListeners[counter];

				if (eventListener.object == this && eventListener.type == type && eventListener.listener == listener) {

					// As we used a proxy event for DOMContentLoaded we check to see if we need to remove the listener from that instead 
					var eventNameToDetach = (type === "DOMContentLoaded" ? "onreadystatechange" : "on" + type);
					this.detachEvent(eventNameToDetach, eventListener.wrapper);

					break;
				}
				++counter;
			}
		};
	}

})();