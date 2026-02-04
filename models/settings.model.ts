import { Schema, model, models, Document } from 'mongoose';

export interface ISettings extends Document {
    commissionRate: number; // Percentage, e.g. 10
    supportEmail?: string;
    supportPhone?: string;
    lowStockThreshold: number;
    updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
    commissionRate: { type: Number, default: 10, required: true },
    supportEmail: { type: String, default: 'support@ecosaro.com' },
    supportPhone: { type: String, default: '+91 999 999 9999' },
    lowStockThreshold: { type: Number, default: 5 },
}, { timestamps: { createdAt: false, updatedAt: true } });

export const Settings = models.Settings || model<ISettings>('Settings', SettingsSchema);
