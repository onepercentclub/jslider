module.exports = function(grunt)
{

    var jsStandAlone = [
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
    ];

    var jsBundle = [
        'src/vendor/hammerjs/hammer.js'
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
