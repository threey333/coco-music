<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back" @click='back'>
        <i class="icon-back"></i>
      </div>
      <!-- 切换容器 -->
      <div class="switches-wrapper">
        <switches :currentIndex='currentIndex' :switches='switches' @switch='switchItem'></switches>
      </div>
      <div class="play-btn" ref="playBtn" @click='random'>
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <!-- 显示收藏主页或最近收听主页的盒子 -->
      <div class="list-wrapper" ref="listWrapper">
        <!-- 收藏主页 -->
        <scroll-bar class="list-scroll" :data="favoriteHistory" v-if="currentIndex === 0" ref="favoriteList">
          <div class="list-inner">
            <song-list :songData="favoriteHistory" @select="selectSong"></song-list>
          </div>
        </scroll-bar>
        <!-- 最近收听主页 -->
        <scroll-bar class="list-scroll" v-else :data="playHistory" ref="playList">
          <div class="list-inner">
            <song-list :songData="playHistory" @select='selectSong'></song-list>
          </div>
        </scroll-bar>
      </div>
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultDesc"></no-result>
      </div>
    </div>
  </transition>
</template>

<script>
import Switches from '@/components/switches'
import NoResult from '@/components/no-result'
import SongList from '@/base/song-list'
import ScrollBar from '@/base/scrollbar'
import { mapGetters, mapActions } from 'vuex'
import Song from '@/utils/song.js'
import { playlistMixin } from '@/utils/mixin.js'
export default {
  name: 'UserCenter',
  mixins: [playlistMixin],
  data () {
    return {
      currentIndex: 0,
      switches: [
        { name: '我喜欢的' },
        { name: '最近听的' }
      ]
    }
  },
  computed: {
    noResult () {
      if (this.currentIndex === 0) {
        return !this.favoriteHistory.length
      } else {
        return !this.playHistory.length
      }
    },
    noResultDesc () {
      if (this.currentIndex === 0) {
        return '暂无收藏歌曲'
      } else {
        return '您还没听过歌曲'
      }
    },
    ...mapGetters([
      'playHistory',
      'favoriteHistory'
    ])
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.listWrapper.style.bottom = bottom
      if (this.currentIndex === 0) {
        this.$refs.favoriteList.refresh()
      } else {
        this.$refs.playList.refresh()
      }
    },
    switchItem (index) {
      this.currentIndex = index
    },
    back () {
      this.$router.back()
    },
    // 随机播放，这里同样注意要把从本地缓存中读出来的数据实例化
    random () {
      let list = this.currentIndex === 0 ? this.favoriteHistory : this.playHistory
      if (list.length === 0) return
      list = list.map(item => {
        return new Song(item)
      })
      this.randomPlay({
        list
      })
    },
    /**
     * @param {Object} 歌曲对象的信息数据
    */
    selectSong (song, index) {
      // console.log(song)
      this.insertSong(new Song(song))
    },
    ...mapActions([
      'insertSong',
      'randomPlay'
    ])
  },
  components: {
    Switches,
    NoResult,
    SongList,
    ScrollBar
  }
}
</script>

<style lang='scss' scoped>
.user-center {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 100;
  width: 100%;
  background: $color-background;
  &.slide-enter-active,
  &.slide-leave-active {
    transition: all 0.3s;
  }
  &.slide-enter,
  &.slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 50;
    .icon-back {
      display: block;
      padding: 10px;
      font-size: $font-size-large-x;
      color: $color-theme;
    }
  }
  .switches-wrapper {
    margin: 10px 0 30px 0;
  }
  .play-btn {
    box-sizing: border-box;
    width: 135px;
    padding: 7px 0;
    margin: 0 auto;
    text-align: center;
    border: 1px solid $color-text-l;
    color: $color-text-l;
    border-radius: 100px;
    font-size: 0;
    .icon-play {
      display: inline-block;
      vertical-align: middle;
      margin-right: 6px;
      font-size: $font-size-medium-x;
    }
    .text {
      display: inline-block;
      vertical-align: middle;
      font-size: $font-size-small;
    }
  }
  .list-wrapper {
    position: absolute;
    top: 110px;
    bottom: 0;
    width: 100%;
    .list-scroll {
      height: 100%;
      overflow: hidden;
      .list-inner {
        padding: 20px 30px;
      }
    }
  }
  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
