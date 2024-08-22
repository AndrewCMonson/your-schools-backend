import { Schema, Types, model, Document } from "mongoose";

export interface SessionAttributes extends Document {
  user: Types.ObjectId;
  token: string;
  expireAt: Date;
}

export const sessionSchema = new Schema<SessionAttributes>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Date,
      default: Date.now() + 1000 * 60 * 60 * 3,
      index: { expires: "3h" },
    },
  },
  {
    timestamps: true,
  },
);

export const SessionModel = model("Session", sessionSchema);
