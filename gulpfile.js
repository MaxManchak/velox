'use strict';

var gulp = require ('gulp');
// // CSS
var postcss = require ('gulp-postcss'); //подключение postcss
var smartImport = require ('postcss-smart-import'); //продвинутый импорт css в один файл
var nested = require ('postcss-nested'); //позволяет делать вложенности как в cинтаксисе less
var autoprefixer = require ('autoprefixer'); //автоматическое добавление префиксов свойствам
var cssnano = require ('cssnano'); // продвинутая минификация css
var simpleVars = require ('postcss-simple-vars'); //использование переменных в css
var mixins = require ('postcss-mixins'); //использование примесей
var moveMQ = require ('postcss-move-media'); // перемещение и объединение media queries

// // HTML & JS
// var rigger = require('gulp-rigger'); // импорт в файл
var fileinclude = require ('gulp-file-include'); // расширенный импорт в файл
var uglify = require ('gulp-uglify'); // минификация js
var babel = require ('gulp-babel'); // добавление полифила

// // IMAGE
var imagemin = require ('gulp-imagemin'); // минификация изображений
const webp = require ('gulp-webp'); // преобразование изображений в формат webp

// // webserver
var browserSync = require ('browser-sync').create ();

var newer = require ('gulp-newer'); // проверка на наличие файлов в папке сборки (при первом запуске) и делает сверку даты модификации
// var notify = require('gulp-notify');
// var combine = require('stream-combiner2');//

var clean = require ('gulp-clean');

var path = {
  src: {
    html: 'source/*.html',
    js: 'source/js/script.js',
    jslib: 'source/js/library/*.*',
    css: 'source/css/*.css',
    img: 'source/images/*.*',
    fonts: 'source/fonts/**',
  },
  build: {
    html: 'build/',
    js: 'build/js/',
    jslib: 'build/js/',
    css: 'build/css/',
    img: 'build/images/',
    fonts: 'build/fonts/',
  },

  watch: {
    html: 'source/**/*.html',
    js: 'source/js/**/*.js',
    jslib: 'source/js/library/*.js',
    css: 'source/css/**/*.css',
    img: 'source/images/**/*.*',
    fonts: 'source/fonts/**/*.*',
  },
  clean: './build/',
};

var config = {
  server: {
    baseDir: 'build/',
  },
  port: 80,
  // open: "external",
  // tunnel: 'maxmanchak-private',
  logPrefix: 'Frontend_Devil',
  browser: 'google chrome',
  notify: true,
};

//                                              CSS
gulp.task ('css', function () {
  return gulp
    .src (
      path.src.css,
      {
        // since: gulp.lastRun('css')
      }
    )
    .pipe (
      postcss ([
        smartImport (),
        nested (),
        simpleVars (),
        mixins (),
        moveMQ (),
        autoprefixer ({
          browsers: ['last 10 version'],
        }),
        // cssnano(),
      ])
    )
    .pipe (gulp.dest (path.build.css));
});

//                                            HTML
gulp.task ('html', function () {
  return gulp
    .src (
      path.src.html,
      {
        // since: gulp.lastRun('html'),
      }
    )
    .pipe (
      fileinclude ({
        prefix: '@@',
        basepath: '@file',
      })
    )
    .pipe (gulp.dest (path.build.html));
});

//                                            JavaScript
gulp.task ('js', function () {
  return (gulp
      .src (path.src.js, {
        since: gulp.lastRun ('js'),
      })
      .pipe (
        fileinclude ({
          prefix: '@@',
          basepath: '@file',
        })
      )
      .pipe (babel ())
      // .pipe(uglify())
      .pipe (gulp.dest (path.build.js)) );
});

gulp.task ('jslib', function () {
  return (gulp
      .src (path.src.jslib, {
        since: gulp.lastRun ('jslib'),
      })
      // .pipe(uglify())
      .pipe (gulp.dest (path.build.js)) );
});

//                                            Image
gulp.task ('image', function (callback) {
  gulp
    .src (
      path.src.img,
      {
        // since: gulp.lastRun('image'),
      }
    )
    // .pipe(newer(path.build.img))
    .pipe (
      imagemin ({
        interlaced: true,
        progressive: true,
        optimizationLevel: 5,
        svgoPlugins: [
          {
            removeViewBox: true,
          },
        ],
      })
    )
    .pipe (gulp.dest (path.build.img));

  gulp
    .src (
      path.src.img,
      {
        // since: gulp.lastRun('image'),
      }
    )
    // .pipe(newer(path.build.img))
    .pipe (webp ({quality: 100}))
    .pipe (gulp.dest (path.build.img));

  callback ();
});

//                  fonts
gulp.task ('fonts', function () {
  return gulp
    .src (path.src.fonts, {
      since: gulp.lastRun ('fonts'),
    })
    .pipe (gulp.dest (path.build.fonts));
});

gulp.task ('clean', function () {
  return gulp.src (path.clean).pipe (clean ());
});

gulp.task (
  'build',
  gulp.parallel ('html', 'js', 'jslib', 'css', 'image', 'fonts')
);
gulp.task (
  'production',
  gulp.series ('clean', 'html', 'js', 'jslib', 'css', 'image', 'fonts')
);

gulp.task ('webserver', function () {
  browserSync.init (config);
  browserSync.watch ('build/**/*.*').on ('change', browserSync.reload);
});

//                                             Watcher
gulp.task ('watch', function () {
  gulp.watch ([path.watch.html], gulp.parallel ('html'));
  gulp.watch ([path.watch.css], gulp.parallel ('css'));
  gulp.watch ([path.watch.js], gulp.parallel ('js'));
  gulp.watch ([path.watch.jslib], gulp.parallel ('jslib'));
  gulp.watch ([path.watch.img], gulp.parallel ('image'));
  gulp.watch ([path.watch.fonts], gulp.parallel ('fonts'));
});

gulp.task ('default', gulp.parallel ('build', 'webserver', 'watch'));
