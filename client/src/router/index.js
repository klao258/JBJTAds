import { createRouter, createWebHistory } from 'vue-router';
import { HomeOutline, InformationCircleOutline } from '@vicons/ionicons5';

export const routes = [
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/views/Login.vue'),
		meta: { title: '登陆页面' },
	},
	{
		path: '/',
		name: 'Layout',
		component: () => import('@/components/Layout.vue'),
		meta: { requiresAuth: true },
		redirect: { name: 'Home' },
		children: [
			{
				path: '/home',
				name: 'Home',
				component: () => import('@/views/Home.vue'),
				meta: {
					title: '今日概览',
					icon: HomeOutline,
					requiresAuth: true,
				},
			},
			{
				path: '/channel',
				name: 'Channel',
				component: () => import('@/views/Channel.vue'),
				meta: {
					title: '频道管理',
					icon: InformationCircleOutline,
					requiresAuth: true,
				},
			},
		],
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

// 路由守卫：需要登录的页面进行校验
router.beforeEach((to, from, next) => {
	const token = localStorage.getItem('accessToken');
	if (to.meta.requiresAuth && !token) {
		return next('/login');
	}
	next();
});

export default router;
