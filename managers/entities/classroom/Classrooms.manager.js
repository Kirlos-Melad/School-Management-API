import UsersManager from "../user/Users.manager";
import ClassroomsDocument from "./Classrooms.document";

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
		const has_students = await UsersManager.FindOneByClassroomId({
			classroom_id: id,
		})
			.lean()
			.exec();

		if (has_students)
			throw new Error("Cannot delete classroom with students");

		const result = await ClassroomsDocument.findByIdAndDelete(id, {
			session,
		})
			.lean()
			.exec();

		return result;
	}

	async FindOneBySchoolId({ school_id }) {
		const result = await ClassroomsDocument.findOne({ school_id })
			.lean()
			.exec();

		return result;
	}
}

export default new ClassroomsManager();
