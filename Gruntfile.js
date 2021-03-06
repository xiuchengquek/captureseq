/**
 * Created by xiuchengquek on 25/02/2016.
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
                    src: [//'public/lib/jquery/dist/jquery.min.js',
                      'public/lib/jquery/dist/jquery.min.js',
                      'public/lib/jquery-ui-custom/jquery-ui.min.js',
                      'public/lib/lokijs/build/lokijs.min.js',
                      'public/lib/boostrap/dist/js/boostrap.min.js',
                      'public/lib/angular/angular.min.js',
                      'public/lib/lodash/dist/lodash.min.js',
                      'public/lib/d3/d3.min.js',
                      'public/lib/dalliance/dalliance-compiled.js',
                      'public/lib/angular-multiselect-npm/dist/prod/angular-multi-select.min.js',
                      'public/lib/angular-smart-table/dist/smart-table.min.js'


                     ],
                dest: 'captureseq/static/js/dependencies.js'

            },
            user_code : {

                    src: ['captureseq/capseq/static/js/*.js','captureseq/capseq/static/js/genomeView/*.js' ],
                    dest: 'captureseq/capseq/static/js/built/capseq.built.js'
            },
             user_code_local : {

                    src: ['captureseq/capseq/static/js/*.js','captureseq/capseq/static/js/genomeView/*.js' ],
                    dest: 'captureseq/static_local/js/built/capseq.built.js'
            },
        },
        cssmin: {
            options: {},
            target : {
                files: {
                    'captureseq/static/css/built.css': [

                        'public/lib/html5-boilerplate/dist/css/main.css',
                        'public/lib/html5-boilerplate/dist/css/normalize.css',
                        'public/lib/html5-boilerplate/dist/css/normalize.css',
                        'public/lib/bootstrap/dist/css/bootstrap.min.css',
                        'public/lib/jquery-ui-custom/jquery-ui.css',
                        'public/lib/angular-bootstrap/ui-bootstrap-csp.css',
                        'public/lib/dalliance/*.css',
                        'public/lib/angular-multiselect-npm/dist/prod/angular-multi-select.min.css',

                        'captureseq/capseq/static/css/app.css']
                }
            }
        },
        watch: {
            scripts:{
                files: ['captureseq/capseq/static/js/*.js','captureseq/capseq/static/js/genomeView/*.js'] ,
                tasks : ['concat'],
                option : {
                    spawn : false,
                }
            }
        },
        copy: {
            main : {
                files: [
                    {expand: true, cwd: 'public/lib/', src: ['components-font-awesome/**',
                    ], dest: 'captureseq/static/'}
                ]
            },
            jqueryui :{
              files : [
                {expand : true, cwd : 'public/lib/jquery-ui-custom/', src:['images/**'],
                  dest:'captureseq/static/css/'}
              ]
            },
          multiselect :{
              files : [
                {expand : true, cwd : 'public/lib/multi-select/img', src:['switch.png'],
                  dest:'captureseq/static/img/'}
              ]
            },
          fonts : {
            files : [{expand: true, cwd : 'public/lib/bootstrap/fonts' , src : [ '**'], dest : 'captureseq/static/fonts/'}]
          }
        }
        });

    // Load the plugin that provides the "uglify" task.

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['concat','cssmin','copy','watch']);

};
