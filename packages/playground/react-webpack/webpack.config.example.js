// Example webpack.config.js using React DevTools plugin
// This file demonstrates how to use the plugin in different scenarios

const path = require('node:path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// Option 1: Direct import (after build)
// const ReactDevToolsPlugin = require('react-devtools/webpack')

// Option 2: Using dynamic import (for ESM compatibility)
// Note: Webpack 5 supports async configs
// module.exports = async () => {
//   const { webpack: ReactDevToolsPlugin } = await import('react-devtools/webpack')
//   return {
//     // ... config
//     plugins: [
//       new HtmlWebpackPlugin({ template: './public/index.html' }),
//       ReactDevToolsPlugin({ enabledEnvironments: ['development', 'test'] }),
//     ],
//   }
// }

// Option 3: Synchronous require (current implementation)
let ReactDevToolsPlugin = null
try {
  const pluginModule = require('react-devtools/webpack')
  ReactDevToolsPlugin = pluginModule.webpack || pluginModule.default || pluginModule
}
catch (e) {
  console.warn('React DevTools plugin not available:', e.message)
}

module.exports = {
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    // Add React DevTools plugin if available
    ...(ReactDevToolsPlugin
      ? [ReactDevToolsPlugin({
          enabledEnvironments: ['development', 'test'],
        })]
      : []),
  ],
  devServer: {
    port: 3004,
    hot: true,
    open: true,
  },
}
