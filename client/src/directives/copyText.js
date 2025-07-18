import { useMessage } from 'naive-ui';

export default {
	beforeMount(el) {
		const message = useMessage(); // 获取 Message 实例

		const handleDoubleClick = () => {
			const text = el.innerText; // 获取文本内容
			navigator.clipboard
				.writeText(text)
				.then(() => {
					// 使用 Naive UI Message 提示用户复制成功
					message.success(`文本已复制: ${text}`);
				})
				.catch((err) => {
					console.error('复制失败:', err);
					message.error('复制失败，请重试。');
				});
		};

		el.addEventListener('contextmenu', handleDoubleClick);
		el._handleDoubleClick = handleDoubleClick; // 存储引用
	},
	unmounted(el) {
		el.removeEventListener('contextmenu', el._handleDoubleClick);
	},
};
