<template>
  <div class="loading">
    <img src="./loading.gif" width="24" height="24">
    <p class="describe">{{title}}</p>
  </div>
</template>

<script>
export default {
  name: 'loading',
  props: {
    title: {
      type: String,
      default: '正在加载中...'
    }
  }
}
</script>

<style lang='scss' scoped>
.loading {
  width: 100%;
  text-align: center;
  .describe {
    line-height: 20px;
    font-size: $font-size-small;
    color: $color-text-l;
  }
}
</style>
