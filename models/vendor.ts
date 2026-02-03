import mongoose, { Schema, Document, Types } from "mongoose"

/**
 * Interface for a vendor's address
 */
export interface IVendorAddress {
  required: false
  street: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface IPayoutDetails {
  bankName: string
  accountNumber: string
  accountHolder: string
  ifscCode: string
}

export interface IOpeningHours {
  open: string
  close: string
  closed: boolean
}

export interface IWeeklyHours {
  monday: IOpeningHours
  tuesday: IOpeningHours
  wednesday: IOpeningHours
  thursday: IOpeningHours
  friday: IOpeningHours
  saturday: IOpeningHours
  sunday: IOpeningHours
}

export interface IShippingOption {
  name: string
  price: number
  days: string
}

export interface ITaxInfo {
  gstin: string
  pan: string
}

/**
 * Vendor Application Status
 */
export type VendorStatus = "pending" | "approved" | "rejected" | "suspended"

/**
 * Main Vendor interface
 */
export interface IVendor extends Document {
  user: Types.ObjectId // Reference to the User model
  businessName: string
  businessEmail: string
  businessPhone?: string
  businessAddress: IVendorAddress
  description?: string
  status: VendorStatus
  products: Types.ObjectId[] // Product references
  payoutDetails?: IPayoutDetails
  openingHours?: IWeeklyHours
  returnPolicy?: string
  shippingOptions?: IShippingOption[]
  taxInfo?: ITaxInfo
  razorpayAccountId?: string
  isBankVerified: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Vendor schema
 */

const AddressSchema: Schema<IVendorAddress> = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
}, { _id: false });

const PayoutDetailsSchema: Schema<IPayoutDetails> = new Schema({
  bankName: { type: String },
  accountNumber: { type: String },
  accountHolder: { type: String },
  ifscCode: { type: String },
}, { _id: false });

const OpeningHoursSchema: Schema<IOpeningHours> = new Schema({
  open: { type: String },
  close: { type: String },
  closed: { type: Boolean, default: false },
}, { _id: false });

const WeeklyHoursSchema: Schema<IWeeklyHours> = new Schema({
  monday: { type: OpeningHoursSchema },
  tuesday: { type: OpeningHoursSchema },
  wednesday: { type: OpeningHoursSchema },
  thursday: { type: OpeningHoursSchema },
  friday: { type: OpeningHoursSchema },
  saturday: { type: OpeningHoursSchema },
  sunday: { type: OpeningHoursSchema },
}, { _id: false });

const ShippingOptionSchema: Schema<IShippingOption> = new Schema({
  name: { type: String },
  price: { type: Number },
  days: { type: String },
}, { _id: false });

const TaxInfoSchema: Schema<ITaxInfo> = new Schema({
  gstin: { type: String },
  pan: { type: String },
}, { _id: false });

const VendorSchema: Schema<IVendor> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    businessEmail: {
      type: String,
      required: [true, "Business email is required"],
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address.'],
    },
    businessPhone: {
      type: String,
      trim: true
    },
    businessAddress: {
      type: AddressSchema,
      required: [true, "Business address is required"]
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    payoutDetails: {
      type: PayoutDetailsSchema,
      required: false,
    },
    openingHours: {
      type: WeeklyHoursSchema,
      required: false,
    },
    returnPolicy: {
      type: String,
      trim: true,
    },
    shippingOptions: [ShippingOptionSchema],
    taxInfo: {
      type: TaxInfoSchema,
      required: false,
    },
    razorpayAccountId: { type: String },
    isBankVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

export const Vendor =
  mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema)