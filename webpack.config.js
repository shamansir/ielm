module.exports = {
    entry: {
      'app': [
        'whatwg-fetch',
        './index.js'
      ]
    },

    output: {
      filename: '[name].js',
    },

    module: {
      loaders: [
        {
          test:    /\.elm$/,
          exclude: [/elm-stuff/, /node_modules/],
          use: {
            loader:  'elm-webpack-loader',
            options: {
              cwd: './build',
              verbose: true,
              warn: true
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            { loader: "style-loader" },
            { loader: "css-loader" }
          ]
        }
      ],
      noParse: /\.elm$/,
    },

    devServer: {
      inline: true,
      stats: { colors: true },
    }
  };
