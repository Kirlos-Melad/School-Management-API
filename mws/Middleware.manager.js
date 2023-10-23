module.exports = class MiddlewareManager {
	constructor() {
		this.httpExposed = Object.entries({
			post: ["post_school", "post_classroom"],
			get: ["get_schools", "get_classrooms"],
			patch: ["patch_school", "patch_classroom"],
			delete: ["delete_school", "delete_classroom"],
		})
			.filter(([, value]) => value.length > 0)
			.map(([key, value]) => value.map((i) => `${key}=${i}`))
			.flat(1);
	}

	post_school({ __post_school }) {
		return __post_school;
	}

	get_schools({ __get_all_school }) {
		return __get_all_school;
	}

	patch_school({ __patch_school }) {
		return __patch_school;
	}

	delete_school({ __delete_school }) {
		return __delete_school;
	}

	post_classroom({ __post_classroom }) {
		return __post_classroom;
	}

	get_classrooms({ __get_all_classroom }) {
		return __get_all_classroom;
	}

	patch_classroom({ __patch_classroom }) {
		return __patch_classroom;
	}

	delete_classroom({ __delete_classroom }) {
		return __delete_classroom;
	}
};
