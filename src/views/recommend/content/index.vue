<template>
  <li class="item" @click="selectItem(songsheetItem,songsheetTrackIds)">
    <div class="icon">
      <img v-lazy="songsheetItem.picUrl" width="90" height="90">
    </div>
    <div class="text">
      <h2 class="name padding" v-html="songsheetItem.name"></h2>
      <p class="desc padding">歌曲：{{songsheetItem.trackCount}}</p>
      <p class="desc padding">播放次数：{{songsheetItem.playCount}}</p>
      <p class="desc">{{songsheetDesc}}</p>
    </div>
  </li>
</template>

<script>
import { _getsongsheetDetail } from '@/api/recommend.js'
import { mapMutations } from 'vuex'

export default {
  name: 'SongsheetContent',
  props: {
    songsheetItem: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      songsheetDesc: '',
      songsheetTrackIds: []
    }
  },
  created () {
    if (this.songsheetItem) {
      this.getPlaylistDetail()
    }
  },
  methods: {
    // 获取各歌单详情
    async getPlaylistDetail () {
      const id = this.songsheetItem.id
      try {
        const { data: res } = await _getsongsheetDetail(id)
        if (res.code === 200) {
          this.songsheetDesc = res.playlist.description || '该歌单暂时没有描述'
          const { playlist: { trackIds } } = res
          const Ids = []
          trackIds.forEach(item => {
            Ids.push(item.id)
          })
          this.songsheetTrackIds = Ids
          this.success()
        } else {
          throw new Error('加载数据失败')
        }
      } catch (error) {
        console.log(error)
      }
    },
    selectItem (songsheet, songsheetDetail) {
      console.log(songsheet, songsheetDetail)
      this.$router.push({
        path: `/recommend/${songsheet.id}`
      })
      this.setSongSheet(songsheet)
      this.setSongSheetAllSongID(songsheetDetail)
    },
    success () {
      this.$emit('success', 1)
    },
    ...mapMutations({
      setSongSheet: 'SET_SONGSHEET',
      setSongSheetAllSongID: 'SET_SONGSHEET_ALLSONGID'
    })
  }

}
</script>

<style lang="scss" scoped>
.item {
  display: flex;
  box-sizing: border-box; //将盒子变为弹性盒子
  padding: 0 20px 10px;
  align-items: center;
  .icon {
    flex: none;
    width: 90px;
    padding-right: 18px;
  }
  .text {
    display: flex;
    flex-direction: column; //设置交叉轴为主轴方向。
    justify-content: center;
    flex: 1;
    line-height: 20px;
    overflow: hidden;
    font-size: $font-size-medium;
    .padding {
      padding-bottom: 2px;
    }
    .name {
      color: $color-text-ll;
      @include no-wrap();
    }
    .desc {
      color: $color-text-l;
      @include no-wrap();
    }
  }
}
</style>
