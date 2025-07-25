<template>
	<span
		class="copy-text"
		@contextmenu.prevent="onCopyText"
		style="cursor: pointer; color: #1890ff"
		:title="'点击或右键复制 ' + text">
		<slot>{{ text }}</slot>
	</span>
</template>

<script setup>
import { useMessage } from 'naive-ui';

const props = defineProps({
	text: { type: String, required: true },
	copyText: { type: String },
});

const message = useMessage();

const onCopyText = async () => {
	try {
		document.body.focus();
		console.log('页面聚焦成功！');
		await navigator.clipboard.writeText(props.copyText || props.text);
		message.success('复制成功');
	} catch (e) {
		console.log(e);
		message.error('复制失败，请手动复制');
	}
};
</script>

<style>
.copy-text:hover {
	text-decoration: underline;
}
</style>
