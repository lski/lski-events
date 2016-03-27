# Lski-Events

A micro events handler (only 2.3kb - 936bytes gzipped) that behaves like the jQuery event API, where you can add, remove, fire events.

Providing features such as:

- Single run event handlers
- Multiple event attachments in single call
- Delegated events via a selector
- Flexible target element arguments: either an Element, Elements or a query selector
- The ability to trigger events
- Custom events
- Normalisation of behaviour between browsers
- IE8 support (With the use an extra plugin supplied [see here](#IE8))

## Install

lski-events supports for globals (lski.events), CommonJS and AMD. It is also available via bower or npm using one of the commands below, or can be added as a script using the files in the dist folder.

```bat
npm install lski-events
or
bower install lski-events
```

## Usage

There a several functions provided, each has an alias to a jquery method that it matches:

- add - Adds event listeners  (alias 'on')
- remove - Removes event listeners (alias 'off')
- once - Adds an event listener that will only fire once (alias 'one')
- fire - Dispatches an event, so that any listeners will run their handlers (alias 'trigger')

## Examples

### Add Listeners

The following examples show how to add an event listeners to the following html:

```html
<div class="buttons">
	<button id="mybutton" type="button">Click Me!</button>
	<button id="otherbutton" type="button">Click Me Too!</button>
	<img src="some-image.js"/>
<div>
```


```javascript
// With selector
events.add('#mybutton', 'click', function(event) {
	// this = element that event is attached too
});
```

As well as a selector you can pass in an Element or any 'array like' (e.g. an array or a NodeList) list of Element objects:

```javascript
// With an element:
events.add(document.getElementById('mybutton'), 'click', function(event) { });

// With an array like list of Element objects:
events.add(document.querySelectorAll('button'), 'click', function(event) { });
```

You can also add a handler to multiple events at the same time, using a space separated list between event names or an array of event names:

```javascript
events.add('#mybutton', 'click dblclick', function(event) { });
//or 
events.add('#mybutton', ['click', 'dblclick'], function(event) { });
```

You can add a "single run" listener too, that will only fire the once then remove itself from the element.

```javascript
events.once('#mybutton', 'click', function(event) { });
```

### Add Delegated Listeners

You can also handle events that bubble from child elements, these are called delegated events. 

The advantage of this is if the child elements are dynamic, they dont have to exist when adding the listener, also it means only adding one listener to one element, rather than the overhead of adding it too all child elements. See [addEventListener at MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) for more detailed explanation.

This API gives you two ways of doing this. The first uses the same syntax as above, where a listener is added to a parent element and any child element that fires an event that bubbles is caught by that listener.

```javascript
// Same behaviour as addEventListener
events.add('.buttons', 'click', function(event) {
	
	/* Catches click events from ANY child element of the div buttons
	 * this = element that the listener is attached too
	 * event.currentTarget = element that the listener is attached too
	 * event.delegateTarget = element that the listener is attached too
	 * event.target = the element clicked e.g. the button or image
	 */
});
```

The second method does the same thing, but accepts an additional 'selector' as the 3rd parameter. If a child element raises an event that bubbles to the parent, the selector is checked against the child element, if it matches it will run the handler, otherwise does nothing. Still works with child elements that havent been created yet.

```javascript
// Filters any bubbling events so only the if the button is clicked will it fire
events.add('.buttons', 'click', 'button', function(event) {
	
	/* Catches click events only from child elements of the div that are buttons
	 * this = the element clicked e.g. the button
	 * event.target = the element clicked i.e. only the button
	 * event.currentTarget = element that the listener is attached too
	 * event.delegateTarget = element that the listener is attached too
	 */
});
```

### Remove Listeners

```javascript
// A handler would normally be added first
function myHandler() { }

events.add('#mybutton', 'click', myHandler);

// Later on you can remove the handler
events.remove('#mybutton', 'click', myHandler);
```
*__NB:__* Removing a handler that hasnt been added yet does NOT throw an error

Like 'add' you can provide a string selector, an Element object or an array like list of Element objects. Plus you can detach a handler from multiple events in a single call like 'add' too:

```javascript
// Remove handler from multiple events
events.remove('#mybutton', 'click, dblclick', function(event) { });
```

### Trigger Events

Triggering an event means fire against any matching events that have been added to the element

```javascript
// With a string name for the event
events.trigger('button', 'click');

// Passing data to the listener
events.trigger('button', 'click', { myData: data });
```

*__NB:__* This example creates a cross browser 'CustomEvent' behind the scenes for you, so that you dont have to worry about the different ways of creating an Event object in browsers yourself.

```javascript
// Using a pre-created Event object 
var evt = new CustomEvent('click', { 'bubbles': true, 'cancelable': true });
events.trigger('button', evt);

// Using a pre-created Event object with data to pass to the listener
var evt = new CustomEvent('click', { 'bubbles': true, 'cancelable': true, detail: { myData: data } });
events.trigger('button', evt);
```

*__NB:__*  This example of creating a new event object would be different on different enviroments but the trigger function would work the same regardless. 


## Build

To build the distribution files, at the command line follow run the following commands. The first command installs required node modules if not already loaded and then run the build.

```bat
npm install
npm run build
```

## Test

To run the tests in the browser, at the command line follow run the following commands. The first command installs required node modules if not already loaded and then open a browser and run the tests.

```bat
npm install
npm test
```

## jQuery

Although not a complete drop in replacement for jQuerys event methods, it matches most of its footprint and behaviour of the on/off/one/trigger methods, even having alias's for those methods. 

Atm the only real omission is passing data to the on function. I am hoping to add that functionality. Please raise an issue if something is missing that I have overlooked.

## IE8 

Although this API does have good support for IE8, it requires a polyfill that implements addEventListener/removeEventListener/dispatchEvent, that can be added via conditional comments.

I have included a package [addeventlistener-with-dispatch](https://github.com/lski/addeventlistener-with-dispatch) that I have created and is added to the dist folder on creating the distribution. This API has been tested against IE8 using that polyfill, I can not guarantee it will work with other polyfills.

To test against IE8 simply run the test in IE8, the polyfill has already been added.