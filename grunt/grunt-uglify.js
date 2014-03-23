module.exports = function(grunt)
{

    var standalone = [
            'src/vendor/jshashtable-2.1_src.js',
            'src/vendor/jquery.dependClass-0.1.js',
            'src/vendor/jquery.numberformatter-1.2.3.js',
            'src/js/SliderUXComponent.js',
            'src/js/SliderLimitLabel.js',
            'src/js/SliderValueLabel.js',
            'src/js/SliderTemplate.js',
            'src/js/SliderDraggable.js',
            'src/js/SliderPointer.js',
            'src/js/Slider.js',
            'src/js/Bootstrap.js'
        ],
        bundled = [
            'src/vendor/hammerjs/hammer.js'
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
