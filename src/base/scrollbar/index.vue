<template>
  <!-- wrapper包装容器 -->
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from '@better-scroll/core'
import ScrollBar from '@better-scroll/scroll-bar'

BScroll.use(ScrollBar)

export default {
  name: 'scrollbar',
  data () {
    return {
      scrollBar: null
    }
  },
  props: {
    /*
      probeType配置项决定是否派发scroll事件
        1. probeType 为 0，在任何时候都不派发 scroll 事件，
        2. probeType 为 1，仅仅当手指按在滚动区域上，每隔 momentumLimitTime 毫秒派发一次 scroll 事件，
        3. probeType 为 2，仅仅当手指按在滚动区域上，一直派发 scroll 事件，
        4. probeType 为 3，任何时候都派发 scroll 事件，包括调用 scrollTo 或者触发 momentum 滚动动画
      这里默认为1
    */
    probeType: { //
      type: Number,
      defalut: 1
    },
    data: { // 传过来的数据，默认为空
      type: Array,
      default: null
    },
    click: { // 手动派发点击事件
      type: Boolean,
      default: true
    },
    refreshDelay: { // 刷新延迟时间
      type: Number,
      default: 20
    },
    listenScroll: { // 要不要监听滚动事件
      type: Boolean,
      default: false
    }
  },
  mounted () {
    // setTimeout定时器刷新频率为17毫秒,初始化操作放在20毫秒后，比较保险
    setTimeout(() => {
      this._initScrollBar()
    }, 20)
  },
  watch: {
    // 监听data，当data数据发生变化就refresh,重新计算BScroll
    data () {
      setTimeout(() => {
        this.refresh()
      }, this.refreshDelay)
    }
  },
  methods: {
    _initScrollBar () {
      // 如果初始化参数是undefined，直接return
      // eslint-disable-next-line no-useless-return
      if (!this.$refs.wrapper) {
        return
      }
      this.scrollBar = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click,
        disableTouch: false
        // disableTouch属性会监听当前环境是否是移动端环境，如果是为false,那么就可以在移动端滚动，如果在PC端则是true,也就是不能在移动端滚动。
      })

      // 是否监听滑动事件
      if (this.listenScroll) {
        // pos:{Object} {x, y} 滚动的实时坐标
        this.scrollBar.on('scroll', (pos) => {
          // 派发一个scroll事件
          this.$emit('scroll', pos)
        })
      }
    },
    enable () {
      /**
       *eenable()是BetterScroll中的方法。
       作用是：启用BScroll,默认是开启。
       *
       */
      this.scrollBar && this.scrollBar.enable()
    },
    disable () {
      /**
       * disable()是BetterScroll中的方法。
       * 作用是：禁用BScroll,DOM事件回调函数不再响应。
       *
       **/
      this.scrollBar && this.scrollBar.disable()
    },
    refresh () {
      /**
       *refresh()是BetterScroll中的方法。
       * 作用是：重新计算BScroll,即当 DOM 结构发生变化的时候务必要调用，确保滚动的效果正常。
       *
       **/
      console.log(110, '刷新了')
      this.scrollBar && this.scrollBar.refresh()
    },

    //  滑动到指定位置
    scrollTo () {
      this.scrollBar && this.scrollBar.scrollTo.apply(this.scrollBar, arguments)
    },
    /**
    * 滚动到指定的目标元素
    */
    scrollToElement () {
      this.scrollBar && this.scrollBar.scrollToElement.apply(this.scrollBar, arguments)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
