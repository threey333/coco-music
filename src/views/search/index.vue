<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box @query="onQueryChange" ref="searchBox"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query" ref="shortcut">
      <scroll-bar :data="forScrollData" :refreshDelay='refreshDelay' ref="scroll" class="shortcut">
        <div>
          <!-- 热门搜索关键词 -->
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li @click="addQuery(item.first)" v-for="(item,index) in hotSearchKey" :key="index" class="item">
                <span>{{item.first}}</span>
              </li>
            </ul>
          </div>
          <!-- 查询历史 -->
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirmClear">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <!-- 查询历史记录显示列表组件 -->
            <search-list :searches="searchHistory" @select="addQuery" @delete="deleteOne"></search-list>
          </div>
        </div>
      </scroll-bar>
    </div>
    <!-- 搜索建议 -->
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest :query="query" @select="saveSearch" @listScroll="blurInput" ref="suggest"></suggest>
    </div>
    <confirm text="是否清除所有的搜索历史" confirmBtnText="清空" @confirm="deleteAll" ref="confirm"></confirm>
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBox from '@/components/search-box'
import Suggest from '@/components/suggest'
import { _searchKeyWords } from '@/api/search.js'
import { mapActions } from 'vuex'
import SearchList from '@/components/search-list'
import Confirm from '@/components/confirm'
import ScrollBar from '@/base/scrollbar'
import { playlistMixin, searchMixin } from '@/utils/mixin.js'

export default {
  name: 'search',
  mixins: [playlistMixin, searchMixin],
  data () {
    return {
      hotSearchKey: []
    }
  },
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    ScrollBar
  },
  computed: {
    forScrollData () {
      return [...this.hotSearchKey, ...this.searchHistory]
    }

  },
  created () {
    this.searchKeyWords()
  },
  watch: {
    query (newQuery) {
      if (!newQuery) {
        // 即切回热门搜索关键字和搜索历史记录页面部分
        setTimeout(() => {
          this.$refs.scroll.refresh()
        }, 20)
      }
    }
  },
  methods: {
    handlePlaylist (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.shortcut.style.bottom = bottom
      this.$refs.scroll.refresh()
      this.$refs.searchResult.style.bottom = bottom
      // console.log(this)
      this.$refs.suggest.refresh()
    },
    async searchKeyWords () {
      const { data: res } = await _searchKeyWords()
      if (res.code === 200) {
        this.hotSearchKey = res.result.hots
      }
    },
    // 清除查询历史记录
    deleteAll () {
      this.clearSearchHistory()
    },
    showConfirmClear () {
      this.$refs.confirm.show()
    },
    ...mapActions([
      'clearSearchHistory'
    ])
  }
}
</script>

<style lang="scss" scoped>
.search {
  .search-box-wrapper {
    margin: 20px;
  }
  .shortcut-wrapper {
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;
    .shortcut {
      height: 100%;
      overflow: hidden;
      .hot-key {
        margin: 0 20px 20px 20px;
        .title {
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-l;
        }
        .item {
          display: inline-block;
          padding: 5px 10px;
          margin: 0 20px 10px 0;
          border-radius: 6px;
          background: $color-highlight-background;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }
      .search-history {
        position: relative;
        margin: 0 20px;
        .title {
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-l;
          .text {
            flex: 1;
          }
          .clear {
            @include extend-click();
            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
    }
  }
  .search-result {
    position: fixed;
    width: 100%;
    top: 178px;
    bottom: 0;
  }
}
</style>
