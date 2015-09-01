# Lengstorf Theme for Hugo

Port of my custom WordPress theme for the static site generator [Hugo](http://http://hugo.spf13.com).

## PostCSS + Babel + Gulp

To make my life easier, I created a `source` directory that contains PostCSS and ES2015-syntax JS. I'm using Gulp to run PostCSS and Babel to process those files.

To modify the static assets, run `gulp watch` from the theme root and edit files in the `source` directory.

This also handles image optimization, file revisioning, and concat/minification.

## Contributing

Please clone this repository and create pull-requests for any features that could have a more general use and that fit within the vision of this theme.
