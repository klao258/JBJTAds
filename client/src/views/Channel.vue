<template>
	<div class="flex flex-v" style="height: 100%">
		<div
			class="filter-bar flex flex-wrap flex-center-y"
			style="
				gap: 12px;
				margin-bottom: 10px;
				padding-bottom: 10px;
				border-bottom: 1px solid #f7f7f7;
			">
			<div class="flex flex-center-y">
				<span v-copy>shortId：</span>
				<n-input
					v-model:value="filters.shortId"
					placeholder="shortId搜索"
					clearable
					size="small"
					style="width: 120px"
					@update:value="() => getChannelListFn(1)" />
			</div>

			<div class="flex flex-center-y">
				<span v-copy>标题：</span>
				<n-input
					v-model:value="filters.title"
					placeholder="标题搜索"
					clearable
					size="small"
					style="width: 120px"
					@update:value="() => getChannelListFn(1)" />
			</div>

			<div class="flex flex-center-y">
				<span>用户名：</span>
				<n-input
					v-model:value="filters.url"
					placeholder="用户名搜索"
					clearable
					size="small"
					style="width: 120px"
					@update:value="() => getChannelListFn(1)" />
			</div>

			<div class="flex flex-center-y">
				<span>类型：</span>
				<n-select
					v-model:value="filters.sourceType"
					:options="sourceTypeOptions"
					size="small"
					placeholder="选择来源类型"
					clearable
					style="width: 120px"
					@update:value="() => getChannelListFn(1)" />
			</div>

			<div class="flex flex-center-y">
				<span>行业类型：</span>
				<n-select
					v-model:value="filters.typeId"
					:options="channelType"
					size="small"
					placeholder="选择行业"
					clearable
					:consistent-menu-width="false"
					style="width: 120px"
					@update:value="() => getChannelListFn(1)" />
			</div>

			<div class="flex flex-center-y">
				<span>等级：</span>
				<n-select
					v-model:value="filters.grade"
					:options="gradeTypes"
					size="small"
					placeholder="选择等级"
					clearable
					style="width: 90px"
					@update:value="() => getChannelListFn(1)" />
			</div>

			<div class="flex flex-center-y">
				<span>符合投放：</span>
				<n-select
					v-model:value="filters.isPlace"
					:options="[
						{ label: '符合', value: 1 },
						{ label: '不符合', value: 0 },
					]"
					size="small"
					placeholder="选择是否符合投放"
					clearable
					style="width: 90px"
					@update:value="() => getChannelListFn(1)" />
			</div>

			<div class="flex flex-center-y">
				<span>已投放：</span>
				<n-select
					v-model:value="filters.isAdvertised"
					:options="[
						{ label: '是', value: 1 },
						{ label: '否', value: 0 },
					]"
					size="small"
					placeholder="选择是否已投放"
					clearable
					style="width: 90px"
					@update:value="() => getChannelListFn(1)" />
			</div>

			<div class="flex flex-center-y">
				<span>已出单：</span>
				<n-select
					v-model:value="filters.hasOrders"
					:options="[
						{ label: '是', value: 1 },
						{ label: '否', value: 0 },
					]"
					size="small"
					placeholder="选择是否已出单"
					clearable
					style="width: 90px"
					@update:value="() => getChannelListFn(1)" />
			</div>

			<n-button size="small" @click="() => getChannelListFn(1)" type="primary">搜索</n-button>
			<n-button size="small" @click="resetFilters">重置</n-button>
			<n-button size="small" type="primary" @click="addChannelModelRef?.show()">
				添加频道
			</n-button>
			<AddChannel :channelType="channelType" />
			<n-button size="small" type="primary" @click="copyAllUrls">复制全部链接</n-button>
		</div>

		<n-data-table
			class="flex-1"
			:columns="columns"
			:data="tableData"
			size="small"
			:bordered="false"
			:single-line="false"
			:pagination="pagination"
			:loading="loading"
			:remote="true"
			max-height="calc(100vh - 49px - 40px - 40px - 35px)"
			:row-key="(row) => row.shortId"
			@update:sorter="handleSort" />

		<add-channel-model
			ref="addChannelModelRef"
			:sourceTypeOptions="sourceTypeOptions"
			:channelType="channelType" />
	</div>
</template>

