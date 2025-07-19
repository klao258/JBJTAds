<template>
	<span
		class="copy-text"
		@contextmenu.prevent="copyText"
		style="cursor: pointer; color: #1890ff"
		:title="'点击或右键复制 ' + text">
		<slot>{{ text }}</slot>
	</span>
</template>

<script setup>
import { useMessage } from 'naive-ui';

const props = defineProps({
	text: { type: String, required: true },
});

const message = useMessage();

const copyText = async () => {
	try {
		await navigator.clipboard.writeText(props.text);
		message.success('复制成功');
	} catch {
		message.error('复制失败，请手动复制');
	}
};
</script>

<style>
.copy-text:hover {
	text-decoration: underline;
}
</style>
