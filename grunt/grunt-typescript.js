module.exports = function(grunt)
{

    grunt.config('typescript', {
        build: {
            src: [
                'src/js/**/*.ts',
                'src/js/*.ts'
            ],
            dest: 'src/js',
            options: {
                module: 'amd',
                target: 'es5',
                base_path: 'src/js',
                sourcemap: false,
                declaration: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-typescript');
};
