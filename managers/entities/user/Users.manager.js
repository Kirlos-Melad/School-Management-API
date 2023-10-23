const { UsersDocument, UserType } = require("./Users.document");
const bcrypt = require("bcrypt");

class UsersManager {
	#ValidatePassword(password) {
		if (!password) throw new Error("Password is required");
		if (typeof password !== "string")
			throw new Error("Password must be a string");
		if (password.length < 8)
			throw new Error("Password must be at least 8 characters");
		if (password.length > 100)
			throw new Error("Password must be at most 100 characters");
		return true;
	}

	#HashPassword(password) {
		const salt = bcrypt.genSaltSync();
		return bcrypt.hashSync(password, salt);
	}

	async Create(
		{ type, name, email, password, school_id, classroom_id = null },
		{ session },
	) {
		password =
			this.#ValidatePassword(password) && this.#HashPassword(password);

		if (type === UserType.STUDENT && !classroom_id)
			throw new Error("Classroom id is required for student");

		const [{ _doc: result }] = await UsersDocument.create(
			[
				{
					type,
					name,
					email,
					password,
					school_id,
					classroom_id,
				},
			],
			{ session },
		);

		delete result.password;
		return result;
	}

	async FindById({ id }) {
		const result = await UsersDocument.findById(id).lean().exec();

		return result;
	}

	async FindIfExists(filter_query) {
		const result = await UsersDocument.findOne(filter_query).lean().exec();

		return result ? true : false;
	}

	async FindAll({ school_id, classroom_id = undefined }) {
		const result = await UsersDocument.find(
			{ school_id, classroom_id },
			{ password: 0 },
		)
			.lean()
			.exec();

		return result;
	}

	async SignIn({ email, password, type }) {
		const result = await UsersDocument.findOne({ email, type })
			.lean()
			.exec();

		// Compare the passwords
		const matched = bcrypt.compareSync(password, result.password);

		if (!matched) throw new Error("Invalid email or password");

		// remove password
		delete result.password;
		return result;
	}

	async FindByIdAndUpdate(
		{ id },
		{ name, email, password, classroom_id, device_id },
		{ session },
	) {
		password =
			password &&
			this.#ValidatePassword(password) &&
			this.#HashPassword(password);

		// Get the user
		const result = await UsersDocument.findByIdAndUpdate(
			id,
			{
				name,
				email,
				password,
				classroom_id,
				$addToSet: { "auth_info.devices": device_id },
			},
			// Update then return the new record by using {new: true}
			{ new: true, runValidators: true, session },
		)
			.lean()
			.exec();

		if (result.type === UserType.STUDENT && !result.classroom_id)
			throw new Error("Classroom id is required for student");

		// remove password
		delete result.password;
		return result;
	}

	async FindByIdAndDelete({ id }, { session }) {
		const result = await UsersDocument.findByIdAndDelete(id, {
			session,
		})
			.lean()
			.exec();

		return result;
	}
}

module.exports = UsersManager;
