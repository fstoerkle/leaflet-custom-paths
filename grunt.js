module.exports = function(grunt) {
    var jsFiles = ['grunt.js', 'src/**/*.js', '*.js'];

    grunt.initConfig({
        lint: {
            all: jsFiles
        }
    });

    grunt.registerTask('default', 'lint');
};