module.exports = function(grunt)
{
    grunt.config('less', {
        build: {
            options: {
                paths: ["dist"]
            },
            files: {
                "dist/all.css": "less/main.less"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
};
