// const bcrypt = require("bcrypt");
// const { Types } = require("mongoose");
// module.exports = class MiddlewareManager {
// 	constructor({ managers }) {
// 		this.managers = managers;

// 		this.myExpose = Object.entries({
// 			post: ["post_school", "post_classroom", "post_user"],
// 			get: ["get_schools", "get_classrooms", "get_users"],
// 			patch: ["patch_school", "patch_classroom", "patch_user"],
// 			delete: ["delete_school", "delete_classroom", "delete_user"],
// 		})
// 			.filter(([, value]) => value.length > 0)
// 			.map(([key, value]) => value.map((i) => `${key}=${i}`))
// 			.flat(1);
// 	}

// 	post_school({ __post_school }) {
// 		return __post_school;
// 	}

// 	get_schools({ __get_all_school }) {
// 		return __get_all_school;
// 	}

// 	patch_school({ __patch_school }) {
// 		return __patch_school;
// 	}

// 	delete_school({ __delete_school }) {
// 		return __delete_school;
// 	}

// 	post_classroom({ __post_classroom }) {
// 		return __post_classroom;
// 	}

// 	get_classrooms({ __get_all_classroom }) {
// 		return __get_all_classroom;
// 	}

// 	patch_classroom({ __patch_classroom }) {
// 		return __patch_classroom;
// 	}

// 	delete_classroom({ __delete_classroom }) {
// 		return __delete_classroom;
// 	}

// 	async post_user({ __device, __post_user }) {
// 		const { agent } = __device;

// 		const device_id = bcrypt.hashSync(agent.source, 1);

// 		const user = __post_user;

// 		const result = await this.managers.mongo.users.FindByIdAndUpdate(
// 			{
// 				id: user._id,
// 			},
// 			{ device_id },
// 			{ session: undefined },
// 		);

// 		const long_token = this.managers.token.genLongToken({
// 			userId: result._id,
// 			userKey: result.auth_info._id,
// 		});

// 		const short_token = this.managers.token.genShortToken({
// 			userId: result._id,
// 			userKey: result.auth_info._id,
// 			deviceId: device_id,
// 		});

// 		return {
//             user: result,
//             long_token,
//             short_token
//         };
// 	}

// 	get_users({ __get_all_user }) {
// 		return __get_all_user;
// 	}

// 	patch_user({ __patch_user }) {
// 		return __patch_user;
// 	}

// 	delete_user({ __delete_user }) {
// 		return __delete_user;
// 	}
// };
