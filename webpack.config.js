/**
 * @file
 * @copyright 2020 Aleksej Komarov
 * @license MIT
 */

const path = require('path');

const createStats = verbose => ({
  assets: verbose,
  builtAt: verbose,
  cached: false,
  children: false,
  chunks: false,
  colors: true,
  hash: false,
  timings: verbose,
  version: verbose,
  modules: false,
});

module.exports = (env = {}, argv) => {
  const config = {
    mode: argv.mode === 'production' ? 'production' : 'development',
    context: path.resolve(__dirname),
    target: 'node',
    entry: {
      cbt: './src/index.ts',
    },
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: '[name].js',
      library: 'cbt',
      libraryTarget: 'umd',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {},
    },
    module: {
      rules: [
        {
          test: /\.m?(j|t)sx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', {
                    modules: 'commonjs',
                    spec: false,
                    loose: true,
                    targets: {
                      node: '12',
                    },
                  }],
                  '@babel/preset-typescript',
                ],
                plugins: [],
              },
            },
          ],
        },
      ],
    },
    optimization: {
      emitOnErrors: false,
    },
    performance: {
      hints: false,
    },
    devtool: false,
    stats: createStats(true),
    plugins: [],
  };
  return config;
};
