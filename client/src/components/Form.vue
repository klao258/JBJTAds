<template>
  <n-card title="">
    <n-form :model="form" label-placement="left" label-width="auto" :show-feedback="false" :inline="true" size="small" ref="formRef">
      <!-- 平台 -->
      <n-form-item v-if="fields.includes('platform')" label="平台:" class="form-item-inline">
        <n-select
          v-model:value="form.platform"
          :options="platformOptions"
          style="width: 100px;"
          placeholder="请选择平台"
          clearable
          @update:value="handleSearch"
        />
      </n-form-item>

      <!-- 账号 -->
      <n-form-item v-if="fields.includes('account')" label="账号:" class="form-item-inline">
        <n-select
          v-model:value="form.account"
          :options="accountOptions"
          style="width: 100px;"
          placeholder="请选择账号"
          clearable
          @update:value="handleSearch"
        />
      </n-form-item>

      <!-- 上级 -->
      <n-form-item v-if="fields.includes('pcode')" label="上级:" class="form-item-inline">
        <n-select
          v-model:value="form.pcode"
          :options="pcodeOptions"
          style="width: 100px;"
          placeholder="请选择上级"
          clearable
          @update:value="handleSearch"
        />
      </n-form-item>

      <!-- 广告码 -->
      <n-form-item v-if="fields.includes('ads')" label="ads:" class="form-item-inline">
        <n-input
          v-model:value="form.ads"
          style="width: 160px;"
          placeholder="请输入广告码"
          clearable
          @update:value="handleSearch"
        />
      </n-form-item>

      <!-- 创建时间 -->
      <n-form-item v-if="fields.includes('date')" label="ads:" class="form-item-inline">
        <n-date-picker
          v-model:formatted-value="form.date"
          value-format="yyyy.MM.dd"
          type="date"
          clearable
          @update:value="handleSearch"
        />
      </n-form-item>

      <!-- 按钮区 -->
      <n-form-item class="form-item-inline">
        <n-button type="primary" @click="handleSearch">搜索</n-button>
        <n-button @click="handleReset">重置</n-button>
      </n-form-item>
    </n-form>
  </n-card>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  
  // ✅ 定义可传入字段控制搜索项展示
  const props = defineProps({
    fields: {
      type: Array,
      default: () => ['platform', 'account', 'pcode', 'ads', 'date']
    }
  })
  
  const emit = defineEmits(['search', 'reset'])
  
  const formRef = ref(null)
  
  const initialForm = {
    platform: '',
    account: '',
    pcode: '',
    ads: '',
    date: getNow()
  }
  
  const form = reactive({ ...initialForm })
  
  // 获取当前北京时间
  const getNow = (offset = 0, format = 'YYYY-MM-DD') => {
    const now = new Date();

    // 转为 Asia/Shanghai 时区的本地时间
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const targetTime = new Date(utc + 8 * 3600000 + offset * 86400000);

    const pad = (n) => String(n).padStart(2, '0');

    const year = targetTime.getFullYear();
    const month = pad(targetTime.getMonth() + 1);
    const day = pad(targetTime.getDate());
    const hour = pad(targetTime.getHours());
    const minute = pad(targetTime.getMinutes());
    const second = pad(targetTime.getSeconds());

    // 替换格式模板
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('hh', hour)
      .replace('mm', minute)
      .replace('ss', second);
  };

  // 平台
  const platformOptions = [
    { label: '请选择', value: '' },
    { label: '金貝飞投', value: '金貝飞投' },
    { label: '天胜娱乐', value: '天胜娱乐' }
  ]
  
  // ads账号
  const accountOptions = [
    { label: '请选择', value: '' },
    { label: '金貝招商', value: 'ZhaoShang' },
    { label: 'ads 晶晶', value: 'JingJing' },
    { label: 'ads 贝贝', value: 'BeiBei' },
    { label: 'ads 菲菲', value: 'FeiFei' },
    { label: 'ads 头头', value: 'TouTou' },
    { label: 'ads 欢欢', value: 'HuanHuan' },
    { label: 'ads 莹莹', value: 'YingYing' },
    { label: 'ads 妮妮', value: 'NiNi' },
    { label: 'ads 可可', value: 'KeKe' },
    { label: 'ADS组织', value: 'ADSZuZhi' },
    { label: 'ads 老k', value: 'LaoK' },
    { label: '金貝推广-KK', value: 'GZKK' },
    { label: '金貝推广-天天', value: 'GZTianTian' },
    { label: '金貝推广-七月', value: 'GZQiQi' },
    { label: "天胜1", value: "TS1" },
    { label: "天胜2", value: "TS2" },
    { label: "天胜3", value: "TSXiaoBao" },
    { label: "天胜4", value: "TSGuoBa" },
    { label: "天胜5", value: "TS5" },
    { label: "天胜6", value: "TS6" },
  ]
  
  // 上级
  const pcodeOptions = [
    { label: '请选择', value: '' },
    { label: 'A仔', value: '53377' },
    { label: '光头', value: '64777' },
    { label: '老k', value: '64782' },
    { label: '大山', value: '22780' },
    { label: '安仔', value: '22782' }
  ]
  
  // 查询
  const handleSearch = () => {
    emit('search', { ...form })
  }
  
  // 重置
  const handleReset = () => {
    Object.assign(form, { ...initialForm })
    emit('reset', { ...form })
  }
  </script>
  
  <style scoped>
  .inline-form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 12px;
  }
  
  .form-item-inline {
    margin-bottom: 0 !important;
  }
  </style>