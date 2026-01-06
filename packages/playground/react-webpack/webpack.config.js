const path = require('node:path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { reactDevToolsPlus } = require('react-devtools-plus/webpack')
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
                  ['@babel/preset-react', {
                    runtime: 'automatic',
                    // development 开启时，React Fiber 下存在_debugSource，可用于定位源码位置
                    development: true,
                  }],
                  ['@babel/preset-typescript', { isTSX: true, allExtensions: true, allowDeclareFields: true }],
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
    reactDevToolsPlus({
      launchEditor: 'cursor',
      enabledEnvironments: ['development', 'test'],
      plugins: [
        {
          name: 'my-plugin',
          view: {
            title: 'My Plugin',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>',
            src: path.resolve(__dirname, './src/plugins/MyPlugin.jsx'),
          },
        },
      ],
      // Enable React Scan auto-injection
      scan: {
        enabled: true, // Enable injection, but controlled by showToolbar/DevTools
        showToolbar: false,
        animationSpeed: 'fast',
      },
    }),
  ],
  devServer: {
    host: 'localhost',
    port: 3004,
    hot: true,
    open: false,
  },
}
