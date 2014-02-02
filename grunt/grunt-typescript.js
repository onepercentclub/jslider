module.exports = function(grunt)
{

    grunt.config('typescript', {
        build: {
            src: [
                'js/**/*.ts',
                'js/*.ts'
            ],
            dest: 'js',
            options: {
                module: 'amd',
                target: 'es5',
                base_path: 'js',
                sourcemap: false,
                declaration: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-typescript');
};
