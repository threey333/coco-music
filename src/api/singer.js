import { request } from './config.js'

// 获取歌手
const _getSingerList = (area, limit, name = -1, type, offset) => {
  return request({
    url: '/artist/list',
    params: {
      area,
      limit,
      initial: name, // 按首字母索引查找参数
      type,
      offset // 偏移数量，用于分页
    }
  })
}

// 获取歌手热门50首歌曲
const _getSingerHotsongs = (id) => {
  return request({
    url: '/artist/top/song',
    params: {
      id
    }
  })
}

// 获取歌手专辑
const _getSingerAlbum = (id) => {
  return request({
    url: '/artist/album',
    params: {
      id
    }
  })
}

export { _getSingerList, _getSingerHotsongs, _getSingerAlbum }
