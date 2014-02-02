module.exports = function(grunt)
{

    grunt.config('recess', {
        development: {
            options: {
                zeroUnits: false
            },
            src: ["src/resources/less/main.less"]

        }
    });

    grunt.loadNpmTasks('grunt-recess');
};
