module.exports = ({ meta, config, managers }) => {
	return async ({ req, res, next }) => {
		try {
			const { type, name, email, password, school_id, classroom_id } =
				req.body;

			const result = await managers.mongo.users.Create(
				{ type, name, email, password, school_id, classroom_id },
				{ session: undefined },
			);

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
