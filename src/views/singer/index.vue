<template>
  <div class="singer" ref="singer">
    <singerlist-view @select="selectSingerItem" :areas="areas" :types="types" :Fnames="Fnames" ref="singerlist"></singerlist-view>
    <router-view></router-view>
  </div>

</template>

<script>
import { areas, types, Fnames } from './data.js'
import SingerlistView from '@/components/singerlistview'
import { mapMutations } from 'vuex'
import { playlistMixin } from '@/utils/mixin.js'

export default {
  mixins: [playlistMixin],
  name: 'singer',
  components: {
    SingerlistView
  },
  data () {
    return {
      areas,
      types,
      Fnames
    }
  },
  methods: {
    selectSingerItem (item) {
      this.$router.push({
        path: `/singer/${item.id}`
      })
      this.setSinger(item)
    },
    handlePlaylist (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.singerlist.refresh()
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  }

}
</script>

<style lang="scss" scoped>
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>
