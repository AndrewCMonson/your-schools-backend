import { Schema, Types, model, Document } from "mongoose";

interface ImageAttributes extends Document {
  url: string;
  alt: string;
  owner: Types.ObjectId;
}

export const imageSchema = new Schema<ImageAttributes>({
  url: {
    type: String,
  },
  alt: {
    type: String,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "School",
  },
});

export interface SchoolAttributes extends Document {
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  phone: string;
  website: string;
  email: string;
  description: string;
  rating: number;
  offers_daycare: boolean;
  age_range: Array<number>;
  early_enrollment: boolean;
  min_tuition: number;
  max_tuition: number;
  days_open: Array<string>;
  days_closed: Array<string>;
  opening_hours: string;
  closing_hours: string;
  min_enrollment: number;
  max_enrollment: number;
  min_student_teacher_ratio: number;
  max_student_teacher_ratio: number;
  images: Array<ImageAttributes>;
  avatar: string;
  isVerified: boolean;
  reviews: Array<Types.ObjectId>;
}

export const schoolsSchema = new Schema<SchoolAttributes>(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipcode: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    phone: {
      type: String,
    },
    website: {
      type: String,
    },
    email: {
      type: String,
    },
    description: {
      type: String,
    },
    rating: {
      type: Number,
    },
    offers_daycare: {
      type: Boolean,
    },
    age_range: {
      type: [Number],
    },
    early_enrollment: {
      type: Boolean,
    },
    min_tuition: {
      type: Number,
    },
    max_tuition: {
      type: Number,
    },
    days_open: {
      type: [String],
    },
    days_closed: {
      type: [String],
    },
    opening_hours: {
      type: String,
    },
    closing_hours: {
      type: String,
    },
    min_enrollment: {
      type: Number,
    },
    max_enrollment: {
      type: Number,
    },
    min_student_teacher_ratio: {
      type: Number,
    },
    max_student_teacher_ratio: {
      type: Number,
    },
    images: [imageSchema],
    avatar: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const SchoolModel = model("school", schoolsSchema);
