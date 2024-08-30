import { AuthenticationError } from "apollo-server-express";
import { readFileSync } from "fs";
import { Resolvers } from "../../__generatedTypes__/graphql.js";
import { ReviewModel, SchoolModel } from "../../models/index.js";
import { getLatLng, getLatLngFromZipcode } from "../../services/index.js";

export const schoolTypeDefs: string = readFileSync(
  "GraphQL/Schools/schoolTypeDefs.graphql",
  "utf-8",
);

export const schoolResolvers: Resolvers = {
  Query: {
    school: async (_, { id }) => {
      if (!id) throw new Error("Please provide an ID");

      const school = await SchoolModel.findById(id);

      if (!school) {
        throw new Error("No school found with this ID");
      }

      return school;
    },
    schools: async (_, { zipcode }) => {
      if (!zipcode) {
        return { schools: [] };
      }
      const schools = await SchoolModel.find({ zipcode: zipcode });

      const locationInfo = await getLatLngFromZipcode(zipcode);

      return { schools, locationInfo };
    },
    allSchools: async () => {
      const schools = await SchoolModel.find();

      if (!schools) {
        throw new Error("No schools found");
      }

      return schools;
    },
  },
  Mutation: {
    addSchool: async (_, { name, address, city, state, zipcode }, { user }) => {
      if (!name || !address || !city || !state || !zipcode) {
        throw new Error(
          "You need to provide a name, address, city, state, and zipcode",
        );
      }

      if (!user) throw new AuthenticationError("You need to be logged in");

      if (!user.isAdmin)
        throw new AuthenticationError(
          "You need to be an admin to add a school",
        );

      const newSchool = await SchoolModel.create({
        name,
        address,
        city,
        state,
        zipcode,
      });

      return newSchool;
    },
    deleteSchool: async (_, { id }, { user }) => {
      if (!id) throw new Error("Please provide a school ID");

      if (!user) throw new AuthenticationError("You need to be logged in");

      if (!user.isAdmin)
        throw new AuthenticationError(
          "You need to be an admin to delete a school",
        );

      const deletedSchool = await SchoolModel.findByIdAndDelete(id);

      if (!deletedSchool) {
        throw new Error("Couldn't find school with this id");
      }

      return "School deleted successfully";
    },
  },
  School: {
    latLng: async (parent) => {
      const { address, city, state } = parent;
      const { lat, lng } = await getLatLng(address, city, state);
      return { lat, lng };
    },
    reviews: async (parent) => {
      const reviews = await ReviewModel.find({ _id: { $in: parent.reviews } });

      if (!reviews) {
        throw new Error("No reviews found for this school");
      }

      return reviews;
    },
  },
};
