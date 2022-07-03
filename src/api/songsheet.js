import { request } from './config.js'

const _getSongsheetList = (ids) => {
  return request({
    url: 'song/detail',
    params: {
      ids: ids
    }
  })
}

export { _getSongsheetList }
