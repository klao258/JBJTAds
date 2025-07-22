<template>
	<n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme-overrides="themeOverrides">
		<n-message-provider>
			<router-view />
		</n-message-provider>
	</n-config-provider>
</template>

<script setup>
import { NConfigProvider, zhCN, dateZhCN } from 'naive-ui';

const themeOverrides = {
	common: {},
	Card: {
		titleTextColor: '#42b983', // 设置标题文字颜色
		paddingMedium: '0', // 修改默认中等尺寸 padding
	},
};
</script>

<style>
.flex {
	display: flex;
}
.flex-wrap {
	flex-wrap: wrap;
}
.flex-v {
	flex-direction: column;
}
.flex-1 {
	flex: 1;
	overflow: hidden;
}
.flex-center-x {
	justify-content: center;
}
.flex-center-y {
	align-items: center;
}
.flex-center {
	justify-content: center;
	align-items: center;
}
.flex-between {
	justify-content: space-between;
}
.flex-end {
	justify-content: flex-end;
}

.page {
	height: 100% !important;
}
/** 卡片 */
.n-card-header__extra {
	color: red !important;
}
.n-card > .n-card__content {
	overflow: hidden;
}

/** 数据表格 */
.n-data-table .n-data-table-th,
.n-data-table .n-data-table-td {
	user-select: none;
	padding: 4px;
}
/* 仅允许 url 列文本可选 */
.n-data-table td:nth-child(8) {
	user-select: text;
}
.n-data-table .n-data-table__pagination {
	margin: 0;
}
.v-binder-follower-container {
	width: 40%;
}
</style>
