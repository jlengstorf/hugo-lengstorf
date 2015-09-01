/*
 * # gulpfile.js
 *
 * Task runners are designed to handle the boring, repetitive jobs that we, as
 * easily-bored, often-busy developers, tend to forget.
 *
 * Fortunately, using task runners is pretty easy, and once it's set up, *you
 * never need to think about it again.*
 *
 * ***Build once, win forever.***
 *
 * **NOTE:** Don't forget to install the required plugins:
 *
 *     npm install --save-dev gulp
 *
 * `--save-dev` should be used for any plugins only used during development.
 * (If the site runs on WordPress, for example, Gulp will likely never run in
 * production, so all the plugins should be saved for development only.)
 *
 * To install a module that's used in the app always, use `--save` instead.
 */


/*
 * Set Up and Configuration
 * ============================================================================
 */

// ### Automatically load Gulp plugins
require('matchdep').filterDev('gulp*').forEach(function( module ) {

  // Remove the `gulp-` prefix & hyphens for better module var names.
  var module_name = module.replace(/^gulp-/, '').replace(/-/, '');

  if (module_name==='postcss') module_name = 'postCSS';

  // Then require the module.
  global[module_name] = require(module);

});


// ### Define filepaths

// For easy reference, declare all filepaths in one place.
var paths = {
  styles: {
    src: 'source/styles/main.css',
    destDir: 'static/css/',
    destFile: 'main.min.css',

    // Watch all CSS files for better LiveReload functionality.
    watch: 'source/styles/**/*.css'
  },
  scripts: {
    src: 'source/scripts/*.js',
    destDir: 'static/js/'
  },
  templates: {
    src: ['layouts/partials/scripts.html','layouts/partials/head.html'],
    destDir: 'layouts/partials/'
  },
  images: {
    src: 'source/images/**/*',
    destDir: 'static/images/',
    watch: [ 'source/images/**/*', '!source/images/**/*@2x.{jpg,png}' ]
  }
};


/*
 * ### Create reusable Gulp pipes for shared functionality
 *
 * The revisioning process is near-identical for both styles and scripts — only
 * the file path changes — so we can keep our code [DRY](http://bit.ly/1LylcUn)
 * by making this step into a reusable function.
 *
 * [`gulp-lazypipe`](http://git.io/vT9CR) makes this function possible by
 * giving us the ability to create an "immutable, lazily-initialized pipeline",
 * which more or less means we can set up reusable stream handling.
 */

// Load the plugin into a variable
var lazypipe = require('lazypipe');


/**
 * A function that abstracts the creation of revisioned filenames and source
 * maps for shared use by both style and script tasks.
 *
 * This function will:
 *
 * - Create a [revisioned](http://git.io/vUBVd) filename
 * - Write the sourcemap for easier debugging in the console
 * - Save the new CSS file
 * - Write the manifest for mapping revisioned files
 *   + NOTE: To get merge working, get really explicit (see issue
 *     [#83](https://github.com/sindresorhus/gulp-rev/issues/83))
 * - Save the manifest in the public folder
 *
 * **NOTE:** Do NOT call the functions when using `lazypipe`
 *
 * For example,
 *
 *     lazypipe()
 *       .pipe(rev())
 *
 * will cause an error.
 *
 * However,
 *
 *     lazypipe()
 *       .pipe(rev)
 *
 * will not. Note how `rev` was passed *without being called*.
 *
 * @function addFileRevision
 *
 * @param  {String} dest The path to which files should be saved
 *
 * @return {Function} a stream handler
 */
function addFileRevision( dest ) {

  var sourceRoot = dest.indexOf('js')!==-1 ? '/scripts/' : '/source/';

  return lazypipe()

    .pipe(rev)

    .pipe(sourcemaps.write, '../maps', { sourceRoot: sourceRoot })

    .pipe(gulp.dest, dest)

    .pipe(rev.manifest, 'source/rev-manifest.json', {
      base: process.cwd()+'/static',
      merge: true
    })

    .pipe(gulp.dest, 'static');

}


/*
 * Stylesheet Processing
 * ============================================================================
 */

// ### Load the required PostCSS plugins

/*
 * Since the processors will be used in multiple tasks, we're making them
 * available to the whole script.
 */
var processors = [

  // - [`postcss-import`](http://git.io/vUQ0p) for `@import` support
  require('postcss-import')({ glob: true }),

  // - [`postcss-mixins`](http://git.io/vUBKn) allows Sass-style mixins
  require('postcss-mixins')({
    mixinsDir: process.cwd() + '/source/scripts/postcss/mixins/'
  }),

  // - [`postcss-nested`](http://git.io/vUBoT) allows nested selectors
  require('postcss-nested'),

  // - [`postcss-simple-vars`](http://git.io/vUBKX) allows Sass-style vars
  require('postcss-simple-vars'),

];


/*
 * ### Process the stylesheet
 *
 * This task will do a bunch of our boring tasks — adding prefixes, minifying,
 * creating source maps, etc. — all without any additional work from us.
 */

