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
  const timeSince = Date.now() - Date('2014-12-30T12:00:00');
  const daysSince = Math.ceil(timeSince / 86400000); // 1000ms x 60s x 60m x 24h
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

  // CONTACT FORM
  const $contact = document.getElementById('contact');
  if ($contact) {

    // Sets up a handler for sending messages
    const sendMessage = function(message, callback) {

      // Messages are delivered using Mandrill
      const endpointURI = 'https://mandrillapp.com/api/1.0/messages/send.json';

      // Creates an XHR object for sending the request
      const xhr = new XMLHttpRequest();

      // Converts the message object to JSON
      const messageJSON = JSON.stringify(message);

      xhr.open('POST', endpointURI);

      // Ensures `this` is handled properly
      xhr.onload = callback.bind(xhr);

      xhr.send(messageJSON);
    };

    const disableForm = function(form) {

      // Allows for custom styling to be applied to the form
      form.classList.add('disabled');

      // Prevents additional submissions of the form
      form.getElementsByTagName('BUTTON')[0].disabled = true;
    };

    const enableForm = function(form) {

      // Reenables the submit button
      form.getElementsByTagName('BUTTON')[0].disabled = false;

      // Removes the disabled styling class from the form
      form.classList.remove('disabled');
    };

    const displayError = function(form, msg) {

      // Creates new DOM elements to build the error
      const $error = document.createElement('div');
      const $errorMsg = document.createElement('p');

      // Adds classes for styling
      $error.classList.add('opt-in__error');
      $errorMsg.classList.add('opt-in__error-message');

      // Adds the error message
      $errorMsg.textContent = msg;

      $error.appendChild($errorMsg);
      form.insertBefore($error, form.firstChild);
    };

    const removeAllErrors = function(form) {
      const $errors = form.querySelectorAll('.opt-in__error');

      [].map.call($errors, error => form.removeChild(error));
    };

    const validateFields = (form, params) => {
      let isError = false;

      if (params.message === '') {
        isError = true;
        displayError(form, 'Please enter a message.');
      }

      if (params.email === '') {
        isError = true;
        displayError(form, 'Please enter your email.');
      }

      if (params.fname === '' || params.lname === '') {
        isError = true;
        displayError(form, 'Please enter your full name.');
      }

      // Checks the honeypot for bots
      if (params.comment !== '') {
        isError = true;
        displayError(form, 'You appear to be a robot. Please reload and try again.');
      }

      return isError;
    };

    const afterSubmit = xhrEvent => {
      const xhr = xhrEvent.currentTarget;

      if (xhr.readyState === 4 && xhr.status === 200) {
        const response = JSON.parse(xhr.responseText)[0];

        if (response.status === 'sent') {
          const loc = window.location;
          const baseURL = loc.origin || loc.protocol + '//' + loc.host;

          // Sends the user to a thank you page
          window.location = baseURL + '/thank-you/';
        } else {

          // TODO This feels sloppy and fragile
          const $form = document.getElementById('contact');

          // Lets the user attempt to resubmit the form
          enableForm($form);

          // If we didn't get a "sent" status, something's wrong.
          const msg = response.reject_reason || 'Please try again. Something went weird.';
          displayError($form, msg);
        }
      }
    };

    let toSend = {
      key: null,
      message: {
        text: null,
        subject: 'Message from lengstorf.com',
        from_email: null,
        from_name: null,
        to: [
          {
            email: atob('amFzb25AbGVuZ3N0b3JmLmNvbQ=='),
            name: atob('SmFzb24gTGVuZ3N0b3Jm'),
            type: 'to',
          },
        ],
      },
    };

    // Form is JS-only, so this unhides it
    $contact.classList.remove('opt-in__hidden');

    // Adds an event handler for the submit action
    $contact.addEventListener('submit', function(event) {
      event.preventDefault();

      // Starts by removing any previous errors
      removeAllErrors(this);

      // Filters and simplifies form fields for easier handling
      let params = {};
      [].filter.call(this.elements, el => !!el.name)
        .forEach(el => params[el.name] = el.value);

      // Validates required form fields
      const isError = validateFields(this, params);

      if (!isError) {
        disableForm(this);

        toSend.key = params.key;
        toSend.message.text = params.message;
        toSend.message.from_email = params.email;
        toSend.message.from_name = params.fname + ' ' + params.lname;

        sendMessage(toSend, afterSubmit);
      }
    });
  }

  // {
  //     "key": "ztJWhFuV1KvoxLr1nPW5ZQ",
  //     "message": {
  //         "text": "This is a test",
  //         "subject": "Mandrill Testing",
  //         "from_email": "testing@example.com",
  //         "from_name": "Example Name",
  //         "to": [
  //             {
  //                 "email": "jason@lengstorf.com",
  //                 "name": "Jason Lengstorf",
  //                 "type": "to"
  //             }
  //         ]
  //     }
  // }

  // HIGHLIGHTSHARE PLUGIN
  if (size.length) {
    const highlightshare = new HighlightShare({
      via: 'jlengstorf',
      container: '.main-content__content',
    });
  }

})();
