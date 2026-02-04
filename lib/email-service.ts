/**
 * Email Service Utility
 * Used for sending notifications to vendors and admins.
 * Currently configured for logging (simulation).
 * Integrate with Nodemailer, SendGrid, or Resend for production.
 */

export class EmailService {
    /**
     * Sends an email notification
     */
    static async sendEmail(to: string, subject: string, text: string, html?: string) {
        console.log(`[EmailService] 📧 Sending email to: ${to}`);
        console.log(`[EmailService] 📝 Subject: ${subject}`);
        console.log(`[EmailService] 📄 Body: ${text}`);

        // In production, add the mail transporter logic here:
        // const transporter = nodemailer.createTransport({...});
        // await transporter.sendMail({ from: 'no-reply@ecosaro.com', to, subject, text, html });

        return { success: true, messageId: `SIMULATED_${Date.now()}` };
    }

    /**
     * Notify vendor of account approval
     */
    static async notifyVendorApproval(vendorEmail: string, businessName: string) {
        const subject = "Welcome to EcoSaro! Your vendor account is approved.";
        const text = `Hi ${businessName},\n\nCongratulations! Your vendor account has been approved. You can now start listing products and managing orders on the EcoSaro marketplace.\n\nLogin to your dashboard: ${process.env.NEXTAUTH_URL}/dashboard\n\nHappy selling!`;
        return this.sendEmail(vendorEmail, subject, text);
    }

    /**
     * Notify vendor of payout processing
     */
    static async notifyPayoutProcessed(vendorEmail: string, businessName: string, amount: number, reference: string) {
        const subject = "Payment Processed: Your EcoSaro Payout is on the way";
        const text = `Hi ${businessName},\n\nWe've processed a payout of ₹${amount} to your primary bank account.\n\nTransaction Reference: ${reference}\n\nIt may take 2-3 business days to reflect in your account.\n\nRegards,\nEcoSaro Team`;
        return this.sendEmail(vendorEmail, subject, text);
    }

    /**
     * Notify vendor of rejected refund
     */
    static async notifyRefundDecision(to: string, userName: string, orderId: string, status: string, reason: string) {
        const subject = `Refund Update for Order #${orderId.slice(-8).toUpperCase()}`;
        const text = `Hi ${userName},\n\nYour refund request for Order #${orderId} has been ${status.toLowerCase()}.\n\nAdmin Notes: ${reason}\n\nThank you for choosing EcoSaro.`;
        return this.sendEmail(to, subject, text);
    }
}
