const UsersManager = new (require("../user/Users.manager"))();
const ClassroomsDocument = require("./Classrooms.document");

class ClassroomsManager {
	async Create({ name, school_id }, { session }) {
		const [{ _doc: result }] = await ClassroomsDocument.create(
			[{ name, school_id }],
			{
				session,
			},
		);

		return result;
	}

	async FindById({ id }) {
		const result = await ClassroomsDocument.findById(id).lean().exec();

		return result;
	}

	async FindAll({ school_id }) {
		const result = await ClassroomsDocument.find({ school_id })
			.lean()
			.exec();

		return result;
	}

	async FindIfExists(filter_query) {
		const result = await ClassroomsDocument.findOne(filter_query)
			.lean()
			.exec();

		return result ? true : false;
	}

	async FindByIdAndUpdate({ id }, { name }, { session }) {
		const result = await ClassroomsDocument.findByIdAndUpdate(
			id,
			{ name },
			// Update then return the new record by using {new: true}
			{ new: true, runValidators: true, session },
		)
			.lean()
			.exec();

		return result;
	}

	async FindByIdAndDelete({ id }, { session }) {
		const has_students = await UsersManager.FindIfExists({
			classroom_id: id,
		});

		if (has_students)
			throw new Error("Cannot delete classroom with students");

		const result = await ClassroomsDocument.findByIdAndDelete(id, {
			session,
		})
			.lean()
			.exec();

		return result;
	}
}

module.exports = ClassroomsManager;
