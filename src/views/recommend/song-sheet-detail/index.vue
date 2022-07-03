<template>
  <transition name="slide" appear>
    <music-list :songData="songsheetData" :title="title" :bgImage="bgImage"></music-list>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import { _getSongsheetList } from '@/api/songsheet.js'
import { createSong } from '@/utils/song.js'
import { _getSongsURL } from '@/api/songs.js'
import MusicList from '@/components/music-list'

export default {
  name: 'songsheetDetail',
  data () {
    return {
      songsheetData: [] // 歌单中的总歌曲数据汇总
    }
  },
  computed: {
    title () {
      return this.songsheet.name
    },
    bgImage () {
      return this.songsheet.picUrl
    },
    ...mapGetters(['songsheet', 'songsheetAllSongID'])
  },
  created () {
    this.getSongURL()
  },
  methods: {
    // 获取歌单中的所有歌曲(不包括歌曲url)
    async getSongsheetList () {
      if (!this.songsheet.id) {
        this.$router.push({
          path: '/recommend'
        })
        return
      }
      try {
        if (this.songsheetAllSongID.length > 0) {
          const id = this.songsheetAllSongID.join(',')
          const { data: res } = await _getSongsheetList(id)
          if (res.code === 200) {
            const songsheetData = []
            for (const item of res.songs) {
              songsheetData.push(createSong(item))
            }
            return songsheetData
          } else {
            throw new Error('加载数据失败')
          }
        } else {
          return
        }
      } catch (error) {
        console.log(error.message)
      }
    },

    // 获取歌曲所有歌曲的url
    async getSongURL () {
      this.songsheetData = await this.getSongsheetList()
      if (this.songsheetAllSongID.length) {
        try {
          const id = this.songsheetAllSongID
          const { data: res } = await _getSongsURL(id)
          if (res.code === 200) {
            // 将歌曲url放入对应歌曲id的地方。
            for (const item of this.songsheetData) {
              res.data.forEach(element => {
                if (element.id === item.songid) {
                  item.url = element.url
                }
              })
            }
            console.log(this.songsheetData)
          } else {
            return new Error('加载出错了')
          }
        } catch (error) {
          console.log(error)
        }
      }
    }

  },

  components: {
    MusicList
  }
}
</script>

<style lang="scss" scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s;
}

.slide-enter,
.slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