// To keep things tidy, require the `clean:styles` task before running.
gulp.task('styles', ['clean:styles'], function(  ) {

  // - Load our lazypiped file revision handling
  var createRevision = addFileRevision(paths.styles.destDir);

  // - Target the source CSS files
  gulp.src(paths.styles.src)

    // - Initialize [sourcemaps](http://git.io/vUBaV)
    .pipe(sourcemaps.init())

    // - Run our given [PostCSS](http://git.io/vUBaL) processors (loaded above)
    .pipe(postCSS(processors))

    // - Use [`gulp-cssnext`](http://git.io/vUB2I) to enable future CSS syntax
    .pipe(cssnext())

    // - [`gulp-cssnano`](http://git.io/vUBVI) optimizes CSS for smaller files
    .pipe(cssnano())

    // - [Rename](https://github.com/hparra/gulp-rename) the files
    .pipe(rename(paths.styles.destFile))

    // - Save the new CSS file
    .pipe(gulp.dest(paths.styles.destDir))

    // - Create a revisioned version of the file
    .pipe(createRevision());

});


/*
 * ### Check for browser support issues
 *
 * Using [`doiuse`](http://git.io/vTdu5), we can bounce our stylesheets off the
 * [caniuse.com](http://caniuse.com/) database and see which features we're
 * using that aren't supported in older browsers. It doesn't remove the need to
 * do cross-browser testing, but it gives us a great starting point to get it
 * done quickly and thoroughly.
 */

// **NOTE:** This task isn't automatic. Run with `gulp styles:browser-support`.
gulp.task('styles:browser-support', function(  ) {

  var doiuse = require('doiuse')({
    browsers:['ie >= 10, > 1%, last 2 versions'],
    onFeatureUsage: function(usageInfo) {
      console.log(usageInfo.message.replace(__dirname, ''));
    }
  });

  gulp.src(paths.styles.src)

    .pipe(postcss(processors))

    .pipe(cssnext())

    .pipe(postcss([doiuse]));

});


/*
 * JavaScript Processing
 * ============================================================================
 */

/*
 * ### Process scripts
 *
 * This task checks for obvious code errors, enforces a coding style guide,
 * concatenates all the app's scripts together, minifies the output, adds a
 * source map, and adds a revision hash to ensure cache busting. It also
 * transpiles ES6 syntax into ES5 syntax so that we can code in The Future™.
 */

// To keep things tidy, require `clean:scripts` task before running.
gulp.task('scripts', ['clean:scripts'], function(  ) {

  var createRevision = addFileRevision(paths.scripts.destDir);

  // - Target the source JS files
  gulp.src(paths.scripts.src)

    .pipe(using())

    // - Lint (& fix) scripts using [Airbnb's styleguide](http://git.io/v8y5cA)
    .pipe(jscs({
      preset: 'airbnb',
      esnext: true
    }))

      // -- If we get an error, log it but don't crash
      .on('error', function( error ) { console.log(error.message); })

    // - Create a source map for easier development
    .pipe(sourcemaps.init())

    // - Concatenate all scripts into one file
    .pipe(concat('main.js'))

    // - Use Babel to transpile ES6 syntax to ES5 for browser support
    .pipe(babel())

    // - Compress the output for smaller file size
    .pipe(uglify())

    .pipe(rename({ suffix: '.min' }))

    // - Save the new JS file
    .pipe(gulp.dest(paths.scripts.destDir))

    // - Create a revisioned version of the file
    .pipe(createRevision());

});


/*
 * ### Automatically fix coding style guide errors
 *
 * [JSCS](http://jscs.info/) has a very cool feature that allows us to
 * *automatically* fix style guide issues in code. Things like indentation and
 * semicolons — plus *much* more — can be fixed by JSCS without any additional
 * work on our part.
 *
 * **NOTE:** This task is non-destructive. Upon running, a new file with the
 * suffix `.fixed` will be created that contains the modified code.
 *
 * **NOTE:** Fixing code styles could easily be incorporated into the main
 * scripts workflow. It probably wouldn't cause any issues. However, my
 * preference is to manually fix problems, which helps me correct bad habits
 * in my coding faster.
 */

// **NOTE:** This task isn't automatic. Run with `gulp scripts:fix`
gulp.task('scripts:fix', function( ) {

  gulp.src(paths.scripts.src)

    // - Set `fix` to `true` so code style issues are automatically fixed
    .pipe(jscs({
      preset: 'airbnb',
      esnext: true,
      fix: true
    }))

    // - Add a suffix for quick comparison between the original and fixed files
    .pipe(rename({ suffix: '.fixed' }))

    // - Save the fixed file
    .pipe(gulp.dest('source/scripts/'));

});


/*
 * Image Optimization
 * ============================================================================
 *
 * Compress images using [`gulp-imagemin`](http://git.io/vUN9E) to speed up
 * your site a bit.
 */

