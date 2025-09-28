// backend/services/notification.js
const nodemailer = require('nodemailer');
const moment = require('moment'); // optional: consider dayjs for a lighter dep
const { getAdminEmails, getPrimaryAdminEmail } = require('../utils/adminAuth');

class NotificationService {
  constructor() {
    this.emailEnabled =
      process.env.SEND_EMAILS === 'true' &&
      !!process.env.EMAIL_USER &&
      !!process.env.EMAIL_PASS &&
      !!process.env.SMTP_HOST &&
      !!process.env.SMTP_PORT;

    if (this.emailEnabled) {
      // Correct Nodemailer API: createTransport(transport[, defaults])
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: String(process.env.SMTP_SECURE || 'false') === 'true', // true for port 465, false for 587/STARTTLS
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          // Allow STARTTLS upgrade; set to { rejectUnauthorized: false } only for trusted internal servers
          rejectUnauthorized: String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED || 'true') === 'true'
        }
      });

      // Verify connection non-blocking
      this.transporter.verify().then(() => {
        console.log('📮 Mail transporter verified and ready');
      }).catch(err => {
        console.warn('⚠️ Mail transporter verification failed:', err?.message);
      });

      console.log('📧 Email service configured');
    } else {
      console.log('📝 Email service running in MOCK MODE');
    }
  }

  async sendExpiredBatchNotification(batchDetails, manufacturerEmail) {
    try {
      const subject = `🚨 URGENT: Medicine Batch Expired - ${batchDetails.batchId}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #ff4444; color: white; padding: 20px; text-align: center;">
            <h1>⚠️ EXPIRED BATCH DETECTED</h1>
          </div>

          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Batch Details:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;"><strong>Batch ID:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${batchDetails.batchId}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;"><strong>Medicine:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${batchDetails.medicineName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;"><strong>Expiry Date:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${batchDetails.expiryDateFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;"><strong>Detected:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${moment().format('DD/MM/YYYY HH:mm')}</td>
              </tr>
            </table>

            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107;">
              <h3>⚠️ Immediate Action Required:</h3>
              <ul>
                <li>Stop distribution of this batch immediately</li>
                <li>Issue recall notice to all distributors</li>
                <li>Check inventory and remove expired stock</li>
                <li>Update your quality management system</li>
              </ul>
            </div>

            <div style="margin-top: 20px; text-align: center;">
              <p style="color: #666;">This is an automated alert from MedChain Blockchain Authentication System</p>
              <p style="color: #666;">Network: ${process.env.NETWORK} (Chain ID: ${process.env.CHAIN_ID})</p>
            </div>
          </div>
        </div>
      `;

      if (this.emailEnabled) {
        await this.transporter.sendMail({
          from: `"MedChain Alert System" <${process.env.EMAIL_USER}>`,
          to: manufacturerEmail,
          cc: getAdminEmails().join(',') || undefined,
          subject,
          html: htmlContent
        });
        console.log(`📧 Expired batch email sent to ${manufacturerEmail}`);
      } else {
        console.log(`📝 MOCK EMAIL: Expired batch notification for ${batchDetails.batchId}`);
        console.log(`📝 Would send to: ${manufacturerEmail}`);
      }

      return { success: true, type: 'expired_batch' };
    } catch (error) {
      console.error('❌ Failed to send expired batch notification:', error.message);
      throw error;
    }
  }

  async sendFakeBatchNotification(batchId, detectionDetails) {
    try {
      const subject = `🚨 SECURITY ALERT: Fake Batch Detected - ${batchId}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
            <h1>🚨 FAKE PRODUCT DETECTED</h1>
          </div>

          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Security Alert Details:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;"><strong>Batch ID:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${batchId}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;"><strong>Detection Time:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${moment().format('DD/MM/YYYY HH:mm:ss')}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;"><strong>Scanner Address:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${detectionDetails.scannerAddress}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;"><strong>Location:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; background: #fff;">${detectionDetails.location}</td>
              </tr>
            </table>

            <div style="margin-top: 20px; padding: 15px; background: #f8d7da; border-left: 4px solid #dc3545;">
              <h3>🚨 Security Actions Required:</h3>
              <ul>
                <li>Investigate the source of fake products</li>
                <li>Contact regulatory authorities</li>
                <li>Issue public safety warning if necessary</li>
                <li>Strengthen supply chain security</li>
                <li>Review distribution channels</li>
              </ul>
            </div>

            <div style="margin-top: 20px; text-align: center;">
              <p style="color: #666;">This is a critical security alert from MedChain System</p>
              <p style="color: #666;">Network: ${process.env.NETWORK} (Chain ID: ${process.env.CHAIN_ID})</p>
            </div>
          </div>
        </div>
      `;

      if (this.emailEnabled) {
        await this.transporter.sendMail({
          from: `"MedChain Security Alert" <${process.env.EMAIL_USER}>`,
          to: getPrimaryAdminEmail(),
          cc: getAdminEmails().slice(1).join(','), // CC other admins
          subject,
          html: htmlContent,
          priority: 'high'
        });
        console.log(`📧 Fake batch security alert sent to admin`);
      } else {
        console.log(`📝 MOCK EMAIL: Fake batch security alert for ${batchId}`);
      }

      return { success: true, type: 'fake_batch' };
    } catch (error) {
      console.error('❌ Failed to send fake batch notification:', error.message);
      throw error;
    }
  }

  async testEmailConfiguration() {
    try {
      if (!this.emailEnabled) {
        return { success: false, message: 'Email service is disabled' };
      }
      await this.transporter.verify();
      console.log('✅ Email configuration test passed');
      return {
        success: true,
        message: 'Email service is working correctly',
        from: process.env.EMAIL_USER,
        host: process.env.SMTP_HOST
      };
    } catch (error) {
      console.error('❌ Email configuration test failed:', error.message);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new NotificationService();
