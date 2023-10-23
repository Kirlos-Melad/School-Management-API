module.exports = ({ meta, config, managers }) => {
	return async ({ req, res, next }) => {
		try {
			//TODO: school_id is from admin info
			const { school_id, classroom_id } = req.body;

			if (!school_id)
				return managers.responseDispatcher.dispatch(res, {
					ok: true,
					code: 200,
					message: "No school_id provided, nothing to find",
				});

			const result = await managers.mongo.users.FindAll({
				school_id,
				classroom_id,
			});

			next(result);
		} catch (error) {
			return managers.responseDispatcher.dispatch(res, {
				ok: false,
				code: 400,
				errors: error.errors
					? Object.entries(error.errors).map(
							([_, value]) => value.message,
					  )
					: error.message || "Bad Request",
			});
		}
	};
};
