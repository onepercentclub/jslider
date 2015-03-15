// Karma configuration
// Generated on Wed Mar 26 2014 07:50:00 GMT+0100 (CET)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'lib/jquery/dist/jquery.js',
            'lib/hammerjs/hammer.js',
            'lib/jquery-hammerjs/jquery.hammer.js',
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
            'build/js/Bootstrap.js',
            'build/tests/**/*.js'
        ],

        junitReporter: {
            outputFile: 'build/junit.xml'
        },
        colors: true,

        // optionally, configure the reporter
        coverageReporter: {
            type : 'html',
            dir : 'build/coverage/'
        },

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'build/js/*.js': ['coverage'],
            'build/js/**/*.js': ['coverage']
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['dots', 'junit', 'coverage'],

        // web server port
        port: 9876,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
