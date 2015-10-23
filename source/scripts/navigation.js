(() => {

  'use strict';

  // SUBNAV TOGGLE
  // Toggles open/close state of the subnav panel
  const $subnavToggle = document.querySelector('.subnav-toggle');
  $subnavToggle.addEventListener('click', (event) => {

    event.preventDefault();

    const $header = document.querySelector('.site-header');
    const $slideOutNav = document.querySelector('.slide-out-nav');
    let navText;

    if ($header.classList.contains('closed')) {
      $header.classList.remove('closed');
      $header.classList.add('open');
      $slideOutNav.setAttribute('aria-hidden', false);

      navText = 'Less';
    } else {
      $header.classList.remove('open');
      $slideOutNav.setAttribute('aria-hidden', '');

      navText = 'More';

      setTimeout(() => {
        $header.classList.add('closed');
        $slideOutNav.setAttribute('aria-hidden', true);
      }, 500);
    }

    $subnavToggle.textContent = navText;

  });

}());
