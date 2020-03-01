const path = require('path');//path是Nodejs中的基本包,用来处理路径
const webpack = require('webpack');//引入webpack
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HTMLPlugin = require('html-webpack-plugin');//引入html-webpack-plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const isDev = process.env.NODE_ENV === 'development';//判断是否为测试环境,在启动脚本时设置的环境变量都是存在于process.env这个对象里面的

const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base');

const defaultPlugins = [ // 这个配置只在client里面使用，后期的服务端渲染不需要此配置，所以不放在base配置里
    new VueLoaderPlugin(),
    new HTMLPlugin(),
    new webpack.DefinePlugin({//主要作用是在此处可以根据isdev配置process.env,一是可以在js代码中可以获取到process.env,二是webpack或则vue等根据process.env如果是development,会给一些特殊的错误提醒等,而这些特殊项在正式环境是不需要的
        'process.env': {
            NODE_ENV: isDev ? '"development"' : '"production"'
        }
    })
];
const devServer = {
    port: 8000,//访问的端口号
    host: '0.0.0.0',//可以设置0.0.0.0 ,这样设置你可以通过127.0.0.1或则localhost去访问
    overlay: {
        errors: true//编译中遇到的错误都会显示到网页中去
    },
     // open: true ,                                 //项目启动时,会默认帮你打开浏览器
    hot: true//在单页面应用开发中,我们修改了代码后是整个页面都刷新,开启hot后,将只刷新对应的组件
};
let config;

if(isDev) {
    config = merge(baseConfig, {
        devtool: '#cheap-module-eval-source-map',
        module: {
            rules: [
                {
                    test: /\.styl(us)?$/,
                    // use: [
                    //     'vue-style-loader',//将css写入到html中去 vue-loader版本大于^15.0时要求使用vue-style-loader
                    //     // 'css-loader',//css-loader处理css
                    //     // 使用css Modules
                    //     {
                    //         loader: 'css-loader',
                    //         options: {
                    //             // 开启CSS Modules
                    //             modules: true,
                    //             camelCase: true,
                    //             // 自定义生成的类名
                    //             localIdentName: '[path]-[name]-[hash:base64:5]' // 编译之后生成的新的css名称
                    //         }
                    //     }, {
                    //         loader: 'postcss-loader',
                    //         options: {
                    //             sourceMap: true//stylus-loader和postcss-loader自己都会生成sourceMap,如果前面stylus-loader已生成了sourceMap,那么postcss-loader可以直接引用前面的sourceMap
                    //         }
                    //     },
                    //     'stylus-loader'//处理stylus的css预处理器的问题件,转换成css后,抛给上一层的css-loader
                    // ]

                    // 只在某些Vue组件中使用 CSS Modules,可以使用oneOf规则并在recourceQuery字符串中检查module字符串
                    oneOf: [
                        // 这里匹配`<style module>`
                        {
                            resourceQuery: /module/,
                            use: [
                                'vue-style-loader',
                                {
                                    loader: 'css-loader',
                                    options: {
                                        modules: true,
                                        camelCase: true,
                                        localIdentName: '[path]-[name]-[hash:base64:5]'
                                    }
                                }, {
                                    loader: 'postcss-loader',
                                    options: {
                                        sourceMap: true
                                    }
                                },
                                'stylus-loader'
                            ]
                        },
                        // 这里匹配普通的`<style>`或者`<style scoped>`
                        {
                            use: [
                                'vue-style-loader',
                                'css-loader',
                                {
                                    loader: 'postcss-loader',
                                    options: {
                                        sourceMap: true
                                    }
                                },
                                'stylus-loader'
                            ]
                        }
                    ]
                }
            ]
        },
        devServer,
        plugins: defaultPlugins.concat([
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin() // 过滤error
        ])
    })
} else {
    config = merge(baseConfig, {
        entry: {
            app: path.join(__dirname, '../client/index.js'),
            vendor: ['vue']
        },
        output: {
            filename: '[name].[chunkhash:8].js'//此处一定是chunkhash,因为用hash时app和vendor的hash码是一样的了,这样每次业务代码更新,vendor也会更新,也就没有了意义.
        },
        module: {
            rules: [
                {
                    test: /\.styl(us)?$/,
                    // use: [
                    //     MiniCssExtractPlugin.loader,
                    //     // 'vue-style-loader',
                    //     'css-loader',
                    //     {
                    //         loader: 'postcss-loader',
                    //         options: {
                    //             sourceMap: true
                    //         }
                    //     },
                    //     'stylus-loader'
                    // ]
                    oneOf: [
                        // 这里匹配`<style module>`
                        {
                            resourceQuery: /module/,
                            use: [
                                MiniCssExtractPlugin.loader,
                                {
                                    loader: 'css-loader',
                                    options: {
                                        modules: true,
                                        camelCase: true,
                                        localIdentName: '[hash:base64:5]'
                                    }
                                }, {
                                    loader: 'postcss-loader',
                                    options: {
                                        sourceMap: true
                                    }
                                },
                                'stylus-loader'
                            ]
                        },
                        // 这里匹配普通的`<style>`或者`<style scoped>`
                        {
                            use: [
                                MiniCssExtractPlugin.loader,
                                'css-loader',
                                {
                                    loader: 'postcss-loader',
                                    options: {
                                        sourceMap: true
                                    }
                                },
                                'stylus-loader'
                            ]
                        }
                    ]
                }
            ]
        },
        plugins: defaultPlugins.concat([
            new MiniCssExtractPlugin({
                filename: '[name].[contenthash:8].css' //定义打包分离出的css文件名
            }),
            //webpack4舍弃掉了CommonsChunkPlugin，改用SplitChunksPlugin,
            //至于打包runtime代码 webpack4直接调用新的方法 ok 完事 RuntimeChunkPlugin
            new webpack.optimize.SplitChunksPlugin({
                name: 'vendor'//定义静态文件打包
            }),
            new webpack.optimize.RuntimeChunkPlugin({
                name: 'runtime'//将app.js文件中一些关于webpack文件的配置单独打包出为一个文件,用于解决部分浏览器长缓存问题 
            }),
            new MiniCssExtractPlugin({
                filename: 'style.css'
            })
        ])
    })
}

module.exports = config; //声明一个config的配置,用于对外暴露