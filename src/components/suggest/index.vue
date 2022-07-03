<template>
  <pull-up class="suggest" :data="searchData" @scrollToEnd="searchMore" @beforeScroll="listScroll" :beforeScroll="beforeScroll"
    :pull-up-load="pullUpLoad" ref="suggestList">
    <ul class="suggest-list">
      <template v-if="searchData.length>0">
        <li class="suggest-item" v-for="(item,index) in searchData" :key="index" @click="selectItem(item)">
          <div class="icon">
            <i :class="getIconClass(item)"></i>
          </div>
          <div class="name">
            <p class="text">{{item.name}}</p>
          </div>
        </li>
        <loading v-show="hasMore" title=""></loading>
      </template>
    </ul>
    <template v-if="!searchData.length&&!hasMore">
      <div class="no-result-wrapper">
        <no-result title="抱歉，暂无搜索结果"></no-result>
      </div>
    </template>
  </pull-up>
</template>

<script>
import { _searchMoreMatch, _search } from '@/api/search.js'
import { createSinger } from '@/utils/singer.js'
import { createSong } from '@/utils/song.js'
import { mapMutations, mapGetters, mapActions } from 'vuex'
import { _getSongDetail, _getSongsURL } from '@/api/songs.js'
import Loading from '@/base/loading'
import PullUp from '@/base/pullup'
import NoResult from '@/components/no-result'

export default {
  name: 'Suggest',
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      type: 'mobile',
      beforeScroll: true,
      offset: 1, // 分页
      limit: 30, // 每页查询30条
      pullup: true, // pullup组件是否开启上拉加载
      pullUpLoad: true, // 允许上拉刷新
      hasMore: true, // 是否有更多结果，初始为true
      getSingerData: false // 用来判断是否请求过歌手详情数据
    }
  },
  computed: {
    ...mapGetters(['searchData'])
  },
  watch: {
    query (newQuery) {
      // 如果newQuery为空则直接不执行查询接口方法
      if (!newQuery) {
        // 当查询参数没空的时候，如果searchData还有值，则继续清空
        if (this.searchData.length) {
          this.clearSearchData()
          this.getSingerData = false
        }
        return
      }
      // 一开始查询信息的时候，如果Vuex中的searchData中没有数据就不清除searchData数据，反之则清除
      if (this.searchData.length) {
        this.clearSearchData()
      }
      this.getSingerData = false // query每次都改变的时候都把getSingerData变为false,说明需要请求歌手数据
      this.offset = 1 // newQuery变化的时候,分页都要变为1
      // 并发处理请求
      this.allProcessRequest(newQuery)
    }
  },
  methods: {
    // 搜索多重匹配
    async searchMoreMatch (newQuery) {
      const { data: res } = await _searchMoreMatch(newQuery)
      console.log(res)
      if (res.code === 200) {
        const singerArr = []
        const singer = res.result.artist ? createSinger(res.result.artist[0]) : null
        if (singer) {
          singerArr.push(singer)
        }
        return singerArr
      }
    },
    // 搜索
    async search (newQuery, limit, page) {
      this.hasMore = true // 上拉是否加载完所有数据
      const { data: res } = await _search(newQuery, limit, page)
      if (res.code === 200) {
        return res.result
      }
    },
    // 检查是否搜索到数据
    checkSearchData (data, singerData) {
      const songData = data
      if (songData.songs) {
        this.setSearchData([...singerData, ...songData.songs])
      }
      // 每次检查搜索到数据不为零则说明有数据，如果为零则说明没有搜索到数据
      if (songData.songCount !== 0) {
        this.hasMore = !(this.limit * this.offset > songData.songCount) // 当页数*条数 > 搜索歌曲数量songData时，说明滚动到底部没有数据加载了，那么就不再上拉刷新数据。
      } else {
        this.hasMore = false
      }
    },
    // 搜索加载更多
    searchMore () {
      console.log(120)
      if (!this.hasMore) {
        return
      }
      this.offset++
      console.log(this.offset)
      this.allProcessRequest(this.query)
    },
    getIconClass (item) {
      if (item.type === 'singer') {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    listScroll () {
      // 当suggest组件滚动的时候，将listScroll事件发送给父组件search
      this.$emit('listScroll')
    },
    refresh () {
      this.$refs.suggestList.refresh()
    },
    // 获取某首歌曲的详情信息
    async getSongDetail (ids) {
      try {
        const { data: res } = await _getSongDetail(ids)
        if (res.code === 200) {
          return res.songs[0]
        }
      } catch (error) {
        console.log(error)
      }
    },
    // 获取歌曲的url
    async getSongsURL (id) {
      try {
        const { data: res } = await _getSongsURL(id)
        if (res.code === 200) {
          return res.data[0]
        }
      } catch (error) {
        console.log(error)
      }
    },
    selectItem (item) {
      if (item.type === 'singer') {
        this.$router.push({
          path: `/search/${item.id}`
        })
        this.setSinger(item)
      } else {
        Promise.all([this.getSongDetail(item.id), this.getSongsURL(item.id)]).then(res => {
          const [songDetail, songURL] = res
          const searchSongDetail = createSong(songDetail)
          searchSongDetail.url = songURL.url
          this.insertSong(searchSongDetail)
        })
      }
      // 做完上面的操作对外父组件发送一个事件
      this.$emit('select')
    },
    // 并发处理请求方法
    allProcessRequest (newQuery) {
      // 如果已经存在歌手数据了，就直接调用search方法
      if (this.getSingerData) {
        this.search(newQuery, this.limit, this.offset).then(res => {
          const searchResult = res
          console.log(searchResult)
          this.checkSearchData(searchResult, [])
        })
        return true
      } else {
        Promise.all([this.searchMoreMatch(newQuery), this.search(newQuery, this.limit, this.offset)]).then(res => {
          const [singerData, searchResult] = res
          this.getSingerData = true
          this.checkSearchData(searchResult, singerData)
        })
      }
    },

    ...mapMutations({
      setSearchData: 'SET_SEARCH_DATA',
      clearSearchData: 'CLEAR_SEARCH_DATA',
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  components: {
    PullUp,
    Loading,
    NoResult
  }
}
</script>

<style lang="scss" scoped>
.suggest {
  height: 100%;
  overflow: hidden;
  .suggest-list {
    padding: 0 30px;
    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    }
    .icon {
      flex: 0 0 30px;
      width: 30px;
      [class^='icon-'] {
        font-size: 14px;
        color: $color-text-d;
      }
    }
    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;
      .text {
        @include no-wrap();
      }
    }
  }
  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
