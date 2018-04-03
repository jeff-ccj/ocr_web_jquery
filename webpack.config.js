const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
    vendor: ['lodash']
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: './src/index.html',   // 指定产出的模板
      filename: 'index.html',          // 产出的文件名
      chunks: ['common', 'base'],     // 在产出的HTML文件里引入哪些代码块
      hash: true,                     // 名称是否哈希值
      title: 'base',                  // 可以给模板设置变量名，在html模板中调用 htmlWebpackPlugin.options.title 可以使用
      minify: {                       // 对html文件进行压缩
        removeAttributeQuotes: true // 移除双引号
      }
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader?sourceMap']
      },
      {
        test: /\.less$/,
        use: ['css-loader?minimize', 'less-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
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
        test: /\.(html)$/,
        use: 'html-withimg-loader',
        include: path.join(__dirname,'./src'),
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: "initial",         // 必须三选一： "initial" | "all"(默认就是all) | "async"
      minSize: 0,                // 最小尺寸，默认0
      minChunks: 1,              // 最小 chunk ，默认1
      maxAsyncRequests: 1,       // 最大异步请求数， 默认1
      maxInitialRequests: 1,    // 最大初始化请求书，默认1
      name: () => {},              // 名称，此选项课接收 function
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
  output: {
    path: path.join(__dirname, "dist"),
    // filename: "[name].js",
    // chunkFilename: "[name].chunk.js"
  },
  devServer:{
    contentBase: path.resolve(__dirname, 'src'),// 配置开发服务运行时的文件根目录
    host: 'localhost',// 开发服务器监听的主机地址
    compress: true,   // 开发服务器是否启动gzip等压缩
    inline: true,
    hot: true,
    port: 8088        // 开发服务器监听的端口
  },

};