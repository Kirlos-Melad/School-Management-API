const { Types } = require("mongoose");
const { UserType } = require("../user/Users.document");
const SchoolsDocument = require("./Schools.document");

class SchoolsManager {
	constructor({ managers } = {}) {
		this.mediator = managers.managersMediator;

		this.httpExposed = Object.entries({
			post: ["Create"],
			get: ["FindAll"],
			patch: ["FindByIdAndUpdate"],
			delete: ["FindByIdAndDelete"],
		})
			.filter(([, value]) => value.length > 0)
			.map(([key, value]) => value.map((i) => `${key}=${i}`))
			.flat(1);
	}

	#ErrorResponse(error) {
		return {
			errors: error.errors
				? Object.entries(error.errors).map(
						([_, value]) => value.message,
				  )
				: error.message || "Bad Request",
		};
	}

	/**
	 * User Object
	 * @typedef {Object} SchoolObject
	 * @property {string} _id - The id of the school
	 * @property {string} name - The name of the school
	 */

	/**
	 * @typedef {Object} SchoolCreateObject
	 * @property {string} name - The name of the school
	 * @property {string} created_at - The date of creation
	 * @property {string} updated_at - The date of last update
	 */

	/**
	 * Create a school
	 * @param {SchoolCreateObject} __body - The body of the request
	 *
	 * @returns {SchoolObject} - The created school
	 */

	async Create({ __userObject, __body }) {
		try {
			if (__userObject.type !== UserType.SUPER_ADMIN)
				throw new Error("Unauthorized");

			const result = await SchoolsDocument.create({ name: __body.name });

			return result;
		} catch (error) {
			return this.#ErrorResponse(error);
		}
	}

	/**
	 * @typedef {Object} FindOneFilter
	 * @property {0 | 1} _id - The id of the school
	 * @property {0 | 1} name - The name of the school
	 * @property {0 | 1} created_at - The created_at of the school
	 * @property {0 | 1} updated_at - The updated_at of the school
	 */

	/**
	 *
	 * @param {SchoolObject} query
	 * @param {FindOneFilter} filter
	 * @returns {UserObject}
	 */

	async FindOne(query = null, filter = {}) {
		if (!query) throw new Error("Query is required for find one");

		const result = await UsersDocument.findOne(query, filter).lean().exec();

		return result;
	}

	/**
	 *
	 * @param {SchoolObject} __query - The body of the request
	 * @returns {UserObject[]}
	 */
	async FindAll({ __userObject, __query }) {
		try {
			if (__userObject.type !== UserType.SUPER_ADMIN)
				throw new Error("Unauthorized");

			const result = await SchoolsDocument.find(__query).lean().exec();

			return result;
		} catch (error) {
			return this.#ErrorResponse(error);
		}
	}

	/**
	 * @typedef FindByIdAndUpdateQuery
	 * @property {string} id - The id of the school
	 */

	/**
	 * @typedef FindByIdAndUpdateBody
	 * @property {string?} name - The name of the school
	 */

	/**
	 * @param {FindByIdAndUpdateQuery} __query - The Query of the request
	 * @param {FindByIdAndUpdateBody} __body - The body of the request
	 *
	 * @returns {SchoolObject} - The school object
	 */
	async FindByIdAndUpdate({ __userObject, __query, __body }) {
		try {
			if (__userObject.type !== UserType.SUPER_ADMIN)
				throw new Error("Unauthorized");

			const result = await SchoolsDocument.findByIdAndUpdate(
				__query.id,
				{ name: __body.name },
				// Update then return the new record by using {new: true}
				{ new: true, runValidators: true },
			)
				.lean()
				.exec();

			return result;
		} catch (error) {
			return this.#ErrorResponse(error);
		}
	}

	/**
	 * @typedef FindByIdAndDeleteQuery
	 * @property {string} id - The id of the school
	 */

	/**
	 * @param {FindByIdAndDeleteQuery} __query - The Query of the request
	 *
	 * @returns {SchoolObject} - The school object
	 */

	async FindByIdAndDelete({ __userObject, __query }) {
		try {
			if (__userObject.type !== UserType.SUPER_ADMIN)
				throw new Error("Unauthorized");

			const id = new Types.ObjectId(__query.id);

			const has_classrooms = await this.mediator.QueryClassrooms({
				school_id: id,
			});

			if (has_classrooms)
				throw new Error("Cannot delete school with classrooms");

			const has_students = await this.mediator.QueryUsers({
				school_id: id,
			});

			if (has_students)
				throw new Error("Cannot delete school with members");

			const result = await SchoolsDocument.findByIdAndDelete(id)
				.lean()
				.exec();

			return result;
		} catch (error) {
			return this.#ErrorResponse(error);
		}
	}
}

module.exports = SchoolsManager;
