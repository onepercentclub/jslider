module.exports = function(grunt)
{

    var standalone = [
        'lib/jshashtable-2.1_src.js',
        'lib/tmpl.js',
        'lib/jquery.dependClass-0.1.js',
        'lib/jquery.numberformatter-1.2.3.js',
        'js/jquery.sliderDraggable.js',
        'js/jquery.sliderPointer.js',
        'js/jquery.slider.js',
        'js/jquery.sliderBootstrap.js'
        ],
        bundled = [
            'lib/hammerjs/hammer.js'
        ];

    grunt.config('uglify', {
        options: {
            mangle: false
        },
        standalone: {
            files: {
                'dist/jquery.slider-standalone.min.js': standalone
            }
        },
        bundled: {
            files: {
                'dist/jquery.slider-bundled.min.js': bundled.concat(standalone)
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
};
