import * as types from './mutation-type.js'

const mutations = {
  [types.SET_SINGER] (state, singer) {
    state.singer = singer
  },

  [types.SET_PLAYING_STATE] (state, flag) {
    state.playing = flag
  },

  [types.SET_PLAYING_STATE] (state, flag) {
    state.playing = flag
  },

  /**
   * @param {Object} state 公共状态数据
   * @param {Boolean} flag  全屏还是缩放的状态布尔值
   */
  [types.SET_FULL_SCREEN] (state, flag) {
    state.fullScreen = flag
  },

  /**
   * @param {Object} state 公共状态数据
   * @param {Array} list   顺序播放列表数据
   */
  [types.SET_PLAYLIST] (state, list) {
    state.playList = list
  },

  /**
   * @param {Object} state 公共状态数据
   * @param {Array} list   随机播放列表数据
   */
  [types.SET_SEQUENCE_LIST] (state, list) {
    state.sequenceList = list
  },

  [types.SET_PLAY_MODE] (state, mode) {
    state.mode = mode
  },

  /**
   * @param {Object} state 公共状态数据
   * @param {Number} index  播放列表数据
   */
  [types.SET_CURRENT_INDEX] (state, index) {
    state.currentIndex = index
  },

  /**
   * 设置歌单信息
   * @param {Object} state 公共状态数据
   * @param {Object} disc  歌单信息
   */
  [types.SET_SONGSHEET] (state, disc) {
    state.songsheet = disc
  },

  [types.SET_SONGSHEET_ALLSONGID] (state, id) {
    state.songsheetAllSongID = id
  },

  /**
   * 设置排行榜信息
   * @param {Object} state 公共状态数据
   * @param {Object} list  排行榜信息数据
   */
  [types.SET_TOP_LIST] (state, list) {
    state.topList = list
  },

  /**
   *
   * @param {Array} state 查询的数据
   * @param {Array} data  每次查询的新数据
   */
  [types.SET_SEARCH_DATA] (state, data) {
    state.searchData = [...state.searchData, ...data]
    for (let i = 0, length = state.searchData.length; i < length; i++) {
      if (state.searchData[i].type && i !== 0) {
        ;[state.searchData[0], state.searchData[i]] = [state.searchData[i], state.searchData[0]]
      }
    }
  },
  [types.CLEAR_SEARCH_DATA] (state) {
    state.searchData = []
  },

  [types.SET_SEARCH_HISTORY] (state, history) {
    state.searchHistory = history
  },

  [types.SET_PLAY_HISTORY] (state, history) {
    state.playHistory = history
  },

  /**
   *
   * @param {Object} state Vuex中的共享状态数据
   * @param {Array} history 收藏歌曲的数据
   */
  [types.SET_FAVORITE_HISTORY] (state, history) {
    state.favoriteHistory = history
  }
}

export default mutations
