import { request } from './config.js'

// 获取轮播图
const _getBanner = () => {
  return request({
    method: 'GET',
    url: '/banner',
    params: {}

  })
}

/** 推荐歌单 */
const _getSongList = (config) => {
  return request({
    method: 'GET',
    url: '/personalized',
    params: {
      limit: config
    }

  })
}

/* 获取歌单/排行榜的详情 */
const _getsongsheetDetail = (config) => {
  return request({
    method: 'GET',
    url: '/playlist/detail',
    params: {
      id: config
    },
    timeout: 8000
  })
}

export { _getBanner, _getSongList, _getsongsheetDetail }
