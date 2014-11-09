var gulp = require('gulp');

//Include Our Plugins
var jsdoc = require('gulp-jsdoc');
var jasmine = require('gulp-jasmine');

var testFiles = [
  'server/**/*.js',
  'test/**/*.js'
];

gulp.task('default', function() {
gulp.task('test', function(){
  return gulp.src(testFiles)
      .pipe(jasmine());
});

gulp.task('docs', function() {
  gulp.src(['server/*.js', 'server/**/*.js'])
  .pipe(jsdoc('./docs'));
});

