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
  





type Review {
    id: ID
    rating: Float
    review: String
    owner: User
    schoolId: School
    createdAt: String
}
  
  

  type Mutation {
    login(email: String!, password: String!): Auth!
    logout: Void
    addReview(schoolId: ID!, rating: Float!, review: String!, owner: ID!): Review!
    updateSchoolInfo(id: ID!, name: String, address: String, city: String, state: String, zipcode: String, phone: String, website: String, email: String, description: String, rating: Float, offers_daycare: Boolean, age_range: [Int!], early_enrollment: Boolean, min_tuition: Int, max_tuition: Int, days_open: [String!], days_closed: [String!], opening_hours: String, closing_hours: String, min_enrollment: Int, max_enrollment: Int, min_student_teacher_ratio: Float, max_student_teacher_ratio: Float, avatar: String, isVerified: Boolean): School!
    
    adminUpdateUserInfo(id: ID!, username: String, email: String, zipcode: String, theme: String, isAdmin: Boolean): User!
    adminAddUser(username: String!, email: String!, isAdmin: Boolean!) : User!
}

  scalar ObjectId
  scalar Void
  `;

export default typedefs;
