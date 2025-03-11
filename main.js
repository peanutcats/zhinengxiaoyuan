import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false

// 添加路由拦截器
uni.addInterceptor({
  returnValue(res) {
    if (res && res.then) {
      return new Promise((resolve, reject) => {
        res.then((data) => {
          resolve(data)
        }).catch((err) => {
          reject(err)
        })
      })
    }
    return res
  }
})

uni.addInterceptor('switchTab', {
  invoke(args) {
    console.log('路由跳转：', args)
    return args
  },
  fail(err) {
    console.error('路由跳转失败：', err)
  }
})

uni.addInterceptor('navigateTo', {
  invoke(args) {
    console.log('路由跳转：', args)
    return args
  },
  fail(err) {
    console.error('路由跳转失败：', err)
  }
})

uni.addInterceptor('reLaunch', {
  invoke(args) {
    console.log('重新启动路由：', args)
    return args
  },
  fail(err) {
    console.error('重新启动失败：', err)
  }
})

App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif