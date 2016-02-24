/**
 * Created by xiuchengquek on 25/02/2016.
 */
/**
 * Created by xiuchengquek on 21/02/2016.
 */



module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';\n',
            },
            libraries : {
                    src: ['public/lib/angular/angular.js',
                    'public/lib/angular-loader/angular-loader.js',
                    'public/lib/angular-route/angular-route.js',
                    'public/lib/angular-mocks/angular-mocks.js',
                    'public/lib/cytoscape/dist/cytoscape.js',
                    'public/lib/lodash/dist/lodash.js',
                     ],
                dest: 'captureseq/static/js/dependencies.js'

            },
            user_code : {

                    src: ['captureseq/capseq/static/js/*.js'],
                    dest: 'captureseq/capseq/static/js/built/capseq.built.js'



            },
        },
        cssmin: {
            options: {},
            target : {
                files: {
                    'static/css/built.css': [
                        'public/lib/html5-boilerplate/dist/css/main.css',
                        'public/lib/html5-boilerplate/dist/css/normalize.css',
                        'app/app.css']
                }
            }

        },

        watch: {
            scripts:{

                files: ['app/mainView/mainView.js', ' app/view2/app.js'],
                tasks : ['concat'],
                option : {
                    spawn : false,
                }
            }

        }


        });

    // Load the plugin that provides the "uglify" task.

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Default task(s).
    grunt.registerTask('default', ['concat','cssmin','watch']);

};
