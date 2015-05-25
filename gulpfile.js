/**
 * Created by candice on 15/5/22.
 */
var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var del = require('del');
var LessPluginCleanCSS = require('less-plugin-clean-css'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    cleancss = new LessPluginCleanCSS({ advanced: true }),
    autoprefix= new LessPluginAutoPrefix({ browsers: ["last 2 versions"] });

var paths = {
    less:'./less/nox-bootstrap.less',
    dist:'./dist'
};


gulp.task('less', function () {
    return gulp.src(paths.less)
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ],
            plugins: [autoprefix, cleancss]
        }))
        .pipe(gulp.dest('./dist/css'));
});

//清除文件
gulp.task('clean', function (cb) {
    del(paths.dist,{force:true}, cb)
});

