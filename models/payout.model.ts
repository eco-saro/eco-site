import { Schema, model, models, Document, Types } from 'mongoose';

export interface IPayout extends Document {
    order: Types.ObjectId;
    vendor: Types.ObjectId;
    amount: number;
    platformFee: number;
    payoutStatus: 'PENDING' | 'BLOCKED' | 'COMPLETED' | 'FAILED';
    blockReason?: string;
    razorpayTransferId?: string;
    razorpayPayoutId?: string;
    retryCount: number;
    processedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>({
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    payoutStatus: {
        type: String,
        enum: ['PENDING', 'BLOCKED', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    blockReason: String,
    razorpayTransferId: String,
    razorpayPayoutId: String,
    retryCount: { type: Number, default: 0 },
    processedAt: Date,
}, { timestamps: true });

export const Payout = models.Payout || model<IPayout>('Payout', PayoutSchema);
