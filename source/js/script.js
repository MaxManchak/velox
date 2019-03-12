'use strict';
(function () {
	let windowHeight = $(window).height();
	function parallax(element, rate, scroll) {
		var temp = Math.floor((scroll / (windowHeight / 100)) * rate);
		$(element).css({ transform: 'translateY(-' + temp + 'px)' });
	}

	$(document).scroll(function () {
		var scroll = $(window).scrollTop();

		parallax($('.first-screen__layer--2'), 1.3, scroll);
		parallax($('.first-screen__layer--3'), 1.7, scroll);
		parallax($('.first-screen__layer--4'), 2.1, scroll);
	});

})();
