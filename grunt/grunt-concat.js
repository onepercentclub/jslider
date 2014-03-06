module.exports = function(grunt)
{

    var jsStandAlone = [
        'lib/jshashtable-2.1_src.js',
        'lib/tmpl.js',
        'lib/jquery.dependClass-0.1.js',
        'lib/jquery.numberformatter-1.2.3.js',
        'js/jquery.sliderDraggable.js',
        'js/jquery.sliderPointer.js',
        'js/jquery.slider.js',
        'js/jquery.sliderBootstrap.js'
    ];

    var jsBundle = [
        'lib/hammerjs/hammer.js'
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
