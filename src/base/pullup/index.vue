<template>
  <div ref="pullup">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from '@better-scroll/core'
import Pullup from '@better-scroll/pull-up'

BScroll.use(Pullup)

export default {
  name: 'pullup',
  props: {
    data: {
      type: Array,
      default: null
    },
    probeType: { //
      type: Number,
      defalut: 1
    },
    click: { // 手动派发点击事件
      type: Boolean,
      default: true
    },
    refreshDelay: { // 刷新延迟时间
      type: Number,
      default: 20
    },
    offsetchange: {
      type: Object,
      defalut: null
    },
    // 上拉加载，默认是不开启
    pullUpLoad: {
      type: Boolean,
      default: false
    },
    listenScroll: { // 要不要监听滚动事件
      type: Boolean,
      default: false
    },
    beforeScroll: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      pullup: null,
      offset: 2,
      isPullUpLoad: true
    }
  },
  mounted () {
    setTimeout(() => {
      this.initPullup()
    }, 20)
  },
  watch: {
    data () {
      setTimeout(() => {
        this.refresh()
        console.log('pullup组件重新刷新了,重置了pullup组件DOM')
      }, this.refreshDelay)
    }
  },
  methods: {

    initPullup () {
      if (!this.$refs.pullup) {
        return
      }
      this.pullup = new BScroll(this.$refs.pullup, {
        scrollY: true,
        probeType: this.probeType,
        click: this.click,
        disableTouch: false,
        // 允许上拉
        pullUpLoad: this.pullUpLoad
      })

      // 是否监听滑动事件
      if (this.listenScroll) {
        // pos:{Object} {x, y} 滚动的实时坐标
        this.pullup.on('scroll', (pos) => {
          // 派发一个scroll事件
          this.$emit('scroll', pos)
        })
      }

      // console.dir(this.pullup.finishPullUp)
      /* pullingup事件，即底部上拉距离超过阈值时触发 */
      if (this.isPullUpLoad) {
        this.isPullUpLoad = false
        this.pullup.on('pullingUp', () => {
          this.$emit('changeoffset', this.offset, this.pullup.finishPullUp)
        })
      }

      // 监听上拉加载是否已经加载到底部，
      if (this.pullUpLoad) {
        const maxY = this.pullup.maxScrollY
        this.pullup.on('scrollEnd', () => {
          if (this.pullup.y <= this.pullup.maxScrollY + 50 && this.pullup.maxScrollY <= maxY) {
            // 说明快滚动到底部了
            this.$emit('scrollToEnd')
          }
        })
      }
      // 监听开始滚动
      if (this.beforeScroll) {
        this.pullup.on('beforeScrollStart', () => {
          this.$emit('beforeScroll')
        })
      }
    },
    refresh () {
      this.pullup && this.pullup.refresh()
    },
    enable () {
      this.pullup && this.pullup.enable()
    },
    disable () {
      this.pullup && this.pullup.disable()
    },

    scrollTo () {
      this.pullup && this.pullup.scrollTo.apply(this.pullup, arguments)
    }
    // /** 下拉刷新新数据 */
    // refreshNewdata () {

    // }
  }
}

</script>

<style lang="scss" scoped>
</style>
