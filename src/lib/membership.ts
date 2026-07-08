import { ShareholderApplication } from '@/types/membership';
import { getWhatsAppLink } from './whatsapp';
import { jsPDF } from 'jspdf';

/**
 * Generates a professional, print-ready 2-page PDF summary receipt of the shareholder application.
 */
export function generateSummaryPdf(data: ShareholderApplication, appId: string, submittedDate: string, passportPhotoBase64?: string): Blob {
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
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('MINISTRY OF CORPORATE AFFAIRS (MCA)', 15, 12);

  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ADIVASI PRODUCER COMPANY (APC)', 15, 18);

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('(Proposed Producer Company under the Companies Act, 2013)', 15, 22.5);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('COMMUNITY OWNED • TRADITION GUIDED • DIGITALLY EMPOWERED', 15, 26.5);

  // Passport Photo Box in Top-Right Corner
  if (passportPhotoBase64) {
    try {
      doc.addImage(passportPhotoBase64, 'JPEG', 160, 10, 30, 37);
    } catch (err) {
      console.error('Error adding photo to PDF:', err);
      // Fallback border
      doc.setDrawColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.setLineWidth(0.2);
      doc.rect(160, 10, 30, 37, 'S');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('Photo Error', 166, 28);
    }
  } else {
    doc.setDrawColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.setLineWidth(0.2);
    doc.rect(160, 10, 30, 37, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('Affix Passport', 164, 26);
    doc.text('Photo Here', 167, 30);
  }

  // Gold separator line (shifted down)
  doc.setDrawColor(secondaryGold[0], secondaryGold[1], secondaryGold[2]);
  doc.setLineWidth(0.5);
  doc.line(15, 49, 195, 49);

  // Receipt Acknowledgement Box
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(15, 52, 180, 20, 'F');
  doc.setDrawColor(229, 231, 235); // border light gray
  doc.rect(15, 52, 180, 20, 'S');

  doc.setTextColor(secondaryGold[0], secondaryGold[1], secondaryGold[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SHAREHOLDER APPLICATION SUMMARY RECEIPT', 20, 58);

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Application ID: ${appId}`, 20, 66);
  doc.text(`Submitted On: ${submittedDate}`, 110, 66);

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
  const drawField = (label: string, value: string, x: number, y: number, labelWidth = 55) => {
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(label, x, y);

    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(value || 'N/A', x + labelWidth, y);
  };

  // 1. Applicant Personal Details (shifted down)
  drawSectionHeader('1. APPLICANT PERSONAL DETAILS', 78);
  drawField('Full Name:', data.fullName, 15, 86);
  drawField("Father's/Mother's/Spouse's Name:", data.fatherHusbandName, 15, 92);
  drawField('Date of Birth:', data.dateOfBirth, 15, 98);
  drawField('Gender:', data.gender ? data.gender.toUpperCase() : 'N/A', 15, 104);
  drawField('Aadhaar Number:', data.aadhaarNumber, 15, 110);
  drawField('PAN Number:', data.panNumber || 'N/A', 15, 116);
  drawField('Mobile Number:', data.mobileNumber, 15, 122);
  drawField('WhatsApp Number:', data.whatsappNumber || 'N/A', 15, 128);
  drawField('Email Address:', data.email || 'N/A', 15, 134);
  drawField('Occupation / Activity:', data.occupation, 15, 140);

  // 2. Residential Address (shifted down)
  drawSectionHeader('2. RESIDENTIAL ADDRESS', 148);
  drawField('Village:', data.village, 15, 156);
  drawField('Gram Panchayat (GP):', data.gramPanchayat, 15, 162);
  drawField('Block Name:', data.block, 15, 168);
  drawField('District:', data.district, 15, 174);
  drawField('State:', data.state, 15, 180);
  drawField('PIN Code:', data.pinCode, 15, 186);

  // 3. Producer Eligibility (shifted down)
  drawSectionHeader('3. PRODUCER ELIGIBILITY', 194);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const activitiesStr = data.producerActivities.join(', ');
  doc.text(activitiesStr || 'No activities selected', 15, 201, { maxWidth: 175 });

  // 4. Share Subscription (shifted down)
  drawSectionHeader('4. SHARE SUBSCRIPTION', 215);
  drawField('Shares Subscribed:', `${data.numberOfShares} Share(s)`, 15, 223);
  drawField('Estimated Contribution:', `₹${(data.numberOfShares * 10000).toLocaleString('en-IN')}`, 15, 229);
  doc.setFont('helvetica', 'bold');
  drawField('Share Face Value:', '₹10,000 per Share', 15, 235);

  // Disclaimer Note at the bottom (shifted down)
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(15, 244, 180, 15, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(15, 244, 180, 15, 'S');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Note: This is page 1 of the official shareholder portal submission summary.', 20, 253);

  // Page 1 Footer
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFontSize(7.5);
  doc.text('Adivasi Producer Company (APC) • Founder: Bijaya Kumar Mellaka', 15, 285);
  doc.text('Page 1 of 2', 178, 285);

  // ---------------- PAGE 2 ----------------
  doc.addPage();

  // 5. Nominee Designation
  drawSectionHeader('5. NOMINEE DESIGNATION', 24);
  drawField('Nominee Full Name:', data.nomineeName, 15, 32);
  drawField('Relationship to Applicant:', data.nomineeRelationship, 15, 38);
  drawField('Nominee Address:', data.nomineeAddress, 15, 44);
  drawField('Nominee Mobile Number:', data.nomineeMobileNumber, 15, 50);

  // 6. Shareholder Bank Details
  drawSectionHeader('6. SHAREHOLDER BANK DETAILS', 57);
  drawField('Account Holder Name:', data.bankAccountHolderName, 15, 65);
  drawField('Bank Name:', data.bankName, 15, 71);
  drawField('Bank Branch:', data.bankBranch, 15, 77);
  drawField('Bank Account Number:', data.bankAccountNumber, 15, 83);
  drawField('IFSC Code:', data.bankIfscCode, 15, 89);

  // 7. Supporting Documents Uploaded
  drawSectionHeader('7. SUPPORTING DOCUMENTS UPLOADED', 96);
  const docs = data.uploadedDocuments;
  drawField('Aadhaar Card:', docs?.aadhaarCard ? `${docs.aadhaarCard.filename} (${(docs.aadhaarCard.fileSize / 1024 / 1024).toFixed(2)} MB)` : 'Not Provided', 15, 104, 60);
  drawField('PAN Card:', docs?.panCard ? `${docs.panCard.filename} (${(docs.panCard.fileSize / 1024 / 1024).toFixed(2)} MB)` : 'Not Provided (Optional)', 15, 110, 60);
  drawField('Passport Photograph:', docs?.passportPhoto ? `${docs.passportPhoto.filename} (${(docs.passportPhoto.fileSize / 1024 / 1024).toFixed(2)} MB)` : 'Not Provided', 15, 116, 60);
  drawField('Producer Activity Proof:', docs?.producerActivityProof ? `${docs.producerActivityProof.filename} (${(docs.producerActivityProof.fileSize / 1024 / 1024).toFixed(2)} MB)` : 'Not Provided', 15, 122, 60);
  drawField('Bank Passbook Front Page:', docs?.bankPassbook ? `${docs.bankPassbook.filename} (${(docs.bankPassbook.fileSize / 1024 / 1024).toFixed(2)} MB)` : 'Not Provided', 15, 128, 60);

  // New Legal MoA/AoA Declaration & Undertaking
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.rect(15, 136, 180, 35, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(15, 136, 180, 35, 'S');

  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('MoA / AoA Declaration & Undertaking:', 20, 141);

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  const declarationText = "I hereby declare that the information furnished in this application is true and correct to the best of my knowledge and belief. I voluntarily apply for subscription to shares in the Proposed Adivasi Producer Company (APC). I agree to abide by the Memorandum of Association (MoA), Articles of Association (AoA), and the rules, regulations, and decisions of the Company after its incorporation under the Companies Act, 2013. I understand that submission of this application and payment of the share subscription amount do not automatically confer shareholder status or any ownership rights. Share allotment and membership shall be subject to the successful incorporation of the Company and approval by its Board of Directors in accordance with the Companies Act, 2013 and other applicable laws.";
  doc.text(declarationText, 20, 146, { maxWidth: 170 });

  // Signatures Lines (Applicant, Nominee, Coordinator)
  doc.setDrawColor(156, 163, 175); // gray-400
  doc.setLineWidth(0.3);
  doc.line(15, 195, 65, 195);
  doc.line(75, 195, 125, 195);
  doc.line(135, 195, 185, 195);

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Signature of Applicant', 22, 199);
  doc.text('Signature of Nominee', 82, 199);
  doc.text('Authorized Signatory', 145, 199);

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Date: ________________', 15, 204);
  doc.text('Date: ________________', 75, 204);
  doc.text('Date: ________________', 135, 204);

  // FOR OFFICE USE ONLY section
  doc.setTextColor(secondaryGold[0], secondaryGold[1], secondaryGold[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('FOR OFFICE USE ONLY', 15, 214);

  // Draw grid table for Office Use
  doc.setDrawColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.setLineWidth(0.4);
  doc.rect(15, 217, 180, 30, 'S');

  doc.setLineWidth(0.25);
  doc.line(75, 217, 75, 247);
  doc.line(135, 217, 135, 247);
  doc.line(15, 232, 195, 232);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);

  // Row 1 filling
  doc.text('Application Ref ID:', 17, 221);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(appId, 17, 227);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Date Received:', 77, 221);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(submittedDate.split(',')[0] || 'N/A', 77, 227);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Verification Status:', 137, 221);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('PENDING / UNDER REVIEW', 137, 227);

  // Row 2 filling
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Membership Folio No:', 17, 236);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('____________________', 17, 242);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Board Approval Date:', 77, 236);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('____________________', 77, 242);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Director Signature:', 137, 236);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('____________________', 137, 242);

  // Page 2 Footer
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFontSize(7.5);
  doc.text('Adivasi Producer Company (APC) • Founder: Bijaya Kumar Mellaka', 15, 285);
  doc.text('Page 2 of 2', 178, 285);

  return doc.output('blob');
}

/**
 * Compiles shareholder application into a clean, structured payload and returns WhatsApp deep link and PDF.
 */
export function compileSubmissionAssets(
  data: ShareholderApplication,
  appId: string,
  submittedDate: string,
  passportPhotoBase64?: string
): { whatsappLink: string; summaryPdfBlob: Blob } {
  const formattedDate = new Date(submittedDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  // Clean structured text representing the official application form
  let message = `*NEW SHAREHOLDER MEMBERSHIP APPLICATION*
*Ref:* ${appId}
*Submitted:* ${formattedDate}
---------------------------------------
*1. PERSONAL DETAILS*
- *Full Name:* ${data.fullName}
- *Father/Mother/Spouse:* ${data.fatherHusbandName}
- *DOB:* ${data.dateOfBirth}
- *Gender:* ${data.gender}
- *Aadhaar No:* ${data.aadhaarNumber}
- *PAN No:* ${data.panNumber || 'N/A'}
- *Mobile No:* ${data.mobileNumber}
- *WhatsApp No:* ${data.whatsappNumber || 'N/A'}
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
- *Nominee Address:* ${data.nomineeAddress}
- *Nominee Mobile:* ${data.nomineeMobileNumber}

*6. BANK DETAILS*
- *Holder Name:* ${data.bankAccountHolderName}
- *Bank Name:* ${data.bankName}
- *Bank Branch:* ${data.bankBranch}
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
  const summaryPdfBlob = generateSummaryPdf(data, appId, formattedDate, passportPhotoBase64);

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
