// External Libs
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserType = Object.freeze({
	SUPER_ADMIN: "super_admin",
	SCHOOL_ADMIN: "school_admin",
	STUDENT: "student",
});

const AuthInfoSchema = new Schema(
	{
		devices: {
			type: [String],
			default: [],
		},
	},
	{ timestamps: false, versionKey: false },
);

const UserSchema = new Schema(
	{
		//TODO: check if attribute if valid and what is userKey?
		type: {
			type: String,
			enum: {
				values: Object.values(UserType),
				message: "{VALUE} is not supported",
			},
			required: [true, "{PATH} not found"],
		},

		name: {
			type: String,
			required: [true, "{PATH} not found"],

			//? Using /managers/_common/schema.models.js validation
			minLength: [3, "{PATH} must be at least {MINLENGTH} characters"],
			maxLength: [20, "{PATH} must be at most {MAXLENGTH} characters"],
		},

		email: {
			lowercase: true,
			trim: true,
			type: String,
			required: [true, "{PATH} not found"],
			//? Using /managers/_common/schema.models.js validation
			minLength: [3, "{PATH} must be at least {MINLENGTH} characters"],
			maxLength: [100, "{PATH} must be at most {MAXLENGTH} characters"],
			validate: {
				validator: (email) => {
					return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
						email,
					);
				},
				message: ({ value }) => `Invalid email`,
			},
		},

		password: {
			type: String,
			required: [true, "{PATH} not found"],
		},

		school_id: {
			type: Schema.Types.ObjectId,
			required: [true, "{PATH} not found"],
		},

		classroom_id: {
			type: Schema.Types.ObjectId,
			default: null,
		},

		auth_info: {
			type: AuthInfoSchema,

			default: {
				devices: [],
			},
		},

		created_at: Number,
		updated_at: Number,
	},

	{
		timestamps: {
			// Make mongoose use ms
			currentTime: () => Date.now(),

			// Change default variable names
			createdAt: "created_at",
			updatedAt: "updated_at",
		},

		// Disable version key (__v)
		versionKey: false,
	},
);

// Create Composite key (Email, Type)
UserSchema.index({ email: 1, type: 1 }, { unique: 1 });

const UsersDocument = mongoose.model("users", UserSchema);

module.exports = { UsersDocument, UserType };
