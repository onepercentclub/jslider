module.exports = function(grunt)
{
    grunt.initConfig({
        pkg: require('./package.json')
    });

    grunt.loadTasks('grunt');

    grunt.registerTask('build',
        'Copies resources, compiles LESS, minifies JS.',
        [
            'less:build',
            'typescript:build',
            'concat',
            'uglify'
        ]
    );

    grunt.registerTask('watch',
        'Copies resources, compiles LESS, minifies JS.',
        [
            'watch'
        ]
    );
};
