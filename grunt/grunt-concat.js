module.exports = function(grunt)
{

    var jsStandAlone = [
        'vendor/jshashtable-2.1_src.js',
        'vendor/tmpl.js',
        'vendor/jquery.dependClass-0.1.js',
        'vendor/jquery.numberformatter-1.2.3.js',
        'js/jquery.sliderDraggable.js',
        'js/jquery.sliderPointer.js',
        'js/jquery.slider.js',
        'js/jquery.sliderBootstrap.js'
    ];

    var jsBundle = [
        'vendor/hammerjs/hammer.js'
    ];

    grunt.config('concat', {
        options: {
            separator: ';'
        },
        standalone: {
            src: jsStandAlone,
            dest: 'dist/jquery.slider-standalone.js'
        },
        bundled: {
            src: jsBundle.concat(jsStandAlone),
            dest: 'dist/jquery.slider-bundled.js'
        }
    });


    grunt.loadNpmTasks('grunt-contrib-concat');
};
