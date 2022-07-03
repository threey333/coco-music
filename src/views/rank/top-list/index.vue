<template>
  <transition name="slide" appear>
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songData="rankListSongData"></music-list>
  </transition>
</template>

<script>
import { _getsongsheetDetail as _getRankListDetail } from '@/api/recommend.js'
import { _getSongsheetList as _getRankListSongData } from '@/api/songsheet.js'
import { _getSongsURL } from '@/api/songs.js'
import MusicList from '@/components/music-list'
import { createSong } from '@/utils/song.js'
import { mapGetters } from 'vuex'
export default {
  name: 'topList',
  components: {
    MusicList
  },
  data () {
    return {
      rankListSongData: [],
      rank: true
    }
  },
  computed: {
    title () {
      return this.topList.description
    },
    bgImage () {
      if (this.rankListSongData.length) {
        return this.rankListSongData[0].songImage
      }
      return this.topList.coverImgUrl
    },
    ...mapGetters(['topList'])
  },
  created () {
    if (this.topList.id) {
      this.getRankListDetail().then(async res => {
        const allSongsID = res
        console.log(res)
        const [rankListSongData, url] = await Promise.all([this.getRankListSongData(allSongsID), this.getSongsURL(allSongsID)])
        for (const songItem of rankListSongData) {
          url.forEach(item => {
            if (item.id === songItem.songid) {
              songItem.url = item.url
            }
          })
        }
        this.rankListSongData = rankListSongData
        console.log(this.rankListSongData)
      })
    } else {
      this.isShowTopList()
    }
  },
  methods: {
    // 从排行榜详情信息中的trackIds获取排行榜中的所有歌曲
    async getRankListDetail () {
      try {
        const { data: res } = await _getRankListDetail(this.topList.id)
        if (res.code === 200) {
          const trackIds = [] // 临时存放排行榜中所有歌曲的Ids
          for (const item of res.playlist.trackIds) {
            trackIds.push(item.id)
          }
          return trackIds
        } else {
          throw new Error('加载数据出错')
        }
      } catch (error) {
        console.log(error.message)
      }
    },
    // 获取排行榜中所有的歌曲
    async getRankListSongData (Ids) {
      try {
        if (!Ids) {
          this.isShowTopList()
          return
        }
        console.log(84, Ids)
        const { data: res } = await _getRankListSongData(Ids.join(','))
        if (res.code === 200) {
          const rankListSongData = []
          // 对所有歌曲数据进行处理，转变为我们需要的数据结构
          for (const item of res.songs) {
            rankListSongData.push(createSong(item))
          }
          return rankListSongData
        } else {
          throw new Error('加载数据出错')
        }
      } catch (error) {
        console.log(error.message)
      }
    },
    // 获取所有歌曲的url
    async getSongsURL (allId) {
      const { data: res } = await _getSongsURL(allId)
      try {
        if (res.code === 200) {
          return res.data
        } else {
          throw new Error('加载数据出错')
        }
      } catch (error) {
        console.log(error.message)
      }
    },
    // 跳转到rank页
    isShowTopList () {
      this.$router.push('/rank')
    }
  }

}
</script>

<style lang="scss" scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter,
.slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
