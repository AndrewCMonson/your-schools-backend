import { Schema, model } from "mongoose";
export const imageSchema = new Schema({
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
export const schoolsSchema = new Schema({
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
}, {
    timestamps: true,
});
export const SchoolModel = model("school", schoolsSchema);
