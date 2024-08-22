import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
export const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, "Please enter a valid e-mail address"],
    },
    password: {
        type: String,
        required: true,
    },
    zipcode: {
        type: String,
        required: false,
    },
    theme: {
        type: String,
        required: false,
        default: "lightTheme",
    },
    favoriteIds: [
        {
            type: Schema.Types.ObjectId,
            ref: "School",
        },
    ],
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    },
}, {
    timestamps: true,
});
userSchema.pre("save", async function (next) {
    if (this.isNew || this.isModified("password")) {
        const saltRounds = 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
});
userSchema.methods.isCorrectPassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
export const UserModel = model("user", userSchema);
