<template>
    <n-card title="频道管理">
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
        <n-checkbox v-model:value="filters.isAdvertised" label="只显示已推广" />
        <n-button @click="fetchChannels" type="primary">搜索</n-button>
        <n-button @click="resetFilters">重置</n-button>
      </div>
  
      <n-data-table
        :columns="columns"
        :data="channels"
        :pagination="{ page: pagination.page, pageSize: pagination.pageSize, itemCount: total }"
        @update:page="page => { pagination.page = page; fetchChannels() }"
        @update:pageSize="pageSize => { pagination.pageSize = pageSize; fetchChannels() }"
        :loading="loading"
        row-key="_id"
      />
    </n-card>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { NCard, NInput, NSelect, NCheckbox, NButton, NDataTable } from 'naive-ui'
  import axios from 'axios'
  
  const filters = reactive({
    title: '',
    sourceType: '',
    isAdvertised: false
  })
  
  const sourceTypeOptions = [
    { label: '机器人(bot)', value: 'bot' },
    { label: '频道(channel)', value: 'channel' },
    { label: '群组(group)', value: 'group' }
  ]
  
  const columns = [
    { title: '标题', key: 'title', ellipsis: true },
    { title: '描述', key: 'description', ellipsis: true },
    { title: '订阅数', key: 'subscribers' },
    { title: '来源类型', key: 'sourceType', render(row) {
        const map = { bot: '机器人', channel: '频道', group: '群组' }
        return map[row.sourceType] || row.sourceType
      }
    },
    { title: '是否推广', key: 'isAdvertised', render(row) {
        return row.isAdvertised ? '是' : '否'
      }
    },
    { title: '创建时间', key: 'createdAt', render(row) {
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
  
  async function fetchChannels() {
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
  
      const res = await axios.get('/api/channels', { params })
      channels.value = res.data.channels
      total.value = res.data.total
    } catch (error) {
      console.error('获取频道列表失败', error)
    } finally {
      loading.value = false
    }
  }
  
  function resetFilters() {
    filters.title = ''
    filters.sourceType = ''
    filters.isAdvertised = false
    pagination.page = 1
    fetchChannels()
  }
  
  onMounted(() => {
    fetchChannels()
  })
  </script>
  