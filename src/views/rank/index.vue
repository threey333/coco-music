<template>
  <div class="rank" ref="rank">
    <scroll-bar class="toplist" :data="topList" ref="topList">
      <ul>
        <li class="item" v-for="(item) in topList" :key="item.id" @click="selectItem(item)">
          <!-- 排行榜左边图标 -->
          <div class="icon">
            <img v-lazy="item.coverImgUrl" width="100%" height="100%">
          </div>
          <div class="songlist">
            <h1>{{item.name}}</h1>
            <p class="time">更新时间：{{item.updateFrequency}}</p>
            <p class="desc">{{item.description}}</p>
            <p class="desc">播放次数：{{item.playCount}}</p>
            <p class="desc">歌曲：{{item.trackCount}}</p>
          </div>
        </li>
      </ul>
      <div class="loading-container" v-show="topThreeSong.length">
        <loading></loading>
      </div>
    </scroll-bar>
    <router-view></router-view>
  </div>
</template>

<script>
import ScrollBar from '@/base/scrollbar'
import Loading from '@/base/loading'
import { _getRankList } from '@/api/ranking.js'
import { playlistMixin } from '@/utils/mixin.js'
import { mapMutations } from 'vuex'

export default {
  name: 'rank',
  mixins: [playlistMixin],
  data () {
    return {
      topList: [],
      topListID: [], // 存放各排行榜榜单的id
      topThreeSong: []
    }
  },
  created () {
    this.getRankList()
  },
  methods: {
    // 获取排行榜数据
    async getRankList () {
      const { data: res } = await _getRankList()
      console.log(res)
      this.topList = res.list
      for (const item of this.topList) {
        this.topListID.push(item.id)
      }
    },
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : 0
      this.$refs.rank.style.bottom = bottom
      this.$refs.topList.refresh()
    },
    selectItem (item) {
      console.log(item)
      this.$router.push({
        path: `/rank/${item.id}`
      })
      this.setTopList(item)
    },
    ...mapMutations({
      setTopList: 'SET_TOP_LIST'
    })

  },
  components: {
    ScrollBar,
    Loading
  }
}
</script>

<style lang="scss" scoped>
.rank {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  .toplist {
    height: 100%;
    overflow: hidden;
    .item {
      display: flex;
      margin: 0 20px;
      padding-top: 20px;
      box-sizing: border-box;
      &:last-child {
        padding-bottom: 20px;
      }
      .icon {
        flex: none;
        width: 18vh;
        height: 18vh;
      }
      .songlist {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        line-height: 3.6vh;
        padding: 0 10px;
        overflow: hidden;
        background: $color-highlight-background;
        color: $color-text-d;
        font-size: $font-size-small;
        h1 {
          flex: 1;
          text-align: center;
          color: $color-text-l;
          font-size: $font-size-vh-medium;
          @include no-wrap();
        }
        .time {
          flex: 1;
          color: $color-text-l;
          font-size: $font-size-vh-small;
        }
        .desc {
          flex: 1;
          color: $color-text-l;
          font-size: $font-size-vh-small;
          @include no-wrap();
          &:last-child {
            padding-bottom: 2px;
          }
        }
      }
    }
    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
