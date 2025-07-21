<template>
	<div>
		<n-modal v-model:show="showModal" title="表格数据" :auto-focus="false" @close="resetData">
			<n-card style="width: 90%">
				<n-data-table
					v-if="tableData.length"
					:columns="columns"
					:data="tableData"
					size="small"
					:max-height="700"
					:row-key="(row) => row.url" />
				<p v-else>没有数据显示</p>
				<template #action>
					<div class="flex flex-between flex-center-y">
						<div>共{{ tableData.length }}条数据</div>
						<div class="flex flex-end">
							<n-button type="primary" @click="addChannelFn">开始添加</n-button>
							<n-button @click="showModal = false">关闭</n-button>
						</div>
					</div>
				</template>
			</n-card>
		</n-modal>
	</div>
</template>

<script setup>
import ShowOrEdit from '@/components/ShowOrEdit.js';
import { batchAddChannels } from '@/api';
import { useMessage } from 'naive-ui';

const message = useMessage();

const props = defineProps({
	channelType: {
		type: Array,
		default: () => [],
	},
});

const showModal = ref(false);
const tableData = ref([]);
const columns = ref([
	{
		title: '#',
		key: 'id',
		align: 'center',
		width: 40,
		render: (row, index) => index + 1,
	},
	{
		title: 'TG类型',
		key: 'sourceType',
		ellipsis: true,
		width: 100,
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'select',
				value: row.sourceType,
				options: [
					{ label: '机器人', value: '机器人' },
					{ label: '频道', value: '频道' },
					{ label: '群组', value: '群组' },
				],
				style: { width: '90px', minHeight: '22px' },
				onUpdateValue: (v) => (tableData.value[index].sourceType = v),
			});
		},
	},
	{
		title: '行业类型',
		key: 'typeId',
		ellipsis: true,
		width: 150,
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'select',
				value: row.typeId,
				options: props.channelType,
				style: { width: '140px', minHeight: '22px' },
				onUpdateValue: (v) => (tableData.value[index].typeId = v),
			});
		},
	},
	{
		title: '标题',
		key: 'title',
		ellipsis: true,
		width: 200,
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'input',
				value: String(row.title),
				style: { width: '190px', minHeight: '22px' },
				onUpdateValue: (v) => {
					tableData.value[index].title = v;
				},
			});
		},
	},
	{
		title: '订阅数',
		key: 'subscribers',
		ellipsis: true,
		width: 100,
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'input',
				value: String(row.subscribers),
				style: { width: '90px', minHeight: '22px' },
				onUpdateValue: (v) => {
					tableData.value[index].subscribers = v;
				},
			});
		},
	},
	{
		title: '用户名',
		key: 'url',
		ellipsis: true,
		width: 120,
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'input',
				value: String(row.url),
				style: { width: '110px', minHeight: '22px' },
				onUpdateValue: (v) => {
					tableData.value[index].url = v;
				},
			});
		},
	},
	{
		title: '评分',
		key: 'grade',
		ellipsis: true,
		width: 80,
		align: 'center',
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'select',
				value: row.grade,
				options: [
					{ label: 'A+', value: 'A+' },
					{ label: 'A', value: 'A' },
					{ label: 'B+', value: 'B+' },
					{ label: 'B', value: 'B' },
					{ label: 'C+', value: 'C+' },
					{ label: 'C', value: 'C' },
					{ label: 'D+', value: 'D+' },
					{ label: 'D', value: 'D' },
				],
				style: { width: '70px', minHeight: '22px' },
				onUpdateValue: (v) => (tableData.value[index].grade = v),
			});
		},
	},
	{
		title: '描述',
		key: 'description',
		ellipsis: true,
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'input',
				value: String(row.description),
				style: { width: '400px', minHeight: '22px' },
				onUpdateValue: (v) => {
					tableData.value[index].description = v;
				},
			});
		},
	},
]);

onMounted(() => {
	for (let i = 0; i < 10; i++) {
		tableData.value.push({
			id: i,
			sourceType: '',
			typeId: '',
			title: '',
			subscribers: '',
			url: '',
			grade: '',
			isAdvertised: 0,
			hasOrders: 0,
			description: '',
		});
	}
});

const resetData = () => {
	tableData.value = [];
	columns.value = [];
};

// 打开弹窗
const show = () => (showModal.value = true);

// 开始添加频道
const addChannelFn = async () => {
	let table = tableData.value?.filter?.((v) => v?.sourceType && v?.typeId && v?.title && v?.url);
	if (table.length === 0) return;

	// 这里可以添加逻辑来处理添加频道的操作
	const res = await batchAddChannels(table);

	message.success(`操作完成，成功${res.successList.length}条，失败${res.failedList.length}条`);

	// 关闭模态框
	showModal.value = false;
};

defineExpose({
	show,
});
</script>

<style scoped>
:deep(.n-upload-file-list) {
	display: none;
}
</style>
