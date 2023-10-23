module.exports = ({ meta, config, managers }) => {
	return async ({ req, res, next }) => {
		try {
			// TODO: from the admin info
			const { school_id, name } = req.body;

			const result = await managers.mongo.classrooms.Create(
				{ school_id, name },
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
