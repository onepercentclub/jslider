module.exports = function(grunt)
{
    grunt.config('less', {
        build: {
            options: {
                paths: ["dist"]
            },
            files: {
                "dist/css/jquery.jslider-all.css": [
                    "less/styles.less",
                    "less/jslider.skin.blue.less",
                    "less/jslider.skin.plastic.less",
                    "less/jslider.skin.round.less",
                    "less/jslider.skin.round.plastic.less"
                ],
                "dist/css/jquery.jslider-base.css": "less/styles.less",
                "dist/css/jquery.jslider-blue.css": "less/jslider.skin.blue.less",
                "dist/css/jquery.jslider-plastic.css": "less/jslider.skin.plastic.less",
                "dist/css/jquery.jslider-round.css": "less/jslider.skin.round.less",
                "dist/css/jquery.jslider-round-plastic.css": "less/jslider.skin.round.plastic.less"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
};
