const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendEmail(to, subject, html, text = '') {
        try {
            const mailOptions = {
                from: `"EE Library System" <${process.env.SMTP_USER}>`,
                to,
                subject,
                text,
                html
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Email sending error:', error);
            return { success: false, error: error.message };
        }
    }

    // Welcome email for new student registration
    async sendWelcomeEmail(studentEmail, studentName) {
        const subject = 'Welcome to EE Department Library System';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Welcome to EE Department Library!</h2>
                <p>Dear ${studentName},</p>
                <p>Thank you for registering with the Electrical Engineering Department Library Management System.</p>
                <p>Your account is currently <strong>pending approval</strong>. Our librarian will review your registration and approve it shortly.</p>
                <p>Once approved, you'll be able to:</p>
                <ul>
                    <li>Browse our extensive collection of engineering books</li>
                    <li>Reserve and borrow books</li>
                    <li>Track your borrowing history</li>
                    <li>Receive due date reminders</li>
                </ul>
                <p>You'll receive another email once your account is approved.</p>
                <br>
                <p>Best regards,<br>
                EE Department Library Team</p>
            </div>
        `;

        return await this.sendEmail(studentEmail, subject, html);
    }

    // Account approval notification
    async sendApprovalEmail(studentEmail, studentName) {
        const subject = 'Account Approved - EE Department Library';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #16a34a;">Account Approved!</h2>
                <p>Dear ${studentName},</p>
                <p>Great news! Your EE Department Library account has been approved.</p>
                <p>You can now log in to your account and start using all library services:</p>
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Login at:</strong> <a href="${process.env.CLIENT_URL}/login">Library System Login</a></p>
                </div>
                <p>Happy reading!</p>
                <br>
                <p>Best regards,<br>
                EE Department Library Team</p>
            </div>
        `;

        return await this.sendEmail(studentEmail, subject, html);
    }

    // Book return reminder (3 days before due date)
    async sendReturnReminderEmail(studentEmail, studentName, bookTitle, dueDate) {
        const subject = 'Book Return Reminder - Due Soon';
        const formattedDate = new Date(dueDate).toLocaleDateString();

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ea580c;">Book Return Reminder</h2>
                <p>Dear ${studentName},</p>
                <p>This is a friendly reminder that you have a book due for return soon:</p>
                <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 20px; margin: 20px 0;">
                    <p><strong>Book:</strong> ${bookTitle}</p>
                    <p><strong>Due Date:</strong> ${formattedDate}</p>
                </div>
                <p>Please return the book by the due date to avoid late fees.</p>
                <p>You can also renew the book online if you need more time (maximum 2 renewals allowed).</p>
                <br>
                <p>Best regards,<br>
                EE Department Library Team</p>
            </div>
        `;

        return await this.sendEmail(studentEmail, subject, html);
    }

    // Overdue book notification
    async sendOverdueNotification(studentEmail, studentName, bookTitle, daysOverdue, fine) {
        const subject = 'Overdue Book Notice - Action Required';

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">Overdue Book Notice</h2>
                <p>Dear ${studentName},</p>
                <p>This book is now overdue and requires immediate attention:</p>
                <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
                    <p><strong>Book:</strong> ${bookTitle}</p>
                    <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
                    <p><strong>Fine Amount:</strong> ₹${fine}</p>
                </div>
                <p><strong>Important:</strong> Please return this book immediately to avoid additional late fees.</p>
                <p>Late fee: ₹${process.env.FINE_PER_DAY || 5} per day</p>
                <p>Contact the library if you have any questions or concerns.</p>
                <br>
                <p>Best regards,<br>
                EE Department Library Team</p>
            </div>
        `;

        return await this.sendEmail(studentEmail, subject, html);
    }

    // Book issued confirmation
    async sendBookIssuedEmail(studentEmail, studentName, bookTitle, issueDate, dueDate) {
        const subject = 'Book Issued Successfully';
        const formattedIssueDate = new Date(issueDate).toLocaleDateString();
        const formattedDueDate = new Date(dueDate).toLocaleDateString();

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #16a34a;">Book Issued Successfully</h2>
                <p>Dear ${studentName},</p>
                <p>The following book has been issued to you:</p>
                <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
                    <p><strong>Book:</strong> ${bookTitle}</p>
                    <p><strong>Issue Date:</strong> ${formattedIssueDate}</p>
                    <p><strong>Due Date:</strong> ${formattedDueDate}</p>
                </div>
                <p>Please return the book by the due date to avoid late fees.</p>
                <p>You'll receive reminder emails as the due date approaches.</p>
                <br>
                <p>Best regards,<br>
                EE Department Library Team</p>
            </div>
        `;

        return await this.sendEmail(studentEmail, subject, html);
    }

    // Book return confirmation
    async sendBookReturnedEmail(studentEmail, studentName, bookTitle, returnDate, fine = 0) {
        const subject = 'Book Returned Successfully';
        const formattedReturnDate = new Date(returnDate).toLocaleDateString();

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #16a34a;">Book Returned Successfully</h2>
                <p>Dear ${studentName},</p>
                <p>Thank you for returning the following book:</p>
                <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
                    <p><strong>Book:</strong> ${bookTitle}</p>
                    <p><strong>Return Date:</strong> ${formattedReturnDate}</p>
                    ${fine > 0 ? `<p><strong>Late Fee:</strong> ₹${fine}</p>` : ''}
                </div>
                ${fine > 0 ? '<p>Please clear the late fee at your earliest convenience.</p>' : '<p>No late fees. Thank you for returning on time!</p>'}
                <br>
                <p>Best regards,<br>
                EE Department Library Team</p>
            </div>
        `;

        return await this.sendEmail(studentEmail, subject, html);
    }
}

module.exports = new EmailService();