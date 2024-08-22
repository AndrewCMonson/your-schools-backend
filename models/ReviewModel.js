import { Schema, model } from "mongoose";
export const reviewSchema = new Schema({
    school: {
        type: Schema.Types.ObjectId,
        ref: "School",
    },
    rating: {
        type: Number,
    },
    review: {
        type: String,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: true,
});
export const ReviewModel = model("Review", reviewSchema);
