import ClassroomsDocument from "../classroom/Classrooms.document";
import ClassroomsManager from "../classroom/Classrooms.manager";
import SchoolsDocument from "./Schools.document";

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
		const has_classrooms = await ClassroomsManager.FindOneBySchoolId({
			school_id: id,
		})
			.lean()
			.exec();

		if (has_classrooms)
			throw new Error("Cannot delete school with classrooms");

		const has_students = await UsersDocument.exists({ school_id: id })
			.lean()
			.exec();

		if (has_students) throw new Error("Cannot delete school with students");

		const result = await SchoolsDocument.findByIdAndDelete(id, {
			session,
		})
			.lean()
			.exec();

		return result;
	}
}

export default new SchoolsManager();
