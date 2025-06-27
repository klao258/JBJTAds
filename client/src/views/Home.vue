<template>
  <div>
    <SearchForm @search="onSearch" @reset="onSearch" />
    <Table
      :columns="columns"
      :data="tableData"
      :pagination="pagination"
    />
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

onMounted(() => {
  getTodayState()
})

const getTodayState = async () => {
  let res = await fetch('/user/getTodayStats')
      res = await res.json()
  console.log(res)
}

const onSearch = (payload) => {
  console.log('搜索条件：', payload)
  // 发请求
}

</script>

<style scoped>
h2 {
  color: #42b983;
}
</style>
  