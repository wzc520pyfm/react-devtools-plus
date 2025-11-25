const path = require('node:path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactDevToolsPlugin = require('react-devtools/webpack').webpack

module.exports = {
  mode: 'development',
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-react', {
                runtime: 'classic',
                development: true,
              }],
              ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    ReactDevToolsPlugin({
      enabledEnvironments: ['development', 'test'],
      scan: {
        enabled: true,
        showToolbar: false,
        animationSpeed: 'fast',
      },
    }),
  ],
  devServer: {
    contentBase: './public',
    port: 3007,
    hot: true,
  },
}
