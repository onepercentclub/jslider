module.exports = function (grunt) {

    grunt.config('ts', {
        'build': {
            src: [
                "src/js/**/*.ts"
            ],
            outDir:'build/js',
            options: {
                sourceMap: true,
                declaration: false,
                removeComments: true,
                fast: 'always'
            }
        },
        'development-tests':{
            src: [
                "src/tests/**/*.ts",
                "src/tests/*.ts"
            ],
            outDir:'build/tests',
            options: {
                sourceMap: true,
                declaration: false,
                removeComments: true,
                fast: 'always'
            }
        }
    });

    grunt.loadNpmTasks('grunt-ts');
};