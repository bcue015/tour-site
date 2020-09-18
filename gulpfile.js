var gulp = require('gulp'),
webpack = require('webpack'),
browserSync = require('browser-sync').create(),
postcss = require('gulp-postcss'),
rgba = require('postcss-hexrgba'),
autoprefixer = require('autoprefixer'),
cssvars = require('postcss-simple-vars'),
nested = require('postcss-nested'),
cssImport = require('postcss-import'),
mixins = require('postcss-mixins'),
imagemin = require('gulp-imagemin'),
del = require('del'),
usemin = require('gulp-usemin'),
rev = require('gulp-rev'),
cssnano = require('gulp-cssnano'),
uglify = require('gulp-uglify'),
rename = require('gulp-rename'),
svgSprite =require('gulp-svg-sprite'),
svg2png = require('gulp-svg2png'),
modernizr = require('gulp-modernizr');

gulp.task('styles', function() {
  return gulp.src('./app/assets/styles/styles.css')
    .pipe(postcss([cssImport, mixins, cssvars, nested, rgba, autoprefixer]))
    .on('error', (error) => console.log(error.toString()))
    .pipe(gulp.dest('./app/temp/styles'));
});

var config = {
  shape:  {
    spacing: {
      padding: 1
    }
  },
  mode: {
    css: {
      variables: {
        replaceSvgWithPng: function() {
          return function(sprite, render) {
            return render(sprite).split('.svg').join('.png');
          }
        }
      },
      sprite: 'sprite.svg',
      render: {
        css: {
          template: './templates/sprite.css'
        }
      }
    }
  }
}

gulp.task('beginClean', function() {
  return del(['./app/temp/sprite', './app/assets/images/sprites']);
});

gulp.task('createSprite', function() {
  return gulp.src('./app/assets/images/icons/**/*.svg')
    .pipe(svgSprite(config))
    .pipe(gulp.dest('./app/temp/sprite/'));
});

gulp.task('createPngCopy', function() {
  return gulp.src('./app/temp/sprite/css/*.svg')
    .pipe(svg2png())
    .pipe(gulp.dest('./app/temp/sprite/css'));
});

gulp.task('copySpriteGraphic', function() {
  return gulp.src('./app/temp/sprite/css/**/*.{svg,png}')
  .pipe(gulp.dest('./app/assets/images/sprites'));
});

gulp.task('copySpriteCSS', function() {
  return gulp.src('./app/temp/sprite/css/*.css')
    .pipe(rename('_sprite.css'))
    .pipe(gulp.dest('./app/assets/styles/modules'));
});

gulp.task('endClean', function() {
  return del('./app/temp/sprite');
});  

gulp.task('icons', gulp.series('beginClean', 'createSprite', 'createPngCopy', gulp.parallel('copySpriteGraphic','copySpriteCSS'), 'endClean'));

gulp.task('scripts', function(callback) {
  webpack(require('./webpack.config.js'), function(err, stats) {
    if (err) {
      console.log(err.toString());
    }

    console.log(stats.toString());
    callback();
  });
});

gulp.task('watch', function() {
  browserSync.init({
    notify: false,
    server: {
      baseDir: "app"
    }
  });

  gulp.watch('./app/index.html').on('change', browserSync.reload);
  gulp.watch('./app/assets/styles/**/*.css', gulp.parallel('waitForStyles'));
  gulp.watch(['./app/assets/scripts/**/*.js'], gulp.parallel('waitForScripts'));
});

gulp.task('waitForStyles', gulp.series('styles', function() {
  return gulp.src('./app/temp/styles/styles.css')
    .pipe(browserSync.stream());
}))

gulp.task('waitForScripts', gulp.series('scripts', function(cb) {
  browserSync.reload();
  cb()
}))

gulp.task('modernizr', function() {
  return gulp.src(['./app/assets/styles/**/*.css', './app/assets/scripts/**/*.js'])
    .pipe(modernizr({
      "options": [
        "setClasses"
      ]
    }))
    .pipe(gulp.dest('./app/temp/scripts'));
});


// This is for Gulp Build

gulp.task('previewDist', function() {
  browserSync.init({
    notify: false,
    server: {
      baseDir: "docs"
    }
  });
});

gulp.task('deleteDistFolder', function() {
	return del("./docs");
});

gulp.task('copyGeneralFiles', function() {
  var pathsToCopy = [
    './app/**/*',
    '!./app/index.html',
    '!./app/assets/images/**',
    '!./app/assets/styles/**',
    '!./app/assets/scripts/**',
    '!./app/temp',
    '!./app/temp/**'
  ]
  return gulp.src(pathsToCopy)
    .pipe(gulp.dest("./docs"));
});

gulp.task('optimizeImages', function() {
	return gulp.src(['./app/assets/images/**/*', '!./app/assets/images/icons', '!./app/assets/images/icons/**/*'])
		.pipe(imagemin({
			progressive: true,
			interlaced: true,
			multipass: true
		}))
		.pipe(gulp.dest("./docs/assets/images"));
});

gulp.task('usemin', function() {
	return gulp.src("./app/index.html")
	.pipe(usemin({
		css: [function() {return rev()}, function() {return cssnano()}],
		js: [function() {return rev()}, function() {return uglify()}]
	}))
	.pipe(gulp.dest("./docs"));
});

gulp.task('build', gulp.series('deleteDistFolder', 'copyGeneralFiles', 'icons', 'styles', 'scripts', gulp.parallel('optimizeImages', 'usemin')));







