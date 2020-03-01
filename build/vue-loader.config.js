module.exports = (isDev) => { // 根据不同的环境生成不同的配置
    return {
        preserveWhiteSpace: true, // 去掉元素之间的空格
        extractCss: !isDev, // 单独提取css文件
        // cssModules: { // 避免css全局明明冲突
        //     localIdentName: '[path]-[name]-[hash:base64:5]', // 编译之后生成的新的css名称
        //     camelCase: true,
        //     modules: true
        // },
        // hotReload: false, // 根据环境变量生成，false 则会关闭vue组件的热重载，但是样式的热重载是又vue-style-loader决定的
        preLoader: {
            // js: // 这部分loader解析完成之后会再去用bable-loader解析这部分的代码
        },
        postLoader: { // 用的比较少

        }
    }
}