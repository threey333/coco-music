/* 工厂模式创建我们想要的数据格式 */
import { _getCurrentSongLyric } from '../api/lyric.js'

export default class Song {
  // eslint-disable-next-line
  constructor({ singerID, songid, songname, songdescribe, songImage, url, lyric }) {
    this.type = 'song'
    this.singerID = singerID
    this.songid = songid
    this.songname = songname
    this.songdescribe = songdescribe
    this.songImage = songImage
    if (url) {
      this.url = url
    }
    if (lyric) {
      this.lyric = lyric
    }
  }

  async getCurrentSongLyric () {
    if (this.lyric) {
      return this.lyric
    }
    const { data: res } = await _getCurrentSongLyric(this.songid)
    if (res.code === 200) {
      this.lyric = res.nolyric ? '该歌词暂时没有歌词' : res.lrc.lyric
      return this.lyric
    } else {
      throw new Error('no lyric')
    }
  }
}

export function createSong (songsData) {
  return new Song({
    singerID: songsData.ar[0].id,
    songid: songsData.id,
    songname: songsData.name + ' ' + filterSongname(songsData.alia, songsData.tns),
    songdescribe: filtersongdescribe(songsData.ar, songsData.al),
    songImage: songsData.al.picUrl
  })
}

// export function createSonged (songsData) {
//   return new Song({
//     singerID: songsData.singerID,
//     songid: songsData.songid,
//     songname: songsData.songname,
//     songdescribe: songsData.songdescribe,
//     songImage: songsData.songImage,
//     url: songsData.url,
//     lyric: songsData.lyric
//   })
// }

/**
 * 把歌区详情转换为:'本歌手名字/其它歌手 - xxx描述'
 * @param {Object} songdescribe 歌曲情况 {id:xxxx, name:xxxx}
 * @returns
 */
function filtersongdescribe (allsinger, songdescribe) {
  if (!songdescribe) {
    // eslint-disable-next-line
    return
  } else {
    const alls = []
    allsinger.forEach(item => {
      alls.push(item.name)
    })
    return alls.join('/') + ' - ' + songdescribe.name
  }
}

/**
 * 把歌曲名字转换为:'歌曲名称 (xxx歌曲描述)'
 * @param {Array} alia
 * @param {Array} tns
*/
function filterSongname (alia, tns) {
  // 如果alia数组长度不为0或者tns存在
  if (alia.length || tns) {
    return alia.length ? ' (' + alia[0] + ')' : ' (' + tns[0] + ')'
  } else {
    return ''
  }
}
