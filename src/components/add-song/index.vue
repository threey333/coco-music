<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <!-- 头部部分 -->
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click='hide'>
          <i class="icon-close"></i>
        </div>
      </div>
      <!-- 搜索盒子容器部分 -->
      <div class="search-box-wrapper">
        <search-box placeholder="搜索歌曲" @query="search" ref="searchBox"></search-box>
      </div>
      <!-- 这块是搜索历史  -->
      <div class="shortcut" v-show="!query">
        <switches :currentIndex="currentIndex" :switches="switches" @switch="switchItem"></switches>
        <div class="list-wrapper">
          <!-- switches组件当前显示哪个，用v-if判断；如果是currentIndex是0显示的是最近播放的页面，如果是1则是搜索历史的页面-->
          <scroll-bar :data="playHistory" v-if="currentIndex===0" class="list-scroll" ref="songList" :refreshDelay="refreshDelay">
            <div class="list-inner">
              <song-list :songData="playHistory" @select="selectSong"></song-list>
            </div>
          </scroll-bar>
          <!-- 搜索历史DOM页面 -->
          <scroll-bar :data="searchHistory" v-if="currentIndex===1" class="list-scroll" ref="searchList"
            :refreshDelay="refreshDelay">
            <div class="list-inner">
              <!-- :refreshDelay="refreshDelay" -->
              <search-list :searches="searchHistory" @select="addQuery" @delete="deleteOne">
              </search-list>
            </div>
          </scroll-bar>
        </div>
      </div>
      <!--搜索结果提示建议组件  -->
      <div class="search-result" v-show="query">
        <!-- 监听listScroll滚动事件，然后触发blurInput方法，将移动端的键盘收起来 -->
        <add-song-suggest :query="query" :showSinger="showSinger" @select="selectSaveSearch" @listScroll="blurInput">
        </add-song-suggest>
      </div>
      <top-tip ref="topTip" :delay="tipDelay">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">该首歌曲已经添加到播放队列</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script>
import SearchBox from '@/components/search-box'
import AddSongSuggest from '@/components/AddSongSuggest'
import { searchMixin } from '@/utils/mixin.js'
import Switches from '@/components/switches'
import ScrollBar from '@/base/scrollbar'
import SongList from '@/base/song-list'
import TopTip from '@/components/top-tip'
import SearchList from '@/components/search-list'
import { mapActions, mapGetters } from 'vuex'
import Song from '@/utils/song.js'

export default {
  name: 'AddSong',
  mixins: [searchMixin],
  data () {
    return {
      showFlag: false,
      showSinger: false,
      currentIndex: 0,
      tipDelay: 1500,
      switches: [
        {
          name: '最近播放'
        },
        {
          name: '搜索历史'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['playHistory'])
  },
  components: {
    SearchBox,
    AddSongSuggest,
    Switches,
    ScrollBar,
    SongList,
    SearchList,
    TopTip
  },
  methods: {
    show () {
      this.showFlag = true
      setTimeout(() => {
        if (this.currentIndex === 0) {
          this.$refs.songList.refresh()
        } else {
          this.$refs.searchList.refresh()
        }
      }, 20)
    },
    hide () {
      this.showFlag = false
    },
    search (newQuery) {
      this.query = newQuery
    },
    // 本地保存查询的历史记录
    selectSaveSearch () {
      this.saveSearch()
      this.showTip()
    },
    // 监听子组件派发出来的switch事件，然后将传过来的index赋值给currentIndex，最后传给子组件switches
    switchItem (index) {
      if (index === this.currentIndex) return
      this.currentIndex = index
    },
    selectSong (song, index) {
      console.log(song, index)
      if (index !== 0) {
        // 这里从缓存里取出来的song只是个普通的数据对象，不是Song对象
        this.insertSong(new Song(song))
        this.showTip()
      }
    },
    showTip () {
      this.$refs.topTip.show()
    },
    ...mapActions([
      'insertSong'
    ])
  }
}
</script>

<style lang="scss" scoped>
.add-song {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 200;
  background: $color-background;
  &.slide-enter-active,
  &.slide-leave-active {
    transition: all 0.3s;
  }
  &.slide-enter,
  &.slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }
  .header {
    position: relative;
    height: 44px;
    text-align: center;
    .title {
      line-height: 44px;
      font-size: $font-size-large;
      color: $color-text;
    }
    .close {
      position: absolute;
      top: 0;
      right: 8px;
      .icon-close {
        display: block; //变块级元素
        padding: 12px;
        font-size: 20px;
        color: $color-theme;
      }
    }
  }
  .search-box-wrapper {
    margin: 20px;
  }
  .shortcut {
    .list-wrapper {
      position: absolute;
      top: 165px;
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
  }
  .search-result {
    position: fixed;
    top: 124px;
    bottom: 0;
    width: 100%;
  }
  .tip-title {
    text-align: center;
    padding: 18px 0;
    font-size: 0;
    .icon-ok {
      font-size: $font-size-medium;
      color: $color-theme;
      margin-right: 4px;
    }
    .text {
      font-size: $font-size-medium;
      color: $color-text;
    }
  }
}
</style>
