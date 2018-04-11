const path = require('path');
const webpack = require("webpack");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: {
    index: './src/js/index.js',
    login: './src/js/login.js',
    vendor: ['lodash']
  },
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: '/'
    // filename: "[name].js",
    // chunkFilename: "[name].chunk.js"
  },
  watch: true,
  node: {
    fs: 'empty'
  },
  watchOptions: {
    ignored: /node_modules/, //忽略不用监听变更的目录
    aggregateTimeout: 500,  // 文件发生改变后多长时间后再重新编译（Add a delay before rebuilding once the first file changed ）
    poll:1000               //每秒询问的文件变更的次数
  },
  devtool: 'inline-source-map',
  resolve: {
    modules: [
      "node_modules"
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: './src/index.html',   // 指定产出的模板
      filename: 'index.html',          // 产出的文件名,
      inject: true,
      chunks: ['common', 'base'],     // 在产出的HTML文件里引入哪些代码块
    }),
    new HtmlWebpackPlugin({
      template: './src/login.html',   // 指定产出的模板
      filename: 'login.html',          // 产出的文件名,
      inject: true,
      chunks: ['common', 'base'],     // 在产出的HTML文件里引入哪些代码块
    }),
    new ExtractTextPlugin('css/style.css')
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader']
        })
      },
      {
        test: /\.less$/i,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader', 'less-loader']
        })
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components|src\/js\/lib)/,
        use: {
          loader: "babel-loader?cacheDirectory=true"
        },
        include: path.resolve(__dirname, 'src'),
      },
      {
        test: /\.(png|jpg|gif|svg|bmp|eot|woff|woff2|ttf)$/,
        loader: {
          loader: 'url-loader',
          options: {
            limit: 5 * 1024,// 图片大小 > limit 使用file-loader, 反之使用url-loader
            outputPath: 'images/'// 指定打包后的图片位置
          }
        }
      },
      {
        test: /\.(html|html)$/,
        use: 'html-withimg-loader',
        include: path.join(__dirname, './src'),
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: "all",         // 必须三选一： "initial" | "all"(默认就是all) | "async"
      minSize: 0,                // 最小尺寸，默认0
      minChunks: 1,              // 最小 chunk ，默认1
      maxAsyncRequests: 1,       // 最大异步请求数， 默认1
      maxInitialRequests: 1,    // 最大初始化请求书，默认1
      name: () => {
      },              // 名称，此选项课接收 function
      cacheGroups: {                 // 这里开始设置缓存的 chunks
        priority: "0",                // 缓存组优先级 false | object |
        vendor: {                   // key 为entry中定义的 入口名称
          chunks: "initial",        // 必须三选一： "initial" | "all" | "async"(默认就是异步)
          test: /react|lodash/,     // 正则规则验证，如果符合就提取 chunk
          name: "vendor",           // 要缓存的 分隔出来的 chunk 名称
          minSize: 0,
          minChunks: 1,
          enforce: true,
          maxAsyncRequests: 1,       // 最大异步请求数， 默认1
          maxInitialRequests: 1,    // 最大初始化请求书，默认1
          reuseExistingChunk: true   // 可设置是否重用该chunk（查看源码没有发现默认值）
        }
      }
    }
  },
  devServer: {
    historyApiFallback: true,
    contentBase: false,
    // contentBase: path.resolve(__dirname, 'src'),// 配置开发服务运行时的文件根目录
    host: 'localhost',// 开发服务器监听的主机地址
    compress: true,   // 开发服务器是否启动gzip等压缩
    inline: true,
    // hot: true,
    // hotOnly: true,
    port: 8088        // 开发服务器监听的端口
  },

};

console.log(path.resolve(__dirname, 'src'))