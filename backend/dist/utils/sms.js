"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = exports.ConsoleSMSProvider = exports.ProductionSMSProvider = void 0;
const env_1 = require("../config/env");
const logger_1 = require("./logger");
class ProductionSMSProvider {
    apiKey;
    senderId;
    providerUrl;
    constructor(apiKey, senderId, providerUrl) {
        this.apiKey = apiKey;
        this.senderId = senderId;
        this.providerUrl = providerUrl;
    }
    async sendSMS(to, message) {
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
            logger_1.logger.info(`✅ SMS successfully dispatched to ${to} via Production Gateway.`);
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to send SMS to ${to} via Production Gateway:`, error);
            throw error;
        }
    }
}
exports.ProductionSMSProvider = ProductionSMSProvider;
class ConsoleSMSProvider {
    async sendSMS(to, message) {
        logger_1.logger.info(`✉️ [Console SMS Mock] MOCK SMS to ${to}: ${message}`);
    }
}
exports.ConsoleSMSProvider = ConsoleSMSProvider;
let activeSMSProvider;
const hasSMSConfig = !!(env_1.env.SMS_API_KEY && env_1.env.SMS_SENDER_ID && env_1.env.SMS_PROVIDER_URL);
const isProd = env_1.env.NODE_ENV === 'production';
if (hasSMSConfig && isProd) {
    activeSMSProvider = new ProductionSMSProvider(env_1.env.SMS_API_KEY, env_1.env.SMS_SENDER_ID, env_1.env.SMS_PROVIDER_URL);
}
else {
    logger_1.logger.warn('⚠️ SMS gateway variables missing or non-production environment. Initializing Console SMS Mock.');
    activeSMSProvider = new ConsoleSMSProvider();
}
exports.smsService = {
    async sendSMS(to, message) {
        await activeSMSProvider.sendSMS(to, message);
    },
};
