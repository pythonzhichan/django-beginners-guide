module.exports = function(grunt){
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),


      // Define concat task
    concat: {
      dist: {
        src: [
        'src/prepend.js',
        'index.js',
        'src/append.js'
        ],
        dest: 'index.js'
      }
    },

    // Define string-replace task
    'string-replace': {
      options: {
        // replace var Opal = by Opal =
        replacements: [{
          pattern: /var\ (Opal\ =)/ig,
          replacement: '$1'
        },
        // quick fix to prevent process.stdxxx when we are in browser
        {
          pattern: /typeof\(process\) === 'object'/ig,
          replacement: "typeof(process) === 'object' && !process.browser"
        }]
      },
      dist: {
        files: {
          'index.js': ['bower_components/opal/opal/current/opal.js']
        }
      }
    },

    simplemocha: {
      options: {
        globals: ['should'],
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'tap'
      },

      all: { src: ['test/**/*.js'] }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-simple-mocha');

  // Define defaults task
  grunt.registerTask('default', ['string-replace', 'concat', 'simplemocha']);


};