<script setup>
import { NInput, NSelect, NButton } from 'naive-ui';
import AddChannel from '@/components/AddChannel.vue';
import AddChannelModel from '@/components/AddChannelModel.vue';
import ShowOrEdit from '@/components/ShowOrEdit.js';
import DelBtn from '@/components/DelBtn.vue';
import { getChannelType, getChannelList, batchUpdateChannels, delChannel } from '@/api';
import CopyText from '@/components/CopyText.vue';
import { useMessage } from 'naive-ui';

const message = useMessage();

// TG类型
const sourceTypeOptions = [
	{ label: '机器人', value: '机器人' },
	{ label: '频道', value: '频道' },
	{ label: '群组', value: '群组' },
];

// 评级
const gradeTypes = [
	{ label: 'A+', value: 'A+' },
	{ label: 'A', value: 'A' },
	{ label: 'B+', value: 'B+' },
	{ label: 'B', value: 'B' },
	{ label: 'C+', value: 'C+' },
	{ label: 'C', value: 'C' },
	{ label: 'D+', value: 'D+' },
	{ label: 'D', value: 'D' },
];

const addChannelModelRef = ref();
const channelType = ref([]);
const tableData = ref([]);
const tableDataCopy = ref([]);
const total = ref(0);
const loading = ref(false);
const filters = reactive({
	shortId: '', // 频道shortId搜索
	title: '', // 频道标题模糊搜索
	url: '', // 用户名模糊搜索
	sourceType: null, // TG类型
	typeId: null, // 行业类型ID
	grade: null, // 等级筛选
	isPlace: null, // 是否符合投放
	isAdvertised: null, // 未推广
	hasOrders: null, // 是否出单
});
const pagination = reactive({
	page: 1,
	pageSize: 100,
	showSizePicker: true,
	pageSizes: [50, 100, 200],
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

// 列配置
const columns = ref([
	{ title: '#', key: 'id', align: 'center', width: 35, render: (row, index) => index + 1 },
	{
		title: '#',
		key: 'del',
		width: 50,
		align: 'center',
		render(row) {
			return h(DelBtn, {
				onConfirm: () => onDelChannel(row),
			});
		},
	},
	{
		title: '频道ID',
		key: 'shortId',
		width: 70,
		render(row) {
			return h(CopyText, { text: row.shortId });
		},
	},
	{
		title: 'TG类型',
		key: 'sourceType',
		ellipsis: { tooltip: true },
		width: 85,
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'select',
				value: row.sourceType,
				options: sourceTypeOptions,
				style: { width: '75px', minHeight: '22px' },
				onUpdateValue: (v) => {
					tableData.value[index].sourceType = v;
					onEditRow(tableData.value[index]);
				},
			});
		},
	},
	{
		title: '行业类型',
		key: 'typeId',
		ellipsis: { tooltip: true },
		width: 150,
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'select',
				value: row.typeId,
				options: channelType.value,
				style: { width: '140px', minHeight: '22px' },
				onUpdateValue: (v) => {
					tableData.value[index].typeId = v;
					onEditRow(tableData.value[index]);
				},
			});
		},
	},
	{
		title: '标题',
		key: 'title',
		ellipsis: true,
		width: 200,
		render(row) {
			return h(
				'a',
				{
					href: row.url,
					target: '_blank',
					rel: 'noopener noreferrer',
					style: 'color: #1890ff',
				},
				[h(CopyText, { text: row.title })]
			);
		},
	},
	{
		title: '订阅数',
		key: 'subscribers',
		width: 85,
		sorter: (row1, row2) => +row1.subscribers - +row2.subscribers,
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'input',
				value: String(row.subscribers),
				style: { width: '75px', minHeight: '22px' },
				onUpdateValue: (v) => {
					tableData.value[index].subscribers = v;
					onEditRow(tableData.value[index]);
				},
			});
		},
	},
	{
		title: '用户名',
		key: 'url',
		width: 135,
		ellipsis: { tooltip: true },
		render(row) {
			return h(
				'a',
				{
					href: row.url,
					target: '_blank',
					rel: 'noopener noreferrer',
					style: 'color: #1890ff',
				},
				[h(CopyText, { text: row.url }, () => row.url.replace('https://t.me/', '@'))]
			);
		},
	},
	{
		title: '等级',
		key: 'grade',
		align: 'center',
		width: 65,
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'select',
				value: row.grade,
				options: gradeTypes,
				style: { width: '55px', minHeight: '22px' },
				onUpdateValue: (v) => {
					tableData.value[index].grade = v;
					onEditRow(tableData.value[index]);
				},
			});
		},
	},
	{
		title: '符合投放',
		key: 'isPlace',
		width: 70,
		align: 'center',
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'select',
				value: row.isPlace,
				options: [
					{ label: '是', value: 1 },
					{ label: '否', value: 0 },
				],
				style: { width: '60px', minHeight: '22px' },
				onUpdateValue: (v) => {
					tableData.value[index].isPlace = v;
					onEditRow(tableData.value[index]);
				},
			});
		},
	},
	{
		title: '已投放',
		key: 'isAdvertised',
		width: 60,
		align: 'center',
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'select',
				value: row.isAdvertised,
				options: [
					{ label: '是', value: 1 },
					{ label: '否', value: 0 },
				],
				style: { width: '55px', minHeight: '22px' },
				onUpdateValue: (v) => {
					tableData.value[index].isAdvertised = v;
					onEditRow(tableData.value[index]);
				},
			});
		},
	},
	{
		title: '已出单',
		key: 'hasOrders',
		width: 60,
		align: 'center',
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'select',
				value: row.hasOrders,
				options: [
					{ label: '是', value: 1 },
					{ label: '否', value: 0 },
				],
				style: { width: '55px', minHeight: '22px' },
				onUpdateValue: (v) => {
					tableData.value[index].hasOrders = v;
					onEditRow(tableData.value[index]);
				},
			});
		},
	},
	{
		title: '收录时间',
		key: 'createdAt',
		width: 150,
		render: (row) => new Date(row.createdAt).toLocaleString(),
	},
	{ title: '描述', key: 'description', ellipsis: { tooltip: true } },
]);

