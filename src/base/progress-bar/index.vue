<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <!-- 进度条线 -->
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <!-- 进度条滑动的按钮 -->
      <div class="progress-btn-wrapper" ref="progressBtn" @touchstart="progressTouchStart" @touchmove="progressTouchMove"
        @touchend="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { prefixStyle } from '@/utils/dom.js'
const transform = prefixStyle('transform')
const progressBtnWidth = 16

export default {
  name: 'progressBar',
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  created () {
    this.touch = {}
  },
  watch: {
    percent (newPercent) {
      if (newPercent > 0 && !this.touch.initiated) {
        this.setProgressOffset(newPercent)
      }
    }
  },
  methods: {
    // 设置播放进度条宽度
    setProgressOffset (percent) {
      // 当滑动比例 > 0 同时 触碰的标志位为fasle,那么就设置播放进度条的宽度。
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const offsetWidth = barWidth * percent
      this.setOffsetWidAndTran(offsetWidth)
    },

    // 触碰开始
    progressTouchStart (e) {
      // 当触碰滑动按钮的时候设置一个按钮标志位，用来控制触碰的频率。
      this.touch.initiated = true
      this.touch.startX = e.touches[0].pageX // 当触碰到滑动按钮的时候,记录该按钮在当前屏幕可视区x轴上的距离
      this.touch.progressMovedWidth = this.$refs.progress.clientWidth // 当触碰进度条按钮的时候，记录进度条滑动的宽度
    },

    // 触碰移动中
    progressTouchMove (e) {
      if (!this.touch.initiated) return
      const touchMoveDistance = e.touches[0].pageX - this.touch.startX // 获取移动过程中当前按钮滑动的最新距离(跟进度条当前位置做参考)
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth, Math.max(0, this.touch.progressMovedWidth + touchMoveDistance)) // 偏移的距离不能超过进度条的宽度，所以当偏移的宽度 > 进度条的宽度的时候就直接取进度条的宽度
      // console.log(offsetWidth)
      this.setOffsetWidAndTran(offsetWidth)
    },
    // 触碰结束
    progressTouchEnd (e) {
      this.touch.initiated = false
      // console.log('end', e)
      // 触碰结束后向父组件发生一个percent改变的事件，同时把新的percent发送出去
      this.triggerChangePercent()
    },

    // 点击进度条改变percent，从而改变audio音频的播放地方
    progressClick (e) {
      // 这里当我们点击 progressBtn 的时候，e.offsetX获取不对
      // 获取一个el的矩形属性，rect 是一个具有四个属性left、top、right、bottom的DOMRect对象
      const rect = this.$refs.progressBar.getBoundingClientRect()
      // 偏移量是点击的点到左窗口的距离减去，进度条这个矩形离左窗口的距离
      const offsetWidth = e.pageX - rect.left
      this.setOffsetWidAndTran(offsetWidth) // 当点击进度条某个地方就把该地方的横轴的距离设置为进度的宽度
      this.triggerChangePercent() // 触发改变，向外父组件传递事件和新的Percent
    },

    // 触发改变
    triggerChangePercent () {
      const newPercent = this.getPercent()
      this.$emit('percentChange', newPercent)
    },

    // 获取按钮在进度条上的滑动比例
    getPercent () {
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      return this.$refs.progress.clientWidth / barWidth
    },

    // 设置进度的宽度和按钮滑动的位置
    setOffsetWidAndTran (offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
    }
  }
}
</script>

<style lang="scss" scoped>
.progress-bar {
  height: 30px;
  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);
    .progress {
      position: absolute;
      height: 100%;
      background: $color-theme;
    }
    .progress-btn-wrapper {
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;
      .progress-btn {
        position: absolute;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid $color-text;
        border-radius: 50%;
        background: $color-theme;
      }
    }
  }
}
</style>
