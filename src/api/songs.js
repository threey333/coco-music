import { request } from './config.js'

// 获取歌曲url
export const _getSongsURL = (songID) => {
  return request({
    url: '/song/url',
    params: {
      id: typeof songID === 'number' ? songID : songID.join(',')
    }
  })
}

// 获取歌曲详情
export const _getSongDetail = (ids) => {
  return request({
    url: '/song/detail',
    params: {
      ids
    }
  })
}
