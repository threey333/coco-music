import { request } from './config.js'

// 热搜关键词
const _searchKeyWords = () => {
  return request({
    url: '/search/hot'
  })
}

// 搜索
const _search = (keywords, limit, offset) => {
  return request({
    url: '/search',
    params: {
      keywords,
      limit,
      offset
    }
  })
}

// 搜索建议
const _searchSuggest = (keywords, type) => {
  return request({
    url: '/search/suggest',
    params: {
      keywords,
      type
    }
  })
}

// 搜索多重匹配
const _searchMoreMatch = (keywords) => {
  return request({
    url: '/search/multimatch',
    params: {
      keywords
    }
  })
}

export { _searchKeyWords, _searchSuggest, _searchMoreMatch, _search }