gulp.task('images', ['clean:images'], function(  ) {

  // [PNGQuant](http://git.io/vUN9x) is better at PNG compression.
  var pngquant = require('imagemin-pngquant');

  // - Target uncompressed image files
  gulp.src(paths.images.src)

    // - Only compress files that are new or have changed
    .pipe(changed(paths.images.destDir))

    // - For debugging only: show which files are being processed
    .pipe(using())

    // - Compress the images
    .pipe(imagemin({
      progressive: true,
      use: [ pngquant() ]
    }))

    // - Save the compressed images
    .pipe(gulp.dest(paths.images.destDir));

});


/*
 * Deletion of Old and Unused Files
 * ============================================================================
 *
 * Before running a Gulp task, old files should be deleted. This isn't strictly
 * necessary, but it's very helpful to make sure you don't have unused files
 * or old versions introducing project size bloat or subtle bugs (e.g. if a
 * task doesn't work but the old version is there, you may not immediately
 * notice a problem).
 */

// To empty directories before processing, we use [`del`](http://git.io/vTFLa).
var del = require('del');

// - Remove the processed stylesheets
gulp.task('clean:styles', function(  ) {

  // `del` is not a Gulp plugin, so we don't pipe files into it.
  del([
    'static/css/*.*',
    'static/maps/**.css.map'
  ]);

});

// - Remove processed images
gulp.task('clean:images', function(  ) {

  // `del` is not a Gulp plugin, so we don't pipe files into it.
  del([
    'static/images/**.*'
  ]);

});

// - Remove processed scripts
gulp.task('clean:scripts', function(  ) {

  // `del` is not a Gulp plugin, so we don't pipe files into it.
  del([
    'static/js/**.*',
    'static/maps/**.js.map'
  ]);

});


/*
 * Dependency Management
 * ============================================================================
 */

/*
 * ### Use revisioned filenames to avoid caching issues
 *
 * To avoid having a "source" and "build" template, which doesn't make a lot
 * of sense in the case of our Jade templates, we need to create an unrevved
 * (e.g. `file.min.css`) include in the template that can later be replaced by
 * `gulp-rev-replace` to use a revved (e.g. `file.min-0fa123be.css`) include.
 */

gulp.task('dependencies:app', function(  ) {

  // - Grab the unrevved file names to inject
  // -- Don't read the files to eke out a little extra performance
  var styles = gulp.src([
    'static/css/main.min.css',
    'static/js/main.min.js'
  ], { read: false });

  // - Load the template files
  gulp.src(paths.templates.src)

    // - Inject the unrevved file into the template
    .pipe(inject(styles, { ignorePath: 'static' }))

    // - Replace with the revved filename
    .pipe(revreplace({
      manifest: gulp.src('source/rev-manifest.json'),
      replaceInExtensions: ['.html']
    }))

    // - Save the file
    .pipe(gulp.dest(paths.templates.destDir));

});


/*
 * ### Automatically inject Bower dependencies
 *
 * With [`wiredep`](http://git.io/vTdch), we can automatically inject any files
 * that our Bower dependencies require.
 *
 * **NOTE:** Using `watch`, we can make sure dependencies are always up-to-date
 * as changes are made. Uninstalled dependencies are removed, newly installed
 * dependencies are added, all as we run the appropriate `bower` commands.
 */

gulp.task('dependencies:bower', function(  ) {

  // - Use the `stream` support wiredep offers
  var wiredep = require('wiredep').stream;

  // - Target which file(s) need to have dependencies included
  gulp.src(paths.templates.src)

    // - Wire all Bower dependencies into the source files
    .pipe(wiredep({ devDependencies: true, ignorePath: '../../public' }))

    // - Save the file in the destination directory
    .pipe(gulp.dest(paths.templates.destDir));

});


/*
 * Automatically Run Tasks When Files Are Changed
 * ============================================================================
 */

// ### Watch files for changes to automatically update them

// With [`gulp-watch`](http://git.io/vThEp) we can run tasks as files change.
gulp.task('watch', function(  ) {

  // - Start listening on the LiveReload port
  livereload.listen();

  // - Set up a watcher on files to execute the proper tasks
  gulp.watch(paths.styles.watch, ['styles']);

  // - Watch JavaScript files and run the `scripts` task when they're changed
  gulp.watch(paths.scripts.src, ['scripts']);

  // - If the revision number changes for a file, re-inject them
  gulp.watch('source/rev-manifest.json', ['dependencies:app']);

  // - Whenever images are added or removed, run the `images` task
  gulp.watch(paths.images.watch, ['images']);

  // - Automatically add/remove dependencies from Bower
  gulp.watch(['bower.json', '.bowerrc'], ['dependencies:bower']);

});


/*
 * The Default Task
 * ============================================================================
 */

/*
 * By creating a default task, we can get the app running just by typing `gulp`
 * in the command line.
 */
gulp.task('default', ['watch']);
