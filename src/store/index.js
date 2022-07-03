/* eslint-disable */
import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger' // 修改日志
import mutations from './mutations'
import * as actions from './actions'
import { Config } from '../utils/config.js'
import { loadSearch, loadPlay, loadFavorite } from '../utils/cache'

Vue.use(Vuex)
const debug = process.env.NODE_ENV !== 'production' // 开发环境中为true，否则为false

export default new Vuex.Store({
  state: {
    singer: {}, // 歌手信息
    playing: false, // 播放状态
    fullScreen: false, // 播放器是全屏的状态还是缩放的状态，默认为false
    playList: [], // 播放列表
    sequenceList: [], // 播放列表
    /*
      playList和sequenceList两者的区别：
        1.当播放是顺序播放的时候，两者没有区别。
        2.如果是随机播放，它们的播放顺序是不一样的
    */
    mode: Config.playMode.sequence, // 播放类型
    currentIndex: -1, // 当前播放索引
    songsheet: {}, // 歌单信息
    songsheetAllSongID: [], // 歌单中所有歌曲的ID
    topList: {}, // 排行榜列表
    searchData: [], // 每次的搜索数据
    searchHistory: loadSearch(), // 搜索历史
    playHistory: loadPlay(), // 播放历史数据
    favoriteHistory: loadFavorite() // 收藏歌曲数据
  },
  getters: {
    singer (state) {
      return state.singer
    },
    playing (state) {
      return state.playing
    },
    fullScreen (state) {
      return state.fullScreen
    },
    playList (state) {
      return state.playList
    },
    sequenceList (state) {
      return state.sequenceList
    },
    mode (state) {
      return state.mode
    },
    currentIndex (state) {
      return state.currentIndex
    },

    currentSong (state) {
      return state.playList[state.currentIndex] || {} // 如果取不到则返回一个空Object
    },

    songsheet (state) {
      return state.songsheet
    },

    songsheetAllSongID (state) {
      return state.songsheetAllSongID
    },
    topList (state) {
      return state.topList
    },
    searchData (state) {
      return state.searchData
    },
    searchHistory (state) {
      return state.searchHistory
    },
    playHistory (state) {
      return state.playHistory
    },
    favoriteHistory (state) {
      return state.favoriteHistory
    }

  },
  mutations,
  actions,
  // 如果是npm run serve就是开发环境，此时就是不等于production，如果是发布环境就是等于production.
  strict: debug,
  plugins: debug ? [createLogger()] : [] // 开发环境下显示vuex的状态修改
})
