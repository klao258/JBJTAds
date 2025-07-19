function copyToClipboard(text) {
	return new Promise((resolve, reject) => {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		textarea.style.left = '-9999px';
		document.body.appendChild(textarea);

		textarea.select();
		try {
			const success = document.execCommand('copy');
			document.body.removeChild(textarea);
			success ? resolve() : reject(new Error('复制失败'));
		} catch (err) {
			document.body.removeChild(textarea);
			reject(err);
		}
	});
}

export default {
	mounted(el, binding) {
		el.__copyHandler__ = async (e) => {
			e.preventDefault();

			const text = binding.value ?? el.innerText?.trim();
			if (!text) {
				window.$message?.warning?.('无可复制内容');
				return;
			}

			try {
				await copyToClipboard(text);
				window.$message?.success?.('复制成功');
			} catch (err) {
				window.$message?.error?.('复制失败，请手动复制');
				console.error('复制失败:', err);
			}
		};

		el.addEventListener('contextmenu', el.__copyHandler__);
	},
	unmounted(el) {
		el.removeEventListener('contextmenu', el.__copyHandler__);
		delete el.__copyHandler__;
	},
};
