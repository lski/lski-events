const gulp = require('gulp'),
	del = require('del'),
	uglify = require('gulp-uglify'),
	insert = require('gulp-insert'),
	settings = require('./package.json'),
	merge = require('merge-stream'),
	versionHeader = ["/*! ", settings.name, " - ", settings.version, " */\n"].join("");

gulp.task('clean', clean);
gulp.task('minify', ['clean'], minifyJs);
gulp.task('default', ['minify']);

function clean() {
	return del('dist');
}

function minifyJs() {
	
	var src = gulp.src(['./src/*.js'])
		.pipe(uglify())
		.pipe(insert.prepend(versionHeader));
		
	var extra = gulp.src(['./node_modules/addeventlistener-with-dispatch/dist/addeventlistener-with-dispatch.js']);
	
	return merge(src, extra)
		.pipe(gulp.dest('./dist/'));
}