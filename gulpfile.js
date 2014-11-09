var gulp = require('gulp');

//plugins
var karma = require('karma').server;
var jsdoc = require('gulp-jsdoc');

var testFiles = [
  'server/**/*.js',
  'test/**/*.js'
];

gulp.task('test', function(done) {
  karma.start({ 
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('docs', function() {
  gulp.src(['server/*.js', 'server/**/*.js'])
  .pipe(jsdoc('./docs'));
});

gulp.task('default', function() {
  gulp.src(testFiles)
  .pipe(karma({
    configFile: 'karma.conf.js',
    action: 'watch'
  }));
});

