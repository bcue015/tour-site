const gulp = require('gulp');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssvars = require('postcss-simple-vars');
const nested = require('postcss-nested');
const cssImport = require('postcss-import');
const browserSync = require('browser-sync').create();
const mixins = require('postcss-mixins');
const hexrgba = require('postcss-hexrgba');
const webpack = require('webpack');

function style() {
	return gulp.src('./app/assets/styles/styles.css')
  	.pipe(postcss([cssImport, mixins, cssvars, nested, hexrgba, autoprefixer]))
  	.on('error', function(errorInfo) {
  		console.log(errorInfo.toString());
  		this.emit('end');
  	})
  	.pipe(gulp.dest('./app/temp/styles'))
  	.pipe(browserSync.stream());
}

function scripts(callback) {
	webpack(require('./webpack.config.js'), function() {
		console.log("Horray! Webpack completed!");
		callback();
	});
}

function watch() {
	browserSync.init({
		notify: false,
		server: {
			baseDir: "app"
		}
	});
	gulp.watch('./app/assets/styles/**/*.css', style);
	gulp.watch('./app/index.html').on('change', browserSync.reload);
	gulp.watch('./app/assets/scripts/**/*.js', scripts).on('change', browserSync.reload);
}



exports.style = style;
exports.watch = watch;
exports.scripts = scripts;








