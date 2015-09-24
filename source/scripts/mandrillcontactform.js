(() => {

  'use strict';

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

})();
