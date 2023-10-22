// External Libs
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SchoolSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, "{PATH} not found"],

			//? Using /managers/_common/schema.models.js validation
			minLength: [3, "{PATH} must be at least {MINLENGTH} characters"],
			maxLength: [20, "{PATH} must be at most {MAXLENGTH} characters"],
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

const SchoolsDocument = mongoose.model("schools", SchoolSchema);

export default SchoolsDocument;
