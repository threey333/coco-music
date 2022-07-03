<template>
  <div class="progress-circle">
    <!--
      为了更好的控制svg图像的大小,所以width和height都不要写死。
      viewBox属性允许指定一个给定的一组图形伸展以适应特定的容器元素。
    -->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!-- r为半径，这里为班级为50；cx和cy就是坐标 -->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent" />
      <!-- stroke-dasharray即描边，stroke-dashoffset即描边的偏移 -->
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray"
        :stroke-dashoffset="dashOffset" />
    </svg>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'progressCircle',
  props: {
    radius: {
      type: Number,
      default: 100
    },
    // 这里的percent是父组件传进来的值
    percent: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      // 周长
      dashArray: Math.PI * 100 // 这里*100是因为svg中的圆半径为50
    }
  },
  computed: {
    // mini播放器进度条周长
    dashOffset () {
      return this.dashArray * (1 - this.percent)
    }
  }
}
</script>

<style lang="scss" scoped>
.progress-circle {
  position: relative;
  circle {
    stroke-width: 8px;
    transform-origin: center;
    &.progress-background {
      transform: scale(0.9);
      stroke: $color-theme-d;
    }
    &.progress-bar {
      transform: scale(0.9) rotate(-90deg);
      stroke: $color-theme;
    }
  }
}
</style>
