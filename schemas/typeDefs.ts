const typedefs = `
type Image {
    url: String
    alt: String
    owner: ObjectId
} 

type Auth {
    token: ID! 
    user: User!
}
  
type User {
    id: ID
    username: String 
    email: String
    password: String
    zipcode: String
    theme: String
    favorites: [School!]
    isAdmin: Boolean
}

type LatLng {
    lat: Float
    lng: Float
}

type Bounds {
    northeast: LatLng
    southwest: LatLng
}

type LocationInfo {
  location: LatLng
  bounds: Bounds
}

type Schools {
  schools: [School!]!
  locationInfo: LocationInfo
}

type Review {
    id: ID
    rating: Float
    review: String
    owner: User
    schoolId: School
    createdAt: String
}

type School {
    id: ID
    name: String
    address: String
    city: String
    state: String
    zipcode: String
    latLng: LatLng
    phone: String
    website: String
    email: String
    description: String
    rating: Float
    offers_daycare: Boolean
    age_range: [Int!]
    early_enrollment: Boolean
    min_tuition: Int
    max_tuition: Int
    days_open: [String!]
    days_closed: [String!]
    opening_hours: String
    closing_hours: String
    min_enrollment: Int
    max_enrollment: Int
    min_student_teacher_ratio: Float
    max_student_teacher_ratio: Float
    images: [Image]
    avatar: String
    isVerified: Boolean
    reviews: [Review!]
}
  
  type Query {
    schools(zipcode: String): Schools!
    allSchools: [School!]!
    school(id: ID!): School!
    me: User! 
    getFavorites(username: String): [User]!
    allUsers: [User!]!
}

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth!
    updateUserInfo(username: String, email: String, password: String, zipcode: String, theme: String): User!
    updateUserPassword(password: String!, newPassword: String!): User
    login(email: String!, password: String!): Auth!
    addToFavorites(schoolId: ID!): User!
    removeFromFavorites(schoolId: ID!): User!
    logout: Void
    recoverPassword(email: String!): String!
    addReview(schoolId: ID!, rating: Float!, review: String!, owner: ID!): Review!
    updateSchoolInfo(id: ID!, name: String, address: String, city: String, state: String, zipcode: String, phone: String, website: String, email: String, description: String, rating: Float, offers_daycare: Boolean, age_range: [Int!], early_enrollment: Boolean, min_tuition: Int, max_tuition: Int, days_open: [String!], days_closed: [String!], opening_hours: String, closing_hours: String, min_enrollment: Int, max_enrollment: Int, min_student_teacher_ratio: Float, max_student_teacher_ratio: Float, avatar: String, isVerified: Boolean): School!
    deleteSchool(id: ID!): String
    addSchool(name: String!, address: String!, city: String!, state: String!, zipcode: String!) : School!
    deleteUser(id: ID!): String
    adminUpdateUserInfo(id: ID!, username: String, email: String, zipcode: String, theme: String, isAdmin: Boolean): User!
    adminAddUser(username: String!, email: String!, isAdmin: Boolean!) : User!
}

  scalar ObjectId
  scalar Void
  `;

export default typedefs;
