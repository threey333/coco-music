<template>
  <transition name="drop" apper>
    <div class="center-list" v-show="showFlag" @click.stop="hide">
      <div class="center-list-content">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'CenterTip',
  props: {
    delay: {
      type: Number,
      default: 1200
    }
  },
  data () {
    return {
      showFlag: false
    }
  },
  methods: {
    show () {
      this.showFlag = true
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.hide()
      }, this.delay)
    },
    hide () {
      this.showFlag = false
    }
  }
}
</script>

<style lang="scss" scoped>
.center-list {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  z-index: 500;
  background: rgba(74, 74, 75, 0.9);
  &.drop-enter-active {
    animation: drop-fadein 0.3s;
  }
  &.drop-leave-active {
    animation: drop-zoom 0.3s;
  }
  .center-list-content {
    height: 18vh;
  }

  // &.drop-enter,
  // &.drop-leave-to {
  //   transform: translate3d(0, -100%, 0);
  // }
}

// 定义动画
@keyframes drop-fadein {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes drop-zoom {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
  }
}
</style>
