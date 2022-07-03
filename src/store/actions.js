// Action 提交的是 mutation，而不是直接变更状态,更改状态还是要mutation去做
// 说到底只是一个函数，你在里面想干嘛都可以，只要最后触发 mutation 就行
import * as types from './mutation-type.js'
import Util from '../utils/util.js'
import { Config } from '../utils/config.js'
import { saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite } from '../utils/cache.js'

// 找到索引下标
function findIndex (list, song) {
  // 如果再播放列表中找不到该歌曲则返回-1
  const index = list.findIndex((item) => {
    return item.songid === song.songid
  })
  return index
}

// 选择播放
export const selectPlay = ({ commit, state }, { list, index }) => {
  /**
   * list是songData数据，index是点即哪首歌曲的下标值
   */
  commit(types.SET_SEQUENCE_LIST, list) // list是接收到的songData数据
  if (state.mode === Config.playMode.random) {
    // 提交随机的播放列表
    const randomList = Util.shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index]) // 找到选中的歌曲在打乱后的歌曲数组中的下标位置
  } else {
    // 提交播放列表
    commit(types.SET_PLAYLIST, list)
  }
  // 提交当前播放index索引
  commit(types.SET_CURRENT_INDEX, index)
  // 提交播放状态为true
  commit(types.SET_PLAYING_STATE, true)
  // 提交全屏播放为true
  commit(types.SET_FULL_SCREEN, true)
}

// 随机播放
export const randomPlay = ({ commit }, { list }) => {
  // 提交播放模式为随机播放
  commit(types.SET_PLAY_MODE, Config.playMode.random)
  // 提交顺序播放列表
  commit(types.SET_SEQUENCE_LIST, list)
  // 提交随机的播放列表
  const randomList = Util.shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  // 提交当前播放index
  commit(types.SET_CURRENT_INDEX, 0)
  // 提交播放状态为true
  commit(types.SET_PLAYING_STATE, true)
  // 提交全屏播放为true
  commit(types.SET_FULL_SCREEN, true)
}

/**
 *从搜索结果中插入数据到播放列表
 * @param {Object} song 歌曲数据
 */
export const insertSong = function ({ commit, state }, song) {
  // 搜索中插入数据
  const playList = state.playList.slice()
  const sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex // 获取当前播放歌曲的下标值
  // 记录当前歌曲
  const currentSong = playList[currentIndex]
  // 查找当前列表中是否有待插入的歌曲，如果有则返回该索引
  // eslint-disable-next-line prefer-const
  let fpIndex = findIndex(playList, song)
  // 因为是插入歌曲，所以索引 + 1.因为splice方法的插入是在当前索引前面插入
  currentIndex++
  playList.splice(currentIndex, 0, song)
  // 插入歌曲后进行判断;
  if (fpIndex > -1) {
    // 说明插入歌曲前，playList已经包含有了插入歌曲,那么就按相应情况进行删除跟插入歌曲相同的原来歌曲
    if (currentIndex > fpIndex) {
      // 如果插入歌曲的位置大于跟插入歌曲相同的原来歌曲的位置，那么直接从该原来的索引位置进行删除
      playList.splice(fpIndex, 1)
      // 删除完后因为数组长度-1，故插入歌曲的位置索引也要相应发生变化，进行-1
      currentIndex--
    } else {
      // 如果插入歌曲的位置小于跟插入歌曲相同的原来歌曲的位置，那么需要对原位置的索引进行+1，然后进行删除。理由是数组长度+1了
      playList.splice(fpIndex + 1, 1)
    }
  }
  // 下面的操作和上面一样，只不过是针对sequenceList播放列表
  const currentSIndex = findIndex(sequenceList, currentSong) + 1
  // 查找插入的歌曲是否在sequenceList中，如果有则返回该索引
  const fsIndex = findIndex(sequenceList, song)
  // 插入歌曲
  sequenceList.splice(currentSIndex, 0, song)
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 将本地缓存中的查询历史数据保存vuex中
export const saveSearchHistory = function ({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

// 从vuex中删除某一个查询历史数据
export const deleteSearchHistory = function ({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

// 从vuex中清空本地缓存中的查询历史数据信息
export const clearSearchHistory = function ({ commit }) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

/**
 * 在playlist组件中的删除某首歌曲操作
 * @param {Object} song 当前要删除歌曲的引用
 */
export const deleteSong = function ({ commit, state }, song) {
  const playList = state.playList.slice() // 获取vuex中的播放列表playList
  const sequenceList = state.sequenceList.slice() // 获取vuex中的另一个播放列表sequnceList(这个播放列表是用来进行操作的)
  let currentIndex = state.currentIndex

  // 获取当前播放歌曲在playList中的下标索引位置
  const delPlayIndex = findIndex(playList, song)
  // 从playList播放列表中删除该歌曲
  playList.splice(delPlayIndex, 1)

  // 下面的操作跟上面同理
  const delSequenceIndex = findIndex(sequenceList, song)
  sequenceList.splice(delSequenceIndex, 1)

  // 从播放列表删除该歌曲后，对当前索引下标进行判断。
  // console.log(143, '播放歌曲当前下标索引' + currentIndex, '删除歌曲的下标索引' + delPlayIndex)
  // 如果是随机播放,那么首次播放的当前歌曲的下标索引永远处于0的位置，此时就需要进行判断操作
  if (state.mode === Config.playMode.random) {
    currentIndex = 0
  } else {
    if (delPlayIndex <= currentIndex) {
      // 如果删除歌曲的下标在当前播放歌曲之前，那么currentIndex需要减1,因为数组长度-1了，在playIndex后面的索引下标理应减1
      // 或者删除的是最后一首歌曲
      currentIndex--
      // console.log(147, '播放歌曲当前下标索引' + currentIndex, '删除歌曲的下标索引' + delPlayIndex)
    }
  }

  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_PLAYLIST, playList)

  // 当播放列表中还有歌曲的时候，每次在playlist组件中删除一首歌曲的时候，都会自动播放歌曲
  const playingState = playList.length > 0
  commit(types.SET_PLAYING_STATE, playingState)
}

// 清空播放器
export const deleteSongList = function ({ commit, satte }) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

// 保存最近播放的数据
export const savePlayHistory = function ({ commit }, historySong) {
  commit(types.SET_PLAY_HISTORY, savePlay(historySong))
}

// 保存收藏的歌曲
export const saveFavoriteHistory = function ({ commit }, favoriteHistory) {
  commit(types.SET_FAVORITE_HISTORY, saveFavorite(favoriteHistory))
}

// 删除某一首收藏歌曲
export const deleteFavoriteHistory = function ({ commit }, favoriteHistory) {
  commit(types.SET_FAVORITE_HISTORY, deleteFavorite(favoriteHistory))
}
