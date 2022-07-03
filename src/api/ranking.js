import { request } from './config.js'

/** 获取排行榜榜单 */
const _getRankList = () => {
  return request({
    url: '/toplist'
  })
}

export { _getRankList }
