import axios from 'axios'
import router from '../router/'

// 配置默认值
// const baseURL = 'https://music.eleuu.com/'
const timeout = 7000
const withCredentials = true
const baseURL = 'https://netease-cloud-music-api-coral-eight.vercel.app/'

export function request (config = {}) {
  const instance = axios.create({
    baseURL,
    timeout,
    withCredentials
  })

  // 设置请求次数，请求的间隙
  instance.defaults.retry = 4 // 重新发送请求次数
  instance.defaults.retryDelay = 1000 // 每次重新发送请求的间隔时间

  // config.params.realIP = '172.17.10.75:8080'
  // 给instance实例对象添加请求拦截器和响应拦截器
  instance.interceptors.request.use(config => {
    const targetURL = config.url
    if (targetURL === '/search/hot' || targetURL === '/toplist') {
      return config
    } else {
      config.params.realIP = '116.25.146.177'
      return config
    }
  }, error => {
    return Promise.reject(error)
  })

  instance.interceptors.response.use(config => {
    return config
  }, error => {
    /** 下面是对网络请求超时的处理，解决的思路就是反复请求 */
    if (error.response) {
      // console.log('err' + error) // for debug
      switch (error.response.status) {
        case 401:
          router.push('/recommend')
          break
        case 404:
          break
        case 500:
          break
      }
    }

    // 处理超时的情况
    const config = error.config
    // If config does not exist or the retry option is not set, reject
    if (!config || !config.retry) return Promise.reject(error)

    // Set the variable for keeping track of the retry count
    config.__retryCount = config.__retryCount || 0

    // Check if we've maxed out the total number of retries
    if (config.__retryCount >= config.retry) {
      // Reject with the error
      return Promise.reject(error)
    }

    // 增加重试次数
    config.__retryCount += 1

    // Create new promise to handle exponential backoff
    const backoff = new Promise(function (resolve) {
      setTimeout(function () {
        resolve()
      }, config.retryDelay || 1)
    })

    // Return the promise in which recalls axios to retry the request
    return backoff.then(function () {
      return instance(config)
    })

    // return Promise.reject(error)
  })

  // 然后改实例出去
  return instance(config)
}
