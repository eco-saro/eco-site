import { Schema, model, models, Document, Types } from 'mongoose';

export interface IOrder extends Document {
  user: Types.ObjectId;
  products: {
    product: Types.ObjectId;
    vendor: Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'completed';
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: 'COD' | 'Card' | 'UPI';
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  shiprocketAWB?: string;
  shiprocketCourier?: string;
  trackingUrl?: string;
  shippingStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
      image: String,
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'completed'], default: 'Pending' },
  shippingAddress: {
    name: String, phone: String, street: String, city: String, state: String, pincode: String, country: String,
  },
  paymentMethod: { type: String, enum: ['COD', 'Card', 'UPI'], default: 'COD' },
  shiprocketOrderId: String,
  shiprocketShipmentId: String,
  shiprocketAWB: String,
  shiprocketCourier: String,
  trackingUrl: String,
  shippingStatus: String,
}, { timestamps: true });

export const Order = models.Order || model<IOrder>('Order', OrderSchema);