module.exports = function(grunt)
{
    var standalone = [
			'src/vendor/jshashtable-2.1_src.js',
			'src/vendor/jquery.dependClass-0.1.js',
			'src/vendor/jquery.numberformatter-1.2.3.js',
			'build/js/SliderTemplate.js',
			'build/js/SliderUXComponent.js',
			'build/js/SliderLimitLabel.js',
			'build/js/SliderValueLabel.js',
			'build/js/SliderDraggable.js',
			'build/js/SliderPointer.js',
			'build/js/Slider.js',
			'build/js/Bootstrap.js',
			'build/js/helpers/MathHelper.js'
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
