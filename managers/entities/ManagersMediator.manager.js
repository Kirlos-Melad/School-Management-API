class ManagersMediator {
	constructor({ UsersManager, SchoolsManager, ClassroomsManager }) {
		this.UsersManager = UsersManager;
		this.SchoolsManager = SchoolsManager;
		this.ClassroomsManager = ClassroomsManager;
	}

	async QueryUsers(query, filter) {
		if (query.id) {
			 query._id = query.id;
			 delete query.id;
		}
		return await this.UsersManager.FindOne(query, filter);
	}

	async QuerySchools(query, filter) {
		if (query.id) {
			query._id = query.id;
			delete query.id;
		}
		return await this.SchoolsManager.FindOne(query, filter);
	}

	async QueryClassrooms(query, filter) {
		if (query.id) {
			query._id = query.id;
			delete query.id;
		}
		return await this.ClassroomsManager.FindOne(query, filter);
	}
}

module.exports = ManagersMediator;
