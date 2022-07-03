import { request } from './config.js'

// 歌词
const _getCurrentSongLyric = (id) => {
  return request({
    url: '/lyric',
    params: {
      id: id
    }
  })
}

export { _getCurrentSongLyric }
