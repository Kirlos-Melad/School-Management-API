const { Types } = require("mongoose");
const { UserType } = require("../user/Users.document");
const ClassroomsDocument = require("./Classrooms.document");

class ClassroomsManager {
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
	 * @typedef {Object} ClassroomObject
	 * @property {string} _id - The id of the classroom
	 * @property {string} school_id - The id of the school
	 * @property {string} name - The name of the classroom
	 */

	/**
	 * @typedef {Object} ClassroomCreateObject
	 * @property {string} school_id - The id of the school
	 * @property {string} name - The name of the classroom
	 * @property {string} created_at - The date of creation
	 * @property {string} updated_at - The date of last update
	 */

	/**
	 * Create a school
	 * @param {ClassroomCreateObject} __body - The body of the request
	 *
	 * @returns {ClassroomObject} - The created classroom
	 */

	async Create({ __userObject, __body }) {
		try {
			if (__userObject.type === UserType.STUDENT)
				throw new Error("Unauthorized");

			let school_id;
			if (__userObject.type === UserType.SCHOOL_ADMIN)
				school_id = __userObject.school_id;
			else school_id = __body.school_id;

			const result = await ClassroomsDocument.create({
				name: __body.name,
				school_id: school_id,
			});

			return result;
		} catch (error) {
			return this.#ErrorResponse(error);
		}
	}

	/**
	 * @typedef {Object} FindOneFilter
	 * @property {0 | 1} _id - The id of the classroom
	 * @property {0 | 1} school_id - The id of the school
	 * @property {0 | 1} name - The name of the classroom
	 * @property {0 | 1} created_at - The created_at of the user
	 * @property {0 | 1} updated_at - The updated_at of the user
	 */

	/**
	 *
	 * @param {ClassroomObject} query
	 * @param {FindOneFilter} filter
	 * @returns {ClassroomObject}
	 */

	async FindOne(query = null, filter = {}) {
		if (!query) throw new Error("Query is required for find one");

		const result = await ClassroomsDocument.findOne(query, filter)
			.lean()
			.exec();

		return result;
	}

	/**
	 * @typedef FindAllQuery
	 * @property {string?} _id - The id of the classroom
	 * @property {string?} school_id - The id of the school
	 * @property {string?} name - The name of the classroom
	 */

	/**
	 *
	 * @param {FindAllQuery} __query - The body of the request
	 * @returns {ClassroomObject[]}
	 */

	async FindAll({ __userObject, __query }) {
		try {
			if (__userObject.type === UserType.STUDENT)
				throw new Error("Unauthorized");

			if (__userObject.type === UserType.SCHOOL_ADMIN)
				__query.school_id = __userObject.school_id;

			const result = await ClassroomsDocument.find(__query).lean().exec();

			return result;
		} catch (error) {
			return this.#ErrorResponse(error);
		}
	}

	/**
	 * @typedef FindByIdAndUpdateQuery
	 * @property {string} id - The id of the classroom
	 */

	/**
	 * @typedef FindByIdAndUpdateBody
	 * @property {string?} name - The name of the classroom
	 */

	/**
	 * @param {FindByIdAndUpdateQuery} __query - The Query of the request
	 * @param {FindByIdAndUpdateBody} __body - The body of the request
	 *
	 * @returns {ClassroomObject} - The classroom object
	 */

	async FindByIdAndUpdate({ __userObject, __query, __body }) {
		try {
			if (__userObject.user_type === UserType.STUDENT)
				throw new Error("Unauthorized");

			const result = await ClassroomsDocument.findByIdAndUpdate(
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
	 * @property {string} id - The id of the classroom
	 */

	/**
	 * @param {FindByIdAndDeleteQuery} __query - The Query of the request
	 *
	 * @returns {ClassroomObject} - The classroom object
	 */

	async FindByIdAndDelete({ __userObject, __query }) {
		try {
			if (__userObject.type === UserType.STUDENT)
				throw new Error("Unauthorized");

			const has_students = await this.mediator.QueryUsers({
				classroom_id: new Types.ObjectId(__query.id),
			});

			if (has_students)
				throw new Error("Cannot delete classroom with students");

			const result = await ClassroomsDocument.findByIdAndDelete(
				__query.id,
			)
				.lean()
				.exec();

			return result;
		} catch (error) {
			return this.#ErrorResponse(error);
		}
	}
}

module.exports = ClassroomsManager;
