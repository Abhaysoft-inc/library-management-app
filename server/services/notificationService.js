const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const emailService = require('./emailService');

class NotificationService {
    constructor() {
        this.isRunning = false;
    }

    // Start all scheduled notification tasks
    start() {
        if (this.isRunning) {
            console.log('Notification service is already running');
            return;
        }

        console.log('🔔 Starting notification service...');

        // Send return reminders every day at 9:00 AM
        cron.schedule('0 9 * * *', () => {
            this.sendReturnReminders();
        });

        // Send overdue notifications every day at 10:00 AM
        cron.schedule('0 10 * * *', () => {
            this.sendOverdueNotifications();
        });

        // Update overdue status every hour
        cron.schedule('0 * * * *', () => {
            this.updateOverdueStatus();
        });

        this.isRunning = true;
        console.log('✅ Notification service started successfully');
    }

    // Send return reminders for books due in 3 days
    async sendReturnReminders() {
        try {
            console.log('📧 Sending return reminders...');

            const dueSoonTransactions = await Transaction.findDueSoonTransactions(3);

            for (const transaction of dueSoonTransactions) {
                try {
                    await emailService.sendReturnReminderEmail(
                        transaction.studentId.email,
                        transaction.studentId.name,
                        transaction.bookId.title,
                        transaction.dueDate
                    );

                    // Mark reminder as sent
                    transaction.notificationsSent.reminder = true;
                    await transaction.save();

                    console.log(`✅ Reminder sent to ${transaction.studentId.email} for book: ${transaction.bookId.title}`);
                } catch (error) {
                    console.error(`❌ Failed to send reminder to ${transaction.studentId.email}:`, error.message);
                }
            }

            console.log(`📧 Return reminders completed. Sent ${dueSoonTransactions.length} reminders.`);
        } catch (error) {
            console.error('❌ Error in sendReturnReminders:', error);
        }
    }

    // Send overdue notifications
    async sendOverdueNotifications() {
        try {
            console.log('📧 Sending overdue notifications...');

            const overdueTransactions = await Transaction.findOverdueTransactions();

            for (const transaction of overdueTransactions) {
                try {
                    const fine = transaction.calculateFine();
                    const now = new Date();
                    const daysOverdue = Math.ceil((now - transaction.dueDate) / (1000 * 60 * 60 * 24));

                    // Check if we've already sent notification today
                    const today = new Date().toDateString();
                    const alreadySentToday = transaction.notificationsSent.overdue.some(
                        notification => new Date(notification.date).toDateString() === today
                    );

                    if (!alreadySentToday) {
                        await emailService.sendOverdueNotification(
                            transaction.studentId.email,
                            transaction.studentId.name,
                            transaction.bookId.title,
                            daysOverdue,
                            fine
                        );

                        // Record the notification
                        transaction.notificationsSent.overdue.push({
                            date: new Date(),
                            daysOverdue
                        });

                        // Update fine amount if not set
                        if (transaction.fine.amount !== fine) {
                            transaction.fine.amount = fine;
                            transaction.fine.reason = 'overdue';
                        }

                        await transaction.save();

                        console.log(`✅ Overdue notification sent to ${transaction.studentId.email} for book: ${transaction.bookId.title} (${daysOverdue} days overdue, ₹${fine} fine)`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to send overdue notification to ${transaction.studentId.email}:`, error.message);
                }
            }

            console.log(`📧 Overdue notifications completed. Processed ${overdueTransactions.length} transactions.`);
        } catch (error) {
            console.error('❌ Error in sendOverdueNotifications:', error);
        }
    }

    // Update transaction status to overdue
    async updateOverdueStatus() {
        try {
            const now = new Date();

            const result = await Transaction.updateMany(
                {
                    status: 'issued',
                    dueDate: { $lt: now },
                    returnDate: null
                },
                {
                    $set: { status: 'overdue' }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`📅 Updated ${result.modifiedCount} transactions to overdue status`);
            }
        } catch (error) {
            console.error('❌ Error updating overdue status:', error);
        }
    }

    // Send immediate notification for book issue
    async sendBookIssuedNotification(transaction) {
        try {
            await emailService.sendBookIssuedEmail(
                transaction.studentId.email,
                transaction.studentId.name,
                transaction.bookId.title,
                transaction.issueDate,
                transaction.dueDate
            );
            console.log(`✅ Book issued notification sent to ${transaction.studentId.email}`);
        } catch (error) {
            console.error(`❌ Failed to send book issued notification:`, error.message);
        }
    }

    // Send immediate notification for book return
    async sendBookReturnedNotification(transaction, fine = 0) {
        try {
            await emailService.sendBookReturnedEmail(
                transaction.studentId.email,
                transaction.studentId.name,
                transaction.bookId.title,
                transaction.returnDate,
                fine
            );
            console.log(`✅ Book returned notification sent to ${transaction.studentId.email}`);
        } catch (error) {
            console.error(`❌ Failed to send book returned notification:`, error.message);
        }
    }

    // Send account approval notification
    async sendAccountApprovalNotification(studentEmail, studentName) {
        try {
            await emailService.sendApprovalEmail(studentEmail, studentName);
            console.log(`✅ Account approval notification sent to ${studentEmail}`);
        } catch (error) {
            console.error(`❌ Failed to send approval notification:`, error.message);
        }
    }

    // Manual trigger for testing
    async testNotifications() {
        console.log('🧪 Testing notification service...');
        await this.sendReturnReminders();
        await this.sendOverdueNotifications();
        await this.updateOverdueStatus();
        console.log('🧪 Test completed');
    }

    // Stop the service
    stop() {
        this.isRunning = false;
        console.log('🔔 Notification service stopped');
    }
}

module.exports = new NotificationService();