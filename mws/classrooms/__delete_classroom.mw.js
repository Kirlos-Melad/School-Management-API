const { Types } = require("mongoose");

module.exports = ({ meta, config, managers }) => {
	return async ({ req, res, next }) => {
		try {
			const { id } = req.body;

			if (!id)
				return managers.responseDispatcher.dispatch(res, {
					ok: true,
					code: 200,
					message: "No id provided, nothing to delete",
				});

			const result = await managers.mongo.classrooms.FindByIdAndDelete(
				{ id: new Types.ObjectId(id) },
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
