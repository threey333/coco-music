<template>
  <ul class="switches">
    <li class="switches-item" :class="{'active':currentIndex === index}" v-for="(item,index) in switches" :key="index"
      @click="switchItem(index)">
      <span>{{item.name}}</span>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'Switches',
  props: {
    switches: {
      type: Array,
      default () {
        return []
      }
    },
    currentIndex: {
      type: Number,
      default: 0
    }

  },
  methods: {
    // 选中哪一个就将事件switch派发出去给父组件
    switchItem (index) {
      this.$emit('switch', index)
    }
  }

}
</script>

<style lang="scss" scoped>
.switches {
  display: flex;
  align-items: center;
  width: 240px;
  margin: 0 auto;
  border: 1px solid $color-highlight-background;
  border-radius: 5px;
  .switches-item {
    flex: 1;
    padding: 8px;
    text-align: center;
    font-size: $font-size-medium;
    color: $color-text-d;
    &.active {
      background: $color-highlight-background;
      color: $color-text;
    }
  }
}
</style>
