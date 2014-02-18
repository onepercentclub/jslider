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

    grunt.config('uglify', {
        options: {
            mangle: false
        },
        my_target: {
            files: {
                'dist/jquery.slider.min.js': jsOrder
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
};
