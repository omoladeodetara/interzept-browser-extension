const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {  entry: {
    options: path.resolve('src/pages/options/index.tsx'),
    background: path.resolve('src/background/index.ts'),
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
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '.' },
        { from: 'manifest.json', to: '.' },
      ],
    }),    new HtmlWebpackPlugin({
      template: path.resolve('src/pages/options/index.html'),
      filename: 'options.html',
      chunks: ['options'],
    }),
  ],  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },
};
