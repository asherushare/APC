"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.ConsoleProvider = exports.NodemailerProvider = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("./logger");
class NodemailerProvider {
    transporter;
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: env_1.env.SMTP_HOST || 'localhost',
            port: env_1.env.SMTP_PORT ? Number(env_1.env.SMTP_PORT) : 587,
            secure: env_1.env.SMTP_PORT === '465',
            auth: {
                user: env_1.env.SMTP_USER,
                pass: env_1.env.SMTP_PASS,
            },
        });
    }
    async sendEmail(payload) {
        const mailOptions = {
            from: env_1.env.SMTP_FROM || '"APC Platform" <noreply@adivasiproducer.com>',
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
        };
        await this.transporter.sendMail(mailOptions);
    }
}
exports.NodemailerProvider = NodemailerProvider;
class ConsoleProvider {
    async sendEmail(payload) {
        logger_1.logger.info(`✉️ [Console Mail Mock] Email dispatched:`);
        logger_1.logger.info(`   To: ${payload.to}`);
        logger_1.logger.info(`   Subject: ${payload.subject}`);
        logger_1.logger.info(`   Body: ${payload.html}`);
    }
}
exports.ConsoleProvider = ConsoleProvider;
let activeProvider;
if (env_1.env.NODE_ENV === 'test' || env_1.env.NODE_ENV === 'development' || !env_1.env.SMTP_HOST || !env_1.env.SMTP_USER || !env_1.env.SMTP_PASS) {
    logger_1.logger.warn('⚠️ SMTP variables missing or non-production environment. Initializing Console Mail Mock.');
    activeProvider = new ConsoleProvider();
}
else {
    try {
        activeProvider = new NodemailerProvider();
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to initialize SMTP Nodemailer. Falling back to Console Mail Mock.');
        activeProvider = new ConsoleProvider();
    }
}
exports.emailService = {
    async sendEmail(payload) {
        await activeProvider.sendEmail(payload);
    },
    async sendPasswordResetEmail(to, resetLink, fullName) {
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
    async sendWelcomeEmail(to, fullName) {
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
    async sendPasswordResetConfirmationEmail(to, fullName) {
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
