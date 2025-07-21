<template>
	<div>
		<n-upload :on-change="onFileChange" accept=".xlsx, .xls">
			<n-button type="primary" size="small">上传频道</n-button>
		</n-upload>

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
import * as XLSX from 'xlsx';
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
const columns = ref([]);
const columnsObj = {
	id: {
		title: '#',
		key: 'id',
		align: 'center',
		width: 40,
		render: (row, index) => index + 1,
	},
	sourceType: {
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
				style: { width: '90px' },
				onUpdateValue: (v) => (tableData.value[index].sourceType = v),
			});
		},
	},
	typeId: {
		title: '行业类型',
		key: 'typeId',
		ellipsis: true,
		width: 150,
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'select',
				value: row.typeId,
				options: props.channelType,
				style: { width: '140px' },
				onUpdateValue: (v) => (tableData.value[index].typeId = v),
			});
		},
	},
	title: { title: '标题', key: 'title', ellipsis: true, width: 150 },
	subscribers: {
		title: '订阅数',
		key: 'subscribers',
		ellipsis: true,
		width: 80,
	},
	url: {
		title: '用户名',
		key: 'url',
		ellipsis: true,
		width: 120,
		render: (row) =>
			h(
				'a',
				{
					directives: [{ name: 'copy' }],
					href: row['url'],
					target: '_blank',
					rel: 'noopener noreferrer',
				},
				'@' + row['url']?.replace(/https\:\/\/t.me\//, '')
			),
	},
	grade: {
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
				style: { width: '70px' },
				onUpdateValue: (v) => (tableData.value[index].grade = v),
			});
		},
	},
	isAdvertised: {
		title: '已投放',
		key: 'isAdvertised',
		ellipsis: true,
		width: 80,
		align: 'center',
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'select',
				value: row.isAdvertised,
				options: [
					{ label: '是', value: 1 },
					{ label: '否', value: 0 },
				],
				style: { width: '70px' },
				onUpdateValue: (v) => (tableData.value[index].isAdvertised = v),
			});
		},
	},
	hasOrders: {
		title: '已出单',
		key: 'hasOrders',
		ellipsis: true,
		width: 80,
		align: 'center',
		render(row, index) {
			return h(ShowOrEdit, {
				editType: 'select',
				value: row.hasOrders,
				options: [
					{ label: '是', value: 1 },
					{ label: '否', value: 0 },
				],
				style: { width: '70px' },
				onUpdateValue: (v) => (tableData.value[index].hasOrders = v),
			});
		},
	},
	description: {
		title: '描述',
		key: 'description',
		ellipsis: true,
	},
};

const onFileChange = ({ file }) => {
	// 确保获取到文件对象
	if (file && file.file instanceof Blob) {
		const reader = new FileReader();
		reader.onload = (e) => {
			const data = new Uint8Array(e.target.result);
			const workbook = XLSX.read(data, { type: 'array' });
			const firstSheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[firstSheetName];

			const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
			columns.value = [
				{
					title: '#',
					key: 'id',
					align: 'center',
					width: 40,
					render: (row, index) => index + 1,
				},
				...jsonData[0].map((item) => {
					const column = columnsObj[item] || {
						title: item,
						key: item,
						ellipsis: true,
					};
					return column;
				}),
			];

			tableData.value = jsonData.slice(1).map((row) => {
				return row.reduce((acc, value, index) => {
					// 将每行数据的 isAdvertised 字段转换
					if (['isAdvertised', 'hasOrders'].includes(jsonData[0][index])) {
						acc[jsonData[0][index]] = value === true || value === '是' ? 1 : 0;
					} else if (['typeId'].includes(jsonData[0][index])) {
						// 将 typeId 字段转换为对应的 ID
						const type = props.channelType?.find((item) => item.label === value);
						acc[jsonData[0][index]] = type ? type.value : '';
					} else {
						acc[jsonData[0][index]] = value; // 其他字段保持不变
					}

					return acc;
				}, {});
			});

			showModal.value = true;
		};

		// 读取文件为 ArrayBuffer
		reader.readAsArrayBuffer(file.file);
	} else {
		console.error('没有选择有效的文件。');
	}
};

const resetData = () => {
	tableData.value = [];
	columns.value = [];
};

// 开始添加频道
const addChannelFn = async () => {
	if (tableData.value.length === 0) return;

	// 这里可以添加逻辑来处理添加频道的操作
	const res = await batchAddChannels(tableData.value);

	message.success(`操作完成，成功${res.successList.length}条，失败${res.failedList.length}条`);

	// 关闭模态框
	showModal.value = false;
};
</script>

<style scoped>
:deep(.n-upload-file-list) {
	display: none;
}
</style>
