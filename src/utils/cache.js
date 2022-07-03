/* 缓存文件 */

import storage from 'good-storage'

const SEARCH_KEY = '__search__' // 设置search的key
const SEARCH_MAX_LEN = 15 // 设置保存search历史的最大存储空间为15

const PLAY_KEY = '__play__' // 设置play的key
const PLAY_MAX_LEN = 200

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LEN = 200

/**
 * 将查询历史的值插入到数组，如果数组中有了，把之前的删除掉，如果超过最大长度，把最后的剔除掉
 * @param {Array} arr 要插入的数组
 * @param {string} val 值
 * @param {func} compare 满足查找指定索引的回调函数
 * @param {int} maxLen 最大长度
 */
function insertArray (arr, val, compare, maxLen) {
  // 先找下这个数组中有没有这个值
  const index = arr.findIndex(compare) // findIndex是数组中的高阶函数
  // 如果索引为0，也就是第一个就满足
  if (index === 0) {
    return
  }
  // 数组中确实有这个值
  if (index > 0) {
    // 删除从 index 处开始的零个或多个元素
    arr.splice(index, 1)
  }
  // 插入到第一个
  arr.unshift(val)
  // 超出最大值，从最后剔除
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

// 从查询历史数组中删除某条查询历史记录
function deleteFromArray (arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

// 保存查询历史
export function saveSearch (query) {
  // 从本地存储中获取之前存储的查询记录，如果没有，默认是空数组
  const searches = storage.get(SEARCH_KEY, [])
  // 每次查询过的信息都插入到数组中
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LEN)
  // 插入完查询历史信息数据后将该数组保存到本地存储中
  storage.set(SEARCH_KEY, searches)
  return searches // 返回该数组
}

// 获取查询缓存数据
export function loadSearch () {
  return storage.get(SEARCH_KEY, [])
}

// 删除某个查询条件
export function deleteSearch (query) {
  // 之前存储的查询记录，如果没有，默认是空数组
  const searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 清空search
export function clearSearch () {
  storage.remove(SEARCH_KEY)
  return []
}

// 将播放的历史数据保存再本地缓存中
export function savePlay (song) {
  const songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return item.songid === song.songid
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}

// 从本地缓存中读取播放历史数据
export function loadPlay () {
  return storage.get(PLAY_KEY, [])
}

// 保存收藏的歌曲
export function saveFavorite (song) {
  const songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return item.songid === song.songid
  }, FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

// 删除某一首收藏歌曲
export function deleteFavorite (song) {
  const songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.songid === song.songid
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

// 从本地缓存中取出收藏歌曲的数据
export function loadFavorite () {
  return storage.get(FAVORITE_KEY, [])
}
