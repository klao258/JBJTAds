<template>
	<n-popconfirm @positive-click="confirm" @negative-click="cancel">
		<template #trigger>
			<n-button size="tiny" type="error">删除</n-button>
		</template>
		{{ props.text }}
	</n-popconfirm>
</template>

<script setup>
const emits = defineEmits(['cancel', 'confirm']);
const props = defineProps({
	text: {
		type: String,
		default: '是否需要删除?',
	},
});

const cancel = () => emits('cancel');
const confirm = () => emits('confirm');
</script>
