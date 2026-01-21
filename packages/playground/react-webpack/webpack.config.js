const path = require('node:path')
// 导入独立打包的插件
const { SamplePlugin } = require('@react-devtools-plus/sample-plugin')
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
      // enabledEnvironments: ['development', 'test'],
      plugins: [
        // ✨ 新 API：可调用格式（推荐）
        // 所有配置内置于插件中，用户只需调用即可
        SamplePlugin(),

        // ✨ 旧 API：对象格式（仍然支持）
        // 本地插件使用字符串路径，由 Webpack 处理热更新
        {
          name: 'my-plugin',
          title: 'My Plugin',
          icon: 'lucide:puzzle',
          view: { src: './src/plugins/MyPlugin.jsx' },
        },

        // ✨ Iframe 插件
        // type 可省略，会自动检测 http/https URL
        {
          name: 'external-docs',
          title: 'React Docs',
          icon: 'ph:book-open-fill',
          view: { type: 'iframe', src: 'https://react.dev' },
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
