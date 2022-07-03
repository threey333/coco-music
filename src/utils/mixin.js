import { mapGetters, mapMutations, mapActions } from 'vuex'
import { Config } from './config.js'
import Util from './util.js'

// mini播放器显示时，调整列表底部高度
export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  mounted () {
    this.handlePlaylist(this.playList)
  },
  // keep-alive 组件激活时调用。
  activated () {
    this.handlePlaylist(this.playList)
  },
  watch: {
    playList (newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist () {
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

// player播放器组件和playlist播放列表组件公用的播放模式切换等功能
export const playerMixin = {
  computed: {
    // 切换播放模式图标
    iconMode () {
      // 先判断当前播放模式是否是顺序播放，如果是就把样式变为顺序播放的图标，如果不是继续判断是否是循环播放，如果是变成循环图标图标，不是就变成随机播放图标
      return this.mode === Config.playMode.sequence ? 'icon-sequence' : this.mode === Config.playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'playList',
      'mode',
      'favoriteHistory'
    ])
  },
  methods: {
    // 改变播放模式和播放图标
    changeMode () {
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      // 如果播放模式等于随机播放，那么就将存放歌曲的sequenceList打乱
      if (mode === Config.playMode.random) {
        console.log('播放模式变为了随机播放模式', 268)
        list = Util.shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      // playList改变后，为了不影响currentSong,所以这里还要重置currentIndex,使其播放的是原来的currentSong
      this.resetCurrentIndex(list)
      // 重置playList
      this.setPlayList(list)
    },

    // 重置currentIndex
    resetCurrentIndex (list) {
      const index = list.findIndex((item) => {
        return item.songid === this.currentSong.songid
      })
      this.setCurrentIndex(index)
    },

    // 获取收藏的图标
    getFavoriteIcon (song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },
    // 切换是否收藏该歌曲
    toggleFavorite (song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteHistory(song)
      } else {
        this.saveFavoriteHistory(song)
      }
    },
    // 是否是收藏的歌曲
    isFavorite (song) {
      const index = this.favoriteHistory.findIndex((item) => {
        return item.songid === song.songid
      })
      return index > -1
    },
    ...mapMutations({
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST',
      setCurrentIndex: 'SET_CURRENT_INDEX'
    }),
    ...mapActions([
      'deleteFavoriteHistory',
      'saveFavoriteHistory'
    ])
  }
}

// 播放列表playlist和搜索公用相关逻辑
export const searchMixin = {
  data () {
    return {
      query: '',
      refreshDelay: 100
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    addQuery (query) {
      this.$refs.searchBox.setQuery(query)
    },
    // 监听子组件search-box发送过来的query事件，从而知道查询的参数发送了变化
    onQueryChange (query) {
      this.query = query.trim()
    },
    // 在移动端,当滚动suggest组件的时候,收起移动端的键盘
    blurInput () {
      this.$refs.searchBox.blur()
    },
    // 保存搜索历史记录
    saveSearch () {
      this.saveSearchHistory(this.query)
    },
    // 删除某一项查询历史记录
    deleteOne (item) {
      this.deleteSearchHistory(item)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
