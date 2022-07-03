<template>
  <!-- transition添加过渡动画 -->
  <transition name="slide" appear>
    <music-list :songData="songData" :title="title" :bgImage="bgImage"></music-list>
  </transition>
</template>

<script>
import MusicList from '@/components/music-list'
import { mapGetters } from 'vuex'
import { _getSingerHotsongs, _getSingerAlbum } from '@/api/singer'
import { _getSongsURL } from '@/api/songs'
import { createSong } from '@/utils/song.js'

export default {
  name: 'singerDetail',
  data () {
    return {
      songID: null, // 收集某歌手热门50首歌曲的id
      songData: [], // 歌曲总数据汇总结构
      albumData: null
    }
  },
  computed: {
    title () {
      return this.singer.name
    },
    bgImage () {
      return this.singer.picUrl
    },
    ...mapGetters(['singer'])
  },
  created () {
    this.dealAllRequest()
  },
  methods: {
    // 获取某歌手热门50首歌曲
    async getSingerHotsongs () {
      const { id } = this.singer
      // 限制不能直接点击歌手详情页
      if (!id) {
        this.$router.push('/singer')
        return
      }
      try {
        const { data: res } = await _getSingerHotsongs(id)
        console.log('42行---歌手热门50首歌曲', res)
        if (res.code === 200) {
          const songData = []
          const songID = []
          for (const item of res.songs) {
            songID.push(item.id)
            // 工厂模式批量生产我们所需要的数据结构
            songData.push(createSong(item))
          }
          return { songData, songID }// 返回我们自拟的数据结构
        } else {
          return new Error('请求数据出错')
        }
      } catch (error) {
        console.log(error)
      }
    },

    // 获取歌手专辑
    async getSingerAlbum () {
      const { id } = this.singer
      if (!id) {
        this.$router.push('/singer')
        return
      }
      const { data: res } = await _getSingerAlbum(id)
      console.log(res)
      return res.hotAlbums
    },

    // 获取歌手歌曲的url连接
    async getSongURL () {
      if (this.songID) {
        try {
          const { data: res } = await _getSongsURL(this.songID)
          if (res.code === 200) {
            console.log(res)
            // 将歌曲url放入对应歌曲id的地方。
            for (const item of this.songData) {
              res.data.forEach(element => {
                if (element.id === item.songid) {
                  item.url = element.url ? element.url : ''
                }
              })
            }
            console.log(this.songData)
          } else {
            throw new Error('加载数据出错')
          }
        } catch (error) {
          console.log(error.message)
        }
      }
    },

    // 并发处理请求，保证数据有序输出
    dealAllRequest () {
      Promise.all([this.getSingerHotsongs(), this.getSingerAlbum()]).then(res => {
        this.songData = res[0] && res[0].songData
        this.songID = res[0] && res[0].songID
        this.getSongURL()
      }).catch(error => {
        console.log(error)
      })
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

.slide-enter {
  transform: translate3d(100%, 0, 0);
}
.slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
