<template>
  <div class="search-list">
    <!--
      为了能让删除有个过渡效果,这里使用个过渡动画
      transition-group:列表过渡
    -->
    <transition-group name="list" tag="ul">
      <!-- 父组件search将查询历史记录信息传进来,即searches -->
      <li v-for="item in searches" :key="item" @click="selectItem(item)" class="search-item">
        <span class="text">{{item}}</span>
        <!-- 添加.stop修饰符是防止冒泡 -->
        <span class="icon" @click.stop="deleteOne(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'searchList',
  props: {
    searches: {
      type: Array,
      default () {
        return []
      }
    }
  },
  methods: {
    selectItem (item) {
      console.log(item)
      this.$emit('select', item)
    },
    deleteOne (item) {
      this.$emit('delete', item)
    }
  }
}

</script>

<style lang="scss" scoped>
.search-list {
  .search-item {
    display: flex;
    align-items: center;
    height: 40px;
    overflow: hidden;
    &.list-enter-active,
    &.list-leave-active {
      transition: all 0.1s;
    }
    &.list-enter,
    &.list-leave-to {
      height: 0;
    }
    .text {
      flex: 1;
      color: $color-text-l;
    }
    .icon {
      @include extend-click();
      .icon-delete {
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }
  }
}
</style>
