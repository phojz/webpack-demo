const webpack = require('webpack')
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const uglify = require("uglifyjs-webpack-plugin"); //压缩js
const PurifyCSSPlugin = require("purifycss-webpack"); //去掉无用的css
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin"); // 压缩css
// 用terser-webpack-plugin替换uglifyjs-webpack-plugin，可以解决es6语法问题
const TerserPlugin = require("terser-webpack-plugin");
const glob = require("glob");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const website = {
  // publicPath: "http://localhost:8080/",
  publicPath: "",
};
module.exports = {
  entry: {
    // lodash: __dirname + "/../app/lodash.js",
    main: __dirname + "/../app/main.js",
    // list: __dirname + "/../app/list.js",
    common: __dirname + "/../app/common.js"
  },
  output: {
    path: __dirname + "/../distTmp",
    publicPath: website.publicPath, //publicPath：主要作用就是处理静态文件路径的。
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@img': path.resolve(__dirname, '../app/images/')
      // '@img': '../app/images/'
    }
  },
  stats: {
    //简化打包信息
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // "style-loader",
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
          // 这个插件好像不用这个，引入就报错
          // "style-loader",
        ],
      },
      {
        test: /\.less$/,
        use: [
          // "style-loader",
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              importLoaders: 2, //  使less中引入less可用
            },
          },
          "css-loader",
          "postcss-loader",
          "less-loader",
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 500, //是把小于500B的文件打成Base64的格式，写入JS
              outputPath: "images/", //打包后的图片放到images文件夹下
              esModule: false, //设置为false,不然图片路径上会带有个default
            },
          },
        ],
      },
      // {
      //   test: /\.ico$/,
      //   loader: "file-loader",
      // },
      // 解决的问题就是在html文件中引入<img>标签
      {
        test: /\.(htm|html)$/,
        use: ["html-withimg-loader"],
      },
      {
        test: /\.(jsx|js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ]
      },
      // {
      //   test: require.resolve('./../app/main.js'),
      //   use: {
      //     // 这种方法会报错
      //     // {
      //     //   loader: "imports-loader?this=>window",
      //     // }
      //     // 改变this指向，指向window
      //     loader: 'imports-loader',
      //     options: {
      //       wrapper: 'window',
      //     }
      //   }
      // }
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      minify: false,
      hash: true, //为了开发中js有缓存效果，所以加入hash，这样可以有效避免缓存JS。
      filename: "index.html",
      template: "./app/index.html",
      // favicon: "./app/favicon.ico",
      chunks: ['runtime', 'vendors', 'main', 'common']
    }),
    // new HTMLWebpackPlugin({
    //   minify: false,
    //   hash: true, 
    //   filename: "list.html",
    //   template: "./app/list.html",
    //   chunks: ['runtime', 'vendors', 'list', 'common']
    // }),
    // 清理上次打包文件
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "style.css",
      // chunkFilename: "[name].chunk.css"
    }),
    // new uglify(),
    // new PurifyCSSPlugin({
    //   //这里配置了一个paths，主要是需找html模板，purifycss根据这个配置会遍历你的文件，查找哪些css被使用了。
    //   paths: glob.sync(path.join(__dirname, "*.html")),
    // }),
    // 压缩css
    new OptimizeCSSAssetsPlugin({
      assetNameRegExp: /\.css$/g, //用于匹配需要优化或者压缩的资源名
      cssProcessor: require("cssnano"), //用于压缩和优化CSS 的处理器  
      cssProcessorOptions: { discardComments: { removeAll: true } }, //去除注释
      canPrint: true, //表示插件能够在console中打印信息
    }),
    // 开启gzip压缩
    new CompressionPlugin({
      filename: '[path].gz[query]', //目标资源名称。[file] 会被替换成原资源。[path] 会被替换成原资源路径，[query] 替换成原查询字符串
      algorithm: "gzip", //算法
      test: new RegExp(
        "\\.(js|css)$" //压缩 js 与 css
      ),
      threshold: 10240, //只处理比这个值大的资源。按字节计算
      minRatio: 0.8, //只有压缩率比这个值小的资源才会被处理
    }),
    // new BundleAnalyzerPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery',
      _join: ['lodash', 'join']
    }),
  ],
  optimization: {
    // runtimeChunk: {
    //   name: 'runtime'
    // },
    minimize: true,
    usedExports: true, // Tree shaking用
    minimizer: [
      new OptimizeCSSAssetsPlugin({}),
      // 为方便看效果，先关闭压缩js代码插件
      // new TerserPlugin({
      //   test: /\.js(\?.*)?$/i,
      // }),
    ],
    usedExports: true,
    // 代码分割
    // splitChunks: {
    //   chunks: "all",
    //   // minSize: 30000,
    //   // maxSize: 50000,
    //   // minChunks: 1,
    //   // maxAsyncRequests: 5,
    //   // maxInitialRequests: 3,
    //   // automaticNameDelimiter: '~',
    //   // name: true,
    //   // cacheGroups: {
    //   //   vendors: {
    //   //     test: /[\\/]node_modules[\\/]/,
    //   //     priority: -10,
    //   //     filename: 'vendors.[contenthash:5].js',
    //   //   },
    //   //   default: {
    //   //     minChunks: 2,
    //   //     priority: -20,
    //   //     reuseExistingChunk: true,
    //   //     filename: 'vendors.js',
    //   //   }
    //   // }
    // },
  },
  // 不提示包过大的警告信息
  performance: false
};

