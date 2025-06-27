<template>
    <div>
      <n-data-table
        :columns="computedColumns"
        :data="sortedData"
        :loading="loading"
        :pagination="false"
        bordered
        size="small"
        @update:sorter="handleSorterChange"
      />
      <div class="flex justify-end mt-4">
        <n-pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :page-count="pageCount"
          :page-sizes="[10, 20, 50, 100]"
          show-size-picker
          size="small"
          @update:page="page => emit('page-change', page)"
          @update:page-size="size => emit('page-size-change', size)"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    columns: { type: Array, required: true },
    data: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    pagination: {
      type: Object,
      default: () => ({
        page: 1,
        pageSize: 10,
        total: 0
      })
    }
  })
  
  const emit = defineEmits(['page-change', 'page-size-change'])
  
  const page = ref(props.pagination.page || 1)
  const pageSize = ref(props.pagination.pageSize || 10)
  
  watch(() => props.pagination.page, val => page.value = val)
  watch(() => props.pagination.pageSize, val => pageSize.value = val)
  
  const pageCount = computed(() => {
    return Math.ceil(props.pagination.total / pageSize.value) || 1
  })
  
  // 当前排序状态
  const sorter = ref({ columnKey: '', order: false })
  
  // 处理排序点击
  const handleSorterChange = val => {
    sorter.value = val
  }
  
  // 加入 sortable 支持
  const computedColumns = computed(() => {
    return props.columns.map(col => {
      if (col.sortable) {
        return { ...col, sorter: 'default' }
      }
      return col
    })
  })
  
  // 根据排序字段和顺序处理排序后的数据
  const sortedData = computed(() => {
    const { columnKey, order } = sorter.value
    if (!columnKey || !order) return props.data
  
    const sorted = [...props.data].sort((a, b) => {
      const aVal = a[columnKey]
      const bVal = b[columnKey]
      if (aVal === bVal) return 0
      if (order === 'ascend') {
        return aVal > bVal ? 1 : -1
      } else if (order === 'descend') {
        return aVal < bVal ? 1 : -1
      }
      return 0
    })
  
    return sorted
  })
  </script>
  
  <style scoped>
  .mt-4 {
    margin-top: 16px;
  }
  </style>
  