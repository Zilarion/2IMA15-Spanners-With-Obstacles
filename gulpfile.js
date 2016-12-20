'use strict';

var browserify = require('browserify');
var concat = require('gulp-concat');
var bulkSass = require('gulp-sass-bulk-import');
var sass = require('gulp-sass');
var gulp = require('gulp');
var inject = require('gulp-inject');
var nunjucks = require('gulp-nunjucks');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');

// Compile js
gulp.task("js", function () {
    return browserify({entries: 'src/js/app.js', debug: true}).bundle()
        .on('error', function(error) {
            gutil.log(gutil.colors.red('Error: ' + error));
        })
        .pipe(source('app.js'))
        .pipe(gulp.dest('www/'))
});

// Compile sass
gulp.task('sass', function() {
    return gulp.src('src/scss/index.scss')
        .pipe(bulkSass())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(sourcemaps.write('sourcemaps/'))
        .pipe(gulp.dest('www/'))
});

// Render html
gulp.task('html', ['js', 'sass'], function() {
    return gulp.src('src/index.html')
        .pipe(nunjucks.compile())
        .pipe(inject(gulp.src(['www/**/*.js', 'www/**/*.css'], {read: false}), {relative: true, ignorePath: 'www'}))
        .pipe(gulp.dest('www/'))
});

gulp.task('build', ['js', 'html'], function() {
    gutil.log(gutil.colors.green('Done running build'))
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.*', ['build']);
});