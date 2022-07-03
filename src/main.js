import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 导入图片懒加载插件
import VueLazyload from 'vue-lazyload'

// 导入scss入口文件
import '@/assets/scss/index.scss'

Vue.use(VueLazyload, {
  loading: require('./assets/image/default.png')
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
