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
          test: /\.css$/,
          use: [
            { loader: "style-loader" },
            { loader: "css-loader" }
          ]
        },
        {
          test: /\.elm$/,
          loader: 'ignore-loader'
        },
        {
          test: /^build\//,
          loader: 'ignore-loader'
        }
      ],
      noParse: /\.elm$/
    },

    devServer: {
      inline: true,
      stats: { colors: true }
    }
  };
