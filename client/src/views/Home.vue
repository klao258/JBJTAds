<template>
  <div class="page flex flex-v">
    <SearchForm :fields="['createDate']" @search="onSearch" @reset="onSearch" />
    <div class="flex">
      <n-card :title="v.platform" v-for="(v, k) in userStats" :key="k">
        <template #header-extra>注册总数：{{ v.regCount }}</template>
        <n-data-table
          size="small"
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
    </div>

    <div class="flex flex-1">
      <n-card title="账号统计">
        <n-data-table
          style="height: calc(100% - 39px);"
          size="small"
          :max-height="'calc(100% - 39px)'"
          :columns="[
            { title: '账号', key: 'adsAccount' },
            { title: '注册', key: 'regCount' },
            { title: '付款', key: 'payCount' },
            { title: '金额', key: 'payAmount' },
          ]"
          :data="accountStats"
          :render-cell="renderCell"
        />
      </n-card>
    </div>

    <div class="flex flex-1">
      <n-card title="帖子统计">
        <n-data-table
          style="height: calc(100% - 39px);"
          size="small"
          :max-height="'calc(100% - 39px)'"
          :columns="[
            { title: '标题', key: 'title' },
            { title: '注册', key: 'regCount' },
            { title: '付款', key: 'payCount' },
            { title: '金额', key: 'payAmount' },
          ]"
          :data="postStats" />
      </n-card>
    </div>
  </div>
</template>

<script setup>
import SearchForm from '@/components/Form.vue'
import Table from '@/components/Table.vue'

const loading = ref(false)
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 50
})
const columns = reactive([
  { title: 'ID', key: 'id' },
  { title: '昵称', key: 'nickname' },
  { title: '充值额', key: 'recharge', sortable: true }
])
const tableData = reactive([
  { id: 1, nickname: '用户A', recharge: 100 },
  { id: 2, nickname: '用户B', recharge: 200 }
])

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

const renderCell = (value, rowData, column) => {
  if(column.key === 'adsAccount'){
    return account[value] || value
  }
  return value
}

const onSearch = async (params) => {
  const queryString = new URLSearchParams(params).toString();
  let res = await fetch(`/user/getTodayStats?${queryString}`)
      res = await res.json()
  let data = res?.data || {}
      userStats.splice(0, userStats.length, ...data?.userStats);
      accountStats.splice(0, userStats.length, ...data?.accountStats)
      postStats.splice(0, postStats.length, ...data?.postStats)
  console.log(data)
}

</script>

<style scoped>
h2 {
  color: #42b983;
}
</style>
  