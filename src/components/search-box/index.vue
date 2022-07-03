<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input class="box" v-model="query" :placeholder="placeholder" ref="query">
    <i v-show="query" class="icon-dismiss" @click="clear"></i>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import Util from '@/utils/util.js'

export default {
  name: 'SearchBox',
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  data () {
    return {
      query: ''
    }
  },
  /**
   * vm.$watch实例方法相当于watch监听器
   * @param {String} query data中的query数据
   * @param {Object|Function} 回调函数
   *
  */
  created () {
    // 节流搜索
    this.$watch('query', Util.debounce(newQuery => {
      this.$emit('query', newQuery)
    }, 200))
  },
  methods: {
    clear () {
      this.query = ''
      this.clearSearchData()
    },
    setQuery (newQuery) {
      this.query = newQuery
    },
    blur () {
      this.$refs.query.blur() // 失去焦点刷新提醒的功能
    },
    ...mapMutations({
      clearSearchData: 'CLEAR_SEARCH_DATA'
    })
  }
}
</script>

<style lang="scss" scoped>
.search-box {
  display: flex;
  align-items: center; //交叉轴方向垂直
  box-sizing: border-box; //将盒子变为弹性盒子
  width: 100%;
  padding: 0 6px;
  height: 40px;
  background: $color-highlight-background;
  border-radius: 6px;
  .icon-search {
    font-style: 24px;
    color: $color-background;
  }
  .box {
    flex: 1;
    margin: 0 5px;
    line-height: 18px;
    background: $color-highlight-background;
    color: $color-text;
    font-size: $font-size-medium;
    outline: none;
    // 下面都是为了兼容各浏览器，此时要配合js才能实现
    &::-webkit-input-placeholder {
      color: $color-text-d;
    }
    &::-moz-placeholder {
      color: $color-text-d;
    }
    &::-ms-input-placeholder {
      color: $color-text-d;
    }
    &::placeholder {
      color: $color-text-d;
    }
  }
  .icon-dismiss {
    font-size: 16px;
    color: $color-background-s;
  }
}
</style>
