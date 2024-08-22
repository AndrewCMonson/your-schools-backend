import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { UserAttributes } from '../models/UserModel';
import { SchoolAttributes } from '../models/SchoolsModel';
import { ReviewAttributes } from '../models/ReviewModel';
import { MyContext } from '../utils/auth';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  ObjectId: { input: any; output: any; }
  Void: { input: any; output: any; }
};

export type Auth = {
  __typename?: 'Auth';
  token: Scalars['ID']['output'];
  user: User;
};

export type Bounds = {
  __typename?: 'Bounds';
  northeast?: Maybe<LatLng>;
  southwest?: Maybe<LatLng>;
};

export type Image = {
  __typename?: 'Image';
  alt?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<Scalars['ObjectId']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type LatLng = {
  __typename?: 'LatLng';
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
};

export type LocationInfo = {
  __typename?: 'LocationInfo';
  bounds?: Maybe<Bounds>;
  location?: Maybe<LatLng>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addReview: Review;
  addSchool: School;
  addToFavorites: User;
  addUser: Auth;
  adminAddUser: User;
  adminUpdateUserInfo: User;
  deleteSchool?: Maybe<Scalars['String']['output']>;
  deleteUser?: Maybe<Scalars['String']['output']>;
  login: Auth;
  logout?: Maybe<Scalars['Void']['output']>;
  recoverPassword: Scalars['String']['output'];
  removeFromFavorites: User;
  updateSchoolInfo: School;
  updateUserInfo: User;
  updateUserPassword?: Maybe<User>;
};


export type MutationAddReviewArgs = {
  owner: Scalars['ID']['input'];
  rating: Scalars['Float']['input'];
  review: Scalars['String']['input'];
  schoolId: Scalars['ID']['input'];
};


export type MutationAddSchoolArgs = {
  address: Scalars['String']['input'];
  city: Scalars['String']['input'];
  name: Scalars['String']['input'];
  state: Scalars['String']['input'];
  zipcode: Scalars['String']['input'];
};


export type MutationAddToFavoritesArgs = {
  schoolId: Scalars['ID']['input'];
};


export type MutationAddUserArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationAdminAddUserArgs = {
  email: Scalars['String']['input'];
  isAdmin: Scalars['Boolean']['input'];
  username: Scalars['String']['input'];
};


export type MutationAdminUpdateUserInfoArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isAdmin?: InputMaybe<Scalars['Boolean']['input']>;
  theme?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  zipcode?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteSchoolArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRecoverPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationRemoveFromFavoritesArgs = {
  schoolId: Scalars['ID']['input'];
};


export type MutationUpdateSchoolInfoArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  age_range?: InputMaybe<Array<Scalars['Int']['input']>>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  closing_hours?: InputMaybe<Scalars['String']['input']>;
  days_closed?: InputMaybe<Array<Scalars['String']['input']>>;
  days_open?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  early_enrollment?: InputMaybe<Scalars['Boolean']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isVerified?: InputMaybe<Scalars['Boolean']['input']>;
  max_enrollment?: InputMaybe<Scalars['Int']['input']>;
  max_student_teacher_ratio?: InputMaybe<Scalars['Float']['input']>;
  max_tuition?: InputMaybe<Scalars['Int']['input']>;
  min_enrollment?: InputMaybe<Scalars['Int']['input']>;
  min_student_teacher_ratio?: InputMaybe<Scalars['Float']['input']>;
  min_tuition?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  offers_daycare?: InputMaybe<Scalars['Boolean']['input']>;
  opening_hours?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['Float']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
  zipcode?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateUserInfoArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  theme?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  zipcode?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateUserPasswordArgs = {
  newPassword: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  allSchools: Array<School>;
  allUsers: Array<User>;
  getFavorites: Array<Maybe<User>>;
  me: User;
  school: School;
  schools: Schools;
};


export type QueryGetFavoritesArgs = {
  username?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySchoolArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySchoolsArgs = {
  zipcode?: InputMaybe<Scalars['String']['input']>;
};

export type Review = {
  __typename?: 'Review';
  createdAt?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  owner?: Maybe<User>;
  rating?: Maybe<Scalars['Float']['output']>;
  review?: Maybe<Scalars['String']['output']>;
  schoolId?: Maybe<School>;
};

export type School = {
  __typename?: 'School';
  address?: Maybe<Scalars['String']['output']>;
  age_range?: Maybe<Array<Scalars['Int']['output']>>;
  avatar?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  closing_hours?: Maybe<Scalars['String']['output']>;
  days_closed?: Maybe<Array<Scalars['String']['output']>>;
  days_open?: Maybe<Array<Scalars['String']['output']>>;
  description?: Maybe<Scalars['String']['output']>;
  early_enrollment?: Maybe<Scalars['Boolean']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  images?: Maybe<Array<Maybe<Image>>>;
  isVerified?: Maybe<Scalars['Boolean']['output']>;
  latLng?: Maybe<LatLng>;
  max_enrollment?: Maybe<Scalars['Int']['output']>;
  max_student_teacher_ratio?: Maybe<Scalars['Float']['output']>;
  max_tuition?: Maybe<Scalars['Int']['output']>;
  min_enrollment?: Maybe<Scalars['Int']['output']>;
  min_student_teacher_ratio?: Maybe<Scalars['Float']['output']>;
  min_tuition?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  offers_daycare?: Maybe<Scalars['Boolean']['output']>;
  opening_hours?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  rating?: Maybe<Scalars['Float']['output']>;
  reviews?: Maybe<Array<Review>>;
  state?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
  zipcode?: Maybe<Scalars['String']['output']>;
};

export type Schools = {
  __typename?: 'Schools';
  locationInfo?: Maybe<LocationInfo>;
  schools: Array<School>;
};

export type User = {
  __typename?: 'User';
  email?: Maybe<Scalars['String']['output']>;
  favorites?: Maybe<Array<School>>;
  id?: Maybe<Scalars['ID']['output']>;
  isAdmin?: Maybe<Scalars['Boolean']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  theme?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  zipcode?: Maybe<Scalars['String']['output']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Auth: ResolverTypeWrapper<Omit<Auth, 'user'> & { user: ResolversTypes['User'] }>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Bounds: ResolverTypeWrapper<Bounds>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Image: ResolverTypeWrapper<Image>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LatLng: ResolverTypeWrapper<LatLng>;
  LocationInfo: ResolverTypeWrapper<LocationInfo>;
  Mutation: ResolverTypeWrapper<{}>;
  ObjectId: ResolverTypeWrapper<Scalars['ObjectId']['output']>;
  Query: ResolverTypeWrapper<{}>;
  Review: ResolverTypeWrapper<ReviewAttributes>;
  School: ResolverTypeWrapper<SchoolAttributes>;
  Schools: ResolverTypeWrapper<Omit<Schools, 'schools'> & { schools: Array<ResolversTypes['School']> }>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  User: ResolverTypeWrapper<UserAttributes>;
  Void: ResolverTypeWrapper<Scalars['Void']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Auth: Omit<Auth, 'user'> & { user: ResolversParentTypes['User'] };
  Boolean: Scalars['Boolean']['output'];
  Bounds: Bounds;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Image: Image;
  Int: Scalars['Int']['output'];
  LatLng: LatLng;
  LocationInfo: LocationInfo;
  Mutation: {};
  ObjectId: Scalars['ObjectId']['output'];
  Query: {};
  Review: ReviewAttributes;
  School: SchoolAttributes;
  Schools: Omit<Schools, 'schools'> & { schools: Array<ResolversParentTypes['School']> };
  String: Scalars['String']['output'];
  User: UserAttributes;
  Void: Scalars['Void']['output'];
};

export type AuthResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Auth'] = ResolversParentTypes['Auth']> = {
  token?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BoundsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Bounds'] = ResolversParentTypes['Bounds']> = {
  northeast?: Resolver<Maybe<ResolversTypes['LatLng']>, ParentType, ContextType>;
  southwest?: Resolver<Maybe<ResolversTypes['LatLng']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImageResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Image'] = ResolversParentTypes['Image']> = {
  alt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['ObjectId']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LatLngResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['LatLng'] = ResolversParentTypes['LatLng']> = {
  lat?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lng?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LocationInfoResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['LocationInfo'] = ResolversParentTypes['LocationInfo']> = {
  bounds?: Resolver<Maybe<ResolversTypes['Bounds']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['LatLng']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addReview?: Resolver<ResolversTypes['Review'], ParentType, ContextType, RequireFields<MutationAddReviewArgs, 'owner' | 'rating' | 'review' | 'schoolId'>>;
  addSchool?: Resolver<ResolversTypes['School'], ParentType, ContextType, RequireFields<MutationAddSchoolArgs, 'address' | 'city' | 'name' | 'state' | 'zipcode'>>;
  addToFavorites?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationAddToFavoritesArgs, 'schoolId'>>;
  addUser?: Resolver<ResolversTypes['Auth'], ParentType, ContextType, RequireFields<MutationAddUserArgs, 'email' | 'password' | 'username'>>;
  adminAddUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationAdminAddUserArgs, 'email' | 'isAdmin' | 'username'>>;
  adminUpdateUserInfo?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationAdminUpdateUserInfoArgs, 'id'>>;
  deleteSchool?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteSchoolArgs, 'id'>>;
  deleteUser?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'id'>>;
  login?: Resolver<ResolversTypes['Auth'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  logout?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType>;
  recoverPassword?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationRecoverPasswordArgs, 'email'>>;
  removeFromFavorites?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationRemoveFromFavoritesArgs, 'schoolId'>>;
  updateSchoolInfo?: Resolver<ResolversTypes['School'], ParentType, ContextType, RequireFields<MutationUpdateSchoolInfoArgs, 'id'>>;
  updateUserInfo?: Resolver<ResolversTypes['User'], ParentType, ContextType, Partial<MutationUpdateUserInfoArgs>>;
  updateUserPassword?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserPasswordArgs, 'newPassword' | 'password'>>;
};

export interface ObjectIdScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ObjectId'], any> {
  name: 'ObjectId';
}

export type QueryResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  allSchools?: Resolver<Array<ResolversTypes['School']>, ParentType, ContextType>;
  allUsers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  getFavorites?: Resolver<Array<Maybe<ResolversTypes['User']>>, ParentType, ContextType, Partial<QueryGetFavoritesArgs>>;
  me?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  school?: Resolver<ResolversTypes['School'], ParentType, ContextType, RequireFields<QuerySchoolArgs, 'id'>>;
  schools?: Resolver<ResolversTypes['Schools'], ParentType, ContextType, Partial<QuerySchoolsArgs>>;
};

export type ReviewResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Review'] = ResolversParentTypes['Review']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  rating?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  review?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  schoolId?: Resolver<Maybe<ResolversTypes['School']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SchoolResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['School'] = ResolversParentTypes['School']> = {
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  age_range?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  closing_hours?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  days_closed?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  days_open?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  early_enrollment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  images?: Resolver<Maybe<Array<Maybe<ResolversTypes['Image']>>>, ParentType, ContextType>;
  isVerified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  latLng?: Resolver<Maybe<ResolversTypes['LatLng']>, ParentType, ContextType>;
  max_enrollment?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  max_student_teacher_ratio?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  max_tuition?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  min_enrollment?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  min_student_teacher_ratio?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  min_tuition?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  offers_daycare?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  opening_hours?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rating?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  reviews?: Resolver<Maybe<Array<ResolversTypes['Review']>>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  zipcode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SchoolsResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['Schools'] = ResolversParentTypes['Schools']> = {
  locationInfo?: Resolver<Maybe<ResolversTypes['LocationInfo']>, ParentType, ContextType>;
  schools?: Resolver<Array<ResolversTypes['School']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = MyContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  favorites?: Resolver<Maybe<Array<ResolversTypes['School']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  isAdmin?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  password?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  theme?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  zipcode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface VoidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Void'], any> {
  name: 'Void';
}

export type Resolvers<ContextType = MyContext> = {
  Auth?: AuthResolvers<ContextType>;
  Bounds?: BoundsResolvers<ContextType>;
  Image?: ImageResolvers<ContextType>;
  LatLng?: LatLngResolvers<ContextType>;
  LocationInfo?: LocationInfoResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  ObjectId?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
  Review?: ReviewResolvers<ContextType>;
  School?: SchoolResolvers<ContextType>;
  Schools?: SchoolsResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Void?: GraphQLScalarType;
};

