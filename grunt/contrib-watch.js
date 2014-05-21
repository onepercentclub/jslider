module.exports = function(grunt)
{

    grunt.config('watch', {
        stylesheets: {
            files: 'src/**/*.less'
            //tasks: [ 'newer:less']
        },
        typescript: {
            files: 'src/**/*.ts',
            tasks: [
            //    'newer',
                'ts:build',
                'ts:development-tests',
                'karma:ci'
            ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
};
