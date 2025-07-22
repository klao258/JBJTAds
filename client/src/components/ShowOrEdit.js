// 自定义渲染单元格封装

import { defineComponent, ref, nextTick, h } from 'vue';
import { NInput, NSelect } from 'naive-ui';

export default defineComponent({
	props: {
		editType: String, // 'input' or 'select'
		value: [String, Number],
		options: Array,
		style: {
			type: Object,
			default: () => ({}),
		},
		onUpdateValue: [Function, Array],
	},
	setup(props) {
		const isEdit = ref(false);
		const inputRef = ref(null);
		const inputValue = ref(props.value);
		const selectRef = ref(null);
		const selectVale = ref(props.value);

		// 点击单元格
		const handleOnClick = () => {
			isEdit.value = true;
			nextTick(() => {
				if (/input/i.test(props.editType)) {
					inputRef.value?.focus();
				} else if (/select/i.test(props.editType)) {
					selectRef.value?.focus();
				}
			});
		};

		// 编辑完成
		const handleChange = () => {
			if (/input/i.test(props.editType)) {
				props.onUpdateValue(inputValue.value);
			} else if (/select/i.test(props.editType)) {
				props.onUpdateValue(selectVale.value);
			}
			isEdit.value = false;
		};

		return () => {
			if (/input/i.test(props.editType)) {
				return h(
					'div',
					{
						style: props.style,
						onClick: handleOnClick,
					},
					isEdit.value
						? h(NInput, {
								ref: inputRef,
								value: inputValue.value,
								size: 'tiny',
								onUpdateValue: (v) => {
									inputValue.value = v;
								},
								onChange: handleChange,
								onBlur: () => (isEdit.value = false),
						  })
						: props.value
				);
			} else if (/select/i.test(props.editType)) {
				return h(
					'div',
					{
						style: props.style,
						onClick: handleOnClick,
					},
					isEdit.value
						? h(NSelect, {
								ref: selectRef,
								showOnFocus: true,
								value: selectVale.value,
								options: props.options,
								size: 'tiny',
								consistentMenuWidth: false,
								onBlur: () => (isEdit.value = false),
								onUpdateValue: (v) => {
									selectVale.value = v;
									handleChange();
								},
						  })
						: props.options.find((item) => item.value === props.value)
						? props.options
								.find((item) => item.value === props.value)
								?.label?.replace(/否/, '')
						: '-'
				);
			}
		};
	},
});
