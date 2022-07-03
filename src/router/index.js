/* eslint-disable */
import Vue from 'vue'
import VueRouter from 'vue-router'

/* 路由懒加载 */
const Recommend = () => import(/* webpackChunkName: "recommend" */ '@/views/recommend')
const SongsheetDetail = () => import(/* webpackChunkName: "recommend" */ '@/views/recommend/song-sheet-detail')
const Search = () => import(/* webpackChunkName: "search" */ '@/views/search')
const Singer = () => import(/* webpackChunkName: "singer" */ '@/views/singer')
const SingerDetail = () => import(/* webpackChunkName: "singer" */ '@/views/singer/singer-detail')
const Rank = () => import(/* webpackChunkName: "rank" */ '@/views/rank')
const TopList = () => import(/* webpackChunkName: "rank" */ '@/views/rank/top-list')
const UserCenter = () => import(/* webpackChunkName: "user" */ '@/views/user-center')

/** 解决router重复报错 */
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/recommend' },
  {
    path: '/rank',
    component: Rank,
    children: [
      {
        path: ':id',
        component: TopList
      }
    ]
  },
  {
    path: '/recommend',
    component: Recommend,
    children: [
      {
        path: ':id',
        component: SongsheetDetail
      }
    ]
  },
  {
    path: '/search',
    component: Search,
    children: [
      {
        path: ':id',
        component: SingerDetail
      }
    ]
  },
  {
    path: '/singer',
    component: Singer,
    children: [
      {
        path: ':id',
        component: SingerDetail
      }
    ]
  },
  {
    path: '/user',
    component: UserCenter
  }
]

const router = new VueRouter({
  routes
})

export default router
