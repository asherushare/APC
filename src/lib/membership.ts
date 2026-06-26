import { ShareholderApplication } from '@/types/membership';
import { getWhatsAppLink } from './whatsapp';
import { jsPDF } from 'jspdf';

/**
 * Generates a professional, print-ready 2-page PDF summary receipt of the shareholder application.
 */
export function generateSummaryPdf(data: ShareholderApplication, appId: string, submittedDate: string): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Helper colors
  const primaryGreen = [21, 128, 61]; // #15803d
  const secondaryGold = [180, 83, 9];  // #b45309
  const textDark = [31, 41, 55];       // #1f2937
  const textMuted = [107, 114, 128];   // #6b7280
  const bgLight = [249, 250, 251];     // #f9fafb

  // ---------------- PAGE 1 ----------------
  // Header Branding
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ADIVASI PRODUCER COMPANY (APC)', 15, 20);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('COMMUNITY OWNED • TRADITION GUIDED • DIGITALLY EMPOWERED', 15, 25);

  // Gold separator line
  doc.setDrawColor(secondaryGold[0], secondaryGold[1], secondaryGold[2]);
  doc.setLineWidth(0.5);
  doc.line(15, 28, 195, 28);

  // Receipt Acknowledgement Box
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(15, 33, 180, 20, 'F');
  doc.setDrawColor(229, 231, 235); // border light gray
  doc.rect(15, 33, 180, 20, 'S');

  doc.setTextColor(secondaryGold[0], secondaryGold[1], secondaryGold[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SHAREHOLDER APPLICATION SUMMARY RECEIPT', 20, 39);

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Application ID: ${appId}`, 20, 47);
  doc.text(`Submitted On: ${submittedDate}`, 110, 47);

  // Helper function to draw section headers
  const drawSectionHeader = (title: string, y: number) => {
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(title, 15, y);
    doc.setDrawColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
    doc.setLineWidth(0.3);
    doc.line(15, y + 2, 195, y + 2);
  };

  // Helper to draw grid items
  const drawField = (label: string, value: string, x: number, y: number, labelWidth = 50) => {
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(label, x, y);

    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(value || 'N/A', x + labelWidth, y);
  };

  // 1. Applicant Personal Details
  drawSectionHeader('1. APPLICANT PERSONAL DETAILS', 63);
  drawField('Full Name:', data.fullName, 15, 71);
  drawField("Father's/Husband's Name:", data.fatherHusbandName, 15, 78);
  drawField('Date of Birth:', data.dateOfBirth, 15, 85);
  drawField('Gender:', data.gender ? data.gender.toUpperCase() : 'N/A', 15, 92);
  drawField('Aadhaar Number:', data.aadhaarNumber, 15, 99);
  drawField('PAN Number:', data.panNumber || 'N/A', 15, 106);
  drawField('Mobile Number:', data.mobileNumber, 15, 113);
  drawField('Email Address:', data.email || 'N/A', 15, 120);
  drawField('Occupation / Activity:', data.occupation, 15, 127);

  // 2. Residential Address
  drawSectionHeader('2. RESIDENTIAL ADDRESS', 140);
  drawField('Village:', data.village, 15, 148);
  drawField('Gram Panchayat (GP):', data.gramPanchayat, 15, 155);
  drawField('Block Name:', data.block, 15, 162);
  drawField('District:', data.district, 15, 169);
  drawField('State:', data.state, 15, 176);
  drawField('PIN Code:', data.pinCode, 15, 183);

  // 3. Producer Eligibility
  drawSectionHeader('3. PRODUCER ELIGIBILITY', 196);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const activitiesStr = data.producerActivities.join(', ');
  doc.text(activitiesStr || 'No activities selected', 15, 204, { maxWidth: 175 });

  // 4. Share Subscription
  drawSectionHeader('4. SHARE SUBSCRIPTION', 218);
  drawField('Shares Subscribed:', `${data.numberOfShares} Share(s)`, 15, 226);
  drawField('Estimated Contribution:', `₹${(data.numberOfShares * 10000).toLocaleString('en-IN')}`, 15, 233);
  drawField('Share Face Value:', '₹10,000 per Share', 15, 240);

  // Disclaimer Note at the bottom
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(15, 250, 180, 15, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(15, 250, 180, 15, 'S');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Note: This is page 1 of the official shareholder portal submission summary.', 20, 259);

  // Page 1 Footer
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFontSize(8);
  doc.text('Page 1 of 2', 98, 285);

  // ---------------- PAGE 2 ----------------
  doc.addPage();

  // Header Branding (Simplified)
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('ADIVASI PRODUCER COMPANY (APC) - APPLICATION SUMMARY', 15, 15);

  doc.setDrawColor(secondaryGold[0], secondaryGold[1], secondaryGold[2]);
  doc.setLineWidth(0.5);
  doc.line(15, 18, 195, 18);

  // 5. Nominee Designation
  drawSectionHeader('5. NOMINEE DESIGNATION', 27);
  drawField('Nominee Full Name:', data.nomineeName, 15, 35);
  drawField('Relationship to Applicant:', data.nomineeRelationship, 15, 42);
  drawField('Nominee Date of Birth:', data.nomineeDateOfBirth, 15, 49);
  drawField('Nominee Address:', data.nomineeAddress, 15, 56);
  drawField('Nominee Mobile Number:', data.nomineeMobileNumber, 15, 63);

  // 6. Shareholder Bank Details
  drawSectionHeader('6. SHAREHOLDER BANK DETAILS', 76);
  drawField('Account Holder Name:', data.bankAccountHolderName, 15, 84);
  drawField('Bank Name:', data.bankName, 15, 91);
  drawField('Bank Account Number:', data.bankAccountNumber, 15, 98);
  drawField('IFSC Code:', data.bankIfscCode, 15, 105);

  // 7. Supporting Documents Uploaded
  drawSectionHeader('7. SUPPORTING DOCUMENTS UPLOADED', 118);
  const docs = data.uploadedDocuments;
  drawField('Aadhaar Card:', docs?.aadhaarCard ? `${docs.aadhaarCard.filename} (${(docs.aadhaarCard.fileSize / 1024 / 1024).toFixed(2)} MB)` : 'Not Provided', 15, 126, 60);
  drawField('PAN Card:', docs?.panCard ? `${docs.panCard.filename} (${(docs.panCard.fileSize / 1024 / 1024).toFixed(2)} MB)` : 'Not Provided (Optional)', 15, 133, 60);
  drawField('Passport Photograph:', docs?.passportPhoto ? `${docs.passportPhoto.filename} (${(docs.passportPhoto.fileSize / 1024 / 1024).toFixed(2)} MB)` : 'Not Provided', 15, 140, 60);
  drawField('Producer Activity Proof:', docs?.producerActivityProof ? `${docs.producerActivityProof.filename} (${(docs.producerActivityProof.fileSize / 1024 / 1024).toFixed(2)} MB)` : 'Not Provided', 15, 147, 60);
  drawField('Bank Passbook Front Page:', docs?.bankPassbook ? `${docs.bankPassbook.filename} (${(docs.bankPassbook.fileSize / 1024 / 1024).toFixed(2)} MB)` : 'Not Provided', 15, 154, 60);

  // Declarations & Signatures Section
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(15, 168, 180, 48, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(15, 168, 180, 48, 'S');

  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Digital Self-Declaration & Trust Confirmed:', 20, 174);

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('✓ Applicant confirmed all info is correct and matches supporting documents.', 20, 180);
  doc.text('✓ Applicant agreed to follow rules, guidelines and general bylaws of Adivasi Producer Company.', 20, 185);
  doc.text('✓ Applicant accepted that membership requires block verification and formal board advisory approval.', 20, 190);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Trust Disclaimer:', 20, 197);
  doc.setFont('helvetica', 'normal');
  doc.text('Documents are used only for APC verification. No online payment is collected through this site. Personal data remains confidential.', 20, 202);

  // Signatures Lines
  doc.setDrawColor(156, 163, 175); // gray-400
  doc.setLineWidth(0.3);
  doc.line(25, 245, 85, 245);
  doc.line(125, 245, 185, 245);

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Signature of Applicant', 38, 250);
  doc.text('Block Coordinator Verification', 133, 250);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Date: ________________________', 25, 257);
  doc.text('Date: ________________________', 125, 257);

  // Page 2 Footer
  doc.text('Page 2 of 2', 98, 285);

  return doc.output('blob');
}

/**
 * Compiles shareholder application into a clean, structured payload and returns WhatsApp deep link and PDF.
 */
export function compileSubmissionAssets(
  data: ShareholderApplication,
  appId: string,
  submittedDate: string
): { whatsappLink: string; summaryPdfBlob: Blob } {
  const formattedDate = new Date(submittedDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // Clean structured text representing the official application form
  let message = `*NEW SHAREHOLDER MEMBERSHIP APPLICATION*
*Ref:* ${appId}
*Submitted:* ${formattedDate}
---------------------------------------
*1. PERSONAL DETAILS*
- *Full Name:* ${data.fullName}
- *Father/Husband:* ${data.fatherHusbandName}
- *DOB:* ${data.dateOfBirth}
- *Gender:* ${data.gender}
- *Aadhaar No:* ${data.aadhaarNumber}
- *PAN No:* ${data.panNumber || 'N/A'}
- *Mobile No:* ${data.mobileNumber}
- *Email:* ${data.email || 'N/A'}
- *Occupation:* ${data.occupation}

*2. ADDRESS DETAILS*
- *Village:* ${data.village}
- *Gram Panchayat:* ${data.gramPanchayat}
- *Block:* ${data.block}
- *District:* ${data.district}
- *State:* ${data.state}
- *PIN Code:* ${data.pinCode}

*3. PRODUCER ELIGIBILITY*
${data.producerActivities.map(act => `✓ ${act}`).join('\n')}

*4. SHARE SUBSCRIPTION*
- *Shares Subscribed:* ${data.numberOfShares} Share(s)
- *Total Contribution:* ₹${data.calculatedContribution.toLocaleString('en-IN')} (at ₹10,000 per Share)

*5. NOMINEE DETAILS*
- *Nominee Name:* ${data.nomineeName}
- *Relationship:* ${data.nomineeRelationship}
- *Nominee DOB:* ${data.nomineeDateOfBirth}
- *Nominee Address:* ${data.nomineeAddress}
- *Nominee Mobile:* ${data.nomineeMobileNumber}

*6. BANK DETAILS*
- *Holder Name:* ${data.bankAccountHolderName}
- *Bank Name:* ${data.bankName}
- *Account Number:* ${data.bankAccountNumber}
- *IFSC Code:* ${data.bankIfscCode}`;

  if (data.uploadedDocuments) {
    message += `

*7. SUPPORTING DOCUMENTS*
- *Aadhaar Card:* ${data.uploadedDocuments.aadhaarCard?.filename || 'Not Provided'}
- *PAN Card:* ${data.uploadedDocuments.panCard?.filename || 'Not Provided (Optional)'}
- *Passport Photo:* ${data.uploadedDocuments.passportPhoto?.filename || 'Not Provided'}
- *Producer Proof:* ${data.uploadedDocuments.producerActivityProof?.filename || 'Not Provided'}
- *Bank Passbook:* ${data.uploadedDocuments.bankPassbook?.filename || 'Not Provided'}`;
  }

  message += `

*8. DECLARATIONS*
- [x] Confirmed information is correct.
- [x] Agreed to follow APC rules.
- [x] Understood approval is required.
---------------------------------------
_Sent via APC Shareholder Portal_`;

  // Create deep link pointing to the official APC phone number
  const whatsappLink = getWhatsAppLink(message);

  // Generate the PDF receipt
  const summaryPdfBlob = generateSummaryPdf(data, appId, formattedDate);

  return {
    whatsappLink,
    summaryPdfBlob
  };
}

/**
 * Fallback backward compatibility submit wrapper.
 */
export async function submitShareholderApplication(
  data: ShareholderApplication
): Promise<{ success: boolean; whatsappLink: string; applicationId: string; submittedAt: string; summaryPdfBlob: Blob }> {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  const appId = `APC-${year}-${randomPart}`;
  const submittedDate = new Date().toISOString();

  const assets = compileSubmissionAssets(data, appId, submittedDate);

  return {
    success: true,
    whatsappLink: assets.whatsappLink,
    applicationId: appId,
    submittedAt: submittedDate,
    summaryPdfBlob: assets.summaryPdfBlob
  };
}
