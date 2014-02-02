module.exports = function(grunt)
{

    grunt.config('watch', {
        stylesheets: {
            files: 'src/**/*.less',
            tasks: [ 'newer:less']
        },
        typescript: {
            files: 'js/**/*.ts',
            tasks: ['newer:typescript:build']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
};
