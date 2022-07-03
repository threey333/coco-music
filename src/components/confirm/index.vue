<template>
  <transition name="confirm-fade">
    <div class="confirm" v-show="showFlag" @click.stop>
      <!-- 确认容器 -->
      <div class="confirm-wrapper">
        <!-- 确认内容 -->
        <div class="confirm-content">
          <p class="text">{{text}}</p>
          <!-- 按钮操作 -->
          <div class="operate">
            <div class="operate-btn left" @click="cancel">{{cancelBtnText}}</div>
            <div class="operate-btn" @click="confirm">{{confirmBtnText}}</div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'confirm',
  props: {
    text: {
      type: String,
      default: ''
    },
    confirmBtnText: {
      type: String,
      default: '确定'
    },
    cancelBtnText: {
      type: String,
      default: '取消'
    }
  },
  data () {
    return {
      showFlag: false // 是否显示
    }
  },
  methods: {
    // 外部调用show方法
    show () {
      this.showFlag = true
    },
    // 外部调用隐藏
    hide () {
      this.showFlag = false
    },
    // 监听取消事件
    cancel () {
      this.hide()
      this.$emit('cancel')
    },
    // 监听确认事件
    confirm () {
      this.hide()
      this.$emit('confirm')
    }
  }
}
</script>

<style lang="scss" scoped>
.confirm {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 998;
  background-color: $color-background-d;
  &.confirm-fade-enter-active {
    animation: confirm-fadein 0.3s; //confirm-fadein即动画名称.fadein:淡入
    .confirm-content {
      animation: confirm-zoom 0.3s; //confirm-zoom即动画名称
    }
  }
  .confirm-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;
    .confirm-content {
      width: 270px;
      border-radius: 13px;
      background: $color-highlight-background;
      .text {
        padding: 19px 15px;
        line-height: 22px;
        text-align: center;
        font-size: $font-size-large;
        color: $color-text-l;
      }
      .operate {
        display: flex;
        align-items: center;
        text-align: center;
        font-size: $font-size-large;
        .operate-btn {
          flex: 1;
          line-height: 22px;
          padding: 10px 0;
          border-top: 1px solid $color-background-d;
          color: $color-text-d;
          &.left {
            border-right: 1px solid $color-background-d;
          }
        }
      }
    }
  }
}

// 定义动画
@keyframes confirm-fadein {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes confirm-zoom {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