onMounted(async () => {
	await getChannelTypeFn();
	await getChannelListFn();
});

// 获取行业分类
const getChannelTypeFn = async () => {
	const res = await getChannelType();
	channelType.value =
		res?.channelTypes?.map?.((item) => ({
			label: item.name,
			value: item._id,
		})) || [];
};

// 获取频道列表
const getChannelListFn = async (page) => {
	if (page) {
		pagination.page = page;
	}
	loading.value = true;
	try {
		// 构造查询参数
		const params = {
			page: pagination.page,
			pageSize: pagination.pageSize,
		};
		if (filters.shortId) params.shortId = filters.shortId;
		if (filters.title) params.title = filters.title;
		if (filters.url) params.url = filters.url;
		if (filters.sourceType) params.sourceType = filters.sourceType;
		if (filters.typeId) params.typeId = filters.typeId;
		if (filters.grade) params.grade = filters.grade;
		if (filters.isPlace !== null) params.isPlace = filters.isPlace;
		if (filters.isAdvertised !== null) params.isAdvertised = filters.isAdvertised;
		if (filters.hasOrders !== null) params.hasOrders = filters.hasOrders;

		const res = await getChannelList(params);
		tableData.value = res.data || [];
		tableDataCopy.value = JSON.parse(JSON.stringify(res?.data || []));
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
	filters.shortId = ''; // shortId
	filters.title = ''; // 频道标题模糊搜索
	filters.url = ''; // 用户名模糊搜索
	filters.sourceType = null; // TG类型
	filters.typeId = null; // 行业类型ID
	filters.grade = null; // 等级筛选
	filters.isPlace = null; // 是否符合投放
	filters.isAdvertised = null; // 未推广
	filters.hasOrders = null; // 未推广

	pagination.page = 1;
	getChannelListFn();
};

// 复制所有链接
const copyAllUrls = async () => {
	const allUrls = tableData.value.map((item) => item.url).join('\n');
	if (!allUrls) {
		message.warning('表格无链接可复制');
		return;
	}
	try {
		await navigator.clipboard.writeText(allUrls);
		message.success('全部链接复制成功');
	} catch {
		message.error('复制失败，请手动复制');
	}
};

// 排序
const handleSort = (sorter) => {
	const { columnKey, order } = sorter;
	if (!order) {
		// 恢复原始顺序
		tableData.value = [...tableDataCopy.value];
		return;
	}

	tableData.value.sort((a, b) => {
		const v1 = +a['subscribers'];
		const v2 = +b['subscribers'];
		return order === 'ascend' ? v1 - v2 : v2 - v1;
	});
};

// 编辑行
const onEditRow = async (row) => {
	const res = await batchUpdateChannels([row]);
	message.success('更新成功！');
};

// 删除频道
const onDelChannel = async (row) => {
	const res = await delChannel({ shortId: row.shortId });
	message.success('删除成功');
};
</script>
