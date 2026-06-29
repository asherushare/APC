import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<void>;
}

export class NodemailerProvider implements EmailProvider {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'localhost',
      port: env.SMTP_PORT ? Number(env.SMTP_PORT) : 587,
      secure: env.SMTP_PORT === '465',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendEmail(payload: EmailPayload): Promise<void> {
    const mailOptions = {
      from: env.SMTP_FROM || '"APC Platform" <noreply@adivasiproducer.com>',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    };
    await this.transporter.sendMail(mailOptions);
  }
}

export class ConsoleProvider implements EmailProvider {
  async sendEmail(payload: EmailPayload): Promise<void> {
    logger.info(`✉️ [Console Mail Mock] Email dispatched:`);
    logger.info(`   To: ${payload.to}`);
    logger.info(`   Subject: ${payload.subject}`);
    logger.info(`   Body: ${payload.html}`);
  }
}

let activeProvider: EmailProvider;

if (env.NODE_ENV === 'test' || env.NODE_ENV === 'development' || !env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
  logger.warn('⚠️ SMTP variables missing or non-production environment. Initializing Console Mail Mock.');
  activeProvider = new ConsoleProvider();
} else {
  try {
    activeProvider = new NodemailerProvider();
  } catch (error) {
    logger.error('❌ Failed to initialize SMTP Nodemailer. Falling back to Console Mail Mock.');
    activeProvider = new ConsoleProvider();
  }
}

export const emailService = {
  async sendEmail(payload: EmailPayload): Promise<void> {
    await activeProvider.sendEmail(payload);
  },

  async sendPasswordResetEmail(to: string, resetLink: string, fullName: string): Promise<void> {
    const subject = 'Reset Your Password - APC Digital Platform';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #047857; margin-bottom: 20px;">Password Reset Request</h2>
        <p>Dear ${fullName},</p>
        <p>We received a request to reset your password for the APC Digital Platform. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #047857; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>This secure reset link is valid for **1 hour**. If you did not make this request, please ignore this email; your password will remain secure.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #64748b;">This is an automated security message. Please do not reply directly to this email.</p>
      </div>
    `;
    await this.sendEmail({ to, subject, html });
  },

  async sendWelcomeEmail(to: string, fullName: string): Promise<void> {
    const subject = 'Welcome to APC Digital Platform!';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #047857; margin-bottom: 20px;">Welcome to APC!</h2>
        <p>Dear ${fullName},</p>
        <p>Your staff/administrator account has been successfully created on the APC Digital Platform.</p>
        <p>You can now log in to review shareholder onboarding files, monitor block boundaries, and inspect platform statistics.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #64748b;">Adivasi Producer Company — Empowering Tribal Communities.</p>
      </div>
    `;
    await this.sendEmail({ to, subject, html });
  },

  async sendPasswordResetConfirmationEmail(to: string, fullName: string): Promise<void> {
    const subject = 'Security Alert: Password Changed - APC Digital Platform';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #b91c1c; margin-bottom: 20px;">Security Notification</h2>
        <p>Dear ${fullName},</p>
        <p>The password for your APC Digital Platform account was successfully changed recently.</p>
        <p>If you initiated this change, no action is required.</p>
        <p><strong>⚠️ If you did not authorize this change</strong>, please contact the primary system administrator immediately to secure your profile.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
        <p style="font-size: 12px; color: #64748b;">This is a security alert. Please do not reply directly to this email.</p>
      </div>
    `;
    await this.sendEmail({ to, subject, html });
  }
};
