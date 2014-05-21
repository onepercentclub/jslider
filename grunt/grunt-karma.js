module.exports = function (grunt) {

    grunt.config('karma', {
        options: {
            configFile: 'karma.conf.js',
            runnerPort: 9999,
            browsers: ['Chrome']
        },
        ci: {
            singleRun: true,
            browsers: ['Chrome'],
            reporters: ['dots', 'junit', 'coverage'],
            junitReporter: {
                outputFile: 'build/junit.xml'
            },
            colors: false,
            preprocessors: {
                // source files, that you wanna generate coverage for
                // do not include tests or libraries
                // (these files will be instrumented by Istanbul)
                'build/js/*.js': ['coverage']
            },

            // optionally, configure the reporter
            coverageReporter: {
                type : 'html',
                dir : 'build/coverage/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-karma');
};