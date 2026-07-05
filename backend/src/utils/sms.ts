import { env } from '../config/env';
import { logger } from './logger';

export interface SMSService {
  sendSMS(to: string, message: string): Promise<void>;
}

export class ProductionSMSProvider implements SMSService {
  private apiKey: string;
  private senderId: string;
  private providerUrl: string;

  constructor(apiKey: string, senderId: string, providerUrl: string) {
    this.apiKey = apiKey;
    this.senderId = senderId;
    this.providerUrl = providerUrl;
  }

  async sendSMS(to: string, message: string): Promise<void> {
    try {
      const response = await fetch(this.providerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          sender: this.senderId,
          route: 'dnd',
          numbers: to,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`SMS Provider HTTP error! status: ${response.status} ${response.statusText}`);
      }

      logger.info(`✅ SMS successfully dispatched to ${to} via Production Gateway.`);
    } catch (error) {
      logger.error(`❌ Failed to send SMS to ${to} via Production Gateway:`, error);
      throw error;
    }
  }
}

export class ConsoleSMSProvider implements SMSService {
  async sendSMS(to: string, message: string): Promise<void> {
    logger.info(`✉️ [Console SMS Mock] MOCK SMS to ${to}: ${message}`);
  }
}

let activeSMSProvider: SMSService;

const hasSMSConfig = !!(env.SMS_API_KEY && env.SMS_SENDER_ID && env.SMS_PROVIDER_URL);
const isProd = env.NODE_ENV === 'production';

if (hasSMSConfig && isProd) {
  activeSMSProvider = new ProductionSMSProvider(
    env.SMS_API_KEY!,
    env.SMS_SENDER_ID!,
    env.SMS_PROVIDER_URL!
  );
} else {
  logger.warn('⚠️ SMS gateway variables missing or non-production environment. Initializing Console SMS Mock.');
  activeSMSProvider = new ConsoleSMSProvider();
}

export const smsService = {
  async sendSMS(to: string, message: string): Promise<void> {
    await activeSMSProvider.sendSMS(to, message);
  },
};
