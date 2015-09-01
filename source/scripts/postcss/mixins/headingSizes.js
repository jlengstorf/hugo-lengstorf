'use strict';

var postcss = require('postcss');

module.exports = function( mixin, fontSizeBase, lineHeightBase ) {

  // Creates a PostCSS node to work with
  var root = postcss.parse('');

  // Remove the units from arguments
  var fontSizeInt = parseFloat(fontSizeBase);

  // We want to allow half-sizes for line height
  var vHeightInt = parseFloat(lineHeightBase) / 2;

  var heading, fontSize, lineHeight;

  // Loops through h1–h6 to create rules
  for (var i=1; i<=6; i++) {

    // Creates the rule
    heading = postcss.rule({ selector: 'h' + i });

    // Determines the font size
    fontSize = Math.round(fontSizeInt + (6 - i) * 1 / 6 * fontSizeInt);

    // Determines the line height
    lineHeight = Math.ceil(fontSize / vHeightInt) * vHeightInt;

    // Appends the properties to the rule
    heading.append({
      prop: 'font-size',
      value: fontSize + 'px'
    },
    {
      prop: 'line-height',
      value: lineHeight + 'px'
    });

    // Adds the new rule to the root node
    root.append(heading);
  }

  // Replaces the mixin with the generated CSS
  mixin.replaceWith(root);
};
