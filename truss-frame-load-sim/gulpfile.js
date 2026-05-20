const gulp = require('gulp');
const connect = require('gulp-connect');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const del = require('del');
const detectPort = require('detect-port');
const path = require('path');

const paths = {
  src: {
    html: 'src/*.html',
    css: 'src/css/*.css',
    js: 'src/js/**/*.js'
  },
  dist: {
    root: 'dist',
    css: 'dist/css',
    js: 'dist/js'
  }
};

function clean() {
  return del([paths.dist.root]);
}

function html() {
  return gulp.src(paths.src.html)
    .pipe(gulp.dest(paths.dist.root))
    .pipe(connect.reload());
}

function css() {
  return gulp.src(paths.src.css)
    .pipe(concat('style.css'))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist.css))
    .pipe(connect.reload());
}

function js() {
  return gulp.src(paths.src.js)
    .pipe(concat('app.js'))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(connect.reload());
}

function watchFiles() {
  gulp.watch(paths.src.html, html);
  gulp.watch(paths.src.css, css);
  gulp.watch(paths.src.js, js);
}

async function serve() {
  const defaultPort = 3000;
  const port = await detectPort(defaultPort);
  
  connect.server({
    root: paths.dist.root,
    port: port,
    livereload: true,
    host: 'localhost'
  });
  
  console.log(`\n========================================`);
  console.log(`🚀 桁架结构演示服务器已启动`);
  console.log(`📍 地址: http://localhost:${port}`);
  console.log(`========================================\n`);
}

const build = gulp.series(clean, gulp.parallel(html, css, js));
const dev = gulp.series(build, gulp.parallel(watchFiles, serve));

exports.clean = clean;
exports.html = html;
exports.css = css;
exports.js = js;
exports.build = build;
exports.dev = dev;
exports.default = dev;
