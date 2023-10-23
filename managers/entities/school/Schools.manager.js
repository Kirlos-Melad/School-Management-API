const UsersManager = new (require("../user/Users.manager"))();
const ClassroomsManager = new (require("../classroom/Classrooms.manager"))();
const SchoolsDocument = require("./Schools.document");

class SchoolsManager {
	async Create({ name }, { session }) {
		const [{ _doc: result }] = await SchoolsDocument.create([{ name }], {
			session,
		});

		return result;
	}

	async FindById({ id }) {
		const result = await SchoolsDocument.findById(id).lean().exec();

		return result;
	}

	async FindAll() {
		const result = await SchoolsDocument.find({}).lean().exec();

		return result;
	}

	async FindByIdAndUpdate({ id }, { name }, { session }) {
		const result = await SchoolsDocument.findByIdAndUpdate(
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
		const has_classrooms = await ClassroomsManager.FindIfExists({
			school_id: id,
		});

		if (has_classrooms)
			throw new Error("Cannot delete school with classrooms");

		const has_students = await UsersManager.FindIfExists({
			school_id: id,
		});

		if (has_students) throw new Error("Cannot delete school with students");

		const result = await SchoolsDocument.findByIdAndDelete(id, {
			session,
		})
			.lean()
			.exec();

		return result;
	}
}

module.exports = SchoolsManager;
