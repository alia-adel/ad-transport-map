const { series, src, dest } = require('gulp');
const uglify = require('gulp-uglify');
const rollup = require('gulp-rollup');

// The `clean` function is not exported so it can be considered a private task.
// It can still be used within the `series()` composition.
function clean(cb) {
  // body omitted
  cb();
}

// The `build` function is exported so it is public and can be run with the `gulp` command.
// It can also be used within the `series()` composition.
function build(cb) {
  // body omitted
  cb();
}


function bundle(cb) {
    // body omitted
    cb();
}

function minify(cb) {
    // body omitted
    cb();
}


// exports.build = build;
// exports.default = series(clean, build, bundle, minify);

exports.default = function() {
    return src('src/**/*.js')
    .pipe(uglify())
    // .pipe(rollup({
    //     // any option supported by Rollup can be set here.
    //     input: ['']
    // }))
    .pipe(dest('dist/'));
  }