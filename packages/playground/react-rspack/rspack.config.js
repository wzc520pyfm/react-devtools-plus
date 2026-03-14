const path = require('node:path')
const { HtmlRspackPlugin } = require('@rspack/core')
const { reactDevToolsPlus } = require('react-devtools-plus/rspack')

/** @type {import('@rspack/core').Configuration} */
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
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'ecmascript',
                jsx: true,
              },
              transform: {
                react: {
                  runtime: 'automatic',
                  development: true,
                },
              },
            },
          },
        },
      },
      {
        test: /\.css$/,
        type: 'css',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  plugins: [
    new HtmlRspackPlugin({
      template: './public/index.html',
    }),
    reactDevToolsPlus({
      launchEditor: 'cursor',
    }),
  ],
  experiments: {
    css: true,
  },
  devServer: {
    host: 'localhost',
    port: 3008,
    hot: true,
    open: false,
  },
}
