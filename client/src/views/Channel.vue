<template>
	<div class="filter-bar" style="display: flex; gap: 16px; margin-bottom: 16px">
		<n-input v-model:value="filters.title" placeholder="频道标题模糊搜索" clearable style="width: 250px" />
		<n-select v-model:value="filters.sourceType" :options="sourceTypeOptions" placeholder="选择来源类型" clearable style="width: 150px" />

		<!-- <n-checkbox v-model:value="filters.isAdvertised" label="只显示已推广" /> -->

		<n-button @click="getChannelListFn" type="primary">搜索</n-button>
		<n-button @click="resetFilters">重置</n-button>
		<AddChannel :channelType="channelType" />
	</div>

	<n-data-table :columns="columns" :data="channels" :pagination="pagination" :loading="loading" :remote="true" :row-key="(row) => row.shortId" />
</template>

<script setup>
import AddChannel from '@/components/AddChannel.vue';
import { getChannelType, getChannelList } from '@/api';

const sourceTypeOptions = [
	{ label: '全部', value: '' },
	{ label: '机器人', value: '机器人' },
	{ label: '频道', value: '频道' },
	{ label: '群组', value: '群组' },
];
const channelType = ref([]);
const channels = ref([]);
const total = ref(0);
const loading = ref(false);
const filters = reactive({
	title: '', // 频道标题模糊搜索
	sourceType: '', // 来源类型
	isAdvertised: null, // 是否推广
});
const pagination = reactive({
	page: 1,
	pageSize: 50,
	showSizePicker: true,
	pageSizes: [10, 50, 100, 200],
	itemCount: 0,
	prefix({ itemCount }) {
		return `共有 ${itemCount} 条`;
	},
	onChange: (page) => {
		pagination.page = page;
		getChannelListFn();
	},
	onUpdatePageSize: (pageSize) => {
		pagination.pageSize = pageSize;
		pagination.page = 1;
		getChannelListFn();
	},
});

const columns = ref([
	{ title: '频道ID', key: 'shortId', ellipsis: true, width: 80 },
	{ title: 'TG类型', key: 'sourceType', ellipsis: true, width: 80 },
	{
		title: '行业类型',
		key: 'typeId',
		ellipsis: true,
		width: 120,
		render(row) {
			return channelType.value.find((item) => item.value === row.typeId)?.label || '-';
		},
	},
	{ title: '标题', key: 'title', ellipsis: true, width: 200 },
	{
		title: '订阅数',
		key: 'subscribers',
		width: 85,
		sorter: {
			compare: (a, b) => a.subscribers - b.subscribers,
		},
	},
	{
		title: '用户名',
		key: 'url',
		width: 130,
		render(row) {
			return h(
				'a',
				{
					href: row['url'],
					target: '_blank',
					rel: 'noopener noreferrer',
				},
				'@' + row['url']?.replace(/https\:\/\/t.me\//, '')
			);
		},
	},
	{
		title: '是否推广',
		key: 'isAdvertised',
		width: 80,
		align: 'center',
		render(row) {
			return row.isAdvertised ? '是' : '否';
		},
	},
	{
		title: '是否出单',
		key: 'hasOrders',
		width: 80,
		align: 'center',
		render(row) {
			return row.hasOrders ? '是' : '否';
		},
	},
	{
		title: '收录时间',
		key: 'createdAt',
		width: 150,
		render(row) {
			return new Date(row.createdAt).toLocaleString();
		},
	},
	{ title: '描述', key: 'description', ellipsis: true },
]);

onMounted(async () => {
	await getChannelTypeFn();
	await getChannelListFn();
});

// 获取频道列表
const getChannelListFn = async () => {
	loading.value = true;
	try {
		// 构造查询参数
		const params = {
			page: pagination.page,
			pageSize: pagination.pageSize,
		};
		if (filters.title) params.title = filters.title;
		if (filters.sourceType) params.sourceType = filters.sourceType;
		if (filters.isAdvertised) params.isAdvertised = true;

		const res = await getChannelList(params);
		channels.value = res.data || [];
		total.value = res.total;

		pagination.itemCount = res.total;
	} catch (error) {
		console.error('获取频道列表失败', error);
	} finally {
		loading.value = false;
	}
};

// 重置过滤条件
const resetFilters = () => {
	filters.title = '';
	filters.sourceType = '';
	filters.isAdvertised = false;
	pagination.page = 1;
	getChannelListFn();
};

// 获取行业分类
const getChannelTypeFn = async () => {
	const res = await getChannelType();
	channelType.value =
		res?.channelTypes?.map?.((item) => ({
			label: item.name,
			value: item._id,
		})) || [];
};
</script>
