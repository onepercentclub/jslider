module.exports = function(grunt) {

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                src: [
                    'js/jshashtable-2.1_src.js',
                    'js/tmpl.js',
                    'js/jquery.dependClass-0.1.js',
                    'js/jquery.numberformatter-1.2.3.js',
                    'js/draggable-0.2.js',
                    'js/jquery.slider.js'
                ],
                dest: 'dist/jquery.slider.js'
            }
        },

        uglify : {
            options : {
                mangle : {
                    except : ['jQuery']
                }
            },
            main: {
                options: {
                    sourceMap: 'dist/jquery.slider.min.map'
                },
                files : {
                    'dist/jquery.slider.min.js' : [
                        'js/jshashtable-2.1_src.js',
                        'js/tmpl.js',
                        'js/jquery.dependClass-0.1.js',
                        'js/jquery.numberformatter-1.2.3.js',
                        'js/draggable-0.2.js',
                        'js/jquery.slider.js'
                    ]
                }
            }
        },
        cssmin : {
            compress : {
                files : {
                    "dist/jquery.slider.min.css" : ['css/jslider.css']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat','uglify', 'cssmin']);
};