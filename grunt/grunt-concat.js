module.exports = function(grunt)
{

    var jsOrder = [
        'lib/jshashtable-2.1_src.js',
        'lib/tmpl.js',
        'lib/jquery.dependClass-0.1.js',
        'lib/jquery.numberformatter-1.2.3.js',
        'lib/hammerjs/hammer.js',
        'js/jquery.sliderDraggable.js',
        'js/jquery.sliderPointer.js',
        'js/jquery.slider.js',
        'js/jquery.sliderBootstrap.js'
    ];

    grunt.config('concat', {
        options: {
            separator: ';'
        },
        dist: {
            src: jsOrder,
            dest: 'dist/jquery.slider.js'
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
};
