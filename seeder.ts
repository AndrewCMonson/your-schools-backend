import { connectDB } from "./config/db.js";
import { schools, users } from "./data/index.js";
import { SchoolModel, UserModel } from "./models/index.js";

connectDB();

const importData = async () => {
  try {
    await SchoolModel.deleteMany();
    await UserModel.deleteMany();

    await SchoolModel.insertMany(schools);

    await UserModel.insertMany(users);

    console.log("Data imported");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await SchoolModel.deleteMany();
    await UserModel.deleteMany();

    console.log("Data destroyed");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
