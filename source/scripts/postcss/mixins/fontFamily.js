'use strict';

var postcss = require('postcss');

module.exports = function( mixin, size ) {

  // Sets a default font family, plus font weight
  var fontFamilyDecl = postcss.decl({
    prop: 'font-family',
    value: '"Gotham A", "Gotham B", sans-serif'
  });

  var fontWeightDecl = postcss.decl({
    prop: 'font-weight',
    value: '400'
  });

  // If the font is smaller than 18px, use the screen-smart version
  if (parseInt(size) < 18) {
    fontFamilyDecl.value = '"Gotham Ssm A", "Gotham Ssm B", sans-serif';
  }

  mixin.replaceWith(fontFamilyDecl, fontWeightDecl);
};
