var gulp = require('gulp');
var less = require('gulp-less');
var plumber = require('gulp-plumber');
var cssnano = require('gulp-cssnano'); // Подключаем пакет для минификации CSS
var rename = require('gulp-rename'); // Подключаем библиотеку для переименования файлов
var autoprefixer = require('gulp-autoprefixer');
var del = require('del'); // Подключаем библиотеку для удаления файлов и папок
var imagemin = require('gulp-imagemin'); // Подключаем библиотеку для работы с изображениями
var pngquant = require('imagemin-pngquant'); // Подключаем библиотеку для работы с png
var cache = require('gulp-cache'); // Подключаем библиотеку кеширования
var mqpacker = require('css-mqpacker');
var concat = require('gulp-concat'); // Подключаем gulp-concat (для конкатенации файлов)
var uglify = require('gulp-uglifyjs'); // Подключаем gulp-uglifyjs (для сжатия JS)
var server = require('browser-sync').create();

gulp.task('style', function() {
    return gulp.src('source/less/style.less') // Берем style.less и преобразуем его в css
        .pipe(plumber())
        .pipe(less())
        .pipe(
            autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }),
            mqpacker({ sort: true }))
        .pipe(gulp.dest('source/css'))
        .pipe(server.stream()) // Обновляем CSS на странице при изменении
        .pipe(cssnano())
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest('source/css'))
});

gulp.task('serve', function() {
    server.init({
        server: 'source',
        notify: false,
        open: true,
        cors: true,
        ui: false
    });
});

gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        'source/libs/jquery/dist/jquery.min.js', // Берем jQuery
        'source/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('source/js')); // Выгружаем в папку source/js
});

gulp.task('css-libs', function() {
    return gulp.src('source/less/libs.less')
        .pipe(less())
        .pipe(gulp.dest('source/css'))
        .pipe(cssnano()) // Сжимаем
        .pipe(rename('libs.min.css')) // Добавляем суффикс .min
        .pipe(gulp.dest('source/css')); // Выгружаем в папку source/css
});

gulp.task('watch', ['serve','css-libs','style', 'scripts'], function() {
    gulp.watch('source/less/**/*.less', ['style']); // Наблюдение за less файлами
    // Наблюдение за другими типами файлов
    gulp.watch('source/*.html', server.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('source/js/**/*.js', server.reload); // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
    return del.sync('build'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
    return gulp.src('source/img/**/*') // Берем все изображения из source
        .pipe(cache(imagemin({ // Сжимаем их с наилучшими настройками
            interlaced: true,
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('build/img')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'style','css-libs', 'scripts'], function() {

    var buildCss = gulp.src([ // Переносим CSS стили в продакшен
            'source/css/*.css',

        ])
        .pipe(gulp.dest('build/css'))

    var buildFonts = gulp.src('source/fonts/**/*') // Переносим шрифты в продакшен
        .pipe(gulp.dest('build/fonts'))

    var buildJs = gulp.src('source/js/**/*') // Переносим скрипты в продакшен
        .pipe(gulp.dest('build/js'))

    var buildHtml = gulp.src('source/*.html') // Переносим HTML в продакшен
        .pipe(gulp.dest('build'));
});

gulp.task('clear', function() {
    return cache.clearAll();
})

gulp.task('default', ['watch']);