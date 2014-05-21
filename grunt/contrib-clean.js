module.exports = function (grunt) {

    grunt.config('clean', {
        development: {
            src: [ 'build/*','.tscache/*' ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
};
