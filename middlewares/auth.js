import { verifyAccessToken } from '../utils/jwt.js';

export default async (ctx, next) => {
	const token = ctx.headers.authorization?.replace('Bearer ', '');
	if (!token) return ctx.throw(401, '未登录');

	// 根据ADS广告账户ID来放行,其他的需要token
	if (
		[
			'MM7ivAIocfOXfO9R-p1cItH6cnFanDHS8imnbtCEUWHD1y-2Z9w2f66QwPFZSsif', // 天胜1
			'MMorVjN0FQOkl6hVVkxueu_fEvDIjoSShl5b1pAYVl5oYC_jcKDgQHoFrYK5LLXS', // 天胜2
			'qYRy4BimC5wRRUxyYgLhTVuyEH1aTVQ2kP-K3OiSLQz13Id9f6JC6hGasbjE1yPS', // 天胜3
			'u_k5119XJseQHEDjbeUHntsMUUiMiergGNjS7KEg1UVy5ITdif2GTa-k5nwQFbsa', // 天胜4
			'TpMWrxgkhv3VVFM41zwdLrfleZ7Vj3sso4ebLZMkOSCTH9n6J0gMpjRKqJQjcvBP', // 天胜5
			'UwPOHN7WDYXw72qKI-_PrPDOrdW3LTgDtrz7-Ec-z49TkrW2pIjLiSs54qjNhBFP', // 天胜6
			'RsEzG4UyKfZC0uTpzj7E7NoVLKGyHqfD7r4-ayjGEmaiTDV3sMmdv8iOSTmxpysY', // 天胜7
			'Y_szWswdhFvZTnemkwbpF7qO0owajHXdKoW1KgQrb4P-NZMvvdQfGo7w2n_RWwm8', // 天胜8
			'FtWCWLIhd-r2sMCfKFnbhlnKessSnxKGNMWXtJuYEKqGAULIkXolmbyiW4gQpo04', // 天胜9
			'onvkSlDnqisJUTV7BJczGpMM-Qiz_ixpJeTHHlrLJSA3Gz9hlalMtE1_cBhc7r9Q', // 天胜10
			'4mTMMVpq8hTVx3BeEJ174YjomgON9GYFCdtQhWw_QhzGfEKRsSmuCZYnSBW_HfKp', // 天胜11
			'GUwn2iPIfZo3qcSBffWAq5q2uUbwDkriX7Q8ZWmh7uIhpHKqqrYHpnnms1lmOWGt', // 天胜12
		].includes(token)
	) {
		await next();
		return;
	}

	const user = verifyAccessToken(token);
	if (!user) return ctx.throw(401, '登录已过期');

	if (ctx.ip !== user.ip || ctx.headers['user-agent'] !== user.ua) {
		return ctx.throw(401, '环境异常，请重新登录');
	}

	ctx.state.user = user;
	await next();
};
