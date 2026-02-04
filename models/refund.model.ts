import { Schema, model, models, Document, Types } from 'mongoose';

export interface IRefund extends Document {
    order: Types.ObjectId;
    itemIndex: number; // Index of the product in the order's products array
    user: Types.ObjectId;
    vendor: Types.ObjectId;
    amount: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const RefundSchema = new Schema<IRefund>({
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    itemIndex: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    adminNotes: String,
}, { timestamps: true });

export const Refund = models.Refund || model<IRefund>('Refund', RefundSchema);
