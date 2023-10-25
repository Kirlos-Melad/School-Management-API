const bcrypt = require("bcrypt");

const { UsersDocument, UserType } = require("./Users.document");

class UsersManager {
	constructor({ managers } = {}) {
		this.tokenManager = managers.token;
		this.mediator = managers.managersMediator;
		this.usersValidator = new (require("./Users.validator"))();
		this.usersTransformer = new (require("./Users.transformer"))();

		this.httpExposed = Object.entries({
			post: ["Create", "CreateSuper", "SignIn"],
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

	async #GenerateTokens({ user_id, user_type, device_id }) {
		const long_token = this.tokenManager.genLongToken({
			user_id: user_id,
			user_type: user_type,
		});

		const short_token = this.tokenManager.genShortToken({
			user_id: user_id,
			user_type: user_type,
			device_id: device_id,
		});

		return {
			long_token,
			short_token,
		};
	}

	async #Create({
		type,
		name,
		email,
		password,
		school_id,
		classroom_id,
		device_id,
	}) {
		if (school_id && !(await this.mediator.QuerySchools({ id: school_id })))
			throw new Error("School not found");

		if (
			classroom_id &&
			!(await this.mediator.QueryClassrooms({ id: classroom_id }))
		)
			throw new Error("Classroom not found");

		let result = await UsersDocument.create({
			type,
			name,
			email,
			password,
			school_id,
			classroom_id,
			devices: [device_id],
		});

		result = result._doc;

		delete result.password;

		const { long_token, short_token } = await this.#GenerateTokens({
			user_id: result._id,
			user_type: result.type,
			device_id: device_id,
		});

		return {
			user: result,
			long_token,
			short_token,
		};
	}

	/**
	 * User Object
	 * @typedef {Object} UserObject
	 * @property {string} _id - The id of the user
	 * @property {string} type - The type of the user
	 * @property {string} name - The name of the user
	 * @property {string} email - The email of the user
	 * @property {string} school_id - The school id of the user
	 * @property {string} classroom_id - The classroom id of the user
	 * @property {string[]} devices - The devices of the user
	 * @property {string} created_at - The created_at of the user
	 * @property {string} updated_at - The updated_at of the user
	 */

	/**
	 * Auth Object
	 * @typedef {Object} AuthObject
	 * @property {UserObject} user - The user object
	 * @property {string} long_token - The long token of the user
	 * @property {string} short_token - The short token of the user
	 */

	/**
	 * CreateSuper body
	 * @typedef {Object} CreateSuperBody
	 * @property {string} name - The name of the user
	 * @property {string} email - The email of the user
	 * @property {string} password - The password of the user
	 * @property {string} secret - The secret of the super admin
	 *
	 */

	/**
	 * @param {CreateSuperBody} __body - The body of the request
	 * @param {Object} __device - The device of the request
	 *
	 * @returns {AuthObject} - The auth object
	 */
	async CreateSuper({ __body, __device }) {
		try {
			const exists = await UsersDocument.exists({
				type: UserType.SUPER_ADMIN,
			});

			if (exists) throw new Error("Super admin already exists");

			__body.type = UserType.SUPER_ADMIN;
			this.usersValidator.ValidateCreate(__body);
			const data = this.usersTransformer.TransformCreate({
				...__body,
				device: __device,
			});

			return await this.#Create(data);
		} catch (error) {
			return this.#ErrorResponse(error);
		}
	}

	/**
	 * Create body
	 * @typedef {Object} CreateBody
	 * @property {string} type - The type of the user
	 * @property {string} name - The name of the user
	 * @property {string} email - The email of the user
	 * @property {string} password - The password of the user
	 * @property {string?} school_id - The school id of the user
	 * @property {string?} classroom_id - The classroom id of the user
	 */

	/**
	 * @param {CreateBody} __body - The body of the request
	 * @param {Object} __device - The device of the request
	 *
	 * @returns {AuthObject} - The auth object
	 */
	async Create({ __userObject, __device, __body }) {
		try {
			if (__userObject.type === UserType.STUDENT)
				throw new Error("unauthorized");

			if (
				__userObject.type === UserType.SCHOOL_ADMIN &&
				__body.type !== UserType.STUDENT
			)
				throw new Error("unauthorized");

			if (__body.type === UserType.SUPER_ADMIN)
				throw new Error("unauthorized");

			this.usersValidator.ValidateCreate(__body);
			const data = this.usersTransformer.TransformCreate({
				...__body,
				device: __device,
			});

			return await this.#Create(data);
		} catch (error) {
			return this.#ErrorResponse(error);
		}
	}

	/**
	 * Sign in body
	 * @typedef {Object} SignInBody
	 * @property {string} type - The type of the user
	 * @property {string} email - The email of the user
	 * @property {string} password - The password of the user
	 */

	/**
	 * @param {SignInBody} __body - The body of the request
	 * @param {Object} __device - The device of the request
	 *
	 * @returns {AuthObject} - The auth object
	 */
	async SignIn({ __device, __body }) {
		try {
			this.usersValidator.ValidateSignIn(__body);

			const { email, password, type, device_id } =
				this.usersTransformer.TransformSignIn({
					...__body,
					device: __device,
				});

			const result = await UsersDocument.findOne({ email, type }).exec();

			if (!result) throw new Error("Invalid email or password");

			// Compare the passwords
			const matched = bcrypt.compareSync(password, result._doc.password);

			if (!matched) throw new Error("Invalid email or password");

			const { long_token, short_token } = await this.#GenerateTokens({
				user_id: result._id,
				user_type: result.type,
				device_id: device_id,
			});

			await result.updateOne(
				{ $addToSet: { devices: device_id } },
				{
					new: true,
					runValidators: true,
				},
			);

			// remove password
			delete result._doc.password;

			return {
				user: result._doc,
				long_token,
				short_token,
			};
		} catch (error) {
			return this.#ErrorResponse(error);
		}
	}

	/**
	 * @typedef {Object} FindOneFilter
	 * @property {0 | 1} _id - The id of the user
	 * @property {0 | 1} type - The type of the user
	 * @property {0 | 1} name - The name of the user
	 * @property {0 | 1} email - The email of the user
	 * @property {0 | 1} school_id - The school id of the user
	 * @property {0 | 1} classroom_id - The classroom id of the user
	 * @property {0 | 1} devices - The devices of the user
	 * @property {0 | 1} created_at - The created_at of the user
	 * @property {0 | 1} updated_at - The updated_at of the user
	 */

	/**
	 *
	 * @param {UserObject} query
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
	 * @param {UserObject} __query - The body of the request
	 * @returns {UserObject[]}
	 */
	async FindAll({ __userObject, __query }) {
		try {
			const searchQuery = { ...__query };

			if (__userObject.type === UserType.STUDENT)
				throw new Error("unauthorized");
			if (__userObject.type === UserType.SCHOOL_ADMIN)
				searchQuery.school_id = __userObject.school_id;

			const result = await UsersDocument.find(searchQuery, {
				password: 0,
			})
				.lean()
				.exec();

			return result;
		} catch (error) {
			this.#ErrorResponse(error);
		}
	}

	/**
	 * @typedef FindByIdAndUpdateQuery
	 * @property {string} id - The id of the user
	 */

	/**
	 * @typedef FindByIdAndUpdateBody
	 * @property {string?} name - The name of the user
	 * @property {string?} email - The email of the user
	 * @property {string?} password - The password of the user
	 * @property {string?} school_id - The school id of the user
	 * @property {string?} classroom_id - The classroom id of the user
	 */

	/**
	 * @param {FindByIdAndUpdateQuery} __query - The Query of the request
	 * @param {FindByIdAndUpdateBody} __body - The body of the request
	 *
	 * @returns {UserObject} - The user object
	 */
	async FindByIdAndUpdate({ __userObject, __query, __body }) {
		try {
			if (__userObject.type === UserType.STUDENT)
				throw new Error("unauthorized");

			const result = await UsersDocument.findOne({
				_id: __query.id,
			}).exec();

			if (
				__userObject.type === UserType.SCHOOL_ADMIN &&
				result.type !== UserType.STUDENT
			)
				throw new Error("unauthorized");

			__body.password &&
				this.usersValidator.ValidatePassword(__body.password);

			const data = this.usersTransformer.TransformUpdate(
				{
					updater_type: __userObject.type,
					updatee_type: result._doc.type,
				},
				__body,
			);

			await result.updateOne(data, {
				new: true,
				runValidators: true,
			});
			// remove password
			delete result._doc.password;
			return { ...result, ...data };
		} catch (error) {
			return this.#ErrorResponse(error);
		}
	}

	/**
	 * @typedef FindByIdAndDeleteQuery
	 * @property {string} id - The id of the user
	 */

	/**
	 * @param {FindByIdAndDeleteQuery} __query - The Query of the request
	 *
	 * @returns {UserObject} - The user object
	 */
	async FindByIdAndDelete({ __userObject, __query }) {
		try {
			if (__userObject._id === __query.id)
				throw new Error("unauthorized");

			if (__userObject.type === UserType.STUDENT)
				throw new Error("unauthorized");

			const result = await UsersDocument.findOne({
				_id: __query.id,
			}).exec();

			if (
				__userObject.type === UserType.SCHOOL_ADMIN &&
				(result.type !== UserType.STUDENT ||
					result.school_id !== __userObject.school_id)
			)
				throw new Error("unauthorized");

			result.deleteOne();

			return result;
		} catch (error) {
			return this.#ErrorResponse(error);
		}
	}
}

module.exports = UsersManager;
