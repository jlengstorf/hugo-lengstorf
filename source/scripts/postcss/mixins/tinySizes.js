'use strict';

var postcss = require('postcss');

module.exports = function( mixin, fontSize, lineHeight ) {

  // Creates a PostCSS node to work with
  var root = postcss.parse('');

  // Removes the unit
  var fontSizeInt = parseInt(fontSize);
  var lineHeightInt = parseInt(lineHeight);

  // If the font size is too small, sets it to the minimum
  if (fontSizeInt < 14) {
    fontSizeInt = 14;
    lineHeightInt = 20;
  }

  // Adds new declarations to the node
  root.append({
    prop: 'font-size',
    value: fontSizeInt + 'px'
  },
  {
    prop: 'line-height',
    value: lineHeightInt + 'px'
  });

  // Replaces the mixin with the processed CSS
  mixin.replaceWith(root);

};
