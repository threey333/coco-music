const cdn = {
  js: [
    'https://lib.baomitu.com/vue/2.6.14/vue.min.js',
    'https://lib.baomitu.com/axios/0.21.4/axios.min.js',
    'https://lib.baomitu.com/vuex/3.6.2/vuex.min.js',
    'https://lib.baomitu.com/vue-router/3.5.2/vue-router.min.js'
  ]
}

module.exports = {
  publicPath: './',
  assetsDir: 'static',
  css: {
    loaderOptions: {
      sass: {
        // sass-loader版本9以上使用的是additionalData
        additionalData: `
          @import "@/assets/scss/variable.scss";
          @import "@/assets/scss/mixin.scss";
        `
      }
    }
  },
  chainWebpack: config => {
    // 生产环境
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')
      config.set('externals', {
        vue: 'Vue',
        axios: 'axios',
        vuex: 'Vuex',
        'vue-router': 'VueRouter'
      })
      config.plugin('html').tap(args => {
        args[0].isProd = true
        args[0].cdn = cdn
        args[0].title = 'WebMusicApp'
        args[0].meta = true
        return args
      })
    })
    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main.js')
      config.plugin('html').tap(args => {
        args[0].isProd = false
        args[0].cdn = null
        return args
      })
    })
  }

}
