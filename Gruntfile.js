module.exports = function(grunt)
{
    grunt.initConfig({
        pkg: require('./package.json')
    });

    grunt.loadTasks('grunt');

    grunt.registerTask('deploy',
        'Compiles LESS, minifies JS.',
        [
            'less:build',
            'typescript:build',
            'concat',
            'uglify'
        ]
    );

    grunt.registerTask('build:js',
        'Minifies JS.',
        [
            'typescript:build',
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
