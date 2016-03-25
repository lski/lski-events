const gulp = require('gulp'),
	del = require('del'),
	uglify = require('gulp-uglify'),
	insert = require('gulp-insert'),
	settings = require('./package.json'),
	versionHeader = ["/*! ", settings.description, " - ", settings.version, " */\n"].join("");

gulp.task('clean', clean);
gulp.task('minify', ['clean'], minifyJs);
gulp.task('default', ['minify']);

function clean() {
	return del('dist');
}

function minifyJs() {

    return gulp.src(['./src/*.js', './node_modules/addeventlistener-with-dispatch/dist/addeventlistener-with-dispatch.js'])
        .pipe(uglify())
        .pipe(insert.prepend(versionHeader))
        .pipe(gulp.dest('./dist/'));
}