const md5 = require("md5");
const bcrypt = require("bcrypt");
const { UserType } = require("./Users.document");

class UsersTransformer {
	HashPassword(password) {
		const salt = bcrypt.genSaltSync();
		return bcrypt.hashSync(password, salt);
	}

	TransformCreate({
		type,
		name,
		email,
		password,
		school_id,
		classroom_id,
		device,
		secret,
	}) {
		if (type === UserType.SUPER_ADMIN) {
			school_id = null;
			classroom_id = null;
		} else {
			if (type === UserType.SCHOOL_ADMIN) classroom_id = null;

			secret = undefined;
		}

		return {
			type,
			name,
			email,
			password: this.HashPassword(password),
			school_id,
			classroom_id,
			device_id: md5(device),
			secret,
		};
	}

	TransformSignIn({ type, email, password, device }) {
		return {
			type,
			email,
			password,
			device_id: md5(device),
		};
	}

	TransformUpdate(
		{ updater_type, updatee_type },
		{ name, email, password, school_id, classroom_id },
	) {
		const data = {};

		//? anyone can change his password
		if (password) data.password = this.HashPassword(password);

		if (updater_type === updatee_type) {
			//? only super admin his name & email
			if (updater_type === UserType.SUPER_ADMIN) {
				if (name) data.name = name;
				if (email) data.email = email;
			}
		} else {
			//? school admin can change student email & classroom
			if (
				updater_type === UserType.SCHOOL_ADMIN &&
				updatee_type === UserType.STUDENT
			) {
				if (name) data.name = name;
				if (email) data.email = email;
				if (classroom_id) data.school_id = classroom_id;
			}
			//? super admin can change anyone email & school & classroom
			else if (updater_type === UserType.SUPER_ADMIN) {
				if (name) data.name = name;
				if (email) data.email = email;
				if (school_id) data.school_id = school_id;
				if (classroom_id) data.classroom_id = classroom_id;
			}
		}

		return data;
	}
}

module.exports = UsersTransformer;
