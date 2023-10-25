const config = require("../../../config/index.config");
const { UserType } = require("./Users.document");

class UsersValidator {
	ValidatePassword(password) {
		if (!password) throw new Error("Password is required");
		if (typeof password !== "string")
			throw new Error("Password must be a string");
		if (password.length < 8)
			throw new Error("Password must be at least 8 characters");
		if (password.length > 100)
			throw new Error("Password must be at most 100 characters");
	}

	ValidateCreate({ type, password, school_id, classroom_id, secret }) {
		if (
			type === UserType.SUPER_ADMIN &&
			(!secret || secret !== config.dotEnv.SUPER_ADMIN_SECRET)
		)
			throw new Error("Secret is required for super admin");

		if (type === UserType.SCHOOL_ADMIN && !school_id)
			throw new Error("School id is required for school admin");

		if (type === UserType.STUDENT && (!school_id || !classroom_id))
			throw new Error(
				"School id and classroom id are required for student",
			);

		this.ValidatePassword(password);
	}

	ValidateType(type) {
		if (!type) throw new Error("Type is required for sign in");
		if (typeof type !== "string")
			throw new Error("Type must be a string for sign in");
		if (!Object.values(UserType).includes(type))
			throw new Error("Type is invalid for sign in");
	}

	ValidateSignIn({ type }) {
		this.ValidateType(type);
	}
}

module.exports = UsersValidator;
