<template>
  <!-- slider包装器 -->
  <div class="slider" ref="slider">
    <!-- slider-group 在样式中没有设置宽，这里我们要在js中手动设置宽 -->
    <div class="slider-group" ref="sliderGroup">
      <!-- 匿名插槽占坑 -->
      <slot></slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item,index) of dots" :key="index" :class="{active:currentPageIndex===index}"></span>
    </div>
  </div>
</template>

<script>
import { addClass } from '@/utils/dom.js'

import BScroll from '@better-scroll/core'
// import ScrollBar from '@better-scroll/scroll-bar'
import Slide from '@better-scroll/slide'
// 使用插件
BScroll.use(Slide)

export default {
  name: 'slider',
  data () {
    return {
      // dots 点，即轮播图中的小圆圈
      slider: null,
      dots: [],
      children: [],
      currentPageIndex: 0,
      timer: 0, // 存放轮播的定时器
      resizeTimer: 0 // 调整大小时的定时器
    }
  },
  props: {
    // 默认循环轮播
    loop: {
      type: Boolean,
      default: true
    },
    // 默认自动播放
    autoPlay: {
      type: Boolean,
      default: true
    },
    // 轮播间隔,默认4s
    interval: {
      type: Number,
      default: 4000
    }
  },
  created () {

  },
  mounted () {
    // 定时器刷新频率为17毫秒，这里直接设置20毫秒就好了。
    setTimeout(() => {
      this.setSliderWidth()
      this.initDots()
      this.initSlider()

      // 判断是否自动播放
      if (this.autoPlay) {
        // 切换下一页
        this.playNext()
      }
    }, 20)

    /* 窗口调整大小 */
    window.addEventListener('resize', () => {
      /**
      *   enabled属性是BetterScroll插件中的属性。
      *   作用是：判断BetterScroll是否初始化，或者是初始化是否处于启动状态
      *  */
      // eslint-disable-next-line no-useless-return
      if (!this.slider || !this.slider.enabled) return
      if (this.resizeTimer) clearTimeout(this.resizeTimer)
      // 判断当前scroll是否处于滚动动画过程中
      this.resizeTimer = setTimeout(() => {
        // pending属性是判断BetterScroll是否处于滚动动画过程中
        if (this.slider.pending) {
          this._onScrollEnd()
        } else {
          if (this.autoPlay) {
            this.playNext()
          }
        }
        this.refresh()
      }, 60)

      /**
         * refresh()是BetterScroll插件中的方法。
         * 作用：重新计算 BetterScroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常。
         *  */
    })
  },
  // keep-alive 组件激活时，slider再次被激活，并归于初始化状态
  activated () {
    this.slider.enable()
    const pageIndex = this.slider.getCurrentPage().pageX
    this.slider.goToPage(pageIndex, 0, 0)
    this.currentPageIndex = pageIndex
    if (this.autoPlay) {
      this.playNext()
    }
  },
  beforeDestroy () {
    this.slider.disable()
    clearTimeout(this.timer)
  },
  deactivated () {
    this.slider.disable()
    clearTimeout(this.timer)
  },
  methods: {
    // 设置宽度方法
    setSliderWidth (isResize) {
      // vm.$children是当前实例的直接子组件，改属性配合数组使用
      this.children = this.$refs.sliderGroup.children

      // 轮播图的宽度占一屏，slider的宽度之和==每一个轮播图的宽度之和。
      // eslint-disable-next-line no-unused-vars
      let sliderWidth = 0
      const clientWidth = this.$refs.slider.clientWidth

      for (let i = 0, length = this.children.length; i < length; i++) {
        // 给每个轮播图添加slider-item样式
        const child = this.children[i]
        addClass(child, 'slider-item')
        child.style.width = clientWidth + 'px'
        sliderWidth += clientWidth
      }

      // 为了使better-scoll能无缝切换滚动，这里要给slider-group前后再添加一个clientWidth宽度
      // reResize第一次为underfined，保证了sliderWidth只增加1次。
      if (this.loop && !isResize) {
        sliderWidth += 2 * clientWidth
      }

      this.$refs.sliderGroup.style.width = sliderWidth + 'px'
    },
    initDots () {
      // 轮播图中的点数跟sliderGroup.children长度一样,即长度为5
      this.dots = new Array(this.children.length)
    },
    // 初始化Slider
    initSlider () {
      // 使用BSscroll插件进行轮播切换的时候，它会帮我们克隆两份轮播图，从而实现无缝轮播。
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        click: true,
        disableTouch: false,
        momentum: false, // 避免惯性动画带来的快速滚动闪烁的问题
        slide: {
          loop: this.loop, // 控制无限滚动
          threshold: 0.3, // 手动切换时的阈值
          speed: 400
        }
      })
      // 使用BSscroll初始化slider后，sliderGroup.children等长度变7
      /**
       * 随机轮播图滚动，改变currentPageIndex的值
       * 这里使用的是BetterScroll中的on方法
       * @param {string} type 事件名
       * @param {Function} fn 回调函数
       * @param {Object} context 函数执行上下文环境，默认是this
       *  */
      this.slider.on('scrollEnd', this._onScrollEnd)
    },
    _onScrollEnd () {
      /**
      * getCurrentPage()方法是BetterScroll中的slider插件方法，返回值是page
      **/
      this.currentPageIndex = this.slider.getCurrentPage().pageX // 滚动到第几个图片，从0开始，与index对应
      if (this.autoPlay) {
        this.playNext()
      }
    },
    // 轮播图滚动方法。
    playNext () {
      // 每次轮播之前判断是有定时器，如果有则清除
      if (this.timer) clearTimeout(this.timer)
      // 轮播图自动切换
      this.timer = setTimeout(() => {
        /**
         * next()方法是BetterScroll中slider插件的方法，功能是滚动到下一张
         *  */
        this.slider.next()
      }, this.interval)
    },
    // 当浏览器窗口被调整时会触发的方法
    refresh () {
      if (this.slider) {
        this.setSliderWidth(true)
        /**
         * refresh()是BetterScroll插件中的方法。
         * 作用：重新计算 BetterScroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常。
         *  */
        this.slider.refresh()
      }
    }

  }
}
</script>

<style lang="scss" scoped>
.slider {
  min-height: 1px; //最小高度为1px,即高度不能低于1px。
  .slider-group {
    position: relative;
    overflow: hidden; //溢出的隐藏
    white-space: nowrap; //一行显示，不换行
    .slider-item {
      float: left;
      box-sizing: border-box;
      overflow: hidden;
      text-align: center;
      a {
        display: block;
        width: 100%;
        overflow: hidden;
        text-decoration: none; //去除超链接的下划线
      }
      img {
        display: block;
        width: 100%;
      }
    }
  }
  .dots {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 12px;
    text-align: center;
    font-size: 0;
    .dot {
      display: inline-block;
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
}
</style>
