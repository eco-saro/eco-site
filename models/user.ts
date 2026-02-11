import mongoose, { Schema, Document, Types } from "mongoose"

/**
 * Interface for a user's address
 */
export interface IAddress {
  label: string
  name: string
  phone: string
  street: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault?: boolean
}

/**
 * User Roles
 */
export type UserRole = "buyer" | "vendor" | "admin"

/**
 * Main User interface
 */
export interface IUser extends Document {
  name: string
  email: string
  image?: string
  password?: string
  phone?: string
  role: UserRole
  isEmailVerified: boolean
  addresses: IAddress[]
  wishlist: Types.ObjectId[]         // Product references
  dateOfBirth?: Date
  gender?: "male" | "female" | "other"
  bio?: string
  otp?: string
  otpExpires?: Date
  otpAttempts?: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Address sub-schema
 */
const AddressSchema: Schema<IAddress> = new Schema({
  label: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
})

/**
 * User schema
 */
const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["buyer", "vendor", "admin"],
      default: "buyer",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    addresses: {
      type: [AddressSchema],
      default: [],
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    bio: {
      type: String,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
  }
)

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
