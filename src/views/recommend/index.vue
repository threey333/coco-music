<template>
  <div class="recommend" ref="recommend">
    <scroll-bar ref="ScrollBar" class="recommend-content" :data="discList">
      <!-- BScroll的层级是父子级，子级只有第一个元素才会滚动，想要下面两个同级的div同时滚动，需要在外层包裹一层div，作为外层的一个子元素， -->
      <div>
        <!-- 轮播图 -->
        <div v-if="banners.length" class="slider-wrapper">
          <!-- 轮播图组件 -->
          <slider>
            <template v-for="(item,index) of banners">
              <!-- class="slider-item" -->
              <div :key="index">
                <a href="#" :key="index">
                  <img @load="loadingImg" :src="item.imageUrl" alt="bannersImages" />
                </a>
              </div>
            </template>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <template>
            <ul v-show="discList.length && discList.length>0">
              <songsheet-content @success="handle" :songsheetItem="item" v-for="(item,index) in discList" :key="index"
                ref='songsheetContentItem'>
              </songsheet-content>
            </ul>
          </template>
        </div>
      </div>
      <!-- loading -->
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll-bar>
    <router-view></router-view>
  </div>
</template>

<script>
import { _getBanner, _getSongList } from '@/api/recommend.js'
import { playlistMixin } from '@/utils/mixin.js'
import ScrollBar from '@/base/scrollbar'
import Slider from '@/base/slider'
import Loading from '@/base/loading'
import SongsheetContent from './content/'

export default {
  name: 'recommend',
  mixins: [playlistMixin],
  components: {
    ScrollBar,
    Slider,
    Loading,
    SongsheetContent
  },
  data () {
    return {
      banners: [], // 轮播图数据
      discList: [], // 歌单列表
      checkLoaded: false, // 监听轮播图是否加载
      totalNum: 0
    }
  },
  watch: {
    // 当totalNum到达20的时候，刷新ScrollBar
    totalNum (newNum) {
      if (newNum === 20) {
        this.$refs.recommend.style.bottom = '30px'
        this.$refs.ScrollBar.refresh()
      }
    }
  },
  created () {
    /** 轮播图数据 */
    this.getBanner()
    /** 推荐歌单 */
    this.getDiscList()
  },
  computed: {},
  methods: {
    handlePlaylist (playList) {
      const bottom = playList.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.ScrollBar.refresh()
    },
    // 获取轮播图
    async getBanner () {
      try {
        const { data: res } = await _getBanner()
        if (res.code === 200) {
          this.banners = res.banners.slice(0, 5)
        } else {
          throw new Error('加载数据出错')
        }
      } catch (error) {
        console.log(error)
      }
    },
    // 获取推荐歌单
    async getDiscList () {
      try {
        const { data: res } = await _getSongList(30)
        if (res.code === 200) {
          // 歌单列表
          this.discList = res.result
        } else {
          throw new Error('加载数据出错')
        }
      } catch (error) {
        console.log(error, '105..............')
      }
    },

    /**
     *监听轮播图banner加载，如果加载了重新计算ScrollBar的高度，避免滚动高度问题的出现
     **/
    loadingImg () {
      if (!this.checkLoaded) {
        console.log(141)
        // ScrollBar就是滚动scrollBar组件，其有refresh()方法，重新改计算BScroll。
        this.$refs.ScrollBar.refresh()
        this.checkLoaded = true
      }
    },
    handle (num) {
      this.totalNum += num
    }

  }
}
</script>

<style lang="scss" scoped>
.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  .recommend-content {
    height: 100%;
    overflow: hidden;
    .slider-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
    }
    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-theme;
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
