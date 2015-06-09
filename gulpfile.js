/**
 * Created by candice on 15/5/22.
 */
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    del = require('del'),
    less = require('gulp-less'),
    path = require('path'),
    replace = require('gulp-replace');

var LessPluginCleanCSS = require('less-plugin-clean-css'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    cleancss = new LessPluginCleanCSS({ advanced: true }),
    autoprefix= new LessPluginAutoPrefix({ browsers: ["last 2 versions"] });

var paths = {
    less:'./less/nox-bootstrap.less',
    js:['./js/*.js','!./js/passport.js'],
    image:'./images/*',
    fonts:'./fonts/*',
    dist:'./dist'
};


gulp.task('less', function () {
    return gulp.src(paths.less)
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')],
            plugins: [autoprefix, cleancss]
        }))
        .pipe(replace('background:#000;background-color:rgba(0,0,0,.75);','background: #000\\9;background-color:rgba(0,0,0,.75);'))
        .pipe(gulp.dest('./dist/css'))
        .pipe(notify({message: 'Less task complete'}));
});

gulp.task('js', function () {
    return gulp.src(paths.js)
        .pipe(concat('nox-bootstrap.js'))
        .pipe(uglify())
        .pipe(gulp.dest('js', {cwd: paths.dist}))
        .pipe(notify({message: 'JS task complete'}));
});
//压缩图片
gulp.task('images', function () {
    return gulp.src(paths.image)
        .pipe(imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))
        .pipe(gulp.dest('images',{cwd:paths.dist}))
        .pipe(notify({message: 'Images task complete'}));
});

//拷贝字体文件
gulp.task('fonts',function(){
    return gulp.src(paths.fonts)
        .pipe(gulp.dest('fonts',{cwd:paths.dist}))
        .pipe(notify({message: 'Fonts task complete'}))

});

//设置默认任务（default）
gulp.task('default', ['clean'], function () {
    gulp.start('less','js','images','fonts');
});

//清除文件
gulp.task('clean', function (cb) {
    del(paths.dist,{force:true}, cb)
});

