(() => {
  'use strict';

  const $fiveStages = document.querySelectorAll('.five-stages');

  if ($fiveStages) {

    // Sets up a check to determine whether or not the element is on-screen
    [].forEach.call($fiveStages, el => {

      // Adds a class to the element so we know JS is working
      el.classList.add('js__active');

      // Sets up a handler and attaches it to the scroll event
      const viewportChangeHandler = onVisibilityChange(el);
      addEventListener('scroll', viewportChangeHandler, false);
    });

    // Adds a class to on-screen elements
    function onVisibilityChange(el, callback) {
      return function() {
        if (isElementInViewport(el)) {
          el.classList.add('js__in-viewport');
        } else {
          el.classList.remove('js__in-viewport');
        }
      };
    }

    // Helper for checking if the element is within the viewport
    // @see http://stackoverflow.com/a/7557433/463471
    function isElementInViewport(el) {
      const position = el.getBoundingClientRect();

      return (
        position.top >= 0 &&
        position.left >= 0 &&
        position.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        position.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
  }

})();
