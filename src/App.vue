<template>
  <div id="app">
    <m-header></m-header>
    <tabbar></tabbar>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
// 导入头部标题组件
import MHeader from '@/views/m-header'
// 导入切换标签栏
import Tabbar from '@/views/tabbar'
// 播放器不属于任何组件的，所以在根组件导入
import Player from '@/components/player'

export default {
  components: {
    MHeader,
    Tabbar,
    Player
  }
}
</script>

<style>
</style>
