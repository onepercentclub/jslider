module.exports = function(grunt)
{
    grunt.config('less', {
        build: {
            options: {
                paths: ["dist"],
                rootpath:'/',
                relativeUrls:true,
                cleancss: true,
                ieCompat:true
            },
            files: {
                "dist/css/jquery.jslider-all.css": [
                    "dist/less/jslider.base.less",
                    "dist/less/jslider.skin.blue.less",
                    "dist/less/jslider.skin.plastic.less",
                    "dist/less/jslider.skin.round.less",
                    "dist/less/jslider.skin.round.plastic.less",
                    "dist/less/jslider.skin.fancy.round.less"
                ],
                "dist/css/jquery.jslider-base.css": "dist/less/jslider.base.less",
                "dist/css/jquery.jslider-blue.css": "dist/less/jslider.skin.blue.less",
                "dist/css/jquery.jslider-plastic.css": "dist/less/jslider.skin.plastic.less",
                "dist/css/jquery.jslider-round.css": "dist/less/jslider.skin.round.less",
                "dist/css/jquery.jslider-round-plastic.css": "dist/less/jslider.skin.round.plastic.less",
                "dist/css/jquery.jslider-fancy-round.css": "dist/less/jslider.skin.fancy.round.less"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
};
