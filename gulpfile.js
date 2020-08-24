const gulp = require('gulp');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssvars = require('postcss-simple-vars');
const nested = require('postcss-nested');
const cssImport = require('postcss-import');
const browserSync = require('browser-sync').create();
const mixins = require('postcss-mixins');

function style() {
	return gulp.src('./app/assets/styles/styles.css')
  	.pipe(postcss([cssImport, mixins, cssvars, nested, autoprefixer]))
  	.on('error', function(errorInfo) {
  		console.log(errorInfo.toString());
  		this.emit('end');
  	})
  	.pipe(gulp.dest('./app/temp/styles'))
  	.pipe(browserSync.stream());
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
}

exports.style = style;
exports.watch = watch;







