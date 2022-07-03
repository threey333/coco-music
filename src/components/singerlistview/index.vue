<template>
  <div class="listview">
    <div class="category-menu">
      <h2 class="artist-category-menu-item">
        <div @click='handleTypesClick(index)' v-for="(item,index) of types" :key="index"
          :class="{'current':currentType===item.value}">{{item.content}}</div>
      </h2>
      <h2 class="artist-category-menu-item">
        <div @click="handleAreasClick(index)" v-for="(item,index) of areas" :key="index"
          :class="{'current':currentArea===item.value}">{{item.content}}</div>
      </h2>
    </div>
    <pullup @changeoffset="handleOffsetchange" :data="singerList" class="scrollbar-view" ref="listview" :pullUpLoad="pullUpLoad">
      <div class="singerlist-group">
        <ul>
          <li @click="selectSingerItem(group)" class="singerlist-group-item" v-for="(group,index) of singerList" :key="index">
            <img v-lazy="group.picUrl" class="avatar" />
            <div class="describeBox">
              <span class="name">歌手：{{group.name}}</span>
              <span class="music-size">歌曲：{{group.musicSize}}</span>
            </div>
          </li>
        </ul>
        <div class="pullup-tips" v-show="singerList.length">
          <div v-if="!offsetBoolean">
            <span>上拉加载更多</span>
          </div>
          <div v-else>
            <loading title=''></loading>
          </div>
        </div>
      </div>
      <!-- 绝对定位在右边的一个列表 -->
      <div class="singer-name-list">
        <ul>
          <li v-for="(item,index) of Fnames" :key="index" class="item" :class="{'current':currentName === item.value}"
            @click="handleNamesClick(index)">
            {{item.content}}</li>
        </ul>
      </div>
      <loading class="loading-container" v-if="!singerList.length"></loading>
    </pullup>
  </div>
</template>

<script>
import Loading from '@/base/loading'
import Pullup from '@/base/pullup'
import { _getSingerList } from '@/api/singer.js'
import { createSinger } from '@/utils/singer.js'

export default {
  name: 'singerlistview',
  props: {
    data: {
      type: Array,
      default: () => {
        return []
      }
    },
    areas: {
      type: Array,
      default: () => {
        return []
      }
    },
    types: {
      type: Array,
      default: () => {
        return []
      }
    },
    Fnames: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      currentArea: -1, // 获取全部
      currentType: -1, // 获取全部
      currentName: -1, // 获取热门
      limit: 30, // 返回歌手数量
      offset: 1, // 分页
      singerList: [],
      offsetBoolean: false,
      pullUpLoad: true // 允许上拉加载
    }
  },
  created () {
    this.getSingerList()
  },
  methods: {
    async getSingerList () {
      try {
        const singerList = []
        const { data: res } = await _getSingerList(
          this.currentArea, // 歌手地区,比如有全部、华语、欧美、日本、韩国、其它
          this.limit, // 返回数量，默认是30条
          this.currentName, // 按字母查询参数，-1为热门
          this.currentType, // 类型，比如有全部（-1）、男歌手（1），女歌手（2），乐队（3）
          this.offset // 用于分页，默认为0，这里为1
        )
        for (const item of res.artists) {
          singerList.push(createSinger(item))
        }
        if (res.code === 200 && this.offsetBoolean) {
          this.singerList = [...this.singerList, ...singerList]
          this.offsetBoolean = false
        } else {
          this.singerList = singerList
        }
      } catch (error) {
        console.log(error)
      }
    },

    /** 处理根据名字首字母查找 */
    handleNamesClick (index) {
      this.$refs.listview.offset = 1
      this.$refs.listview.scrollTo(0, 0)
      this.currentName = this.Fnames[index].value
      this.getSingerList()
    },

    /** 处理types menu点击事件 */
    handleTypesClick (index) {
      this.$refs.listview.offset = 1
      this.$refs.listview.scrollTo(0, 0)
      console.log(index, this.types[index].value)
      this.currentType = this.types[index].value
      this.getSingerList()
    },

    /** 处理语种menu点击事件 */
    handleAreasClick (index) {
      this.$refs.listview.offset = 1
      this.$refs.listview.scrollTo(0, 0)
      console.log(index, this.areas[index].value)
      this.currentArea = this.areas[index].value
      this.getSingerList()
    },

    /**
     * 处理pullup组件在底部上拉刷新数据，这里看似为分页
     * 这个方法是传给子组件pullup使用的。
     **/
    async handleOffsetchange (offset, finishPullUp) {
      // offsetBoolean是控制底部上拉加载时的样式。
      this.offsetBoolean = true
      this.offset = offset
      await this.getSingerList()
      this.$refs.listview.isPullUpLoad = true
      this.$refs.listview.offset += 1
      console.log(this.offset)
      /**
       * pullingUp 事件的消费机会只有一次。
       * 因此需要调用 finishPullUp() 来告诉 BetterScroll 来提供下一次 pullingUp 事件的消费机会。
       **/
      finishPullUp()
      this.$refs.listview.refresh()
    },

    selectSingerItem (item) {
      this.$emit('select', item) // 发送给父组件singer
    },

    refresh () {
      this.$refs.listview.refresh()
    }
  },
  components: {
    Pullup,
    Loading
  }
}
</script>

<style scoped lang="scss">
.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;
  .category-menu {
    height: auto;
    .artist-category-menu-item {
      height: 30px;
      line-height: 30px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
      display: flex;
      div {
        width: calc(100% / 6);
        text-align: center;
        &.current {
          color: $color-theme;
        }
      }
    }
  }
  .scrollbar-view {
    position: relative;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 91.8%;
    overflow: hidden;
    .singerlist-group {
      padding-bottom: 10px;
      .singerlist-group-item {
        display: flex;
        align-items: center;
        padding: 20px 0 0 30px;
        .avatar {
          width: 14vw;
          height: 14vw;
          border-radius: 50%;
        }
        .describeBox {
          display: flex;
          flex-direction: column;
          width: 100%;
          .name {
            margin-left: 20px;
            color: $color-text-ll;
            font-size: $font-size-medium;
          }
          .music-size {
            margin-top: 10px;
            margin-left: 20px;
            color: $color-text-l;
            font-size: $font-size-small;
          }
        }
      }
      .pullup-tips {
        width: 100%;
        height: 4vh;
        line-height: 4vh;
        padding: 5px;
        text-align: center;
        color: $color-text-l;
      }
    }

    .singer-name-list {
      position: absolute;
      z-index: 30;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 9vw;
      // padding: 10px 0;
      border-radius: 10px;
      text-align: center;
      background: $color-background-d;
      font-family: Helvetica;
      .item {
        padding: 3px;
        line-height: 0.9; //1
        color: $color-text-l;
        font-size: 2vh; //$font-size-small
        &.current {
          color: $color-theme;
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
