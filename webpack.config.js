module.exports = {
    entry: {
      'app': [
        'whatwg-fetch',
        './index.js'
      ]
    },

    output: {
      filename: 'ielm.js',
    },

    module: {
      loaders: [
        {
          test: /\.css$/,
          exclude: /build/,
          use: [
            { loader: "style-loader" },
            { loader: "css-loader" }
          ]
        }
      ],
      noParse: [ /\.elm$/, /^.\/build\// ]
    },

    externals:
      [
        function(context, request, callback) {
          // exclude ./ChunkNN_NN.js, ChunkNN_NN.js etc.
          if (/^\.?(\/)?Chunk\d+_\d+\.js$/.test(request)) {
            return callback(null, 'commonjs ' + request);
          }
          callback();
        }
      ],

    devServer: {
      inline: true,
      stats: { colors: true }
    }
  };
