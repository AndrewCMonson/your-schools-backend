import { Schema, model, Document, Types } from "mongoose";

export interface ReviewAttributes extends Document {
  school: Types.ObjectId;
  rating: number;
  review: string;
  owner: Types.ObjectId;
}

export const reviewSchema = new Schema<ReviewAttributes>(
  {
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
  },
  {
    timestamps: true,
  },
);

export const ReviewModel = model("Review", reviewSchema);
