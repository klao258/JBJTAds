<template>
    <div class="filter-bar" style="display:flex; gap:16px; margin-bottom:16px;">
      <n-input
        v-model:value="filters.title"
        placeholder="频道标题模糊搜索"
        clearable
        style="width: 250px;"
      />
      <n-select
        v-model:value="filters.sourceType"
        :options="sourceTypeOptions"
        placeholder="选择来源类型"
        clearable
        style="width: 150px;"
      />
      <!-- <n-checkbox v-model:value="filters.isAdvertised" label="只显示已推广" /> -->

      <n-button @click="getChannelListFn" type="primary">搜索</n-button>
      <n-button @click="resetFilters">重置</n-button>
      <AddChannel />
    </div>

    <n-data-table
      :columns="columns"
      :data="channels"
      :pagination="{ page: pagination.page, pageSize: pagination.pageSize, itemCount: total }"
      @update:page="page => { pagination.page = page; getChannelListFn() }"
      @update:pageSize="pageSize => { pagination.pageSize = pageSize; getChannelListFn() }"
      :loading="loading"
      :row-key="(row) => row.shortId" />
  </template>
  
  <script setup>
  import AddChannel from '@/components/AddChannel.vue';
  import { getChannelList } from '@/api'

const showModal = ref(false);
  const filters = reactive({
    title: '',
    sourceType: 'bot',
    isAdvertised: false
  })
  
  const sourceTypeOptions = [
    { label: '机器人(bot)', value: 'bot' },
    { label: '频道(channel)', value: 'channel' },
    { label: '群组(group)', value: 'group' }
  ]
  
  const columns = [
    { title: '频道ID', key: 'shortId', ellipsis: true },
    { title: 'TG类型', key: 'sourceType', render(row) {
        const map = { bot: '机器人', channel: '频道', group: '群组' }
        return map[row.sourceType] || row.sourceType
      }
    },
    { title: '频道类型', key: 'typeId', ellipsis: true },
    { title: '标题', key: 'title', ellipsis: true },
    { title: '描述', key: 'description', ellipsis: true },
    { title: '订阅数', key: 'subscribers' },
    { title: '链接', key: 'url' },
    { title: '是否推广', key: 'isAdvertised', render(row) {
        return row.isAdvertised ? '是' : '否'
      }
    },
    { title: '是否出单', key: 'hasOrders', render(row) {
        return row.isAdvertised ? '是' : '否'
      }
    },
    { title: '收录时间', key: 'createdAt', render(row) {
        return new Date(row.createdAt).toLocaleString()
      }
    }
  ]
  
  const channels = ref([])
  const total = ref(0)
  const loading = ref(false)
  const pagination = reactive({
    page: 1,
    pageSize: 10
  })

  onMounted(() => {
    getChannelListFn()
  })
  
  const getChannelListFn = async () => {
    loading.value = true
    try {
      // 构造查询参数
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize
      }
      if (filters.title) params.title = filters.title
      if (filters.sourceType) params.sourceType = filters.sourceType
      if (filters.isAdvertised) params.isAdvertised = true
  
      const res = await getChannelList(params)
      channels.value = res.channels
      total.value = res.total
    } catch (error) {
      console.error('获取频道列表失败', error)
    } finally {
      loading.value = false
    }
  }
  
  const resetFilters = () => {
    filters.title = ''
    filters.sourceType = ''
    filters.isAdvertised = false
    pagination.page = 1
    getChannelListFn()
  }

  const addChannel = () => {

  }
  </script>
  