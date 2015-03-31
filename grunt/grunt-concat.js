module.exports = function(grunt)
{

    var jsStandAlone = [
        'src/vendor/jshashtable-2.1_src.js',
        'src/vendor/jquery.dependClass-0.1.js',
        'src/vendor/jquery.numberformatter-1.2.3.js',
        'build/js/helpers/MathHelper.js',
        'build/js/SliderTemplate.js',
        'build/js/SliderUXComponent.js',
        'build/js/SliderLimitLabel.js',
        'build/js/SliderValueLabel.js',
        'build/js/SliderDraggable.js',
        'build/js/SliderPointer.js',
        'build/js/Slider.js',
        'build/js/Bootstrap.js'
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
