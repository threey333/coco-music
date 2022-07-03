<template>
  <div class="player" v-show="playList.length">
    <!-- normal-player即我们展开的大播放器 -->
    <transition name="normal" appear @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
      <!-- normal 即默认 -->
      <div class="normal-player" v-show="fullScreen">
        <!-- 播放器背景图 -->
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.songImage">
        </div>

        <div class="top">
          <!-- 左上角的图标，用来返回 -->
          <div class="back" @click='back'>
            <i class="icon-back"></i>
          </div>
          <!-- title：顶部的歌曲名称 -->
          <h1 class="title" v-html="currentSong.songname"></h1>
          <!-- subtitle：顶部的歌手名称 -->
          <h2 class="subtitle" v-html="currentSong.songdescribe"></h2>
        </div>

        <!-- 中间是唱片，里面展示的是一张歌曲的图片 -->
        <div class="middle" @touchstart="middleTouchStart" @touchmove="middleTouchMove" @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <!-- cdClass是旋转动画样式 -->
              <div class="cd" :class="cdClass">
                <img class="image" :src="currentSong.songImage" ref="cdWrapper">
              </div>
            </div>
            <!-- cd唱片DOM页单行显示歌词的地方 -->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!-- 歌曲歌词部分 -->
          <scroll-bar class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine" class="text" :class="{'current':currentLyricLineNum===index}"
                  v-for="(line,index) in currentLyric.lines" :key="index">{{line.txt}}</p>
              </div>
            </div>
          </scroll-bar>
        </div>
        <!-- bottom：底部是一些操作区，如上一首、下一首、播放等等功能操作 -->
        <div class="bottom">
          <!-- 显示是唱片DOM还是歌词详情DOM的点图标提示 -->
          <div class="dot-wrapper">
            <div class="dot" :class="{'active':currentPageShow==='cd'}"></div>
            <div class="dot" :class="{'active':currentPageShow==='lyric'}"></div>
          </div>
          <!-- 歌曲播放时间进度条 -->
          <div class="progress-wrapper">
            <span class="time time-l">{{handleTime(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{currentSongDuration}}</span>
          </div>
          <!-- operators 操作区 -->
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableClass">
              <i @click='prev' class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableClass">
              <!-- switchPlayState 切换播放状态 -->
              <i @click="switchPlayState" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableClass">
              <i @click='next' class="icon-next"></i>
            </div>
            <div class="icon i-right" @click='toggleFavorite(currentSong)'>
              <i class="icon" :class="getFavoriteIcon(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!--小型播放器，即缩放时显示的播放器  -->
    <transition name="mini" appear>
      <div class="mini-player" v-show="!fullScreen" @click='open'>
        <div class="icon">
          <img :class="cdClass" width="40" height="40" :src="currentSong.songImage">
        </div>
        <div class="text">
          <h2 class="songname" v-html="currentSong.songname"></h2>
          <p class="songdescribe" v-html="currentSong.songdescribe"></p>
        </div>
        <!-- 下面是播放状态图标 -->
        <div class="control">
          <!-- 点击防止冒泡，以免打开全屏状态下的播放页面 -->
          <progress-circle :percent="percent" :radius="radius">
            <!-- icon-mini样式是用来绝对定位的 -->
            <i @click.stop="switchPlayState" :class="miniplayIcon" class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop='showPlaylist'>
          <!-- .stop修饰符是防止事件冒泡,也就是防止每次打开playlist的时候，全屏的播放页面回打开 -->
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <!--
      调用audio中的play()播放的时机就是currentSong有值的时候，所以要用watch监听
      canplay事件是audio中的常用的事件，它主要作用是：缓冲至目前可播放状态.
      error事件是audio中的常用事件，它主要作用是：请求数据时遇到错误
      timeupdate事件是audio中的常用事件，它主要作用是：监听播放时间的改变
    -->
    <audio :src="currentSong.url" ref="audio" @play="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
    <center-tip ref="centerTip" :delay="tipDelay" crossOrigin="anonymous">
      <div class="center-title">
        <i class='err'></i>
        <span class="text">该歌曲暂时无法播放</span>
      </div>
    </center-tip>
  </div>
</template>

<script>
import animations from 'create-keyframe-animation'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { prefixStyle } from '@/utils/dom.js'
import { format } from '@/utils/format.js'
import { Config } from '@/utils/config.js'
import ProgressCircle from '@/base/progress-circle'
import ProgressBar from '@/base/progress-bar'
import ScrollBar from '@/base/scrollbar'
import Playlist from '@/components/playlist'
import CenterTip from '@/components/center-tip'
import Lyric from 'lyric-parser' // Lyric是个类
import { playerMixin } from '@/utils/mixin.js'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')

export default {
  name: 'player',
  mixins: [playerMixin],
  data () {
    return {
      songReadyPlay: false, // 用来解决切换歌曲时过快导致play()方法无法播放而报错，相当于切换歌曲的节流阀开关
      currentTime: 0, // 歌曲播放时间长度
      duration: 0, // //当前播放音乐的总时长
      radius: 32,
      playPromise: null, // 用来判断当前audio的src是否读取正常
      currentLyric: null, // 当前歌曲歌词(该数据结构是个对象结构，其中lines这个属性是个数组，保存着该歌曲每行的歌词)
      currentLyricLineNum: 0, // 当前歌词所在的行
      currentPageShow: 'cd', // 初始cd页面
      playingLyric: '', // cd唱片页显示单行歌词
      tipDelay: 2100
    }
  },

  computed: {
    cdClass () {
      return this.playing ? 'play' : 'play pause'
    },
    // 播放图标
    playIcon () {
      return this.playing ? 'icon-play' : 'icon-pause'
    },
    // mini播放图标
    miniplayIcon () {
      return this.playing ? 'icon-play-mini' : 'icon-pause-mini'
    },
    // 为了能看到切换歌曲时，切换图标有按下的效果，这里使用了disableClass计算属性，监听songReadyPlay,为false则添加disable的css属性
    disableClass () {
      return this.songReadyPlay ? '' : 'disable' // disable是css设置的一个属性
    },
    // 处理当前歌曲的总时长时间，处理为xx:xx
    currentSongDuration () {
      return format(this.duration)
    },
    // 进度条进行比例
    percent () {
      return this.currentTime / this.duration
    },
    ...mapGetters(['fullScreen', 'playing', 'currentIndex'])
  },
  created () {
    this.touch = {}
  },
  watch: {
    // 监听currentSong是否有歌曲，有就播放
    currentSong (newSong, oldSong) {
      if (!newSong.songid) return // 当播放列表中只有一首歌曲并且对其进行删除，那么newSong就为空。如果为空直接跳出不执行后面的操作
      if (newSong.songid === oldSong.songid) return
      // 如果上一首歌的歌词还有就停了
      if (this.currentLyric) {
        this.currentLyric.stop()
        this.currentTime = 0
        this.playingLyric = ''
        this.currentLyricLineNum = 0
      }
      if (this.timer) {
        clearTimeout(this.timer)
      }
      // 为了解决音乐播放器在微信中从后台切换前台时也能正常播放，那么这里不要使用$nextTick,而是使用定时器
      this.timer = setTimeout(() => {
        this.playPromise = this.$refs.audio.play()
        // 获取当前歌曲歌词
        this.getCurrentSongLyric()
      }, 1000)
    },
    // 监听播放状态
    playing (newPlaying) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause()
      })
    }
  },

  methods: {
    // 缩放播放器，即显示小型播放页面
    back () {
      this.setFullScreen(false)
    },
    // 显示播放器页面
    open () {
      this.setFullScreen(true)
    },

    enter (el, done) {
      // 当只用 JavaScript 过渡的时候，在 enter 和 leave 中必须使用 done 进行回调。
      // 否则，它们将被同步调用，过渡会立即完成。
      const { x, y, scale } = this.getPosAndScale()
      const animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: 'translate3d(0,0,0) scale(1.2)'
        },
        100: {
          transform: 'translate3d(0,0,0) scale(1)'
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done) // done是回调函数
    },

    afterEnter () {
      animations.unregisterAnimation('move') // 进入后移除move
      this.$refs.cdWrapper.style.animation = ''
    },

    leave (el, done) {
      // 当只用 JavaScript 过渡的时候，在 enter 和 leave 中必须使用 done 进行回调。
      // 否则，它们将被同步调用，过渡会立即完成。
      const { x, y, scale } = this.getPosAndScale()
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      // 监听cdWrapper是否执行完动画
      this.$refs.cdWrapper.addEventListener('transitionend', () => {
        done()
      })
    },
    // 动画离开之后的钩子函数
    afterLeave () {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },

    // 获取可视化窗口中的各种系数，用于给cd唱片图像做动画用的
    getPosAndScale () {
      const targetWidth = 40 // 获取mini播放器左下角图像的大小
      const paddingLeft = 40 // 获取mini播放器左下角到左边的内边距距离
      const paddingBottom = 30 // 获取mini播放器左下角到底部的内边距距离
      const paddingTop = 80 // 获取全屏播放器唱片图像到顶部的内边距距离
      const width = window.innerWidth * 0.8 // 获取任意可视区窗口中唱片自身的宽度和高度 (因为是正方形)
      const scale = targetWidth / width // 获取缩放比例
      const x = -(window.innerWidth / 2 - paddingLeft) // 左移动的距离
      const y = window.innerHeight - paddingBottom - paddingTop - width / 2
      return {
        x,
        y,
        scale
      }
    },

    // 改变播放状态
    switchPlayState () {
      if (!this.songReadyPlay) return
      this.setPlayingState(!this.playing)
      // 改变播放状态时，如果存在歌词则歌词状态也改换。
      if (this.currentLyric) {
        /** togglePlay方法是处理歌词的第三方库的方法 */
        this.currentLyric.togglePlay()
      }
    },

    // 滑动进度条改变的方法
    onProgressBarChange (newPercent) {
      const currentTime = this.duration * newPercent
      this.$refs.audio.currentTime = this.duration * newPercent // 改变音频的播放时间（注意audio的currentTime属性是个可读写的属性）
      if (!this.playing) { // 如果不是播放状态，那么就改变为播放状态
        this.switchPlayState()
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },

    // 上一首
    prev () {
      if (!this.songReadyPlay) return
      // 如果歌曲列表中只有一首歌的时候，就单曲循环
      if (this.playList.length === 1) {
        this.loopPlay()
        return
      } else {
        let index = this.currentIndex - 1 < 0 ? this.playList.length - 1 : this.currentIndex - 1
        // 当歌曲中的url为null,那么直接跳过该歌曲页面，转而跳到有url链接的歌曲中
        while (!this.playList[index].url) {
          index = index - 1
          if (index < 0) {
            index = this.playList.length - 1
          }
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          // 如果不是播放状态就改变为播放状态,以保证每切换一首歌，其不仅自动播放，播放图标还会随着播放状态进行改变。
          this.setPlayingState()
        }
      }
      this.songReadyPlay = false
    },

    // 下一首
    next () {
      if (!this.songReadyPlay) return
      if (this.playList.length === 1) {
        this.loopPlay()
        return
      } else {
        const length = this.playList.length
        let index = this.currentIndex + 1 === length ? 0 : this.currentIndex + 1
        while (!this.playList[index].url) {
          index = index + 1
          if (index > this.playList.length) {
            index = 0
          }
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          // 如果不是播放状态就改变为播放状态,以保证每切换一首歌，其不仅自动播放，播放图标还会随着播放状态进行改变。
          this.switchPlayState()
        }
      }

      this.songReadyPlay = false
    },

    // 开始播放指定的音频或视频时，发生的canplay事件，ready方法主要是防止点击切换歌曲过快报错
    ready () {
      this.songReadyPlay = true
      console.log(364, 'ready')
    },

    // 当请求的歌曲url不能播放的时候，就把songReadyPlay开关变为true
    error () {
      this.songReadyPlay = true
      this.setPlayingState(false)
      this.$refs.centerTip.show()
      this.currentLyric = null
      this.playingLyric = ''
      this.currentLyricLineNum = 0
      setTimeout(() => {
        this.next()
      }, 2000)
    },

    // 监听歌曲播放是否完毕，完毕就执行end()方法
    end () {
      this.currentTime = 0
      if (this.mode === Config.playMode.loop) {
        this.loopPlay()
      } else {
        this.nextPlay()
      }
    },

    // 当一首歌曲播放完毕后进行循环播放
    loopPlay () {
      console.log('循环播放')
      this.$refs.audio.currentTime = 0 // audioDOM元素的currentTime是个可读写的属性
      this.$refs.audio.play()
      this.setPlayingState(true)
      // 当播放模式是单曲循环的时候，歌词每次都要重新从0开始
      if (this.currentLyric) {
        /**
         * seek(startTime)方法是处理歌词的第三方工具的方法
         * 作用是重置歌词读条在某个时间开始
         * @param {Number} startTime 开始时间
        */
        this.currentLyric.seek(0)
      }
    },

    // 当一首歌曲播放完毕后进行下一首歌曲播放
    nextPlay () {
      console.log('顺序播放')
      // 如果歌曲列表中只有一首歌，那么就循环播放
      if (this.playList.length === 1) {
        this.loopPlay()
      } else {
        const length = this.playList.length
        let index = this.currentIndex + 1 === length ? 0 : this.currentIndex + 1
        while (!this.playList[index].url) {
          index = index + 1
          if (index > this.playList.length) {
            index = 0
          }
        }
        if (!this.songReadyPlay) return
        this.setCurrentIndex(index)
        if (!this.playing) {
          // 如果不是播放状态就改变为播放状态,以保证每切换一首歌，其不仅自动播放，播放图标还会随着播放状态进行改变。
          this.switchPlayState()
        }
      }
    },

    // 获取歌曲播放长度和播放进度时间
    updateTime (e) {
      this.duration = e.target.duration
      this.currentTime = e.target.currentTime
    },

    // 歌曲播放时间处理方法
    handleTime (interval) {
      return format(interval)
    },

    // 获取处理后的歌曲歌词
    getCurrentSongLyric () {
      this.currentSong.getCurrentSongLyric().then(lyric => {
        if (this.currentSong.lyric !== lyric) return
        this.currentLyric = new Lyric(lyric, this.handleLyric) // 处理歌词，因为lyric是字符串格式
        this.savePlayHistory(this.currentSong)
        if (this.playing) {
          this.currentLyric.play()
        }
      }).catch((err) => { // catch处理！！
        console.log(err)
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLyricLineNum = 0
      })
    },
    // 歌词处理回调函数
    handleLyric ({ lineNum, txt }) {
      this.currentLyricLineNum = lineNum
      // 歌词高亮地方没有超过5行则当前滚动位置不发生变化，否则发生滚动而且滚动的时候显示的还是当前歌曲正在唱的地方，也就是滚动到目标元素上
      if (lineNum > 5) {
        const lineEl = this.$refs.lyricLine[lineNum - 5]
        if (lineEl) {
          /**
         * @param {String} el 滚动到目标元素上。
         * @param {Number} time 滚动动画执行的时长
        */
          this.$refs.lyricList.scrollToElement(lineEl, 4)
        }
      } else {
        /**
         * @param {Number} x x横轴坐标
         * @param {Number} y y横轴坐标
         * @param {Number} tiem 滚动动画执行的时间
        */
        this.$refs.lyricList.scrollTo(0, 0, 4)
      }
      this.playingLyric = txt
    },
    middleTouchStart (e) {
      this.touch.initiated = true
      const touch = e.touches[0]
      // 记录开始触碰时的x和y距离
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
      // 用来判断是否是一次移动
      this.touch.moved = false
    },
    middleTouchMove (e) {
      if (!this.touch.initiated) return
      const touch = e.touches[0]
      // 每当触碰滑动时，都记录下滑动的距离（距离开始触碰时的位置的长度）
      const moveDistanceX = touch.pageX - this.touch.startX
      const moveDistanceY = touch.pageY - this.touch.startY
      // 如果y轴的滑动范围大于x轴的滑动范围，说明是歌词的scroll组件在滚动，不操作
      if (Math.abs(moveDistanceY) > Math.abs(moveDistanceX)) {
        return
      }
      if (!this.touch.moved) {
        this.touch.moved = true
      }
      // 歌词页的left属性，如果当前是cd页，那么歌词页就在屏幕右边，left为0，如果被滑到屏幕当前页了，那么left就是负的屏幕宽
      const left = this.currentPageShow === 'cd' ? 0 : -window.innerWidth
      // 计算右歌词DOM变更的距离
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + moveDistanceX))
      // 计算touch偏移的百分比
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      // ，然后操作dom执行
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      // 歌词滑动的过度时间设置为0
      // 歌词滑动的透明度过度设置为0
    },
    middleTouchEnd () {
      if (!this.touch.moved) return
      let offsetWidth, opacity
      const time = 300
      // 如果当前是cd唱片DOM页
      if (this.currentPageShow === 'cd') {
        // 如果偏移百分比大于0.2则直接把offsetWidth变成-window.innerWidth
        if (this.touch.percent > 0.2) {
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentPageShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
        // 如果当前不是cd唱片DOM页，则也进行判断
      } else {
        if (this.touch.percent < 0.8) {
          offsetWidth = 0
          opacity = 1
          this.currentPageShow = 'cd'
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }

      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
      this.touch.initiated = false // 标志位变为false
    },
    showPlaylist () {
      this.$refs.playlist.show()
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE'
    }),
    ...mapActions([
      'savePlayHistory'
    ])
  },
  components: {
    ProgressBar,
    ProgressCircle,
    ScrollBar,
    Playlist,
    CenterTip
  }
}
</script>

