const path = require('node:path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactDevToolsPlugin = require('react-devtools/webpack').webpack
const webpack = require('webpack')

module.exports = {
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-react', { runtime: 'automatic' }],
                  ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
                ],
              },
            },
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          },
        ],
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
    // 自动注入 React
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    ReactDevToolsPlugin({
      enabledEnvironments: ['development', 'test'],
    }),
  ],
  devServer: {
    port: 3004,
    hot: true,
    open: false,
  },
}
