const path = require('node:path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { reactDevToolsPlus } = require('react-devtools-plus/webpack')

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
              ['@babel/preset-typescript', { isTSX: true, allExtensions: true, allowDeclareFields: true }],
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
    // Force all packages to use the same React version from this package's node_modules
    // This fixes "Invalid hook call" errors caused by multiple React copies in pnpm monorepo
    alias: {
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      // React 17 doesn't have react-dom/client, so alias it to react-dom to prevent errors
      // The code in react-globals-init.js has try-catch to handle this gracefully
      'react-dom/client': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    reactDevToolsPlus({
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
