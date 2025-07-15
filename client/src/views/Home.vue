<template>
  <div class="page flex flex-v">
    <SearchForm :fields="['dateRange']" @search="onSearch" @reset="onSearch" />

    <div class="flex-1">
      <n-tabs type="line" v-model:value="currentTab" animated style="height: 100%;" ref="postTableRef" >
        <n-tab-pane name="platform" tab="平台统计" style="height: 100%; overflow: auto;">
          <n-card class="flex-1" :title="v.platform" v-for="(v, k) in userStats" :key="k">
            <template #header-extra>注册总数：{{ v.regCount }}</template>
            <n-data-table
              size="small"
              :max-height="postTableHeight"
              :columns="[
                { title: '名称', key: 'upname' },
                { title: '编码', key: 'upcode' },
                { title: '注册', key: 'regCount' },
                { title: '付款', key: 'payCount' },
                { title: '金额', key: 'payAmount' },
              ]"
              :data="v.children"
            />
          </n-card>
        </n-tab-pane>

        <n-tab-pane name="account" tab="账号统计" style="height: 100%;">
          <n-card title="">
            <n-data-table
              size="small"
              :max-height="postTableHeight"
              :columns="[
                { title: '账号', key: 'adsAccount' },
                { title: '平台', key: 'platform' },
                { title: '注册', key: 'regCount' },
                { title: '付款', key: 'payCount' },
                { title: '金额', key: 'payAmount' },
              ]"
              :data="accountStats"
              :render-cell="renderCell"
            />
          </n-card>
        </n-tab-pane>

        <n-tab-pane name="post" tab="帖子统计" style="height: 100%;">
          <n-card title="">
            <n-data-table
              size="small"
              :max-height="postTableHeight"
              :columns="[
                { title: '标题', key: 'title' },
                { title: '注册', key: 'regCount' },
                { title: '付款', key: 'payCount' },
                { title: '金额', key: 'payAmount' },
              ]"
              :data="postStats"
            />
          </n-card>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup>
import SearchForm from '@/components/Form.vue'
import { getTodayStats } from '@/api'

const currentTab = ref('platform')

const account = {
  ZhaoShang: '金貝招商',
  BeiBei: 'ads 贝贝',
  HuanHuan: 'ads 欢欢',
  KeKe: 'ads 可可',
  FeiFei: 'ads 菲菲',
  TouTou: 'ads 头头',
  LaoK: 'ads 老k',
  ADSZuZhi: 'ADS组织',
  GZKK: '金貝推广-KK',
  GZTianTian: '金貝推广-天天',
  JingJing: 'ads 晶晶',
  YingYing: 'ads 莹莹',
  NiNi: 'ads 妮妮',
  GZQiQi: '金貝推广-七月',
  TS1: '天胜1',
  TS2: '天胜2',
  TSXiaoBao: '天胜3',
  TSGuoBa: '天胜4',
  TS5: '天胜5',
  TS6: '天胜6',
}
const userStats = reactive([])
const accountStats = reactive([])
const postStats = reactive([])

const postTableRef = ref(null)
const postTableHeight = ref(400) // 默认高度

// 设置表格高度
const setPostTableHeight = async () => {
  await nextTick() // 确保 DOM 已渲染
  if (postTableRef.value) {
    const height = postTableRef.value?.$el?.clientHeight
    postTableHeight.value = height - 42 - 12 - 40 - 20 // 自定义偏移，例如减去表头高度
  }
}


// 格式化单元格数据
const renderCell = (value, rowData, column) => {
  if(column.key === 'adsAccount'){
    return account[value] || value
  }
  return value
}

// 获取数据
const onSearch = async (params) => {
  let res = await getTodayStats(params)
  userStats.splice(0, userStats.length, ...res?.userStats);
  accountStats.splice(0, accountStats.length, ...res?.accountStats)
  postStats.splice(0, postStats.length, ...res?.postStats)

  setPostTableHeight()
}
</script>

<style scoped>
h2 {
  color: #42b983;
}
</style>
  