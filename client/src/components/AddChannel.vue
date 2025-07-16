<template>
    <div>
        <n-upload :on-change="onFileChange" accept=".xlsx, .xls">
            <n-button type="primary">添加频道</n-button>
        </n-upload>
  
        <n-modal v-model:show="showModal" title="表格数据" :auto-focus="false" @close="resetData">
            <n-card style="width: 98%;">
                <n-data-table v-if="tableData.length"
                    :columns="columns"
                    :data="tableData"
                    :max-height="400"
                    :row-key="(row) => row.url" />
                <p v-else>没有数据显示</p>
                <template #action>
                    <div class="flex flex-between flex-center-y">
                        <div>共{{ tableData.length - 1 }}条数据</div>
                        <div class="flex flex-end">
                            <n-button type="primary" @click="showModal = false">开始添加</n-button>
                            <n-button @click="showModal = false">关闭</n-button>
                        </div>
                    </div>
                </template>
            </n-card>
        </n-modal>
    </div>
</template>
  
<script setup>
import { getChannelType } from '@/api';
import * as XLSX from 'xlsx';
import { NSelect } from "naive-ui";
import { onMounted } from 'vue';

  
const showModal = ref(false);
const tableData = ref([]);
const columns = ref([]);
const columnsObj = {
    title: { title: '标题', key: 'title', ellipsis: true, width: 150 },
    url: { title: '链接', key: 'url', ellipsis: true, width: 100, render(row) {
            return row.url?.replace(/https\:\/\/t.me\//, '@')
        } 
    },
    sourceType: { title: 'TG类型', key: 'sourceType', ellipsis: true, width: 80, render(row, index) {
            return h(NSelect, {
                value: row.sourceType,
                style: { width: '100px' },
                options: [
                    { label: '机器人', value: '机器人'}, 
                    { label: '频道', value: '频道' }, 
                    { label: '群组', value: '群组' }
                ],
                onUpdateValue(v) {
                    tableData.value[index].sourceType = v;
                }
            });
        } 
    },
    isAdvertised: { title: '是否推广', key: 'isAdvertised', ellipsis: true, width: 80, render(row, index) {
            return h(NSelect, {
                value: row.isAdvertised,
                style: { width: '80px' },
                options: [
                    { label: '是', value: true }, 
                    { label: '否', value: false }, 
                ],
                onUpdateValue(v) {
                    tableData.value[index].isAdvertised = v;
                }
            });
        } 
    },
    typeId: { title: '频道类型', key: 'typeId', ellipsis: true, width: 80 },
    hasOrders: { title: '是否出单', key: 'hasOrders', ellipsis: true, width: 80, render(row, index) {
            return h(NSelect, {
                value: row.hasOrders,
                style: { width: '80px' },
                options: [
                    { label: '是', value: true }, 
                    { label: '否', value: false }, 
                ],
                onUpdateValue(v) {
                    tableData.value[index].hasOrders = v;
                }
            });
        } 
    },
    grade: { title: '评分', key: 'grade', ellipsis: true, width: 80, render(row, index) {
            return h(NSelect, {
                value: row.grade,
                style: { width: '80px' },
                options: [
                    { label: 'A+', value: 'A+' }, 
                    { label: 'A', value: 'A' }, 
                    { label: 'B+', value: 'B+' },
                    { label: 'B', value: 'B' }, 
                    { label: 'C+', value: 'C+' }, 
                    { label: 'C', value: 'C' },
                    { label: 'D+', value: 'D+' }, 
                    { label: 'D', value: 'D' }
                ],
                onUpdateValue(v) {
                    tableData.value[index].grade = v;
                }
            });
        } 
    },
    subscribers: { title: '订阅数', key: 'subscribers', ellipsis: true, width: 80 },
    description: { title: '描述', key: 'description', ellipsis: true, width: 200 }
};

onMounted(async () => {
    await getChannelTypeFn();
});

// 获取行业分类
const getChannelTypeFn = async () => {
    const res = await getChannelType();
    console.log('获取频道类型:', res);
        // columnsObj.typeId.options = res.data.map(item => ({ label: item.name, value: item.id }));
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
            columns.value = jsonData[0].map(item => {
                const column = columnsObj[item] || { title: item, key: item, ellipsis: true };
                return column
            });
            tableData.value = jsonData.slice(1).map(row => {
                return row.reduce((acc, value, index) => {
                acc[jsonData[0][index]] = value;
                return acc;
                }, {});
            });

            console.log('表格数据:',columns.value, tableData.value);

            // 自动打开模态框
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
</script>
  