<style lang="scss" scoped>
.player {
  .normal-player {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: $color-background;
    z-index: 150;
    .background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.6;
      z-index: -1;
      filter: blur(20px);
    }
    .top {
      position: relative;
      margin-bottom: 25px;
      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg); //逆时针旋转90度
        }
      }
      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        @include no-wrap(); //不换行
        font-size: $font-size-large;
        color: $color-text;
      }
      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }
    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;
      .middle-l {
        display: inline-block; //变行内块元素
        vertical-align: top; //行内元素垂直对齐方式
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;
        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box; //变成弹性盒子
          height: 100%;
          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            &.play {
              animation: rotate 15s linear infinite; //线性无限滚动
            }
            &.pause {
              animation-play-state: paused;
            }
            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }
          }
        }
        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;
          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }
      .middle-r {
        display: inline-block;
        vertical-align: top; //设置行内元素在垂直方向的对齐方式
        width: 100%;
        height: 100%;
        overflow: hidden;
        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;
          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
            &.current {
              color: $color-text;
            }
          }
          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }
    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;
      .dot-wrapper {
        text-align: center;
        font-size: 0;
        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;
          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        margin: 0 auto;
        padding: 10px 0;
        width: 80%;
        .time {
          flex: 0 0 30px;
          width: 30px;
          color: $color-text;
          font-size: $font-size-small;
          line-height: 30px; //行高，内容会自动随着行高的高度而垂直居中
          &.time-l {
            text-align: left;
          }

          &.time-r {
            text-align: right;
          }
        }
        .progress-bar-wrapper {
          flex: 1;
          padding: 0 2%;
        }
      }
      .operators {
        display: flex;
        align-items: center;
        .icon {
          flex: 1;
          color: $color-theme;
          &.disable {
            color: $color-theme-d;
          }
          i {
            font-size: 30px;
          }
        }
        .i-left {
          text-align: right;
        }
        .i-center {
          padding: 0 20px;
          text-align: center;
          i {
            font-size: 40px;
          }
        }
        .i-right {
          text-align: left;
        }
        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }
    &.normal-enter-active,
    &.normal-leave-active {
      transition: all 0.4s;
      .top,
      .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }
    &.normal-enter,
    &.normal-leave-to {
      opacity: 0;
      .top {
        transform: translate3d(0, -100px, 0); //从上到下过渡100px
      }
      .bottom {
        transform: translate3d(0, 100px, 0); //从下到上过渡100px
      }
    }
  }

  .mini-player {
    display: flex;
    align-items: center; //交叉轴垂直居中
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;
    &.mini-enter-active,
    &.mini-leave-active {
      transition: all 0.4s;
    }

    &.mini-enter,
    &.mini-leave-to {
      opacity: 0;
    }
    .icon {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      padding: 0 10px 0 20px;
      img {
        border-radius: 50%;
        &.play {
          animation: rotate 10s linear infinite;
        }
        &.pause {
          animation-play-state: paused;
        }
      }
    }
    .text {
      display: flex;
      flex-direction: column; //将主轴方向设置为交叉位置
      justify-content: center; //在主轴垂直居中
      flex: 1;
      line-height: 20px;
      overflow: hidden;
      .songname {
        margin-bottom: 2px;
        @include no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
      }
      .songdescribe {
        @include no-wrap();
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }
    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;
      .icon-play-mini,
      .icon-pause-mini,
      .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }
      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
  .center-title {
    text-align: center;
    margin: 20px 0;
    .err {
      display: block;
      font-size: 12vh;
    }
    .text {
      display: inline-block;
      padding-top: 16px;
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
