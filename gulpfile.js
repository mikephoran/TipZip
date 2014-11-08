//Include gulp
var gulp = require('gulp');

//Include Our Plugins
var karma = require('karma').server;
// var karma = require('gulp-karma');

var testFiles = [
  'server/**/*.js',
  'test/**/*.js'
];

gulp.task('test', function(done){
  karma.start({ 
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

// gulp.task('test', function(){
//   return gulp.src(testFiles)
//   .pipe(karma({
//     configFile: 'karma.conf.js',
//     action: 'start'
//   }))
//   .on('error', function(err){
//     throw err;
//   });
// });

gulp.task('default', function(){
  gulp.src(testFiles)
  .pipe(karma({
    configFile: 'karma.conf.js',
    action: 'watch'
  }));
});

