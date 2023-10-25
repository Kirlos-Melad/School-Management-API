const { Types } = require("mongoose");

module.exports = ({ meta, config, managers }) => {
	return async ({ req, res, next }) => {
		if (!req.headers.token) {
			console.log("token required but not found");
			return managers.responseDispatcher.dispatch(res, {
				ok: false,
				code: 401,
				errors: "unauthorized",
			});
		}
		let result = null;
		try {
			const decoded = managers.token.verifyShortToken({
				token: req.headers.token,
			});
			if (!decoded) {
				console.log("failed to decode-1");
				return managers.responseDispatcher.dispatch(res, {
					ok: false,
					code: 401,
					errors: "unauthorized",
				});
			}

			result = await managers.managersMediator.QueryUsers(
				{
					id: new Types.ObjectId(decoded.user_id),
				},
				{ password: 0, devices: 0 },
			);

			if (!result) throw new Error("user not found");
		} catch (err) {
			console.log("failed to decode-2");
			console.log(err);
			return managers.responseDispatcher.dispatch(res, {
				ok: false,
				code: 401,
				errors: "unauthorized",
			});
		}

		next(result);
	};
};
