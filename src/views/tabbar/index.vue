<template>
  <div class="tabbar">
    <router-link class="tabbar-item" to="/recommend" v-slot="{href,isActive,navigate}" custom>
      <li :class="{'router-link-active ':isActive}" :href="href" @click="navigate">
        <span class="tabbar-link">推荐</span>
      </li>
    </router-link>
    <router-link class="tabbar-item" to="/singer" v-slot="{href,isActive,navigate}" custom>
      <li :class="{'router-link-active ':isActive}" :href="href" @click="navigate">
        <span class="tabbar-link">歌手</span>
      </li>
    </router-link>
    <router-link class="tabbar-item" to="/rank" v-slot="{href,isActive,navigate}" custom>
      <li :class="{'router-link-active ':isActive}" :href="href" @click="navigate">
        <span class="tabbar-link">排行</span>
      </li>
    </router-link>
    <router-link class="tabbar-item" to="/search" v-slot="{href,isActive,navigate}" custom>
      <li :class="{'router-link-active ':isActive}" :href="href" @click="navigate">
        <span class="tabbar-link">搜索</span>
      </li>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'tabbaar'
}
</script>

<style lang="scss" scoped>
.tabbar {
  display: flex;
  height: 44px;
  line-height: 44px;
  font-size: $font-size-medium; //14px
  .tabbar-item {
    flex: 1;
    text-align: center;
    .tabbar-link {
      padding-bottom: 5px;
      color: $color-text-l;
    }
    &.router-link-active {
      .tabbar-link {
        color: $color-theme;
        border-bottom: 2px solid $color-theme;
      }
    }
  }
}
</style>
