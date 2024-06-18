const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    setupMiddlewares: (middlewares, devServer) => {
      // Custom middleware before existing middlewares
      middlewares.unshift((req, res, next) => {
        console.log('Before middleware');
        next();
      });

      // Custom middleware after existing middlewares
      middlewares.push((req, res, next) => {
        console.log('After middleware');
        next();
      });

      return middlewares;
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};
