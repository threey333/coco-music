<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <!-- 上面添加click.stop主要是防止事件冒泡，以至于点击list-wwrapper里面的时候也不会触发hide方法 -->
        <!-- 头部分 -->
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <!-- 身体内容部分 -->
        <scroll-bar :data="sequenceList" :refreshDelay="refreshDelay" ref="listContent" class="list-content">
          <transition-group name="list" tag="ul" ref="list" appear>
            <li class="item" ref="listItem" v-for="(item,index) in sequenceList" :key="item.songid"
              @click="selectItem(item,index)">
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.songname}}</span>
              <span class="like" @click.stop="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll-bar>
        <!-- 操作区 -->
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <!-- 关闭区 -->
        <div class="list-close" @click='hide'>
          <span>关闭</span>
        </div>
      </div>
      <comfirm text="是否清空播放列表" confirmBtnText='清空' ref="comfirm" @confirm="clearPlaylist"></comfirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script>
import Comfirm from '@/components/confirm'
import ScrollBar from '@/base/scrollbar'
import AddSong from '@/components/add-song'
import { mapMutations, mapActions } from 'vuex'
import { Config } from '@/utils/config.js'
import { playerMixin } from '@/utils/mixin.js'

export default {
  name: 'playlist',
  mixins: [playerMixin],
  data () {
    return {
      showFlag: false,
      refreshDelay: 100 // 延迟时间为100
    }
  },
  computed: {
    modeText () {
      return this.mode === Config.playMode.sequence ? '顺序播放' : this.mode === Config.playMode.random ? '随机播放' : '单曲循环'
    }
  },
  watch: {
    // 如果currentSong改变，scroll到这个歌曲的位置
    currentSong (newSong, oldSong) {
      if (!this.showFlag || newSong.songid === oldSong.songid) {
        return
      }

      setTimeout(() => {
        this.scrollToCurrent(newSong)
      }, 20)
    }
  },
  methods: {
    // 显示
    show () {
      this.showFlag = true
      setTimeout(() => {
        // 展开遮罩层手动刷新一下scroll
        this.$refs.listContent.refresh()
        this.scrollToCurrent(this.currentSong) // playlist展开的时候自动将正在播放的歌曲放在第一行
      }, 20)
    },
    hide () {
      this.showFlag = false
    },
    // 显示确认对话框
    showConfirm () {
      this.$refs.comfirm.show()
    },
    // 显示AddSong组件,同时添加歌曲
    addSong () {
      this.$refs.addSong.show()
    },
    selectItem (item, index) {
      // 如果是随机播放
      if (this.mode === Config.playMode.random) {
        index = this.playList.findIndex(song => {
          return song.songid === item.songid
        })
      }
      this.setCurrentIndex(index)
      this.setPlayingStatus(true)
    },
    deleteOne (item) {
      this.deleteSong(item)
      // 如果删除该首歌后，播放列表中没有歌曲了，那么就隐藏该playlist
      if (!this.playList.length) {
        this.hide()
      }
    },
    // 清除播放列表
    clearPlaylist () {
      this.deleteSongList()
      this.hide()
    },
    getCurrentIcon (item) {
      if (item.songid === this.currentSong.songid) {
        return 'icon-play'
      } else {
        return ''
      }
    },
    // 每次打开playlist的时候自动滚动到正在播放的目标歌曲位置，即正在播放的歌曲显示在Playlist的第一行
    scrollToCurrent (current) {
      // 找到正在播放歌曲的下标位置
      const index = this.sequenceList.findIndex(song => {
        return song.songid === current.songid
      })
      this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
    },
    ...mapMutations({
      setPlayingStatus: 'SET_PLAYING_STATE'
    }),
    ...mapActions([
      'deleteSong',
      'deleteSongList'
    ])

  },
  components: {
    Comfirm,
    ScrollBar,
    AddSong
  }
}
</script>

<style lang="scss" scoped>
.playlist {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 200;
  background-color: $color-background-d;
  &.list-fade-enter-active,
  &.list-fade-leave-active {
    transition: opacity 0.3s;
    .list-wrapper {
      transition: all 0.3s;
    }
  }
  &.list-fade-enter,
  &.list-fade-leave-to {
    opacity: 0;
    .list-wrapper {
      transform: translate3d(0, 100%, 0);
    }
  }
  // &.list-fade-enter {
  // }
  .list-wrapper {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: $color-highlight-background;
    .list-header {
      position: relative;
      padding: 20px 30px 10px 20px;
      .title {
        display: flex;
        align-items: center;
        .icon {
          margin-right: 10px;
          font-size: 30px;
          color: $color-theme-d;
        }
        .text {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-l;
        }
        .clear {
          @include extend-click();
          .icon-clear {
            font-size: $font-size-medium;
            color: $color-text-d;
          }
        }
      }
    }
    .list-content {
      max-height: 240px;
      overflow: hidden;
      .item {
        display: flex;
        align-items: center;
        height: 40px;
        padding: 0 30px 0 20px;
        // overflow: hidden;
        &.list-enter-active,
        &.list-leave-active {
          transition: all 0.2s linear;
        }
        &.list-enter,
        &.list-leave-to {
          height: 0;
        }
        .current {
          flex: 0 0 20px;
          width: 20px;
          font-size: $font-size-small;
          color: $color-theme-d;
        }
        .text {
          flex: 1;
          @include no-wrap();
          font-size: $font-size-medium;
          color: $color-text-d;
        }
        .like {
          @include extend-click();
          margin-right: 15px;
          font-size: $font-size-small;
          color: $color-theme;
          .icon-favorite {
            color: $color-sub-theme;
          }
        }
        .delete {
          @include extend-click();
          font-size: $font-size-small;
          color: $color-theme;
        }
      }
    }
    .list-operate {
      width: 140px;
      margin: 20px auto 30px auto;
      .add {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border: 1px solid $color-text-l;
        border-radius: 100px;
        color: $color-text-l;
        .icon-add {
          margin-right: 5px;
          font-size: $font-size-small-s;
        }
        .text {
          font-size: $font-size-small;
        }
      }
    }
    .list-close {
      text-align: center;
      line-height: 50px;
      background: $color-background;
      font-size: $font-size-medium-x;
      color: $color-text-l;
    }
  }
}
</style>
