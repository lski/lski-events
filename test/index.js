/* global lski */
(function() {

	"use strict";

	/**
	 * States whether log outputs to the console or not
	 */
	var outputLog = false;
	var imageSrcToLoad = "assests/test.png";
	var altSrcImgToLoad = "assests/test-2.png";

	describe('attach event', function() {

		var eventNo = 0;

		it(++eventNo + ': namespace exists', function() {

			expect(lski).not.toBe(null);
			expect(lski.events).not.toBe(null);
		});

		// give it an alias
		var evts = lski.events;

		var s2 = it(++eventNo + ': should catch event', function(done) {

			var el = document.getElementById('test-2');
			var loaded = false;

			evts.add(el, 'load', function(evt) {

				_log(s2.getFullName(), 'image loaded', evt, this, evt);
				loaded = true;
			});

			el.src = imageSrcToLoad;

			setTimeout(function() {
				expect(loaded).toBe(true);
				done();
			}, 1500);
		});

		var s3 = it(++eventNo + ': should catch event & supply element as this', function(done) {

			var el = document.getElementById('test-3');
			var loaded = false;

			evts.add(el, 'load', function(evt) {

				_log(s3.getFullName(), 'image loaded', evt, this);
				expect(this).toEqual(jasmine.any(Element));
				expect(this.tagName).toMatch(/img/i);
				loaded = true;
			});

			el.src = imageSrcToLoad;

			setTimeout(function() {
				expect(loaded).toBe(true);
				done();
			}, 2000);
		});

		var s4 = it(++eventNo + ': should remove add and remove a listener', function(done) {

			var el = document.getElementById('test-4');
			var loaded = false;
			var handler = function(evt) {

				_log(s4.getFullName(), 'image loaded', evt, this);
				loaded = true;
			};

			evts.add(el, 'load', handler);
			evts.remove(el, 'load', handler);

			el.src = imageSrcToLoad;

			setTimeout(function() {
				expect(loaded).toBe(false);
				done();
			}, 1000);
		});

		var s5 = it(++eventNo + ': should catch event on multiple elements', function(done) {

			var els = document.querySelectorAll('#test-5 img'),
				loadedCount = 0;

			evts.add(els, 'load', function(evt) {

				_log(s5.getFullName(), 'image loaded', this.id, evt, this);
				loadedCount++;
			});

			els[0].src = imageSrcToLoad;
			els[1].src = imageSrcToLoad;

			setTimeout(function() {
				expect(loadedCount).toBe(2);
				done();
			}, 1500);
		});

		var s6 = it(++eventNo + ': should fire/trigger an event', function(done) {

			var el = document.getElementById('test-6');
			var run = false;

			evts.add(el, 'click', function(evt) {

				_log(s6.getFullName(), 'click run', evt, this);
				run = true;
			});

			evts.trigger(el, 'click');

			setTimeout(function() {
				expect(run).toBe(true);
				done();
			}, 2500);
		});

		var s7 = it(++eventNo + ': should fire/trigger an custom event', function(done) {

			var el = document.getElementById('test-7');
			var run = false;

			evts.add(el, 'custom-click', function(evt) {

				_log(s7.getFullName(), 'click run', evt, this);
				run = true;
			});

			evts.trigger(el, 'custom-click');

			setTimeout(function() {
				expect(run).toBe(true);
				done();
			}, 1500);
		});


		var s8 = it(++eventNo + ': should only fire once', function(done) {

			var el = document.getElementById('test-8'),
				runCount = 0;

			evts.once(el, 'load', function(evt) {

				runCount++;
				_log(s8.getFullName(), 'click run ' + runCount + ' times', evt, this);
			});

			el.src = imageSrcToLoad;
			el.src = altSrcImgToLoad;

			setTimeout(function() {
				expect(runCount).toBe(1);
				done();
			}, 2000);
		});

		var s9 = it(++eventNo + ': should bubble', function(done) {

			var el = document.getElementById('test-9');
			var buttons = el.getElementsByTagName('button');
			var loaded = false;

			evts.add(el, 'click', 'button', function(evt) {

				_log(s9.getFullName(), 'bubble caught', evt, this);
				loaded = true;
			});

			evts.fire(buttons[0], 'click');

			setTimeout(function() {
				expect(loaded).toBe(true);
				done();
			}, 2000);
		});

		var s10 = it(++eventNo + ': should attach more than one event via string', function(done) {

			var el = document.getElementById('test-10'),
				runCount = 0;

			evts.add(el, 'load click', function(evt) {

				runCount++;
				_log(s10.getFullName(), 'click & load run ' + runCount + ' times', evt, this);
			});

			el.src = imageSrcToLoad;
			evts.trigger(el, 'click');

			setTimeout(function() {
				expect(runCount).toBe(2);
				done();
			}, 2000);
		});
		
		var s11 = it(++eventNo + ': should attach more than one event via array', function(done) {

			var el = document.getElementById('test-10'),
				runCount = 0;

			evts.add(el, ['load', 'click'], function(evt) {

				runCount++;
				_log(s11.getFullName(), 'click & load run ' + runCount + ' times', evt, this);
			});

			el.src = imageSrcToLoad;
			evts.trigger(el, 'click');

			setTimeout(function() {
				expect(runCount).toBe(2);
				done();
			}, 2000);
		});
		
		var s12 = it(++eventNo + ': should filter out events that are not correct', function(done) {

			var el = document.getElementById('test-11'),
				runCount = 0;

			evts.add(el, [' click  ', ''], function(evt) {

				runCount++;
				_log(s12.getFullName(), 'click run ' + runCount + ' times', evt, this);
			});

			el.src = imageSrcToLoad;
			evts.trigger(el, 'click');

			setTimeout(function() {
				expect(runCount).toBe(1);
				done();
			}, 2000);
		});
		
		var s13 = it(++eventNo + ': should fire ready', function(done) {

			var run = false;
			
			evts.ready(function(evt){
				
				run = true;
				_log(s13.getFullName(), 'ready fired', evt, this);
			});

			setTimeout(function() {
				expect(run).toBe(true);
				done();
			}, 500);
		});
	});

	function _log() {

		if (outputLog) {
			
			try {
				console.log.apply(console, arguments);	
			} 
			catch (e) {
				// IE8 Hack
				var i = arguments.length, args = [];
				while (--i >= -1 && args.push('args[' + i + ']'));
				new Function('args', 'console.log(' + args.join(',') + ')')(arguments);
			}
		}
	}

})();