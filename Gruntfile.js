module.exports = function(grunt)
{
    grunt.initConfig({
        pkg: require('./package.json')
    });

    grunt.loadTasks('grunt');

    grunt.registerTask('dev',
        'Prepares for development, sets up watch.',
        [
            'clean:development',
            //'less:development',
            'ts:build',
            'ts:development-tests',
            'karma',
        ]
    );

    grunt.registerTask('development',
        'Prepares for development, sets up watch.',
        [
            'dev',
            'watch'
        ]
    );

    grunt.registerTask('build',
        'Compiles LESS, builds JS, and uglifies it',
        [
            //'less:build',
            'ts:build',
            'concat',
            'uglify'
        ]
    );

    grunt.registerTask('build:js',
        'Minifies JS.',
        [
            'ts:build',
            'concat',
            'uglify'
        ]
    );

    grunt.registerTask('build:less',
        'Minifies JS.',
        [
            'less:build',
            'concat',
            'uglify'
        ]
    );
};
