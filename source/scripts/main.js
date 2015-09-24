// Porting the site's functionality away from jQuery
(() => {

  'use strict';

  /*
   * SCREEN SIZE DETECTION FOR JS VIA CSS
   * More info on how this works: http://adactio.com/journal/5429/
   ***************************************************************************/
  const size = window.getComputedStyle(document.body, ':after')
              .getPropertyValue('content').replace(/\W/g, '');

  /*
   * CUSTOM THEME JS
   ***************************************************************************/

  // DAYS ON THE ROAD COUNTER
  const todayIs = Date.now();
  const iLeftOn = new Date('2014-12-30T12:00:00');

  // 1000ms x 60s x 60m x 24h
  const daysSince = Math.ceil((todayIs - iLeftOn) / 86400000);
  const $daysAbroad = document.querySelector('.days-abroad');
  if ($daysAbroad) {
    $daysAbroad.textContent = daysSince + ' days';
  }

  // SUBNAV TOGGLE
  // Toggles open/close state of the subnav panel
  const $subnavToggle = document.querySelector('.subnav-toggle');
  $subnavToggle.addEventListener('click', (event) => {

    event.preventDefault();

    const $header = document.querySelector('.site-header');
    let navText;

    if ($header.classList.contains('closed')) {
      $header.classList.remove('closed');
      $header.classList.add('open');

      navText = 'Less';
    } else {
      $header.classList.remove('open');

      navText = 'More';

      setTimeout(() => { $header.classList.add('closed'); }, 500);
    }

    $subnavToggle.textContent = navText;

  });

  // SHARING POPUPS
  if (size === 'desktop') {
    const $sharing = document.querySelectorAll('.main-content__sharing');
    const callback = event => {

      // Only targets sharing links
      if (event.target.classList.contains('main-content__sharing-link')) {
        event.preventDefault();

        // Opens a small named window for standard sharing
        window.open(
          event.target.href,
          'sharing-window',
          'width=800, height=400, top=200, left=300'
        );
      }
    };

    // Loops through each matched node and attaches a click handler
    for (let i = 0; i < $sharing.length; i++) {
      $sharing[i].addEventListener('click', callback);
    }
  }

  // FEATURED IMAGE HANDLING
  // Mobile featured images are handled differently

  // Adds a class that fires up JS-only styles
  if (size.length) {
    const selector = [
      '.main-content__headline',
      '.main-content__headline--related',
      '.main-content__headline--single',
    ].join(',');
    const $headlines = document.querySelectorAll(selector);
    let $headline;
    let headlineImage;

    for (let i = 0; i < $headlines.length; i++) {
      $headline = $headlines[i];
      headlineImage = $headline.dataset.image;

      $headline.style.backgroundImage = 'url(' + headlineImage + ')';

      // Adds a class that causes JS-specific styles to render
      $headline.classList.add('show-image');
    }
  }

  // Attaches the background image to the
  if (size === 'desktop') {
    const bgSelectors = [
      '.main-content__headline',
      '.main-content__headline--single',
      '.main-content__headline--page',
    ].join(',');
    const $bgHeadlines = document.querySelectorAll(bgSelectors);

    if ($bgHeadlines.length > 0) {
      const $bgHeadline = $bgHeadlines[0];
      const bgImage = $bgHeadline.dataset.image;

      // Loads the body style info to access the background color
      const $body = document.querySelector('body');
      const bgColor = window.getComputedStyle($body).backgroundColor;

      // Creates a gradient color to use in the style declaration
      let bgFade;
      if (bgColor.indexOf('rgba') === -1) {
        bgFade = bgColor.replace(')', ', 0.92)').replace('rgb', 'rgba');
      } else {
        bgFade = bgColor;
      }

      const bgGradient = 'linear-gradient(to bottom, ' + bgFade + ', ' +
        bgColor + ' 50vw)';

      $body.style.backgroundImage = bgGradient + ', url(' + bgImage + ')';
    }
  }

  // LOCAL SCROLLING (WITHOUT JQUERY)
  // Adds a function to handle scrolling the page
  function scrollTo(element, targetPos, duration) {
    const currentPos = element.scrollTop;
    const posChange = targetPos - currentPos;
    const increment = 20;

    console.log('Beginning scrollTo...');
    console.log('currentPos', currentPos);
    console.log('posChange', posChange);

    // Quadratic easing (in/out) from http://gizma.com/easing/#quad3 (modified)
    const easeInOut = (currentTime, start, change, duration) => {
      console.log('easeInOut()');

      currentTime /= duration / 2;

      if (currentTime < 1) {
        return change / 2 * currentTime * currentTime + start;
      }

      currentTime--;

      return -currentTime / 2 * (currentTime * (currentTime - 2) - 1) + start;
    };

    // Sets up a loop that executes for the length of time set in duration
    const animateScroll = (elapsedTime) => {
      elapsedTime += increment;

      console.log('Animating...', elapsedTime);

      const newPos = easeInOut(elapsedTime, currentPos, posChange, duration);

      // Actually sets the document's scroll setting
      element.scrollTop = newPos;
      console.log('newPos', newPos);

      if (elapsedTime < duration) {
        setTimeout(() => { animateScroll(elapsedTime); }, increment);
      }
    };

    // Starts the animation
    animateScroll(0);
  }

  // Checks for a local link
  document.addEventListener('click', event => {
    const target = event.target;

    // Makes sure a link was clicked
    if (target.tagName.toLowerCase() === 'a' && target.href !== 'undefined') {
      const href = target.href;
      const loc = document.location;
      const currentURL = `${loc.protocol}//${loc.host}${loc.pathname}`;

      // Removes the current URL and checks for a protocol to spot anchor links
      if (!href.replace(currentURL, '').match(/^http/)) {
        event.preventDefault();

        const menuAdjustment = size === 'mobile' ? 50 : 60;
        const anchorOffset = target.offsetTop - menuAdjustment;

        // Animates the scroll to avoid jarring page jumps
        scrollTo(document.body, anchorOffset, 2000);
      }
    }
  });

  // FOOTNOTE SHUFFLING
  // I like to keep footnotes below the rest of the content, so this moves 'em.
  const $mdFootnotesContainer = document.querySelector('.footnotes');
  if ($mdFootnotesContainer !== null) {

    // Extracts the ordered list full of footnotes
    const $footnotesList = $mdFootnotesContainer.getElementsByTagName('OL');

    // Targets the preferred footnotes container
    const $footnotesContainer = document.querySelector('.post-footnotes');

    // Adds a class for styling purposes
    $footnotesList[0].classList.add('post-footnotes__list');

    // Adds the migrated list to the preferred container
    $footnotesContainer.appendChild($footnotesList[0]);

    // Now that the footnotes are present, show the container
    $footnotesContainer.classList.remove('hidden');

    // Removes the old container altogether
    if ($mdFootnotesContainer.parentNode) {
      $mdFootnotesContainer.parentNode.removeChild($mdFootnotesContainer);
    }
  }

  // GOOGLE ANALYTICS OUTBOUND LINK TRACKING
  const gaTrackOutboundClick = function(url) {
    ga('send', 'event', 'outbound', 'click', url, {
      hitCallback: function() {
        document.location = url;
      },
    });
  };

  document.addEventListener('click', event => {
    if (event.target.classList.contains('js__ga-track-outbound')) {
      event.preventDefault();
      gaTrackOutboundClick(event.target.href);
    }
  });

  // HIGHLIGHTSHARE PLUGIN INIT
  if (size.length) {
    const highlightshare = new HighlightShare({
      via: 'jlengstorf',
      container: '.main-content__content',
    });
  }

})();
