import { companyInfo } from '@/data/company';
import { DigitalService } from '@/types/digital';

/**
 * Sanitizes phone number by removing non-numeric characters.
 */
export function getSanitizedPhone(): string {
  return companyInfo.whatsapp.replace(/\D/g, '');
}

/**
 * Generates the deep link for WhatsApp wa.me endpoint.
 */
export function getWhatsAppLink(message: string): string {
  const phone = getSanitizedPhone();
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Formats a template for booking requests.
 */
export function generateBookingMessage(
  service: DigitalService,
  client: { name: string; phone: string; village: string; date: string; remarks?: string }
): string {
  return `*NEW DIGITAL SERVICE BOOKING REQUEST*
---------------------------------------
*Service:* ${service.title}
*Price:* ${service.pricing?.displayPrice || 'N/A'}
*Est. Time:* ${service.processingTime}

*Client Details:*
- *Name:* ${client.name}
- *Phone:* ${client.phone}
- *Village:* ${client.village}
- *Preferred Date:* ${client.date}

*Additional Notes:*
${client.remarks || 'No specific remarks.'}

---------------------------------------
_Sent via APC Digital Portal_`;
}

/**
 * Formats support request message template.
 */
export function generateSupportMessage(serviceName?: string): string {
  if (serviceName) {
    return `Hello APC Digital Support, I need help regarding the service: *${serviceName}*. Please assist.`;
  }
  return `Hello APC Digital Support, I have a general query regarding the digital portal services.`;
}

/**
 * Formats custom service inquiries template.
 */
export function generateInquiryMessage(customQuery: string): string {
  return `*CUSTOM SERVICE INQUIRY*
---------------------------------------
*Query:* ${customQuery}

---------------------------------------
_Sent via APC Digital Portal_`;
}
