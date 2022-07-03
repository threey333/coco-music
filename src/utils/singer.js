/* 工厂模式创建我们想要的歌手数据格式 */

export default class Singer {
  // eslint-disable-next-line
  constructor({ singerID, singerName, singerImage, musicSize }) {
    this.type = 'singer'
    this.id = singerID
    this.name = singerName
    this.picUrl = singerImage
    this.musicSize = musicSize
  }
}

export function createSinger (singerListData) {
  return new Singer({
    singerID: singerListData.id,
    singerName: filterSingerName(singerListData.alias, singerListData.name),
    singerImage: singerListData.picUrl,
    musicSize: singerListData.musicSize
  })
}

/**
 *
 * @param {Array} alias 歌手的别名
 * @param {String} name  歌手的名字
 */
function filterSingerName (alias, name) {
  if (alias.length === 0) {
    return name
  } else {
    return name + ` (${alias[0]})`
  }
}
